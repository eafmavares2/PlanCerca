
// Importa el componente Stack desde Expo Router.
// Stack permite manejar la navegación entre las pantallas de la aplicación.
import { Stack } from 'expo-router';

// Define el componente principal de navegación de la aplicación.
export default function RootLayout() {

  // Retorna la estructura de navegación que utilizará la aplicación.
  return (

    // Crea un navegador de tipo Stack.
    // screenOptions={{ headerShown: false }} oculta la barra superior
    // que Expo Router muestra automáticamente en las pantallas.
    <Stack screenOptions={{ headerShown: false }}>

      // Define la pantalla principal de la aplicación.
      // name="index" hace referencia al archivo index.tsx.
      <Stack.Screen name="index" />

      // Registra la pantalla de registro de usuarios.
      // name="register" hace referencia al archivo register.tsx.
      <Stack.Screen name="register" />

      // Registra la pantalla principal después del inicio de sesión.
      // name="home" hace referencia al archivo home.tsx.
      <Stack.Screen name="home" />

    </Stack>
  );
}
