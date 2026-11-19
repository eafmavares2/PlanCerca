import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleLogin = () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setFormError('');
    onLogin();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Plan<Text style={styles.accent}>Cerca</Text></Text>
        <Text style={styles.subtitle}>Tu plan de bienestar, paso a paso.</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setFormError('');
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña (mínimo 8 caracteres)"
          placeholderTextColor="#888"
          secureTextEntry
          autoComplete="current-password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setFormError('');
          }}
        />

        {formError ? <Text style={styles.errorText} accessibilityRole="alert">{formError}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} accessibilityRole="button">
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} accessibilityRole="button">
          <Text style={styles.linkText}>
            ¿No tienes cuenta? <Text style={styles.accent}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  formContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  accent: {
    color: '#00E676', // Verde energético estilo fitness
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 32,
  },
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
  errorText: {
    color: '#FF8A80',
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#00E676',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#AAA',
    textAlign: 'center',
    fontSize: 14,
  },
});