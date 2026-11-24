import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const RINGS_CONFIG = [
  { key: 'steps', radius: 74, strokeWidth: 12, color: '#00E676', trackColor: '#163022' },
  { key: 'water', radius: 58, strokeWidth: 12, color: '#38BDF8', trackColor: '#152A38' },
  { key: 'active', radius: 42, strokeWidth: 12, color: '#FF9800', trackColor: '#332412' },
];

export function ActivityRingsCard({
  steps = 0,
  stepGoal = 8000,
  waterMl = 0,
  waterGoal = 2500,
  activeMinutes = 0,
  activeGoal = 45,
  distanceKm = 0,
  totalCalories = 0,
  onAddManualSteps,
  onOpenCardio,
}) {
  const size = 172;
  const center = size / 2;

  const progressByKey = {
    steps: Math.min(1, Math.max(0, steps / stepGoal)),
    water: Math.min(1, Math.max(0, waterMl / waterGoal)),
    active: Math.min(1, Math.max(0, activeMinutes / activeGoal)),
  };

  return (
    <View style={styles.card}>
      {/* Cabecera de la tarjeta */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Actividad de hoy</Text>
        <View style={styles.headerActions}>
          {onAddManualSteps ? (
            <TouchableOpacity style={styles.stepBtn} onPress={() => onAddManualSteps(250)}>
              <Ionicons name="add" size={14} color="#121212" />
              <Text style={styles.stepBtnText}>250 pasos</Text>
            </TouchableOpacity>
          ) : null}
          {onOpenCardio ? (
            <TouchableOpacity style={styles.detailBtn} onPress={onOpenCardio}>
              <Ionicons name="chevron-forward" size={16} color="#9AE6B4" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Zona principal: Rueda concéntrica a la izquierda + Leyenda a la derecha */}
      <View style={styles.mainRow}>
        <View style={styles.ringContainer}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G transform={`rotate(-90 ${center} ${center})`}>
              {RINGS_CONFIG.map((ring) => {
                const circumference = 2 * Math.PI * ring.radius;
                const progress = progressByKey[ring.key];
                const strokeDashoffset = circumference * (1 - progress);

                return (
                  <G key={ring.key}>
                    {/* Pista de fondo */}
                    <Circle
                      cx={center}
                      cy={center}
                      r={ring.radius}
                      stroke={ring.trackColor}
                      strokeWidth={ring.strokeWidth}
                      fill="none"
                    />
                    {/* Progreso activo */}
                    {progress > 0 ? (
                      <Circle
                        cx={center}
                        cy={center}
                        r={ring.radius}
                        stroke={ring.color}
                        strokeWidth={ring.strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                      />
                    ) : null}
                  </G>
                );
              })}
            </G>
          </Svg>

          {/* Contador central dentro de los aros */}
          <View style={styles.centerOverlay} pointerEvents="none">
            <Text style={styles.centerMainNumber}>{steps.toLocaleString()}</Text>
            <Text style={styles.centerSubLabel}>pasos</Text>
          </View>
        </View>

        {/* Leyenda lateral de los 3 aros */}
        <View style={styles.legendColumn}>
          <View style={styles.legendItem}>
            <View style={styles.legendHeader}>
              <View style={[styles.dot, { backgroundColor: '#00E676' }]} />
              <Text style={styles.legendTitle}>Pasos</Text>
            </View>
            <Text style={styles.legendValue}>
              {steps.toLocaleString()} <Text style={styles.legendGoal}>/ {stepGoal.toLocaleString()}</Text>
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={styles.legendHeader}>
              <View style={[styles.dot, { backgroundColor: '#38BDF8' }]} />
              <Text style={styles.legendTitle}>Hidratación</Text>
            </View>
            <Text style={styles.legendValue}>
              {waterMl} <Text style={styles.legendGoal}>/ {waterGoal} ml</Text>
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={styles.legendHeader}>
              <View style={[styles.dot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendTitle}>Actividad</Text>
            </View>
            <Text style={styles.legendValue}>
              {activeMinutes} <Text style={styles.legendGoal}>/ {activeGoal} min</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Fila inferior de 3 métricas rápidas */}
      <View style={styles.bottomMetrics}>
        <View style={styles.metricCol}>
          <Text style={styles.metricNumber}>{totalCalories.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Cal</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricNumber}>{distanceKm}</Text>
          <Text style={styles.metricLabel}>km</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricNumber}>{Math.min(100, Math.round((steps / stepGoal) * 100))}%</Text>
          <Text style={styles.metricLabel}>Meta pasos</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2B302D',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#00E676',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  stepBtnText: {
    color: '#121212',
    fontSize: 11,
    fontWeight: '700',
  },
  detailBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#173326',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ringContainer: {
    width: 172,
    height: 172,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMainNumber: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: '700',
  },
  centerSubLabel: {
    color: '#AAA',
    fontSize: 11,
    fontWeight: '600',
  },
  legendColumn: {
    flex: 1,
    gap: 12,
  },
  legendItem: {
    gap: 2,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTitle: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
  },
  legendValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    paddingLeft: 14,
  },
  legendGoal: {
    color: '#77858F',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2B302D',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#88938C',
    fontSize: 11,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#2B302D',
  },
});