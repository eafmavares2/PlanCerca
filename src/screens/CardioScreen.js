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
import { PedometerCard } from '../components/PedometerCard';
import { supabase } from '../lib/supabase';

const INTENSITIES = ['Baja', 'Media', 'Alta'];

export default function CardioScreen({ userId, records, onRefresh, pedometer }) {
  const [modalMode, setModalMode] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [activityName, setActivityName] = useState('');
  const [durationMin, setDurationMin] = useState('30');
  const [distanceKm, setDistanceKm] = useState('4.5');
  const [calories, setCalories] = useState('250');
  const [intensity, setIntensity] = useState('Media');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Estadísticas propias de Cardio
  const totalMinutes = records.reduce((sum, r) => sum + Number(r.duration_min), 0);
  const totalDistance = records.reduce((sum, r) => sum + Number(r.distance_km), 0);
  const totalCalories = records.reduce((sum, r) => sum + Number(r.calories), 0);

  const closeModal = () => {
    setModalMode(null);
    setEditingRecord(null);
    setRecordToDelete(null);
    setFormError('');
  };

  const openCreate = () => {
    setEditingRecord(null);
    setActivityName('');
    setDurationMin('30');
    setDistanceKm('4.5');
    setCalories('250');
    setIntensity('Media');
    setNotes('');
    setFormError('');
    setModalMode('form');
  };

  const openEdit = (item) => {
    setEditingRecord(item);
    setActivityName(item.activity_name);
    setDurationMin(String(item.duration_min));
    setDistanceKm(String(item.distance_km));
    setCalories(String(item.calories));
    setIntensity(item.intensity || 'Media');
    setNotes(item.notes || '');
    setFormError('');
    setModalMode('form');
  };

  const handleSave = async () => {
    const cleanName = activityName.trim();
    const parsedMin = parseInt(durationMin, 10) || 0;
    const parsedKm = parseFloat(distanceKm) || 0;
    const parsedKcal = parseInt(calories, 10) || 0;

    if (!cleanName) {
      setFormError('Escribe el nombre de la actividad.');
      return;
    }

    setSaving(true);
    const payload = {
      user_id: userId,
      activity_name: cleanName,
      duration_min: parsedMin,
      distance_km: parsedKm,
      calories: parsedKcal,
      intensity,
      notes: notes.trim(),
    };

    const { error } = editingRecord
      ? await supabase.from('cardio_records').update(payload).eq('id', editingRecord.id)
      : await supabase.from('cardio_records').insert(payload);

    setSaving(false);
    if (error) {
      setFormError('No se pudo guardar la sesión de cardio.');
      return;
    }

    await onRefresh();
    closeModal();
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    await supabase.from('cardio_records').delete().eq('id', recordToDelete.id);
    await onRefresh();
    closeModal();
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordCopy}>
        <View style={styles.badgeRow}>
          <Text style={styles.intensityBadge}>Intensidad {item.intensity}</Text>
          <Text style={styles.kcalBadge}>{item.calories} kcal</Text>
        </View>
        <Text style={styles.recordTitle}>{item.activity_name}</Text>
        <Text style={styles.recordMetrics}>
          {item.duration_min} min · {item.distance_km} km
        </Text>
        {item.notes ? <Text style={styles.recordNotes}>{item.notes}</Text> : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={19} color="#B8C7D2" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            setRecordToDelete(item);
            setModalMode('delete');
          }}
        >
          <Ionicons name="trash-outline" size={19} color="#FF8A80" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Cardio y Pasos</Text>
          <Text style={styles.subtitle}>Podómetro y sesiones cardiovasculares.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color="#121212" />
          <Text style={styles.addBtnText}>Sesión</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <PedometerCard
              {...pedometer}
              onAddManualSteps={pedometer.addManualSteps}
            />

            <View style={styles.statsCard}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalMinutes} min</Text>
                <Text style={styles.statLabel}>Tiempo total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalDistance.toFixed(1)} km</Text>
                <Text style={styles.statLabel}>Distancia</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalCalories}</Text>
                <Text style={styles.statLabel}>Kcal cardio</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="pulse-outline" size={30} color="#77858F" />
            <Text style={styles.emptyTitle}>Sin sesiones de cardio</Text>
            <Text style={styles.emptyDesc}>Agrega tu primera carrera, caminata o ciclismo.</Text>
          </View>
        }
      />

      <Modal visible={modalMode !== null} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.backdrop}>
            {modalMode === 'delete' ? (
              <View style={styles.panel}>
                <Text style={styles.modalTitle}>Eliminar sesión</Text>
                <Text style={styles.modalDesc}>
                  ¿Quieres eliminar “{recordToDelete?.activity_name}”?
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.panel}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  <Text style={styles.modalTitle}>
                    {editingRecord ? 'Editar sesión cardio' : 'Nueva sesión cardio'}
                  </Text>

                  <Text style={styles.label}>Actividad</Text>
                  <TextInput
                    style={styles.input}
                    value={activityName}
                    onChangeText={setActivityName}
                    placeholder="Ej. Trote continuo / Bicicleta"
                    placeholderTextColor="#77858F"
                  />

                  <Text style={styles.label}>Intensidad</Text>
                  <View style={styles.chipRow}>
                    {INTENSITIES.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[styles.chip, intensity === item && styles.chipActive]}
                        onPress={() => setIntensity(item)}
                      >
                        <Text style={[styles.chipText, intensity === item && styles.chipTextActive]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Minutos</Text>
                      <TextInput
                        style={styles.input}
                        value={durationMin}
                        onChangeText={setDurationMin}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Km</Text>
                      <TextInput
                        style={styles.input}
                        value={distanceKm}
                        onChangeText={setDistanceKm}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Kcal</Text>
                      <TextInput
                        style={styles.input}
                        value={calories}
                        onChangeText={setCalories}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.label}>Notas (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Ej. Ritmo constante 5:40/km"
                    placeholderTextColor="#77858F"
                  />

                  {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                      <Text style={styles.saveText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#AAA', fontSize: 13, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00E676',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addBtnText: { color: '#121212', fontSize: 13, fontWeight: '700' },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2821',
    borderColor: '#2B3E33',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#00E676', fontSize: 16, fontWeight: '700' },
  statLabel: { color: '#C4CCC7', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 26, backgroundColor: '#2B3E33' },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderColor: '#2B302D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  recordCopy: { flex: 1, gap: 4 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 2 },
  intensityBadge: {
    color: '#9AE6B4',
    backgroundColor: '#173326',
    borderRadius: 5,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  kcalBadge: {
    color: '#D5DDD8',
    backgroundColor: '#262B28',
    borderRadius: 5,
    fontSize: 11,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  recordTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  recordMetrics: { color: '#00E676', fontSize: 13, fontWeight: '600' },
  recordNotes: { color: '#AAA', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 36, height: 38, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  emptyDesc: { color: '#AAA', fontSize: 13, textAlign: 'center' },
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
  modalDesc: { color: '#C4CCC7', fontSize: 14, lineHeight: 20 },
  label: { color: '#D5DDD8', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: {
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
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#121412',
    borderColor: '#3A433D',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#173326', borderColor: '#00E676' },
  chipText: { color: '#AAA', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#00E676' },
  rowInputs: { flexDirection: 'row', gap: 8 },
  errorText: { color: '#FF8A80', fontSize: 13, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { color: '#D2D8D4', fontSize: 14, fontWeight: '600' },
  saveBtn: { backgroundColor: '#00E676', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  saveText: { color: '#121212', fontSize: 14, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#B3261E', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  deleteText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});