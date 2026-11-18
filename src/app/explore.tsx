
/* Importa Image de expo-image para mostrar imágenes optimizadas. */
import { Image } from 'expo-image';

/* Importa SymbolView para mostrar iconos del sistema operativo. */
import { SymbolView } from 'expo-symbols';

/* Importa herramientas de React Native:
   Platform identifica el sistema operativo.
   Pressable permite crear elementos táctiles.
   ScrollView permite desplazarse por el contenido.
   StyleSheet permite organizar los estilos. */
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';

/* Importa el hook que obtiene los espacios seguros de la pantalla,
   evitando que el contenido quede debajo de la barra de estado o navegación. */
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* Importa un componente para abrir enlaces externos. */
import { ExternalLink } from '@/components/external-link';

/* Importa el componente de texto que se adapta al tema de la aplicación. */
import { ThemedText } from '@/components/themed-text';

/* Importa el componente de vista que se adapta al tema de la aplicación. */
import { ThemedView } from '@/components/themed-view';

/* Importa Collapsible, que permite mostrar y ocultar contenido. */
import { Collapsible } from '@/components/ui/collapsible';

/* Importa WebBadge, una etiqueta que se muestra en la versión web. */
import { WebBadge } from '@/components/web-badge';

/* Importa constantes utilizadas para organizar espacios y dimensiones. */
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

/* Importa el hook que permite obtener los colores del tema actual. */
import { useTheme } from '@/hooks/use-theme';


/* Define y exporta el componente principal de esta pantalla. */
export default function TabTwoScreen() {

  /* Obtiene los espacios seguros de la pantalla del dispositivo. */
  const safeAreaInsets = useSafeAreaInsets();

  /* Crea un objeto con los espacios seguros y aumenta el espacio inferior
     para evitar que el contenido quede oculto detrás de la barra de pestañas. */
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  /* Obtiene los colores correspondientes al tema actual. */
  const theme = useTheme();

  /* Selecciona estilos diferentes dependiendo de la plataforma. */
  const contentPlatformStyle = Platform.select({

    /* Estilos específicos para Android. */
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },

    /* Estilos específicos para la versión web. */
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  /* Retorna todo el contenido visual de la pantalla. */
  return (

    /* ScrollView permite desplazarse verticalmente por el contenido.
       También aplica el color de fondo y los espacios de la pantalla. */
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>

      {/* Contenedor principal de toda la pantalla. */}
      <ThemedView style={styles.container}>

        {/* Contenedor del título y del enlace a Expo. */}
        <ThemedView style={styles.titleContainer}>

          {/* Muestra el título principal de la pantalla. */}
          <ThemedText type="subtitle">Explore</ThemedText>

          {/* Muestra un texto descriptivo debajo del título.
              themeColor establece el color del texto. */}
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            This starter app includes example{'\n'}code to help you get started.
          </ThemedText>

          {/* Componente que permite abrir la documentación de Expo.
              href contiene la dirección de la página web.
              asChild permite utilizar Pressable como elemento interactivo. */}
          <ExternalLink href="https://docs.expo.dev" asChild>

            {/* Pressable permite detectar cuando el usuario presiona el enlace.
                pressed indica si el elemento está siendo presionado. */}
            <Pressable style={({ pressed }) => pressed && styles.pressed}>

              {/* Contenedor que agrupa el texto y el icono del enlace. */}
              <ThemedView type="backgroundElement" style={styles.linkButton}>

                {/* Texto que identifica el enlace. */}
                <ThemedText type="link">Expo documentation</ThemedText>

                {/* Muestra un icono diferente dependiendo de la plataforma. */}
                <SymbolView
                  tintColor={theme.text}
                  name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
                  size={12}
                />

              </ThemedView>
            </Pressable>
          </ExternalLink>
        </ThemedView>

        {/* Contenedor que agrupa todas las secciones desplegables. */}
        <ThemedView style={styles.sectionsWrapper}>

          {/* Primera sección desplegable: explica la navegación por archivos. */}
          <Collapsible title="File-based routing">

            {/* Explica cuáles son los archivos que representan las pantallas. */}
            <ThemedText type="small">
              This app has two screens: <ThemedText type="code">src/app/index.tsx</ThemedText> and{' '}
              <ThemedText type="code">src/app/explore.tsx</ThemedText>
            </ThemedText>

            {/* Explica la función del archivo de configuración de navegación. */}
            <ThemedText type="small">
              The layout file in <ThemedText type="code">src/app/_layout.tsx</ThemedText> sets up
              the tab navigator.
            </ThemedText>

            {/* Enlace para consultar más información sobre Expo Router. */}
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>

          </Collapsible>

          {/* Segunda sección desplegable: explica la compatibilidad
              con Android, iOS y navegadores web. */}
          <Collapsible title="Android, iOS, and web support">

            {/* Contenedor del texto y la imagen de esta sección. */}
            <ThemedView type="backgroundElement" style={styles.collapsibleContent}>

              {/* Explica las plataformas disponibles para ejecutar la aplicación. */}
              <ThemedText type="small">
                You can open this project on Android, iOS, and the web. To open the web version,
                press <ThemedText type="smallBold">w</ThemedText> in the terminal running this
                project.
              </ThemedText>

              {/* Muestra una imagen ilustrativa sobre la versión web. */}
              <Image
                source={require('@/assets/images/tutorial-web.png')}
                style={styles.imageTutorial}
              />

            </ThemedView>
          </Collapsible>

          {/* Tercera sección desplegable: explica el uso de imágenes. */}
          <Collapsible title="Images">

            {/* Explica cómo utilizar imágenes con diferentes resoluciones. */}
            <ThemedText type="small">
              For static images, you can use the <ThemedText type="code">@2x</ThemedText> and{' '}
              <ThemedText type="code">@3x</ThemedText> suffixes to provide files for different
              screen densities.
            </ThemedText>

            {/* Muestra el logotipo de React Native. */}
            <Image source={require('@/assets/images/react-logo.png')} style={styles.imageReact} />

            {/* Enlace a la documentación oficial de imágenes de React Native. */}
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>

          </Collapsible>

          {/* Cuarta sección desplegable: explica los temas claro y oscuro. */}
          <Collapsible title="Light and dark mode components">

            {/* Explica que la aplicación puede cambiar sus colores
                dependiendo del tema seleccionado por el usuario. */}
            <ThemedText type="small">
              This template has light and dark mode support. The{' '}
              <ThemedText type="code">useColorScheme()</ThemedText> hook lets you inspect what the
              user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
            </ThemedText>

            {/* Enlace a la documentación de los temas de Expo. */}
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>

          </Collapsible>

          {/* Quinta sección desplegable: explica el funcionamiento
              de las animaciones en la aplicación. */}
          <Collapsible title="Animations">

            {/* Explica que Collapsible utiliza React Native Reanimated
                para realizar animaciones al abrir y cerrar secciones. */}
            <ThemedText type="small">
              This template includes an example of an animated component. The{' '}
              <ThemedText type="code">src/components/ui/collapsible.tsx</ThemedText> component uses
              the powerful <ThemedText type="code">react-native-reanimated</ThemedText> library to
              animate opening this hint.
            </ThemedText>

          </Collapsible>

        </ThemedView>

        {/* Comprueba si la aplicación se está ejecutando en un navegador.
            Si es así, muestra el componente WebBadge. */}
        {Platform.OS === 'web' && <WebBadge />}

      </ThemedView>
    </ScrollView>
  );
}


/* Crea y organiza todos los estilos utilizados en esta pantalla. */
const styles = StyleSheet.create({

  /* Estilo general del ScrollView. */
  scrollView: {
    flex: 1, // Ocupa todo el espacio disponible.
  },

  /* Organiza el contenido horizontalmente y lo centra. */
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  /* Define el contenedor principal. */
  container: {
    maxWidth: MaxContentWidth, // Establece el ancho máximo.
    flexGrow: 1, // Permite que el contenedor crezca.
  },

  /* Organiza el título, el texto y el enlace. */
  titleContainer: {
    gap: Spacing.three, // Espacio entre los elementos.
    alignItems: 'center', // Centra los elementos horizontalmente.
    paddingHorizontal: Spacing.four, // Espacio horizontal interno.
    paddingVertical: Spacing.six, // Espacio vertical interno.
  },

  /* Centra el texto descriptivo. */
  centerText: {
    textAlign: 'center',
  },

  /* Cambia la opacidad cuando se presiona un elemento. */
  pressed: {
    opacity: 0.7,
  },

  /* Estilos del botón que contiene el enlace. */
  linkButton: {
    flexDirection: 'row', // Coloca texto e icono en una fila.
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five, // Redondea las esquinas.
    justifyContent: 'center', // Centra el contenido.
    gap: Spacing.one, // Separa el texto del icono.
    alignItems: 'center',
  },

  /* Organiza las secciones desplegables. */
  sectionsWrapper: {
    gap: Spacing.five, // Espacio entre secciones.
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },

  /* Centra el contenido de las secciones desplegables. */
  collapsibleContent: {
    alignItems: 'center',
  },

  /* Define el tamaño y apariencia de la imagen tutorial. */
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171, // Mantiene la proporción de la imagen.
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },

  /* Define el tamaño y posición del logotipo de React. */
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});
