import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HOME_TABS, SECTION_DETAILS } from '../data/fitness-sections';
import { useStepCounter } from '../hooks/useStepCounter';
import { supabase } from '../lib/supabase';
import CardioScreen from './CardioScreen';
import DashboardScreen from './DashboardScreen';
import NutritionHydrationScreen from './NutritionHydrationScreen';
import StrengthScreen from './StrengthScreen';

const SECTIONS = HOME_TABS.filter((tab) => tab.id !== 'home').map((tab) => ({
  ...tab,
  description: SECTION_DETAILS[tab.id],
}));

export default function HomeScreen({ session, onLogout }) {
  const userId = session?.user?.id;
  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split('@')[0] ||
    'deportista';

  const [selectedTabId, setSelectedTabId] = useState('home');
  const [loadingData, setLoadingData] = useState(true);
  const [strengthRoutines, setStrengthRoutines] = useState([]);
  const [strengthWorkouts, setStrengthWorkouts] = useState([]);
  const [cardioRecords, setCardioRecords] = useState([]);
  const [wellnessRecords, setWellnessRecords] = useState([]);

  const pedometer = useStepCounter(userId);

  const loadAllModules = useCallback(async () => {
    if (!userId) return;
    setLoadingData(true);

    const [routinesRes, workoutsRes, cardioRes, wellnessRes] = await Promise.all([
      supabase.from('strength_routines').select('*').order('created_at', { ascending: false }),
      supabase.from('strength_workouts').select('*').order('created_at', { ascending: false }),
      supabase.from('cardio_records').select('*').order('created_at', { ascending: false }),
      supabase
        .from('nutrition_hydration_records')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (!routinesRes.error) setStrengthRoutines(routinesRes.data ?? []);
    if (!workoutsRes.error) setStrengthWorkouts(workoutsRes.data ?? []);
    if (!cardioRes.error) setCardioRecords(cardioRes.data ?? []);
    if (!wellnessRes.error) setWellnessRecords(wellnessRes.data ?? []);
    setLoadingData(false);
  }, [userId]);

  useEffect(() => {
    loadAllModules();
  }, [loadAllModules]);

  const activeTab = HOME_TABS.find((tab) => tab.id === selectedTabId) ?? HOME_TABS[0];

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx, dy }) =>
          Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy) * 1.3,
        onPanResponderRelease: (_, { dx }) => {
          if (Math.abs(dx) < 60) return;
          setSelectedTabId((currentId) => {
            const currentIndex = HOME_TABS.findIndex((tab) => tab.id === currentId);
            const nextIndex = Math.max(
              0,
              Math.min(HOME_TABS.length - 1, currentIndex + (dx < 0 ? 1 : -1))
            );
            return HOME_TABS[nextIndex].id;
          });
        },
      }),
    []
  );

  const renderActiveScreen = () => {
    if (loadingData) {
      return (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#00E676" />
          <Text style={styles.loaderText}>Sincronizando tus estadísticas...</Text>
        </View>
      );
    }

    switch (selectedTabId) {
      case 'strength':
        return (
          <StrengthScreen
            userId={userId}
            routines={strengthRoutines}
            workouts={strengthWorkouts}
            onRefresh={loadAllModules}
          />
        );
      case 'cardio':
        return (
          <CardioScreen
            userId={userId}
            records={cardioRecords}
            onRefresh={loadAllModules}
            pedometer={pedometer}
          />
        );
      case 'nutrition_hydration':
        return (
          <NutritionHydrationScreen
            userId={userId}
            records={wellnessRecords}
            onRefresh={loadAllModules}
          />
        );
      default:
        return (
          <DashboardScreen
            sections={SECTIONS}
            strengthWorkouts={strengthWorkouts}
            cardioRecords={cardioRecords}
            wellnessRecords={wellnessRecords}
            pedometer={pedometer}
            onSelectSection={setSelectedTabId}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" translucent={false} />

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3048/3048398.png' }}
              style={styles.avatar}
              accessibilityLabel="Perfil de deportista"
            />
            <View style={styles.greetingGroup}>
              <Text style={styles.greeting} numberOfLines={1}>
                {selectedTabId === 'home' ? `Hola, ${userName}` : activeTab.label}
              </Text>
              <Text style={styles.subGreeting}>
                {selectedTabId === 'home' ? 'Resumen general y podómetro' : 'Estadísticas y registros'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.screenContent} {...panResponder.panHandlers}>
          {renderActiveScreen()}
        </View>

        <View style={styles.bottomBar}>
          {HOME_TABS.map((tab) => {
            const isActive = selectedTabId === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabButton}
                onPress={() => setSelectedTabId(tab.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                <Ionicons name={tab.icon} size={20} color={isActive ? '#00E676' : '#888'} />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E' },
  greetingGroup: { flex: 1 },
  greeting: { color: '#FFF', fontSize: 19, fontWeight: '700' },
  subGreeting: { color: '#AAA', fontSize: 12, marginTop: 2 },
  logoutButton: { backgroundColor: '#2A2A2A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9 },
  logoutText: { color: '#FF8A80', fontSize: 13, fontWeight: '700' },
  screenContent: { flex: 1 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loaderText: { color: '#AAA', fontSize: 13 },
  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    marginHorizontal: -20,
    paddingHorizontal: 4,
    paddingTop: 9,
    paddingBottom: 4,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  tabLabel: { color: '#888', fontSize: 10, fontWeight: '600' },
  tabLabelActive: { color: '#00E676' },
});