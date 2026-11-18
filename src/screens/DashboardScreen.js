import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen({ sections, recordsBySection, onSelectSection }) {
  const totalRecords = sections.reduce(
    (total, section) => total + (recordsBySection[section.id]?.length ?? 0),
    0,
  );

  const renderSection = ({ item }) => (
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
        <Text style={styles.sectionCount}>
          {recordsBySection[item.id]?.length ?? 0} registros
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#88938C" />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderSection}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={(
        <View>
          <Text style={styles.eyebrow}>PLAN DE BIENESTAR</Text>
          <Text style={styles.title}>Tus módulos</Text>
          <Text style={styles.subtitle}>
            Organiza cada parte de tu rutina en su propia sección.
          </Text>
          <View style={styles.summary}>
            <Ionicons name="albums-outline" size={20} color="#00E676" />
            <Text style={styles.summaryText}>
              {totalRecords} {totalRecords === 1 ? 'registro' : 'registros'} en tu plan
            </Text>
          </View>
          <Text style={styles.listHeading}>SECCIONES</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 16,
  },
  eyebrow: {
    color: '#9AE6B4',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 7,
  },
  title: {
    color: '#FFF',
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    color: '#AAA',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1C2821',
    borderRadius: 8,
    marginTop: 20,
    padding: 14,
  },
  summaryText: {
    color: '#E1E9E3',
    fontSize: 14,
    fontWeight: '600',
  },
  listHeading: {
    color: '#88938C',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 10,
    padding: 14,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C2821',
    borderRadius: 8,
  },
  sectionCopy: {
    flex: 1,
    gap: 3,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDescription: {
    color: '#AAA',
    fontSize: 12,
    lineHeight: 17,
  },
  sectionCount: {
    color: '#9AE6B4',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
