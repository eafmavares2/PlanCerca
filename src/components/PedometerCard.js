import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function PedometerCard({
  steps,
  goal,
  distanceKm,
  caloriesBurned,
  progressPercent,
  sensorMode,
  sensorError,
  onAddManualSteps,
  compact = false,
  onOpenCardio,
}) {
  const getSensorLabel = () => {
    if (sensorMode === 'checking') return 'Iniciando sensores de movimiento...';
    if (sensorMode === 'hardware') return 'Podómetro del celular activo';
    if (sensorMode === 'accelerometer') return 'Acelerómetro activo (camina para sumar)';
    if (Platform.OS === 'web') return 'Modo manual (navegador web)';
    return sensorError || 'Modo manual activo';
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBox}>
            <Ionicons name="footsteps-outline" size={20} color="#00E676" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Podómetro diario</Text>
            <Text style={styles.sensorStatus}>{getSensorLabel()}</Text>
          </View>
        </View>

        {compact && onOpenCardio ? (
          <TouchableOpacity style={styles.linkBadge} onPress={onOpenCardio}>
            <Text style={styles.linkBadgeText}>Ver Cardio</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.manualBtn} onPress={() => onAddManualSteps(250)}>
            <Ionicons name="add" size={14} color="#121212" />
            <Text style={styles.manualBtnText}>250 pasos</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.counterRow}>
        <Text style={styles.stepsNumber}>{steps.toLocaleString()}</Text>
        <Text style={styles.stepsGoal}>
          / {goal.toLocaleString()} pasos ({progressPercent}%)
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{distanceKm} km</Text>
          <Text style={styles.metricLabel}>Distancia est.</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{caloriesBurned} kcal</Text>
          <Text style={styles.metricLabel}>Gasto est.</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{Math.max(0, goal - steps).toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Restantes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E3531',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#173326',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sensorStatus: {
    color: '#9AE6B4',
    fontSize: 11,
    marginTop: 2,
  },
  linkBadge: {
    backgroundColor: '#173326',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  linkBadgeText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#00E676',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  manualBtnText: {
    color: '#121212',
    fontSize: 11,
    fontWeight: '700',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 14,
  },
  stepsNumber: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
  },
  stepsGoal: {
    color: '#AAA',
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#121412',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E676',
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2B302D',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#88938C',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#2B302D',
  },
});