import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/Colors';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email || !password) { Toast.show({ type: 'error', text1: 'E-Mail und Passwort erforderlich' }); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Login fehlgeschlagen', text2: err.message });
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={['#0D0D1A', '#16162A', '#0D0D1A']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.logoArea}>
          <LinearGradient colors={['#7C3AED', '#06B6D4']} style={styles.logoGradient}>
            <Text style={styles.logoText}>S</Text>
          </LinearGradient>
          <Text style={styles.appName}>Snova Studio</Text>
          <Text style={styles.tagline}>KI-Charaktere & Story-Videos</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>E-Mail</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail}
            placeholder="deine@email.com" placeholderTextColor={Colors.textMuted}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

          <Text style={styles.label}>Passwort</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword}
            placeholder="Passwort" placeholderTextColor={Colors.textMuted}
            secureTextEntry />

          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.button}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Einloggen</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Kein Account? Kontaktiere den Admin.</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  logoArea: { alignItems: 'center', marginBottom: 48 },
  logoGradient: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 1 },
  tagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
  form: { gap: 4 },
  label: { color: Colors.textSecondary, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, color: Colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: Colors.border },
  button: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', color: Colors.textMuted, marginTop: 32, fontSize: 13 },
});
