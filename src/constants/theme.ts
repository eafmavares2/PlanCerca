
// Este archivo contiene las configuraciones visuales de la aplicación.
// Aquí se definen los colores para el modo claro y oscuro,
// las tipografías y los espacios que se utilizan en las pantallas.

// Importa los estilos globales de la aplicación.
import '@/global.css';

// Importa Platform para identificar si la aplicación
// se está ejecutando en Android, iOS o web.
import { Platform } from 'react-native';


// Objeto que almacena todos los colores de la aplicación.
export const Colors = {

  // Colores que se utilizan cuando está activado el modo claro.
  light: {
    text: '#000000', // Color negro para los textos.
    background: '#ffffff', // Color blanco para el fondo.
    backgroundElement: '#F0F0F3', // Color de fondo de los elementos.
    backgroundSelected: '#E0E1E6', // Color de los elementos seleccionados.
    textSecondary: '#60646C', // Color gris para textos secundarios.
  },

  // Colores que se utilizan cuando está activado el modo oscuro.
  dark: {
    text: '#ffffff', // Color blanco para los textos.
    background: '#000000', // Color negro para el fondo.
    backgroundElement: '#212225', // Color de fondo de los elementos.
    backgroundSelected: '#2E3135', // Color de los elementos seleccionados.
    textSecondary: '#B0B4BA', // Color gris claro para textos secundarios.
  },
} as const; // Mantiene los valores como constantes y conserva sus tipos literales.


// Define el tipo ThemeColor.
// Permite utilizar únicamente los nombres de colores que existen
// tanto en el modo claro como en el modo oscuro.
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;


// Objeto que almacena las tipografías de la aplicación.
export const Fonts = Platform.select({

  // Configuración de fuentes para dispositivos Apple (iOS).
  ios: {
    /** Fuente predeterminada sin adornos. */
    sans: 'system-ui',

    /** Fuente con pequeños remates en las letras. */
    serif: 'ui-serif',

    /** Fuente con bordes redondeados. */
    rounded: 'ui-rounded',

    /** Fuente de ancho uniforme entre caracteres. */
    mono: 'ui-monospace',
  },

  // Configuración de fuentes predeterminadas para otras plataformas.
  default: {
    sans: 'normal', // Fuente normal.
    serif: 'serif', // Fuente con remates.
    rounded: 'normal', // Fuente normal.
    mono: 'monospace', // Fuente monoespaciada.
  },

  // Configuración de fuentes para navegadores web.
  web: {
    sans: 'var(--font-display)', // Fuente principal definida en CSS.
    serif: 'var(--font-serif)', // Fuente serif definida en CSS.
    rounded: 'var(--font-rounded)', // Fuente redondeada definida en CSS.
    mono: 'var(--font-mono)', // Fuente monoespaciada definida en CSS.
  },
});


// Objeto que centraliza los espacios y separaciones de la aplicación.
// Permite mantener distancias uniformes entre los componentes.
export const Spacing = {
  half: 2, // Espacio muy pequeño: 2 puntos.
  one: 4, // Espacio pequeño: 4 puntos.
  two: 8, // Espacio: 8 puntos.
  three: 16, // Espacio: 16 puntos.
  four: 24, // Espacio: 24 puntos.
  five: 32, // Espacio: 32 puntos.
  six: 64, // Espacio grande: 64 puntos.
} as const; // Evita que los valores se interpreten como variables modificables.


// Define el espacio inferior adicional para la barra de pestañas.
// En iOS utiliza 50 puntos y en Android 80 puntos.
// Si no existe un valor para la plataforma, utiliza 0.
export const BottomTabInset = Platform.select({
  ios: 50,
  android: 80,
}) ?? 0;


// Define el ancho máximo que puede alcanzar el contenido de la aplicación.
// En este caso, el contenido no superará los 800 puntos.
export const MaxContentWidth = 800;
