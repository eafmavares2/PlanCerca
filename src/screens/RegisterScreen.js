
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

// Expresión regular para validar el formato del correo electrónico.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Componente principal de la pantalla de registro.
// Recibe navigation para navegar entre pantallas y onLogin para continuar.
export default function RegisterScreen({ navigation, onLogin }) {

  // Estado que almacena el nombre del usuario.
  const [name, setName] = useState('');

  // Estado que almacena el correo electrónico.
  const [email, setEmail] = useState('');

  // Estado que almacena la contraseña.
  const [password, setPassword] = useState('');

  // Estado que almacena los mensajes de error del formulario.
  const [formError, setFormError] = useState('');

  // Función que valida los datos ingresados al crear una cuenta.
  const handleRegister = () => {

    // Comprueba que el nombre tenga al menos 2 caracteres.
    // trim() elimina los espacios al inicio y al final.
    if (name.trim().length < 2) {

      // Muestra un mensaje si el nombre no es válido.
      setFormError('Escribe tu nombre (al menos 2 caracteres).');

      // Detiene la ejecución de la función.
      return;
    }

    // Comprueba que el correo electrónico tenga un formato válido.
    if (!EMAIL_PATTERN.test(email.trim())) {

      // Muestra un mensaje si el correo es incorrecto.
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

    // Ejecuta la función recibida para continuar con el inicio de sesión.
    onLogin();
  };

  // Retorna los elementos visuales de la pantalla.
  return (

    // Ajusta la pantalla para evitar que el teclado cubra el formulario.
    <KeyboardAvoidingView
      style={styles.container}

      // En iOS utiliza padding para ajustar el contenido.
      // En otras plataformas no aplica un comportamiento adicional.
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      {/* Permite desplazar el formulario cuando no cabe en la pantalla. */}
      <ScrollView
        contentContainerStyle={styles.formContent}

        // Permite tocar los campos sin cerrar inmediatamente el teclado.
        keyboardShouldPersistTaps="handled"
      >

        {/* Título de bienvenida con el nombre de la aplicación. */}
        <Text style={styles.title}>
          Únete a Plan<Text style={styles.accent}>Cerca</Text>
        </Text>

        {/* Descripción de las funciones de la aplicación. */}
        <Text style={styles.subtitle}>
          Organiza tus entrenamientos, nutrición e hidratación.
        </Text>

        {/* Campo para ingresar el nombre completo. */}
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          placeholderTextColor="#888"

          // Configura el autocompletado para nombres.
          autoComplete="name"

          // Vincula el campo con el estado name.
          value={name}

          // Actualiza el nombre cada vez que el usuario escribe.
          onChangeText={(value) => {
            setName(value);

            // Limpia el mensaje de error al modificar el campo.
            setFormError('');
          }}
        />

        {/* Campo para ingresar el correo electrónico. */}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#888"

          // Configura el teclado para escribir correos electrónicos.
          keyboardType="email-address"

          // Evita que se escriban mayúsculas automáticamente.
          autoCapitalize="none"

          // Configura el autocompletado para correos.
          autoComplete="email"

          // Vincula el campo con el estado email.
          value={email}

          // Actualiza el correo cuando el usuario escribe.
          onChangeText={(value) => {
            setEmail(value);

            // Limpia el mensaje de error.
            setFormError('');
          }}
        />

        {/* Campo para ingresar una contraseña nueva. */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña (mínimo 8 caracteres)"
          placeholderTextColor="#888"

          // Oculta los caracteres de la contraseña.
          secureTextEntry

          // Indica que se está creando una contraseña nueva.
          autoComplete="new-password"

          // Vincula el campo con el estado password.
          value={password}

          // Actualiza la contraseña cuando el usuario escribe.
          onChangeText={(value) => {
            setPassword(value);

            // Limpia el mensaje de error.
            setFormError('');
          }}
        />

        {/* Muestra el mensaje de error si existe. */}
        {formError ? (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
          >
            {formError}
          </Text>
        ) : null}

        {/* Botón que ejecuta la validación del registro. */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Crear cuenta</Text>
        </TouchableOpacity>

        {/* Botón para regresar a la pantalla anterior. */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta? <Text style={styles.accent}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Define los estilos visuales de la pantalla de registro.
const styles = StyleSheet.create({

  // Estilos del contenedor principal.
  container: {
    flex: 1, // Ocupa toda la pantalla.
    backgroundColor: '#121212', // Establece el fondo oscuro.
  },

  // Estilos del contenido del formulario.
  formContent: {
    flexGrow: 1, // Permite que el contenido crezca.
    justifyContent: 'center', // Centra el formulario verticalmente.
    padding: 24, // Agrega espacio alrededor del formulario.
  },

  // Estilos del título.
  title: {
    fontSize: 32, // Tamaño del texto.
    fontWeight: 'bold', // Texto en negrita.
    color: '#FFF', // Color blanco.
    marginBottom: 8, // Espacio inferior.
  },

  // Color verde para destacar el nombre de la aplicación.
  accent: {
    color: '#00E676',
  },

  // Estilos del subtítulo.
  subtitle: {
    fontSize: 15,
    color: '#AAA',
    marginBottom: 32,
  },

  // Estilos de los campos de entrada.
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

  // Estilos del botón para crear la cuenta.
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

  // Estilos del enlace para regresar al inicio de sesión.
  linkText: {
    color: '#AAA',
    textAlign: 'center',
    fontSize: 14,
  },
});
