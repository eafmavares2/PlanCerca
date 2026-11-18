
// Importa Ionicons para mostrar iconos dentro de la aplicación.
import { Ionicons } from '@expo/vector-icons';

// Importa useMemo y useState de React.
import { useMemo, useState } from 'react';

// Importa componentes y herramientas de React Native.
import {
  Image,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Importa SafeAreaView para respetar los espacios seguros de la pantalla.
import { SafeAreaView } from 'react-native-safe-area-context';

// Importa información inicial y configuraciones de las secciones.
import {
  HOME_TABS,
  INITIAL_SECTION_RECORDS,
  SECTION_DETAILS,
} from '../data/fitness-sections';

// Importa las pantallas de cada módulo.
import CardioScreen from './CardioScreen';
import DashboardScreen from './DashboardScreen';
import HydrationScreen from './HydrationScreen';
import NutritionScreen from './NutritionScreen';
import StrengthScreen from './StrengthScreen';

// Crea la lista de secciones sin incluir la pestaña principal.
const SECTIONS = HOME_TABS
  .filter((tab) => tab.id !== 'home')
  .map((tab) => ({
    ...tab,
    description: SECTION_DETAILS[tab.id],
  }));

// Relaciona cada sección con su pantalla correspondiente.
const SECTION_SCREENS = {
  strength: StrengthScreen,
  nutrition: NutritionScreen,
  hydration: HydrationScreen,
  cardio: CardioScreen,
};

// Define y exporta la pantalla principal.
export default function HomeScreen({ onLogout }) {

  // Guarda la pestaña seleccionada.
  const [selectedTabId, setSelectedTabId] = useState('home');

  // Guarda los registros de cada sección.
  const [recordsBySection, setRecordsBySection] = useState(
    INITIAL_SECTION_RECORDS
  );

  // Busca la pestaña seleccionada actualmente.
  const activeTab =
    HOME_TABS.find((tab) => tab.id === selectedTabId) ?? HOME_TABS[0];

  // Selecciona la pantalla que debe mostrarse.
  const ActiveScreen = selectedTabId === 'home'
    ? DashboardScreen
    : SECTION_SCREENS[selectedTabId];

  // Memoriza la configuración de los gestos táctiles.
  const panResponder = useMemo(
    () =>
      PanResponder.create({

        // Detecta los movimientos horizontales.
        onMoveShouldSetPanResponder: (_, { dx, dy }) =>
          Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy) * 1.3,

        // Cambia de pestaña cuando termina el movimiento.
        onPanResponderRelease: (_, { dx }) => {

          // Ignora movimientos demasiado pequeños.
          if (Math.abs(dx) < 60) return;

          // Actualiza la pestaña seleccionada.
          setSelectedTabId((currentId) => {

            // Busca la posición de la pestaña actual.
            const currentIndex = HOME_TABS.findIndex(
              (tab) => tab.id === currentId
            );

            // Calcula la posición de la siguiente pestaña.
            const nextIndex = Math.max(
              0,
              Math.min(
                HOME_TABS.length - 1,
                currentIndex + (dx < 0 ? 1 : -1)
              )
            );

            // Devuelve el identificador de la nueva pestaña.
            return HOME_TABS[nextIndex].id;
          });
        },
      }),
    []
  );

  // Guarda o actualiza un registro.
  const handleSaveRecord = (record) => {

    // Actualiza el estado de los registros.
    setRecordsBySection((current) => {

      // Obtiene los registros de la sección seleccionada.
      const sectionRecords = current[selectedTabId];

      // Comprueba si el registro ya existe.
      const alreadyExists = sectionRecords.some(
        (item) => item.id === record.id
      );

      // Actualiza el registro existente o agrega uno nuevo.
      const updatedRecords = alreadyExists
        ? sectionRecords.map((item) =>
            item.id === record.id ? record : item
          )
        : [record, ...sectionRecords];

      // Devuelve el estado actualizado.
      return {
        ...current,
        [selectedTabId]: updatedRecords,
      };
    });
  };

  // Elimina un registro mediante su identificador.
  const handleDeleteRecord = (recordId) => {

    // Actualiza los registros de la sección seleccionada.
    setRecordsBySection((current) => ({
      ...current,

      // Conserva los registros que no coinciden con el ID eliminado.
      [selectedTabId]: current[selectedTabId].filter(
        (item) => item.id !== recordId
      ),
    }));
  };

  // Prepara las propiedades que recibirá la pantalla activa.
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

  // Retorna la estructura visual de la pantalla principal.
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}
    >

      {/* Configura la barra de estado del dispositivo. */}
      <StatusBar
        backgroundColor="#121212"
        barStyle="light-content"
        translucent={false}
      />

      {/* Contenedor principal de la pantalla. */}
      <View style={styles.container}>

        {/* ENCABEZADO: información del usuario y botón de salida. */}
        <View style={styles.header}>

          {/* Agrupa la imagen y los textos de bienvenida. */}
          <View style={styles.userInfo}>

            {/* Imagen de perfil. */}
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3048/3048398.png',
              }}
              style={styles.avatar}
              accessibilityLabel="Perfil de deportista"
            />

            {/* Agrupa los textos de bienvenida. */}
            <View style={styles.greetingGroup}>

              {/* Saludo que cambia según la pestaña seleccionada. */}
              <Text style={styles.greeting}>
                {selectedTabId === 'home'
                  ? 'Hola, deportista'
                  : activeTab.label}
              </Text>

              {/* Descripción de la pantalla actual. */}
              <Text style={styles.subGreeting}>
                {selectedTabId === 'home'
                  ? 'Tu plan de bienestar'
                  : 'Administra tus registros'}
              </Text>

            </View>
          </View>

          {/* Botón para cerrar sesión. */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>

        </View>

        {/* CONTENIDO PRINCIPAL: muestra la pantalla seleccionada. */}
        <View
          style={styles.screenContent}
          {...panResponder.panHandlers}
        >

          {/* Renderiza dinámicamente el Dashboard o el módulo seleccionado. */}
          <ActiveScreen {...screenProps} />

        </View>

        {/* BARRA DE NAVEGACIÓN INFERIOR. */}
        <View style={styles.bottomBar}>

          {/* Crea un botón para cada pestaña. */}
          {HOME_TABS.map((tab) => {

            // Comprueba si la pestaña está seleccionada.
            const isActive = selectedTabId === tab.id;

            // Retorna el botón de navegación.
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabButton}

                // Cambia la pestaña cuando se presiona.
                onPress={() => setSelectedTabId(tab.id)}

                // Configura la accesibilidad del botón.
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >

                {/* Muestra el icono de la pestaña. */}
                <Ionicons
                  name={tab.icon}
                  size={20}
                  color={isActive ? '#00E676' : '#888'}
                />

                {/* Muestra el nombre de la pestaña. */}
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}
                >
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

// Define los estilos de todos los elementos de HomeScreen.
const styles = StyleSheet.create({

  // Área segura de la pantalla.
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Contenedor principal.
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Encabezado.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  // Información del usuario.
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  // Imagen de perfil.
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
  },

  // Grupo de textos de bienvenida.
  greetingGroup: {
    flex: 1,
  },

  // Saludo principal.
  greeting: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },

  // Texto secundario.
  subGreeting: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },

  // Botón para cerrar sesión.
  logoutButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  // Texto del botón de salida.
  logoutText: {
    color: '#FF8A80',
    fontSize: 13,
    fontWeight: '700',
  },

  // Espacio donde se muestra cada pantalla.
  screenContent: {
    flex: 1,
  },

  // Barra de navegación inferior.
  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    marginHorizontal: -20,
    paddingHorizontal: 4,
    paddingTop: 9,
    paddingBottom: 4,
  },

  // Botones de navegación.
  tabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },

  // Etiquetas de navegación.
  tabLabel: {
    color: '#888',
    fontSize: 9,
    fontWeight: '600',
  },

  // Estilo de la pestaña seleccionada.
  tabLabelActive: {
    color: '#00E676',
  },

});
