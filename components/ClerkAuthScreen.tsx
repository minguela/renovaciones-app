import { useSignIn } from '@clerk/expo';
import { useSSO } from '@clerk/expo/experimental';
import * as AuthSession from 'expo-auth-session';
import { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useSemanticTheme } from '@/constants/design-tokens';
import { clearLegacyAuthToken } from '@/lib/api-client';
import { activateClerkSsoSession } from '@/components/clerk-sso-session';

export function ClerkAuthScreen({ onUseLegacy }: { onUseLegacy: () => void }) {
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { colors, radius } = useSemanticTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithPassword = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await signIn.password({ emailAddress: email.trim(), password });
      if (result.error) {
        setError(result.error.message);
      } else if (signIn.status === 'complete') {
        const finalized = await signIn.finalize();
        if (finalized.error) setError(finalized.error.message);
        else await clearLegacyAuthToken();
      } else {
        setError('La instancia requiere un paso de verificación adicional que aún no está habilitado en esta pantalla.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión con Clerk.');
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'renovacionesapp' }),
      });
      const activated = await activateClerkSsoSession(result);
      if (!activated) {
        setError('Google devolvió requisitos adicionales que esta pantalla aún no puede completar.');
        return;
      }
      await clearLegacyAuthToken();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar Google SSO con Clerk.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen kind="form" style={Platform.OS === 'web' ? styles.webContainer : undefined}>
      <View style={[styles.content, Platform.OS === 'web' && styles.webContent]}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Acceso con Clerk. Solo funcionan cuentas vinculadas a un usuario existente de Renovaciones.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle} disabled={busy}>
          {busy ? <ActivityIndicator color="#333" /> : <>
            <FontAwesome name="google" size={18} color="#333" />
            <Text style={styles.googleText}>Continuar con Google</Text>
          </>}
        </TouchableOpacity>
        <Text style={styles.separator}>o con email</Text>
        <TextInput
          accessibilityLabel="Email"
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderSubtle, borderRadius: radius.lg }]}
          placeholder="tu@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!busy}
        />
        <TextInput
          accessibilityLabel="Contraseña"
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderSubtle, borderRadius: radius.lg }]}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!busy}
        />
        <Button title="Iniciar sesión" onPress={signInWithPassword} loading={busy} disabled={busy || !email || !password} size="lg" />
        <TouchableOpacity style={styles.legacyLink} onPress={onUseLegacy} disabled={busy}>
          <Text style={{ color: colors.accentPrimary, fontWeight: '600' }}>Usar inicio de sesión anterior</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  webContainer: { justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  webContent: { maxWidth: 420, width: '100%', alignSelf: 'center', paddingVertical: 48 },
  title: { fontSize: 30, fontWeight: '600', color: '#15181D', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: '#5D6672', textAlign: 'center', lineHeight: 22, marginBottom: 22 },
  error: { color: '#B42318', backgroundColor: '#FEE4E2', padding: 12, borderRadius: 10, marginBottom: 16 },
  googleButton: { height: 52, borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  googleText: { color: '#333', fontWeight: '600' },
  separator: { textAlign: 'center', color: '#667085', marginVertical: 18 },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 14, backgroundColor: '#fff' },
  legacyLink: { marginTop: 20, alignSelf: 'center' },
});
