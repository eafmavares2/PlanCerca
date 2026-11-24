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

const WATER_GOAL_ML = 2500;
const MEAL_TIMES = ['Desayuno', 'Almuerzo', 'Cena', 'Snack', 'Hidratación'];

export default function NutritionHydrationScreen({ userId, records, onRefresh }) {
  const [modalMode, setModalMode] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [entryType, setEntryType] = useState('nutrition');
  const [title, setTitle] = useState('');
  const [mealTime, setMealTime] = useState('Almuerzo');
  const [waterMl, setWaterMl] = useState('0');
  const [calories, setCalories] = useState('450');
  const [proteinG, setProteinG] = useState('30');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Estadísticas propias del módulo unificado
  const totalWaterMl = records.reduce((sum, r) => sum + Number(r.water_ml), 0);
  const totalCalories = records.reduce((sum, r) => sum + Number(r.calories), 0);
  const totalProtein = records.reduce((sum, r) => sum + Number(r.protein_g), 0);
  const waterPercent = Math.min(100, Math.round((totalWaterMl / WATER_GOAL_ML) * 100));

  const quickAddWater = async (ml) => {
    await supabase.from('nutrition_hydration_records').insert({
      user_id: userId,
      entry_type: 'hydration',
      title: `Vaso de agua (${ml} ml)`,
      meal_time: 'Hidratación',
      water_ml: ml,
      calories: 0,
      protein_g: 0,
      notes: 'Registro rápido',
    });
    await onRefresh();
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingRecord(null);
    setRecordToDelete(null);
    setFormError('');
  };

  const openCreate = () => {
    setEditingRecord(null);
    setEntryType('nutrition');
    setTitle('');
    setMealTime('Almuerzo');
    setWaterMl('0');
    setCalories('450');
    setProteinG('30');
    setNotes('');
    setFormError('');
    setModalMode('form');
  };

  const openEdit = (item) => {
    setEditingRecord(item);
    setEntryType(item.entry_type || 'nutrition');
    setTitle(item.title);
    setMealTime(item.meal_time || 'Almuerzo');
    setWaterMl(String(item.water_ml));
    setCalories(String(item.calories));
    setProteinG(String(item.protein_g));
    setNotes(item.notes || '');
    setFormError('');
    setModalMode('form');
  };

  const handleSave = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('Escribe el nombre del alimento o bebida.');
      return;
    }

    setSaving(true);
    const payload = {
      user_id: userId,
      entry_type: entryType,
      title: cleanTitle,
      meal_time: entryType === 'hydration' ? 'Hidratación' : mealTime,
      water_ml: parseInt(waterMl, 10) || 0,
      calories: parseInt(calories, 10) || 0,
      protein_g: parseFloat(proteinG) || 0,
      notes: notes.trim(),
    };

    const { error } = editingRecord
      ? await supabase
          .from('nutrition_hydration_records')
          .update(payload)
          .eq('id', editingRecord.id)
      : await supabase.from('nutrition_hydration_records').insert(payload);

    setSaving(false);
    if (error) {
      setFormError('No se pudo guardar el registro.');
      return;
    }

    await onRefresh();
    closeModal();
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    await supabase.from('nutrition_hydration_records').delete().eq('id', recordToDelete.id);
    await onRefresh();
    closeModal();
  };

  const renderItem = ({ item }) => {
    const isWater = item.entry_type === 'hydration';

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordCopy}>
          <View style={styles.badgeRow}>
            <Text style={[styles.typeBadge, isWater && styles.waterBadge]}>
              {isWater ? 'Hidratación' : item.meal_time}
            </Text>
            {Number(item.water_ml) > 0 ? (
              <Text style={styles.metricBadge}>{item.water_ml} ml</Text>
            ) : null}
            {Number(item.calories) > 0 ? (
              <Text style={styles.metricBadge}>{item.calories} kcal</Text>
            ) : null}
          </View>
          <Text style={styles.recordTitle}>{item.title}</Text>
          {!isWater ? (
            <Text style={styles.recordMetrics}>
              {item.calories} kcal · {item.protein_g} g proteína
            </Text>
          ) : null}
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
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Nutrición y Agua</Text>
          <Text style={styles.subtitle}>Comidas, macros e hidratación diaria.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color="#121212" />
          <Text style={styles.addBtnText}>Registrar</Text>
        </TouchableOpacity>
      </View>

      {/* Panel de progreso de hidratación + macros */}
      <View style={styles.statsCard}>
        <View style={styles.waterHeader}>
          <Text style={styles.waterTitle}>
            Agua acumulada: {totalWaterMl} / {WATER_GOAL_ML} ml ({waterPercent}%)
          </Text>
          <View style={styles.quickWaterRow}>
            <TouchableOpacity style={styles.quickWaterBtn} onPress={() => quickAddWater(250)}>
              <Text style={styles.quickWaterText}>+250 ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickWaterBtn} onPress={() => quickAddWater(500)}>
              <Text style={styles.quickWaterText}>+500 ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${waterPercent}%` }]} />
        </View>

        <View style={styles.macroRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalCalories} kcal</Text>
            <Text style={styles.statLabel}>Calorías</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalProtein.toFixed(1)} g</Text>
            <Text style={styles.statLabel}>Proteínas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{(totalWaterMl / 1000).toFixed(2)} L</Text>
            <Text style={styles.statLabel}>Hidratación</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="nutrition-outline" size={30} color="#77858F" />
            <Text style={styles.emptyTitle}>Sin registros hoy</Text>
            <Text style={styles.emptyDesc}>Usa +250 ml o agrega tu primera comida.</Text>
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
                <Text style={styles.modalTitle}>Eliminar registro</Text>
                <Text style={styles.modalDesc}>¿Quieres eliminar “{recordToDelete?.title}”?</Text>
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
                    {editingRecord ? 'Editar registro' : 'Nuevo registro'}
                  </Text>

                  <Text style={styles.label}>Tipo de registro</Text>
                  <View style={styles.chipRow}>
                    <TouchableOpacity
                      style={[styles.chip, entryType === 'nutrition' && styles.chipActive]}
                      onPress={() => {
                        setEntryType('nutrition');
                        setWaterMl('0');
                      }}
                    >
                      <Text style={[styles.chipText, entryType === 'nutrition' && styles.chipTextActive]}>
                        Comida / Nutrición
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chip, entryType === 'hydration' && styles.chipActive]}
                      onPress={() => {
                        setEntryType('hydration');
                        setWaterMl('500');
                        setCalories('0');
                        setProteinG('0');
                      }}
                    >
                      <Text style={[styles.chipText, entryType === 'hydration' && styles.chipTextActive]}>
                        Bebida / Agua
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>
                    {entryType === 'hydration' ? 'Bebida' : 'Alimento o comida'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={
                      entryType === 'hydration'
                        ? 'Ej. Botella de agua con electrolitos'
                        : 'Ej. Pechuga de pollo con arroz'
                    }
                    placeholderTextColor="#77858F"
                  />

                  {entryType === 'nutrition' ? (
                    <>
                      <Text style={styles.label}>Momento del día</Text>
                      <View style={styles.chipRow}>
                        {MEAL_TIMES.filter((m) => m !== 'Hidratación').map((m) => (
                          <TouchableOpacity
                            key={m}
                            style={[styles.chip, mealTime === m && styles.chipActive]}
                            onPress={() => setMealTime(m)}
                          >
                            <Text style={[styles.chipText, mealTime === m && styles.chipTextActive]}>
                              {m}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  ) : null}

                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Agua (ml)</Text>
                      <TextInput
                        style={styles.input}
                        value={waterMl}
                        onChangeText={setWaterMl}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Calorías</Text>
                      <TextInput
                        style={styles.input}
                        value={calories}
                        onChangeText={setCalories}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Proteína (g)</Text>
                      <TextInput
                        style={styles.input}
                        value={proteinG}
                        onChangeText={setProteinG}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  <Text style={styles.label}>Notas (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Ej. Post-entrenamiento"
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
    backgroundColor: '#1C2821',
    borderColor: '#2B3E33',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  waterTitle: { color: '#E1E9E3', fontSize: 12, fontWeight: '700', flex: 1 },
  quickWaterRow: { flexDirection: 'row', gap: 6 },
  quickWaterBtn: {
    backgroundColor: '#173326',
    borderColor: '#00E676',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quickWaterText: { color: '#00E676', fontSize: 11, fontWeight: '700' },
  progressTrack: {
    height: 8,
    backgroundColor: '#121412',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 12,
  },
  progressFill: { height: '100%', backgroundColor: '#00E676', borderRadius: 4 },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2B3E33',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#00E676', fontSize: 15, fontWeight: '700' },
  statLabel: { color: '#C4CCC7', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: '#2B3E33' },
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
  typeBadge: {
    color: '#9AE6B4',
    backgroundColor: '#173326',
    borderRadius: 5,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  waterBadge: {
    color: '#80D8FF',
    backgroundColor: '#132B3A',
  },
  metricBadge: {
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: {
    backgroundColor: '#121412',
    borderColor: '#3A433D',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
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