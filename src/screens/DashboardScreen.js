
// Importa Ionicons, una biblioteca de iconos para la aplicación.
import { Ionicons } from '@expo/vector-icons';

// Importa componentes de React Native:
// FlatList: muestra listas de elementos.
// StyleSheet: permite organizar los estilos.
// Text: muestra textos.
// TouchableOpacity: crea elementos que responden al tacto.
// View: funciona como contenedor de otros componentes.
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// Define y exporta la pantalla principal del Dashboard.
// Recibe tres propiedades:
// sections: contiene las secciones disponibles.
// recordsBySection: contiene los registros organizados por sección.
// onSelectSection: función que permite seleccionar una sección.
export default function DashboardScreen({ sections, recordsBySection, onSelectSection }) {

  // Calcula el número total de registros de todas las secciones.
  const totalRecords = sections.reduce(

    // total representa la suma acumulada.
    // section representa cada sección que se está recorriendo.
    // Se obtiene la cantidad de registros de cada sección
    // y se suma al total.
    (total, section) => total + (recordsBySection[section.id]?.length ?? 0),

    // Inicializa la suma en cero.
    0,
  );


  // Define una función que construye visualmente cada sección de la lista.
  // item representa la sección que se está mostrando.
  const renderSection = ({ item }) => (

    // Crea una tarjeta que responde cuando el usuario la presiona.
    <TouchableOpacity

      // Aplica los estilos definidos para la tarjeta.
      style={styles.sectionCard}

      // Cuando se presiona la tarjeta, ejecuta onSelectSection
      // y envía el identificador de la sección seleccionada.
      onPress={() => onSelectSection(item.id)}

      // Indica que este elemento funciona como un botón
      // para mejorar la accesibilidad.
      accessibilityRole="button"

      // Proporciona una descripción para lectores de pantalla.
      accessibilityLabel={`Abrir sección ${item.label}`}
    >

      {/* Contenedor donde se muestra el icono de la sección. */}
      <View style={styles.sectionIcon}>

        {/* Muestra el icono correspondiente a cada sección.
            item.icon contiene el nombre del icono.
            size establece su tamaño.
            color establece su color. */}
        <Ionicons name={item.icon} size={22} color="#00E676" />

      </View>

      {/* Contenedor que agrupa la información de la sección. */}
      <View style={styles.sectionCopy}>

        {/* Muestra el nombre de la sección. */}
        <Text style={styles.sectionTitle}>{item.label}</Text>

        {/* Muestra la descripción de la sección. */}
        <Text style={styles.sectionDescription}>{item.description}</Text>

        {/* Muestra cuántos registros existen en esta sección.
            Si no existen registros, muestra cero. */}
        <Text style={styles.sectionCount}>
          {recordsBySection[item.id]?.length ?? 0} registros
        </Text>

      </View>

      {/* Muestra una flecha que indica que se puede ingresar
          a la sección seleccionada. */}
      <Ionicons name="chevron-forward" size={19} color="#88938C" />

    </TouchableOpacity>
  );


  // Retorna el contenido visual del Dashboard.
  return (

    // FlatList permite mostrar una lista de secciones
    // de manera eficiente, renderizando sus elementos.
    <FlatList

      // Establece las secciones que se mostrarán en la lista.
      data={sections}

      // Obtiene el identificador único de cada sección.
      // Esto ayuda a React Native a identificar los elementos.
      keyExtractor={(item) => item.id}

      // Indica qué función se utilizará para dibujar cada sección.
      renderItem={renderSection}

      // Aplica los estilos al contenedor de toda la lista.
      contentContainerStyle={styles.content}

      // Oculta la barra vertical que indica el desplazamiento.
      showsVerticalScrollIndicator={false}

      // Define el contenido que aparecerá antes de las tarjetas.
      ListHeaderComponent={(

        // Contenedor de la cabecera del Dashboard.
        <View>

          {/* Muestra una pequeña etiqueta superior. */}
          <Text style={styles.eyebrow}>PLAN DE BIENESTAR</Text>

          {/* Muestra el título principal del Dashboard. */}
          <Text style={styles.title}>Tus módulos</Text>

          {/* Muestra una descripción de las secciones. */}
          <Text style={styles.subtitle}>
            Organiza cada parte de tu rutina en su propia sección.
          </Text>

          {/* Contenedor que muestra el resumen de registros. */}
          <View style={styles.summary}>

            {/* Icono que representa los módulos o registros. */}
            <Ionicons name="albums-outline" size={20} color="#00E676" />

            {/* Muestra el total de registros del plan.
                Si existe un solo registro, utiliza "registro".
                Si hay más de uno, utiliza "registros". */}
            <Text style={styles.summaryText}>
              {totalRecords} {totalRecords === 1 ? 'registro' : 'registros'} en tu plan
            </Text>

          </View>

          {/* Título que identifica la lista de secciones. */}
          <Text style={styles.listHeading}>SECCIONES</Text>

        </View>
      )}

    />
  );
}


// Crea y organiza todos los estilos utilizados en el Dashboard.
const styles = StyleSheet.create({

  // Estilos del contenedor principal de la lista.
  content: {
    paddingBottom: 16, // Agrega espacio al final de la lista.
  },

  // Estilos de la etiqueta superior.
  eyebrow: {
    color: '#9AE6B4', // Color verde claro.
    fontSize: 11, // Tamaño del texto.
    fontWeight: '700', // Texto en negrita.
    marginBottom: 7, // Separación inferior.
  },

  // Estilos del título principal.
  title: {
    color: '#FFF', // Texto blanco.
    fontSize: 25, // Tamaño de 25 puntos.
    fontWeight: '700', // Texto en negrita.
  },

  // Estilos del texto descriptivo.
  subtitle: {
    color: '#AAA', // Color gris.
    fontSize: 14, // Tamaño del texto.
    lineHeight: 20, // Altura entre líneas.
    marginTop: 6, // Separación superior.
  },

  // Estilos del contenedor del resumen.
  summary: {
    flexDirection: 'row', // Organiza los elementos horizontalmente.
    alignItems: 'center', // Centra los elementos verticalmente.
    gap: 10, // Espacio entre el icono y el texto.
    backgroundColor: '#1C2821', // Fondo verde oscuro.
    borderRadius: 8, // Redondea las esquinas.
    marginTop: 20, // Separación superior.
    padding: 14, // Espacio interno.
  },

  // Estilos del texto que muestra el total de registros.
  summaryText: {
    color: '#E1E9E3', // Color del texto.
    fontSize: 14, // Tamaño de letra.
    fontWeight: '600', // Grosor seminegrita.
  },

  // Estilos del título de la lista de secciones.
  listHeading: {
    color: '#88938C', // Color gris verdoso.
    fontSize: 11, // Tamaño pequeño.
    fontWeight: '700', // Texto en negrita.
    marginTop: 24, // Separación superior.
    marginBottom: 10, // Separación inferior.
  },

  // Estilos de cada tarjeta de sección.
  sectionCard: {
    flexDirection: 'row', // Organiza los elementos en una fila.
    alignItems: 'center', // Centra verticalmente los elementos.
    gap: 12, // Espacio entre los elementos.
    backgroundColor: '#1E1E1E', // Fondo gris oscuro.
    borderRadius: 10, // Redondea las esquinas.
    marginBottom: 10, // Separa las tarjetas.
    padding: 14, // Espacio interno.
  },

  // Estilos del contenedor del icono.
  sectionIcon: {
    width: 42, // Ancho de 42 puntos.
    height: 42, // Alto de 42 puntos.
    alignItems: 'center', // Centra horizontalmente el icono.
    justifyContent: 'center', // Centra verticalmente el icono.
    backgroundColor: '#1C2821', // Fondo verde oscuro.
    borderRadius: 8, // Redondea las esquinas.
  },

  // Estilos del contenedor de información de cada sección.
  sectionCopy: {
    flex: 1, // Ocupa el espacio disponible.
    gap: 3, // Separa los textos.
  },

  // Estilos del nombre de cada sección.
  sectionTitle: {
    color: '#FFF', // Texto blanco.
    fontSize: 15, // Tamaño del texto.
    fontWeight: '700', // Texto en negrita.
  },

  // Estilos de la descripción de cada sección.
  sectionDescription: {
    color: '#AAA', // Texto gris.
    fontSize: 12, // Tamaño pequeño.
    lineHeight: 17, // Altura entre líneas.
  },

  // Estilos de la cantidad de registros de cada sección.
  sectionCount: {
    color: '#9AE6B4', // Texto verde claro.
    fontSize: 11, // Tamaño pequeño.
    fontWeight: '600', // Grosor seminegrita.
    marginTop: 2, // Separación superior.
  },

});
