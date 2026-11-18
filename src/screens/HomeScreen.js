import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    Image,
    PanResponder,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    HOME_TABS,
    INITIAL_SECTION_RECORDS,
    SECTION_DETAILS,
} from '../data/fitness-sections';
import CardioScreen from './CardioScreen';
import DashboardScreen from './DashboardScreen';
import HydrationScreen from './HydrationScreen';
import NutritionScreen from './NutritionScreen';
import StrengthScreen from './StrengthScreen';

const SECTIONS = HOME_TABS
  .filter((tab) => tab.id !== 'home')
  .map((tab) => ({ ...tab, description: SECTION_DETAILS[tab.id] }));

const SECTION_SCREENS = {
  strength: StrengthScreen,
  nutrition: NutritionScreen,
  hydration: HydrationScreen,
  cardio: CardioScreen,
};

export default function HomeScreen({ onLogout }) {
  const [selectedTabId, setSelectedTabId] = useState('home');
  const [recordsBySection, setRecordsBySection] = useState(INITIAL_SECTION_RECORDS);
  const activeTab = HOME_TABS.find((tab) => tab.id === selectedTabId) ?? HOME_TABS[0];
  const ActiveScreen = selectedTabId === 'home'
    ? DashboardScreen
    : SECTION_SCREENS[selectedTabId];

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, { dx, dy }) =>
      Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy) * 1.3,
    onPanResponderRelease: (_, { dx }) => {
      if (Math.abs(dx) < 60) return;

      setSelectedTabId((currentId) => {
        const currentIndex = HOME_TABS.findIndex((tab) => tab.id === currentId);
        const nextIndex = Math.max(
          0,
          Math.min(HOME_TABS.length - 1, currentIndex + (dx < 0 ? 1 : -1)),
        );
        return HOME_TABS[nextIndex].id;
      });
    },
  }), []);

  const handleSaveRecord = (record) => {
    setRecordsBySection((current) => {
      const sectionRecords = current[selectedTabId];
      const alreadyExists = sectionRecords.some((item) => item.id === record.id);
      const updatedRecords = alreadyExists
        ? sectionRecords.map((item) => item.id === record.id ? record : item)
        : [record, ...sectionRecords];

      return { ...current, [selectedTabId]: updatedRecords };
    });
  };

  const handleDeleteRecord = (recordId) => {
    setRecordsBySection((current) => ({
      ...current,
      [selectedTabId]: current[selectedTabId].filter((item) => item.id !== recordId),
    }));
  };

  const screenProps = selectedTabId === 'home'
    ? {
        sections: SECTIONS,
        recordsBySection,
        onSelectSection: setSelectedTabId,
      }
    : {
        sectionId: selectedTabId,
        records: recordsBySection[selectedTabId],
        onSaveRecord: handleSaveRecord,
        onDeleteRecord: handleDeleteRecord,
      };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3048/3048398.png' }}
              style={styles.avatar}
              accessibilityLabel="Perfil de deportista"
            />
            <View style={styles.greetingGroup}>
              <Text style={styles.greeting}>
                {selectedTabId === 'home' ? 'Hola, deportista' : activeTab.label}
              </Text>
              <Text style={styles.subGreeting}>
                {selectedTabId === 'home' ? 'Tu plan de bienestar' : 'Administra tus registros'}
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
          <ActiveScreen {...screenProps} />
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
                <Ionicons
                  name={tab.icon}
                  size={20}
                  color={isActive ? '#00E676' : '#888'}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
  },
  greetingGroup: {
    flex: 1,
  },
  greeting: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  subGreeting: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  logoutText: {
    color: '#FF8A80',
    fontSize: 13,
    fontWeight: '700',
  },
  screenContent: {
    flex: 1,
  },
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
  tabLabel: {
    color: '#888',
    fontSize: 9,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#00E676',
  },
});
