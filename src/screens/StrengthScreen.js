import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
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
import { supabase } from '../lib/supabase';
import ActiveWorkoutScreen from './ActiveWorkoutScreen';

const formatDurationShort = (sec) => {
  if (!sec) return '0 min';
  if (sec < 60) return `${sec}s`;
  return `${Math.round(sec / 60)} min`;
};

export default function StrengthScreen({ userId, routines = [], workouts = [], onRefresh }) {
  // Estado para entrenamiento activo (pantalla tipo Hevy con cronómetro)
  const [activeWorkoutVisible, setActiveWorkoutVisible] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);

  // Estado para modal de crear / editar rutina
  const [builderVisible, setBuilderVisible] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [routineName, setRoutineName] = useState('');
  const [draftExercises, setDraftExercises] = useState([]);
  const [exNameInput, setExNameInput] = useState('');
  const [exSetsInput, setExSetsInput] = useState('3');
  const [exRepsInput, setExRepsInput] = useState('10');
  const [exKgInput, setExKgInput] = useState('20');
  const [builderError, setBuilderError] = useState('');
  const [savingRoutine, setSavingRoutine] = useState(false);

  // Estado para confirmar eliminación de rutina
  const [routineToDelete, setRoutineToDelete] = useState(null);

  // Estadísticas globales de entrenamientos realizados
  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((sum, w) => sum + Number(w.total_volume_kg || 0), 0);
  const totalSeries = workouts.reduce((sum, w) => sum + Number(w.completed_sets || 0), 0);

  const startEmptyWorkout = () => {
    setSelectedRoutine(null);
    setActiveWorkoutVisible(true);
  };

  const startRoutineWorkout = (routine) => {
    setSelectedRoutine(routine);
    setActiveWorkoutVisible(true);
  };

  const openCreateRoutine = () => {
    setEditingRoutine(null);
    setRoutineName('');
    setDraftExercises([]);
    setExNameInput('');
    setExSetsInput('3');
    setExRepsInput('10');
    setExKgInput('20');
    setBuilderError('');
    setBuilderVisible(true);
  };

  const openEditRoutine = (routine) => {
    setEditingRoutine(routine);
    setRoutineName(routine.name);
    setDraftExercises(
      (routine.exercises || []).map((ex, i) => ({
        id: ex.id || `draft-${i}`,
        name: ex.name,
        muscle_group: ex.muscle_group || 'General',
        sets: ex.sets || [{ kg: '20', reps: '10' }],
      }))
    );
    setExNameInput('');
    setBuilderError('');
    setBuilderVisible(true);
  };

  const addExerciseToDraft = () => {
    const clean = exNameInput.trim();
    if (!clean) {
      setBuilderError('Escribe el nombre del ejercicio para añadirlo.');
      return;
    }

    const numSets = Math.max(1, Math.min(10, parseInt(exSetsInput, 10) || 3));
    const numReps = Math.max(1, parseInt(exRepsInput, 10) || 10);
    const numKg = Math.max(0, parseFloat(exKgInput) || 0);

    const setsArray = Array.from({ length: numSets }, () => ({
      kg: String(numKg),
      reps: String(numReps),
    }));

    setDraftExercises((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: clean,
        muscle_group: 'Fuerza',
        sets: setsArray,
      },
    ]);
    setExNameInput('');
    setBuilderError('');
  };

  const removeDraftExercise = (id) => {
    setDraftExercises((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveRoutine = async () => {
    const cleanName = routineName.trim();
    if (!cleanName) {
      setBuilderError('Escribe un nombre para la rutina (ej. Lower B, Upper A).');
      return;
    }
    if (draftExercises.length === 0) {
      setBuilderError('Agrega al menos un ejercicio a la rutina.');
      return;
    }

    setSavingRoutine(true);
    const payload = {
      user_id: userId,
      name: cleanName,
      exercises: draftExercises,
    };

    const { error } = editingRoutine
      ? await supabase.from('strength_routines').update(payload).eq('id', editingRoutine.id)
      : await supabase.from('strength_routines').insert(payload);

    setSavingRoutine(false);

    if (error) {
      setBuilderError(`Error: ${error.message}`);
      return;
    }

    await onRefresh();
    setBuilderVisible(false);
  };

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return;
    await supabase.from('strength_routines').delete().eq('id', routineToDelete.id);
    setRoutineToDelete(null);
    await onRefresh();
  };

  const renderRoutineCard = ({ item }) => {
    const exerciseSummary = (item.exercises || [])
      .map((ex) => `${ex.name} (${ex.sets?.length ?? 1}x${ex.sets?.[0]?.reps ?? 10})`)
      .join(', ');

    return (
      <View style={styles.routineCard}>
        <View style={styles.routineHeader}>
          <Text style={styles.routineTitle}>{item.name}</Text>
          <View style={styles.routineIconRow}>
            <TouchableOpacity style={styles.smallIconBtn} onPress={() => openEditRoutine(item)}>
              <Ionicons name="create-outline" size={18} color="#B8C7D2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallIconBtn}
              onPress={() => setRoutineToDelete(item)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF8A80" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.routineSummary} numberOfLines={2}>
          {exerciseSummary || 'Sin ejercicios configurados'}
        </Text>

        <TouchableOpacity
          style={styles.startRoutineBtn}
          onPress={() => startRoutineWorkout(item)}
          accessibilityRole="button"
        >
          <Ionicons name="play" size={15} color="#121212" />
          <Text style={styles.startRoutineBtnText}>Empezar Rutina</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutineCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Entrenamiento</Text>

            {/* Resumen de métricas históricas */}
            <View style={styles.statsCard}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalWorkouts}</Text>
                <Text style={styles.statLabel}>Sesiones</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{Math.round(totalVolume).toLocaleString()} kg</Text>
                <Text style={styles.statLabel}>Volumen</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalSeries}</Text>
                <Text style={styles.statLabel}>Series</Text>
              </View>
            </View>

            {/* Botón principal estilo Hevy: Empezar Entrenamiento Vacío */}
            <TouchableOpacity style={styles.emptyStartBtn} onPress={startEmptyWorkout}>
              <Ionicons name="add" size={20} color="#00E676" />
              <Text style={styles.emptyStartText}>Empezar Entrenamiento Vacío</Text>
            </TouchableOpacity>

            {/* Cabecera de sección Rutinas */}
            <View style={styles.routinesSectionHeader}>
              <Text style={styles.sectionTitle}>Mis rutinas ({routines.length})</Text>
              <TouchableOpacity style={styles.newRoutineBtn} onPress={openCreateRoutine}>
                <Ionicons name="clipboard-outline" size={16} color="#121212" />
                <Text style={styles.newRoutineBtnText}>Nueva Rutina</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="barbell-outline" size={28} color="#77858F" />
            <Text style={styles.emptyTitle}>Aún no tienes rutinas</Text>
            <Text style={styles.emptyDesc}>
              Crea una rutina (ej. Lower B, Upper A) o inicia un entrenamiento vacío arriba.
            </Text>
          </View>
        }
        ListFooterComponent={
          workouts.length > 0 ? (
            <View style={styles.historySection}>
              <Text style={styles.historyHeading}>ENTRENAMIENTOS RECIENTES</Text>
              {workouts.slice(0, 5).map((w) => (
                <View key={w.id} style={styles.historyCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{w.routine_name}</Text>
                    <Text style={styles.historyMeta}>
                      {formatDurationShort(w.duration_seconds)} ·{' '}
                      {Math.round(Number(w.total_volume_kg)).toLocaleString()} kg ·{' '}
                      {w.completed_sets} series
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#00E676" />
                </View>
              ))}
            </View>
          ) : null
        }
      />

      {/* Pantalla de Entrenamiento Activo con cronómetro */}
      <ActiveWorkoutScreen
        visible={activeWorkoutVisible}
        userId={userId}
        routine={selectedRoutine}
        onClose={() => setActiveWorkoutVisible(false)}
        onWorkoutFinished={onRefresh}
      />

      {/* Modal Creador / Editor de Rutina */}
      <Modal
        visible={builderVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBuilderVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.backdrop}>
            <View style={styles.panel}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>
                  {editingRoutine ? 'Editar Rutina' : 'Nueva Rutina'}
                </Text>

                <Text style={styles.label}>Nombre de la rutina</Text>
                <TextInput
                  style={styles.input}
                  value={routineName}
                  onChangeText={setRoutineName}
                  placeholder="Ej. Lower B / Pecho y Espalda"
                  placeholderTextColor="#77858F"
                />

                <Text style={styles.label}>Añadir ejercicio a la rutina</Text>
                <TextInput
                  style={styles.input}
                  value={exNameInput}
                  onChangeText={setExNameInput}
                  placeholder="Nombre (ej. Sentadilla Búlgara)"
                  placeholderTextColor="#77858F"
                />

                <View style={styles.miniRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Series</Text>
                    <TextInput
                      style={styles.input}
                      value={exSetsInput}
                      onChangeText={setExSetsInput}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Reps</Text>
                    <TextInput
                      style={styles.input}
                      value={exRepsInput}
                      onChangeText={setExRepsInput}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Peso (kg)</Text>
                    <TextInput
                      style={styles.input}
                      value={exKgInput}
                      onChangeText={setExKgInput}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.addExDraftBtn} onPress={addExerciseToDraft}>
                  <Ionicons name="add" size={18} color="#00E676" />
                  <Text style={styles.addExDraftText}>Agregar a la lista</Text>
                </TouchableOpacity>

                {/* Lista de ejercicios ya añadidos a la rutina */}
                {draftExercises.map((ex, idx) => (
                  <View key={ex.id} style={styles.draftItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.draftItemTitle}>
                        {idx + 1}. {ex.name}
                      </Text>
                      <Text style={styles.draftItemSub}>
                        {ex.sets.length} series × {ex.sets[0]?.reps} reps ({ex.sets[0]?.kg} kg)
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeDraftExercise(ex.id)}>
                      <Ionicons name="close-circle" size={20} color="#FF8A80" />
                    </TouchableOpacity>
                  </View>
                ))}

                {builderError ? <Text style={styles.errorText}>{builderError}</Text> : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setBuilderVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveRoutine}
                    disabled={savingRoutine}
                  >
                    <Text style={styles.saveText}>
                      {savingRoutine ? 'Guardando...' : 'Guardar Rutina'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Confirmar Eliminar Rutina */}
      <Modal
        visible={routineToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRoutineToDelete(null)}
      >
        <View style={styles.backdrop}>
          <View style={styles.panel}>
            <Text style={styles.modalTitle}>Eliminar rutina</Text>
            <Text style={styles.modalDesc}>
              ¿Quieres eliminar la rutina “{routineToDelete?.name}”?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRoutineToDelete(null)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteRoutine}>
                <Text style={styles.deleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2821',
    borderColor: '#2B3E33',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    marginBottom: 12,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#00E676', fontSize: 15, fontWeight: '700' },
  statLabel: { color: '#C4CCC7', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: '#2B3E33' },
  emptyStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E1E1E',
    borderColor: '#2E3531',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    marginBottom: 18,
  },
  emptyStartText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  routinesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  newRoutineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#00E676',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  newRoutineBtnText: { color: '#121212', fontSize: 12, fontWeight: '700' },
  routineCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2B302D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  routineTitle: { color: '#FFF', fontSize: 17, fontWeight: '700', flex: 1 },
  routineIconRow: { flexDirection: 'row', gap: 4 },
  smallIconBtn: { padding: 4 },
  routineSummary: { color: '#AAA', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  startRoutineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00E676',
    borderRadius: 8,
    paddingVertical: 11,
  },
  startRoutineBtnText: { color: '#121212', fontSize: 14, fontWeight: '700' },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: '#1A1D1B',
    borderRadius: 12,
    padding: 22,
    gap: 6,
  },
  emptyTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  emptyDesc: { color: '#AAA', fontSize: 12, textAlign: 'center' },
  historySection: { marginTop: 14 },
  historyHeading: { color: '#88938C', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181B19',
    borderColor: '#262B28',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  historyTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  historyMeta: { color: '#9AE6B4', fontSize: 12, marginTop: 2 },
  backdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.78)' },
  panel: {
    backgroundColor: '#1B1E1C',
    borderColor: '#343A36',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: { color: '#FFF', fontSize: 19, fontWeight: '700', marginBottom: 14 },
  modalDesc: { color: '#C4CCC7', fontSize: 14, lineHeight: 20, marginBottom: 14 },
  label: { color: '#D5DDD8', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  miniLabel: { color: '#AAA', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  input: {
    backgroundColor: '#121412',
    borderColor: '#3A433D',
    borderWidth: 1,
    borderRadius: 8,
    color: '#FFF',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  miniRow: { flexDirection: 'row', gap: 8 },
  addExDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#173326',
    borderColor: '#00E676',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    marginBottom: 12,
  },
  addExDraftText: { color: '#00E676', fontSize: 13, fontWeight: '700' },
  draftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121412',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  draftItemTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  draftItemSub: { color: '#9AE6B4', fontSize: 11, marginTop: 2 },
  errorText: { color: '#FF8A80', fontSize: 12, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { color: '#D2D8D4', fontSize: 14, fontWeight: '600' },
  saveBtn: { backgroundColor: '#00E676', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  saveText: { color: '#121212', fontSize: 14, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#B3261E', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  deleteText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});