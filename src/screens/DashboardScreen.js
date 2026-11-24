import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityRingsCard } from '../components/ActivityRingsCard';

export default function DashboardScreen({
  sections,
  strengthWorkouts = [],
  cardioRecords = [],
  wellnessRecords = [],
  pedometer,
  onSelectSection,
}) {
  const totalVolumeKg = strengthWorkouts.reduce(
    (sum, w) => sum + Number(w.total_volume_kg || 0),
    0
  );
  const strengthMinutes = Math.round(
    strengthWorkouts.reduce((sum, w) => sum + Number(w.duration_seconds || 0), 0) / 60
  );

  const totalCardioMin = cardioRecords.reduce((sum, r) => sum + Number(r.duration_min || 0), 0);
  const totalCardioCalories = cardioRecords.reduce((sum, r) => sum + Number(r.calories || 0), 0);
  const totalCardioKm = cardioRecords.reduce((sum, r) => sum + Number(r.distance_km || 0), 0);

  const totalWaterMl = wellnessRecords.reduce((sum, r) => sum + Number(r.water_ml || 0), 0);
  const totalFoodCalories = wellnessRecords.reduce((sum, r) => sum + Number(r.calories || 0), 0);

  const combinedDistanceKm = Number((pedometer.distanceKm + totalCardioKm).toFixed(2));
  const combinedBurnedCalories = pedometer.caloriesBurned + totalCardioCalories;
  const combinedActiveMinutes = totalCardioMin + strengthMinutes;

  const statsBySection = {
    strength: {
      count: strengthWorkouts.length,
      highlight: `${Math.round(totalVolumeKg).toLocaleString()} kg levantados`,
    },
    cardio: {
      count: cardioRecords.length,
      highlight: `${totalCardioMin} min · ${pedometer.steps.toLocaleString()} pasos hoy`,
    },
    nutrition_hydration: {
      count: wellnessRecords.length,
      highlight: `${totalWaterMl} ml agua · ${totalFoodCalories} kcal`,
    },
  };

  const renderSection = ({ item }) => {
    const stat = statsBySection[item.id] ?? { count: 0, highlight: 'Sin datos' };

    return (
      <TouchableOpacity
        style={styles.sectionCard}
        onPress={() => onSelectSection(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Abrir sección ${item.label}`}
      >
        <View style={styles.sectionIcon}>
          <Ionicons name={item.icon} size={22} color="#00E676" />
        </View>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>{item.label}</Text>
          <Text style={styles.sectionDescription}>{item.description}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.sectionCount}>{stat.count} registros</Text>
            <Text style={styles.sectionHighlight}>{stat.highlight}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={19} color="#88938C" />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderSection}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <Text style={styles.eyebrow}>PLAN DE BIENESTAR</Text>

          <ActivityRingsCard
            steps={pedometer.steps}
            stepGoal={pedometer.goal}
            waterMl={totalWaterMl}
            waterGoal={2500}
            activeMinutes={combinedActiveMinutes}
            activeGoal={45}
            distanceKm={combinedDistanceKm}
            totalCalories={combinedBurnedCalories}
            onAddManualSteps={pedometer.addManualSteps}
            onOpenCardio={() => onSelectSection('cardio')}
          />

          <Text style={styles.listHeading}>MÓDULOS Y ESTADÍSTICAS</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 16 },
  eyebrow: { color: '#9AE6B4', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  listHeading: {
    color: '#88938C',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 10,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E1E1E',
    borderColor: '#2B302D',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C2821',
    borderRadius: 10,
  },
  sectionCopy: { flex: 1, gap: 4 },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  sectionDescription: { color: '#AAA', fontSize: 12, lineHeight: 17 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  sectionCount: {
    color: '#9AE6B4',
    backgroundColor: '#173326',
    borderRadius: 5,
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sectionHighlight: {
    color: '#D5DDD8',
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: 2,
  },
});