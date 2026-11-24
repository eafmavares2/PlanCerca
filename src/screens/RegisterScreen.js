import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (name.trim().length < 2) {
      setFormError('Escribe tu nombre (al menos 2 caracteres).');
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setFormError('');
    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
      },
    });

    setSubmitting(false);

    if (error) {
      setFormError(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          Únete a Plan<Text style={styles.accent}>Cerca</Text>
        </Text>
        <Text style={styles.subtitle}>Organiza tus entrenamientos, nutrición e hidratación.</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          placeholderTextColor="#888"
          autoComplete="name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setFormError('');
          }}
        />

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
          autoComplete="new-password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setFormError('');
          }}
        />

        {formError ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {formError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={submitting}
          accessibilityRole="button"
        >
          {submitting ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <Text style={styles.buttonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta? <Text style={styles.accent}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  formContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  accent: { color: '#00E676' },
  subtitle: { fontSize: 15, color: '#AAA', marginBottom: 32 },
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
  errorText: { color: '#FF8A80', fontSize: 13, marginBottom: 12 },
  button: {
    backgroundColor: '#00E676',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#121212', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#AAA', textAlign: 'center', fontSize: 14 },
});