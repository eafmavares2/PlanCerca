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

export function SectionCrudScreen({ sectionId, title, subtitle, records, onSaveRecord, onDeleteRecord }) {
  const [modalMode, setModalMode] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [formError, setFormError] = useState('');

  const closeModal = () => {
    setModalMode(null);
    setEditingRecord(null);
    setRecordToDelete(null);
    setFormError('');
  };

  const openCreateForm = () => {
    setEditingRecord(null);
    setName('');
    setDescription('');
    setTarget('');
    setFormError('');
    setModalMode('form');
  };

  const openEditForm = (record) => {
    setEditingRecord(record);
    setName(record.title);
    setDescription(record.description);
    setTarget(record.target ?? '');
    setFormError('');
    setModalMode('form');
  };

  const saveRecord = () => {
    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (!cleanName || !cleanDescription) {
      setFormError('Completa el nombre y el detalle del registro.');
      return;
    }

    onSaveRecord({
      id: editingRecord?.id ?? `${sectionId}-${Date.now()}`,
      title: cleanName,
      description: cleanDescription,
      target: target.trim(),
    });
    closeModal();
  };

  const confirmDelete = () => {
    if (recordToDelete) onDeleteRecord(recordToDelete.id);
    closeModal();
  };

  const renderRecord = ({ item }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordCopy}>
        <View style={styles.recordHeading}>
          <Text style={styles.recordTitle}>{item.title}</Text>
          {item.target ? <Text style={styles.recordTarget}>{item.target}</Text> : null}
        </View>
        <Text style={styles.recordDescription}>{item.description}</Text>
      </View>
      <View style={styles.recordActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => openEditForm(item)}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${item.title}`}
        >
          <Ionicons name="create-outline" size={19} color="#B8C7D2" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setRecordToDelete(item);
            setModalMode('delete');
          }}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${item.title}`}
        >
          <Ionicons name="trash-outline" size={19} color="#FF8A80" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateForm}
          accessibilityRole="button"
          accessibilityLabel={`Agregar registro de ${title}`}
        >
          <Ionicons name="add" size={20} color="#121212" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        contentContainerStyle={[styles.listContent, records.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={30} color="#77858F" />
            <Text style={styles.emptyTitle}>Aún no hay registros</Text>
            <Text style={styles.emptyDescription}>Agrega el primero para esta sección.</Text>
          </View>
        )}
      />

      <Modal
        visible={modalMode !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBackdrop}>
            {modalMode === 'delete' ? (
              <View style={styles.modalPanel}>
                <Text style={styles.modalTitle}>Eliminar registro</Text>
                <Text style={styles.modalDescription}>
                  ¿Quieres eliminar “{recordToDelete?.title}”? Esta acción no se puede deshacer.
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
                    <Text style={styles.primaryButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.modalPanel}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  <Text style={styles.modalTitle}>
                    {editingRecord ? 'Editar registro' : 'Nuevo registro'}
                  </Text>
                  <Text style={styles.fieldLabel}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={(value) => {
                      setName(value);
                      setFormError('');
                    }}
                    placeholder="Ej. Press banca"
                    placeholderTextColor="#77858F"
                    maxLength={70}
                    returnKeyType="next"
                  />
                  <Text style={styles.fieldLabel}>Detalle</Text>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={description}
                    onChangeText={(value) => {
                      setDescription(value);
                      setFormError('');
                    }}
                    placeholder="Describe el ejercicio o hábito"
                    placeholderTextColor="#77858F"
                    multiline
                    numberOfLines={3}
                    maxLength={180}
                  />
                  <Text style={styles.fieldLabel}>Meta (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={target}
                    onChangeText={setTarget}
                    placeholder="Ej. 3 series"
                    placeholderTextColor="#77858F"
                    maxLength={50}
                    returnKeyType="done"
                  />
                  {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={saveRecord}>
                      <Text style={styles.primaryButtonText}>Guardar</Text>
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
  screen: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  sectionCopy: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#AAA',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  addButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#00E676',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  addButtonText: {
    color: '#121212',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 28,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDescription: {
    color: '#AAA',
    fontSize: 13,
    textAlign: 'center',
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  recordCopy: {
    flex: 1,
    gap: 6,
  },
  recordHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  recordTitle: {
    color: '#FFF',
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  recordTarget: {
    color: '#9AE6B4',
    backgroundColor: '#173326',
    borderRadius: 5,
    fontSize: 11,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  recordDescription: {
    color: '#AAA',
    fontSize: 13,
    lineHeight: 19,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 2,
  },
  iconButton: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalKeyboard: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  modalPanel: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    alignSelf: 'center',
    backgroundColor: '#1B1E1C',
    borderColor: '#343A36',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalDescription: {
    color: '#C4CCC7',
    fontSize: 14,
    lineHeight: 21,
  },
  fieldLabel: {
    color: '#D5DDD8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#121412',
    borderColor: '#3A433D',
    borderRadius: 8,
    borderWidth: 1,
    color: '#FFF',
    fontSize: 15,
    minHeight: 46,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF8A80',
    fontSize: 13,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  cancelButtonText: {
    color: '#D2D8D4',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    minHeight: 42,
    minWidth: 98,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00E676',
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  deleteButton: {
    minHeight: 42,
    minWidth: 98,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B3261E',
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
