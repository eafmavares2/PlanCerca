
import { useState } from 'react';

// Importa los componentes necesarios de React Native.
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

// Expresión regular para comprobar que el correo tenga un formato válido.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Componente principal de la pantalla de inicio de sesión.
// Recibe navigation para navegar entre pantallas y onLogin para iniciar sesión.
export default function LoginScreen({ navigation, onLogin }) {

  // Guarda el correo electrónico que escribe el usuario.
  const [email, setEmail] = useState('');

  // Guarda la contraseña que escribe el usuario.
  const [password, setPassword] = useState('');

  // Guarda el mensaje de error que se mostrará si los datos son incorrectos.
  const [formError, setFormError] = useState('');

  // Función que valida los datos antes de iniciar sesión.
  const handleLogin = () => {

    // Comprueba que el correo tenga un formato válido.
    // trim() elimina los espacios al inicio y al final.
    if (!EMAIL_PATTERN.test(email.trim())) {

      // Muestra un mensaje si el correo no es válido.
      setFormError('Ingresa un correo electrónico válido.');

      // Detiene la ejecución de la función.
      return;
    }

    // Comprueba que la contraseña tenga al menos 8 caracteres.
    if (password.length < 8) {

      // Muestra un mensaje si la contraseña es demasiado corta.
      setFormError('La contraseña debe tener al menos 8 caracteres.');

      // Detiene la ejecución de la función.
      return;
    }

    // Limpia cualquier mensaje de error anterior.
    setFormError('');

    // Ejecuta la función recibida para iniciar sesión.
    onLogin();
  };

  // Retorna los elementos visuales de la pantalla.
  return (

    // Evita que el teclado cubra los campos del formulario.
    <KeyboardAvoidingView
      style={styles.container}

      // En iOS utiliza padding para ajustar la pantalla cuando aparece el teclado.
      // En Android no establece un comportamiento adicional.
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      {/* Permite desplazar el formulario cuando el contenido no cabe en la pantalla. */}
      <ScrollView
        contentContainerStyle={styles.formContent}

        // Permite interactuar con los campos sin cerrar inmediatamente el teclado.
        keyboardShouldPersistTaps="handled"
      >

        {/* Muestra el nombre de la aplicación con dos colores. */}
        <Text style={styles.title}>
          Plan<Text style={styles.accent}>Cerca</Text>
        </Text>

        {/* Muestra el mensaje de bienvenida. */}
        <Text style={styles.subtitle}>
          Tu plan de bienestar, paso a paso.
        </Text>

        {/* Campo para ingresar el correo electrónico. */}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#888"

          // Configura el teclado para escribir direcciones de correo.
          keyboardType="email-address"

          // Evita que el teclado coloque automáticamente mayúsculas.
          autoCapitalize="none"

          // Indica al dispositivo que el campo contiene un correo.
          autoComplete="email"

          // Vincula el campo con el estado email.
          value={email}

          // Actualiza el correo cada vez que el usuario escribe.
          onChangeText={(value) => {
            setEmail(value);

            // Limpia el mensaje de error al modificar el campo.
            setFormError('');
          }}
        />

        {/* Campo para ingresar la contraseña. */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña (mínimo 8 caracteres)"
          placeholderTextColor="#888"

          // Oculta los caracteres de la contraseña.
          secureTextEntry

          // Indica que el campo corresponde a una contraseña existente.
          autoComplete="current-password"

          // Vincula el campo con el estado password.
          value={password}

          // Actualiza la contraseña cada vez que el usuario escribe.
          onChangeText={(value) => {
            setPassword(value);

            // Limpia el mensaje de error al modificar el campo.
            setFormError('');
          }}
        />

        {/* Muestra el mensaje de error solamente si existe uno. */}
        {formError ? (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
          >
            {formError}
          </Text>
        ) : null}

        {/* Botón que ejecuta la validación y el inicio de sesión. */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Botón para dirigirse a la pantalla de registro. */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>
            ¿No tienes cuenta? <Text style={styles.accent}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Define los estilos visuales de los componentes de la pantalla.
const styles = StyleSheet.create({

  // Estilos del contenedor principal.
  container: {
    flex: 1, // Ocupa todo el espacio disponible.
    backgroundColor: '#121212', // Establece el fondo oscuro.
  },

  // Estilos del contenido del formulario.
  formContent: {
    flexGrow: 1, // Permite que el contenido crezca.
    justifyContent: 'center', // Centra el formulario verticalmente.
    padding: 24, // Agrega espacio alrededor del contenido.
  },

  // Estilos del título PlanCerca.
  title: {
    fontSize: 36, // Tamaño de la letra.
    fontWeight: 'bold', // Texto en negrita.
    color: '#FFF', // Color blanco.
    textAlign: 'center', // Centra el texto.
    marginBottom: 8, // Espacio inferior.
  },

  // Color verde utilizado para destacar partes del texto.
  accent: {
    color: '#00E676',
  },

  // Estilos del subtítulo.
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 32,
  },

  // Estilos de los campos de correo y contraseña.
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },

  // Estilos del mensaje de error.
  errorText: {
    color: '#FF8A80',
    fontSize: 13,
    marginBottom: 12,
  },

  // Estilos del botón de inicio de sesión.
  button: {
    backgroundColor: '#00E676',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  // Estilos del texto del botón.
  buttonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Estilos del enlace para registrarse.
  linkText: {
    color: '#AAA',
    textAlign: 'center',
    fontSize: 14,
  },
});
