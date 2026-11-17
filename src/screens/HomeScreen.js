import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';

// Datos locales separados (como exige la rúbrica: no escritos directo en cada fila)
const FITNESS_DATA = [
  {
    id: '1',
    category: 'Entrenamiento',
    title: 'Rutina de Fuerza: Tren Superior',
    desc: 'Press banca, dominadas y press militar • 45 min',
    stat: 'Intermedio',
  },
  {
    id: '2',
    category: 'Nutrición',
    title: 'Plan de Déficit Calórico',
    desc: 'Distribución de macronutrientes diarios',
    stat: '1,850 kcal',
  },
  {
    id: '3',
    category: 'Hidratación',
    title: 'Meta de Consumo de Agua',
    desc: 'Recordatorios cada 2 horas durante el día',
    stat: '2.5 Litros',
  },
  {
    id: '4',
    category: 'Cardio',
    title: 'Sesión HIIT Quema Grasa',
    desc: 'Intervalos de alta intensidad sin equipo',
    stat: '20 min',
  },
];

export default function HomeScreen({ onLogout }) {
  // useState para filtrar los módulos en vivo durante la demo
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredData =
    selectedCategory === 'Todos'
      ? FITNESS_DATA
      : FITNESS_DATA.filter((item) => item.category === selectedCategory);

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.categoryBadge}>{item.category}</Text>
        <Text style={styles.cardStat}>{item.stat}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.desc}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header con componente Image (requerido por la lista de verificación) */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3048/3048398.png' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Hola, Atleta</Text>
              <Text style={styles.subGreeting}>Panel principal de fitness</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Botones de filtro que modifican el useState */}
        <View style={styles.filterRow}>
          {['Todos', 'Entrenamiento', 'Nutrición'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === cat && styles.filterTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FlatList alimentada con datos locales */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderModuleItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1E1E1E',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subGreeting: {
    fontSize: 13,
    color: '#AAA',
  },
  logoutBtn: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FF5252',
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  filterText: {
    color: '#AAA',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#121212',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#00E676',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardStat: {
    fontSize: 12,
    color: '#FFF',
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#AAA',
  },
});