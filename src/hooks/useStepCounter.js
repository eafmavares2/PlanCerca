import { Accelerometer, Pedometer } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import { supabase } from '../lib/supabase';

const DEFAULT_STEP_GOAL = 8000;
const CONFIRMATION_STEPS = 4; // Pasos rítmicos necesarios para confirmar caminata
const MIN_STEP_INTERVAL_MS = 350; // Máximo ~2.8 pasos/seg (filtra sacudidas rápidas)
const MAX_STEP_INTERVAL_MS = 1300; // Mínimo ~0.75 pasos/seg (filtra golpes aislados)

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export function useStepCounter(userId) {
  const [steps, setSteps] = useState(0);
  const [goal, setGoal] = useState(DEFAULT_STEP_GOAL);
  const [sensorMode, setSensorMode] = useState('checking'); // 'checking' | 'hardware' | 'accelerometer' | 'manual'
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sensorError, setSensorError] = useState('');

  const baseStepsRef = useRef(0);
  const sessionStepsRef = useRef(0);
  const latestStepsRef = useRef(0);
  const goalRef = useRef(DEFAULT_STEP_GOAL);
  const syncTimeoutRef = useRef(null);
  const hardwareConfirmedRef = useRef(false);
  const accelStartedRef = useRef(false);

  const scheduleSyncToSupabase = useCallback(
    (nextSteps) => {
      latestStepsRef.current = nextSteps;
      if (!userId) return;

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        const today = getTodayDateString();
        await supabase.from('daily_step_logs').upsert(
          {
            user_id: userId,
            step_date: today,
            steps: latestStepsRef.current,
            goal: goalRef.current,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,step_date' }
        );
      }, 3000);
    },
    [userId]
  );

  useEffect(() => {
    let pedometerSub = null;
    let accelSub = null;
    let fallbackTimer = null;
    let isMounted = true;

    // 1. Cargar pasos acumulados hoy en Supabase
    const loadSavedSteps = async () => {
      try {
        const today = getTodayDateString();
        const { data: savedLog } = await supabase
          .from('daily_step_logs')
          .select('steps, goal')
          .eq('step_date', today)
          .maybeSingle();

        if (!isMounted) return;
        const savedSteps = savedLog?.steps ?? 0;
        baseStepsRef.current = savedSteps;
        const mergedTotal = savedSteps + sessionStepsRef.current;
        latestStepsRef.current = mergedTotal;
        setSteps(mergedTotal);

        if (savedLog?.goal) {
          goalRef.current = savedLog.goal;
          setGoal(savedLog.goal);
        }
      } catch {
        // Ignorar si no hay registro previo
      }
    };

    loadSavedSteps();

    if (Platform.OS === 'web') {
      setSensorMode('manual');
      return () => {
        isMounted = false;
      };
    }

    // 2. Acelerómetro con filtro de onda (pico-valle) y confirmación de cadencia
    try {
      Accelerometer.setUpdateInterval(40); // 25 lecturas por segundo

      let gravity = 1.0;
      let smoothedSignal = 0;
      let currentPeak = 0;
      let currentValley = 0;
      let inPeakPhase = false;

      let lastCandidateTime = 0;
      let consecutiveCandidates = 0;

      accelSub = Accelerometer.addListener(({ x, y, z }) => {
        if (!isMounted) return;

        if (!accelStartedRef.current) {
          accelStartedRef.current = true;
          setSensorMode((prev) => (prev === 'hardware' ? 'hardware' : 'accelerometer'));
        }

        if (hardwareConfirmedRef.current) return;

        // Magnitud total y eliminación de gravedad + suavizado de vibraciones
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        gravity = gravity * 0.92 + magnitude * 0.08;
        const rawDynamic = magnitude - gravity;
        smoothedSignal = smoothedSignal * 0.6 + rawDynamic * 0.4;

        // Fase 1: Detectar el pico positivo de la pisada
        if (smoothedSignal > 0.2) {
          inPeakPhase = true;
          if (smoothedSignal > currentPeak) {
            currentPeak = smoothedSignal;
          }
        }

        // Fase 2: Detectar el valle posterior al paso para cerrar el ciclo
        if (inPeakPhase && smoothedSignal < -0.08) {
          if (smoothedSignal < currentValley) {
            currentValley = smoothedSignal;
          }

          const waveAmplitude = currentPeak - currentValley;
          const now = Date.now();
          const elapsed = now - lastCandidateTime;

          // Validar que la onda tenga fuerza de paso real (> 0.30G) y no sea una sacudida rápida
          if (waveAmplitude > 0.3 && elapsed >= MIN_STEP_INTERVAL_MS) {
            if (elapsed <= MAX_STEP_INTERVAL_MS) {
              consecutiveCandidates += 1;
            } else {
              // Primer posible paso tras estar quieto (se guarda en buffer sin sumar aún)
              consecutiveCandidates = 1;
            }

            lastCandidateTime = now;

            // Solo sumar cuando se confirma caminata continua (4 pasos rítmicos)
            if (consecutiveCandidates === CONFIRMATION_STEPS) {
              sessionStepsRef.current += CONFIRMATION_STEPS;
              const total = baseStepsRef.current + sessionStepsRef.current;
              setSteps(total);
              scheduleSyncToSupabase(total);
            } else if (consecutiveCandidates > CONFIRMATION_STEPS) {
              sessionStepsRef.current += 1;
              const total = baseStepsRef.current + sessionStepsRef.current;
              setSteps(total);
              scheduleSyncToSupabase(total);
            }
          }

          // Reiniciar ciclo de onda para el siguiente paso
          inPeakPhase = false;
          currentPeak = 0;
          currentValley = 0;
        }
      });
    } catch (err) {
      setSensorError(err?.message || 'No se pudo iniciar el acelerómetro.');
    }

    // 3. Intentar conectar el Podómetro por hardware en paralelo
    const initHardwarePedometer = async () => {
      try {
        let granted = false;
        if (Platform.OS === 'android' && Platform.Version >= 29) {
          const res = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
          );
          granted = res === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const { status } = await Pedometer.requestPermissionsAsync();
          granted = status === 'granted';
        }

        if (!isMounted) return;
        setPermissionDenied(!granted);
        if (!granted) return;

        const available = await Pedometer.isAvailableAsync();
        if (!available || !isMounted) return;

        pedometerSub = Pedometer.watchStepCount((result) => {
          if (result.steps > 0 && isMounted) {
            hardwareConfirmedRef.current = true;
            sessionStepsRef.current = result.steps;
            setSensorMode('hardware');
            const total = baseStepsRef.current + sessionStepsRef.current;
            setSteps(total);
            scheduleSyncToSupabase(total);
          }
        });
      } catch {
        // Respaldo activo con el acelerómetro filtrado
      }
    };

    initHardwarePedometer();

    fallbackTimer = setTimeout(() => {
      if (isMounted && !accelStartedRef.current && !hardwareConfirmedRef.current) {
        setSensorMode('manual');
      }
    }, 2500);

    return () => {
      isMounted = false;
      if (pedometerSub) pedometerSub.remove();
      if (accelSub) accelSub.remove();
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [userId, scheduleSyncToSupabase]);

  const addManualSteps = (amount) => {
    baseStepsRef.current = Math.max(0, baseStepsRef.current + amount);
    const total = baseStepsRef.current + sessionStepsRef.current;
    setSteps(total);
    scheduleSyncToSupabase(total);
  };

  const openDeviceSettings = () => {
    Linking.openSettings();
  };

  const distanceKm = Number((steps * 0.00075).toFixed(2));
  const caloriesBurned = Math.round(steps * 0.04);
  const progressPercent = Math.min(100, Math.round((steps / goal) * 100));

  return {
    steps,
    goal,
    distanceKm,
    caloriesBurned,
    progressPercent,
    sensorMode,
    sensorAvailable: sensorMode === 'hardware' || sensorMode === 'accelerometer',
    permissionDenied,
    sensorError,
    addManualSteps,
    openDeviceSettings,
  };
}