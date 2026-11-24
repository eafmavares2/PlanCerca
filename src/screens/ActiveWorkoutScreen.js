import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const QUICK_EXERCISES = [
  { name: 'Press de Banca', muscle_group: 'Pecho' },
  { name: 'Sentadilla', muscle_group: 'Piernas' },
  { name: 'Peso Muerto Rumano', muscle_group: 'Piernas' },
  { name: 'Remo con Mancuerna', muscle_group: 'Espalda' },
  { name: 'Press Militar', muscle_group: 'Hombros' },
  { name: 'Curl de Bíceps', muscle_group: 'Brazos' },
  { name: 'Zancadas', muscle_group: 'Piernas' },
  { name: 'Dominadas', muscle_group: 'Espalda' },
];

const formatDuration = (totalSeconds) => {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
};

const buildInitialExercises = (routine) => {
  if (!routine?.exercises || !Array.isArray(routine.exercises)) return [];

  return routine.exercises.map((ex, exIndex) => ({
    id: ex.id || `ex-${Date.now()}-${exIndex}`,
    name: ex.name,
    muscle_group: ex.muscle_group || 'General',
    note: '',
    sets: (ex.sets || [{ kg: '20', reps: '10' }]).map((s, setIndex) => ({
      id: `set-${Date.now()}-${exIndex}-${setIndex}`,
      previous: `${s.kg || 0}kg x ${s.reps || 0}`,
      kg: String(s.kg ?? '0'),
      reps: String(s.reps ?? '0'),
      completed: false,
    })),
  }));
};

export default function ActiveWorkoutScreen({
  visible,
  userId,
  routine,
  onClose,
  onWorkoutFinished,
}) {
  const [workoutTitle, setWorkoutTitle] = useState('Entrenamiento libre');
  const [exercises, setExercises] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Modal para agregar ejercicio durante el entreno
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('Pecho');

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!visible) return;

    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setStatusError('');
    setConfirmDiscard(false);
    setWorkoutTitle(routine?.name || 'Entrenamiento libre');
    setExercises(buildInitialExercises(routine));

    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, routine]);

  // Cálculos en tiempo real de series completadas y volumen total
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );

  const totalVolumeKg = exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets.reduce((setSum, s) => {
        if (!s.completed) return setSum;
        const kg = parseFloat(s.kg) || 0;
        const reps = parseInt(s.reps, 10) || 0;
        return setSum + kg * reps;
      }, 0),
    0
  );

  const updateSetField = (exerciseId, setId, field, value) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
        };
      })
    );
  };

  const toggleSetCompleted = (exerciseId, setId) => {
    setStatusError('');
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, completed: !s.completed } : s
          ),
        };
      })
    );
  };

  const addSetToExercise = (exerciseId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const nextSet = {
          id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          previous: lastSet ? `${lastSet.kg || 0}kg x ${lastSet.reps || 0}` : '-',
          kg: lastSet ? lastSet.kg : '20',
          reps: lastSet ? lastSet.reps : '10',
          completed: false,
        };
        return { ...ex, sets: [...ex.sets, nextSet] };
      })
    );
  };

  const removeExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const handleAddExercise = (nameOverride, muscleOverride) => {
    const finalName = (nameOverride ?? newExerciseName).trim();
    if (!finalName) return;

    const newBlock = {
      id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: finalName,
      muscle_group: muscleOverride ?? newExerciseMuscle,
      note: '',
      sets: [
        {
          id: `set-${Date.now()}-1`,
          previous: '-',
          kg: '20',
          reps: '10',
          completed: false,
        },
      ],
    };

    setExercises((prev) => [...prev, newBlock]);
    setNewExerciseName('');
    setAddExerciseOpen(false);
  };

  const handleFinishWorkout = async () => {
    if (completedSets === 0) {
      setStatusError('Marca al menos una serie con ✓ antes de terminar.');
      return;
    }

    setSaving(true);
    setStatusError('');

    const exercisesLog = exercises.map((ex) => ({
      name: ex.name,
      muscle_group: ex.muscle_group,
      sets: ex.sets
        .filter((s) => s.completed)
        .map((s) => ({
          kg: parseFloat(s.kg) || 0,
          reps: parseInt(s.reps, 10) || 0,
        })),
    }));

    const { error } = await supabase.from('strength_workouts').insert({
      user_id: userId,
      routine_id: routine?.id ?? null,
      routine_name: workoutTitle.trim() || 'Entrenamiento libre',
      duration_seconds: elapsedSeconds,
      total_volume_kg: Math.round(totalVolumeKg * 100) / 100,
      completed_sets: completedSets,
      exercises_log: exercisesLog,
    });

    setSaving(false);

    if (error) {
      setStatusError(`Error al guardar: ${error.message}`);
      return;
    }

    await onWorkoutFinished();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => setConfirmDiscard(true)}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Barra superior tipo Hevy */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setConfirmDiscard(true)}
              accessibilityRole="button"
            >
              <Ionicons name="chevron-down" size={22} color="#FFF" />
              <Text style={styles.topTitle} numberOfLines={1}>
                {workoutTitle}
              </Text>
            </TouchableOpacity>

            <View style={styles.topActions}>
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={16} color="#00E676" />
              </View>
              <TouchableOpacity
                style={[styles.finishBtn, saving && { opacity: 0.7 }]}
                onPress={handleFinishWorkout}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#121212" />
                ) : (
                  <Text style={styles.finishBtnText}>Terminar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Barra de métricas en vivo: Duración, Volumen, Series */}
          <View style={styles.liveStatsBar}>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatLabel}>Duración</Text>
              <Text style={styles.liveStatHighlight}>{formatDuration(elapsedSeconds)}</Text>
            </View>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatLabel}>Volumen</Text>
              <Text style={styles.liveStatValue}>
                {Math.round(totalVolumeKg).toLocaleString()} kg
              </Text>
            </View>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatLabel}>Series</Text>
              <Text style={styles.liveStatValue}>{completedSets}</Text>
            </View>
          </View>

          {statusError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{statusError}</Text>
            </View>
          ) : null}

          {/* Lista de ejercicios y tablas de series */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {exercises.length === 0 ? (
              <View style={styles.emptyWorkoutBox}>
                <Ionicons name="barbell-outline" size={34} color="#77858F" />
                <Text style={styles.emptyWorkoutTitle}>Entrenamiento vacío</Text>
                <Text style={styles.emptyWorkoutDesc}>
                  Agrega ejercicios para comenzar a registrar tus series y pesos.
                </Text>
              </View>
            ) : (
              exercises.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseBlock}>
                  {/* Cabecera del ejercicio */}
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseIcon}>
                      <Ionicons name="barbell" size={18} color="#00E676" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseMuscle}>{exercise.muscle_group}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeExBtn}
                      onPress={() => removeExercise(exercise.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF8A80" />
                    </TouchableOpacity>
                  </View>

                  {/* Encabezado de columnas estilo Hevy */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.colHeader, styles.colSet]}>SERIE</Text>
                    <Text style={[styles.colHeader, styles.colPrev]}>ANTERIOR</Text>
                    <Text style={[styles.colHeader, styles.colInput]}>KG</Text>
                    <Text style={[styles.colHeader, styles.colInput]}>REPS</Text>
                    <View style={styles.colCheck}>
                      <Ionicons name="checkmark" size={15} color="#88938C" />
                    </View>
                  </View>

                  {/* Filas de series */}
                  {exercise.sets.map((setItem, index) => (
                    <View
                      key={setItem.id}
                      style={[styles.setRow, setItem.completed && styles.setRowCompleted]}
                    >
                      <View style={styles.colSet}>
                        <View
                          style={[
                            styles.setNumberBadge,
                            setItem.completed && styles.setNumberBadgeDone,
                          ]}
                        >
                          <Text
                            style={[
                              styles.setNumberText,
                              setItem.completed && styles.setNumberTextDone,
                            ]}
                          >
                            {index + 1}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.prevText, styles.colPrev]} numberOfLines={1}>
                        {setItem.previous}
                      </Text>

                      <View style={styles.colInput}>
                        <TextInput
                          style={[styles.numInput, setItem.completed && styles.numInputDone]}
                          value={setItem.kg}
                          onChangeText={(val) =>
                            updateSetField(exercise.id, setItem.id, 'kg', val)
                          }
                          keyboardType="decimal-pad"
                          selectTextOnFocus
                        />
                      </View>

                      <View style={styles.colInput}>
                        <TextInput
                          style={[styles.numInput, setItem.completed && styles.numInputDone]}
                          value={setItem.reps}
                          onChangeText={(val) =>
                            updateSetField(exercise.id, setItem.id, 'reps', val)
                          }
                          keyboardType="numeric"
                          selectTextOnFocus
                        />
                      </View>

                      <TouchableOpacity
                        style={[styles.checkBtn, setItem.completed && styles.checkBtnDone]}
                        onPress={() => toggleSetCompleted(exercise.id, setItem.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: setItem.completed }}
                      >
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={setItem.completed ? '#121212' : '#77858F'}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Botón + Agregar Serie */}
                  <TouchableOpacity
                    style={styles.addSetBtn}
                    onPress={() => addSetToExercise(exercise.id)}
                  >
                    <Ionicons name="add" size={16} color="#FFF" />
                    <Text style={styles.addSetBtnText}>Agregar Serie</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Botón + Agregar Ejercicio */}
            <TouchableOpacity
              style={styles.addExerciseBtn}
              onPress={() => setAddExerciseOpen(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#00E676" />
              <Text style={styles.addExerciseBtnText}>Agregar Ejercicio</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Modal para agregar ejercicio al entrenamiento */}
          <Modal
            visible={addExerciseOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setAddExerciseOpen(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalPanel}>
                <Text style={styles.modalTitle}>Agregar ejercicio</Text>

                <TextInput
                  style={styles.textInput}
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                  placeholder="Nombre del ejercicio (ej. Prensa)"
                  placeholderTextColor="#77858F"
                />

                <Text style={styles.quickLabel}>Sugerencias rápidas:</Text>
                <View style={styles.quickGrid}>
                  {QUICK_EXERCISES.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={styles.quickChip}
                      onPress={() => handleAddExercise(item.name, item.muscle_group)}
                    >
                      <Text style={styles.quickChipText}>+ {item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setAddExerciseOpen(false)}
                  >
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => handleAddExercise()}
                  >
                    <Text style={styles.confirmText}>Añadir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal confirmar descartar entrenamiento */}
          <Modal
            visible={confirmDiscard}
            transparent
            animationType="fade"
            onRequestClose={() => setConfirmDiscard(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalPanel}>
                <Text style={styles.modalTitle}>¿Descartar entrenamiento?</Text>
                <Text style={styles.modalDesc}>
                  Si sales sin presionar Terminar, el progreso de esta sesión no se guardará.
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setConfirmDiscard(false)}
                  >
                    <Text style={styles.cancelText}>Seguir entrenando</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.discardBtn}
                    onPress={() => {
                      setConfirmDiscard(false);
                      onClose();
                    }}
                  >
                    <Text style={styles.discardText}>Descartar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252926',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  topTitle: { color: '#FFF', fontSize: 17, fontWeight: '700', flex: 1 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timerBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#173326',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtn: {
    backgroundColor: '#00E676',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  finishBtnText: { color: '#121212', fontSize: 14, fontWeight: '700' },
  liveStatsBar: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#181B19',
    borderBottomWidth: 1,
    borderBottomColor: '#252926',
  },
  liveStatItem: { flex: 1 },
  liveStatLabel: { color: '#88938C', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  liveStatHighlight: { color: '#00E676', fontSize: 16, fontWeight: '700' },
  liveStatValue: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  errorBanner: {
    backgroundColor: '#3A1816',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorBannerText: { color: '#FF8A80', fontSize: 12, fontWeight: '600' },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 36 },
  emptyWorkoutBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyWorkoutTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  emptyWorkoutDesc: { color: '#AAA', fontSize: 13, textAlign: 'center', maxWidth: 260 },
  exerciseBlock: {
    backgroundColor: '#1A1D1B',
    borderColor: '#2B302D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#173326',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: { color: '#00E676', fontSize: 16, fontWeight: '700' },
  exerciseMuscle: { color: '#88938C', fontSize: 11, marginTop: 1 },
  removeExBtn: { padding: 6 },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#262B28',
    marginBottom: 6,
  },
  colHeader: { color: '#88938C', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  colSet: { width: 44, alignItems: 'center', justifyContent: 'center' },
  colPrev: { flex: 1, textAlign: 'center' },
  colInput: { width: 68, paddingHorizontal: 4 },
  colCheck: { width: 38, alignItems: 'center' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  setRowCompleted: {
    backgroundColor: '#152B20',
  },
  setNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#252A27',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberBadgeDone: { backgroundColor: '#173326' },
  setNumberText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  setNumberTextDone: { color: '#00E676' },
  prevText: { color: '#88938C', fontSize: 12 },
  numInput: {
    backgroundColor: '#121412',
    borderColor: '#343A36',
    borderWidth: 1,
    borderRadius: 8,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 6,
  },
  numInputDone: {
    borderColor: '#00E676',
    backgroundColor: '#12221A',
  },
  checkBtn: {
    width: 34,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#252A27',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  checkBtnDone: {
    backgroundColor: '#00E676',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#252A27',
    borderRadius: 8,
    paddingVertical: 9,
    marginTop: 8,
  },
  addSetBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#173326',
    borderColor: '#00E676',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
  },
  addExerciseBtnText: { color: '#00E676', fontSize: 14, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  modalPanel: {
    backgroundColor: '#1B1E1C',
    borderColor: '#343A36',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalDesc: { color: '#C4CCC7', fontSize: 14, lineHeight: 20, marginBottom: 14 },
  textInput: {
    backgroundColor: '#121412',
    borderColor: '#3A433D',
    borderWidth: 1,
    borderRadius: 8,
    color: '#FFF',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  quickLabel: { color: '#AAA', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  quickChip: {
    backgroundColor: '#121412',
    borderColor: '#3A433D',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickChipText: { color: '#9AE6B4', fontSize: 12, fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { color: '#D2D8D4', fontSize: 14, fontWeight: '600' },
  confirmBtn: { backgroundColor: '#00E676', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  confirmText: { color: '#121212', fontSize: 14, fontWeight: '700' },
  discardBtn: { backgroundColor: '#B3261E', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  discardText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});