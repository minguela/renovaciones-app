import { useAuth as useClerkAuth, useSignIn } from '@clerk/expo';
import { useSSO } from '@clerk/expo/experimental';
import * as AuthSession from 'expo-auth-session';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useSemanticTheme } from '@/constants/design-tokens';
import {
  clearLegacyAuthToken,
  getStoredLegacyAuthToken,
  linkClerkToLegacyAccount,
  provisionClerkAccount,
  setAuthMode,
  verifyLegacyCredentials,
} from '@/lib/api-client';
import { hasCompletedClerkSsoFlow } from '@/components/clerk-sso-session';
import { submitExplicitLegacyLink } from '@/src/application/auth-session-lifecycle';

export function ClerkAuthScreen({
  onUseLegacy,
  onAuthSuccess,
}: {
  onUseLegacy: () => void;
  onAuthSuccess?: () => Promise<unknown> | unknown;
}) {
  const { signIn } = useSignIn();
  const clerkAuth = useClerkAuth();
  const clerkAuthRef = useRef(clerkAuth);
  clerkAuthRef.current = clerkAuth;
  const { startSSOFlow } = useSSO();
  const { colors, radius } = useSemanticTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkExisting, setLinkExisting] = useState(false);
  const [legacyEmail, setLegacyEmail] = useState('');
  const [legacyPassword, setLegacyPassword] = useState('');
  const [legacyTokenAvailable, setLegacyTokenAvailable] = useState(false);

  useEffect(() => {
    if (!linkExisting) return;
    let mounted = true;
    void getStoredLegacyAuthToken().then((token) => {
      if (mounted) setLegacyTokenAvailable(Boolean(token));
    });
    return () => { mounted = false; };
  }, [linkExisting]);

  const waitForClerkToken = async () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const current = clerkAuthRef.current;
      if (current.isLoaded && current.isSignedIn) {
        const token = await current.getToken();
        if (token) return token;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Clerk no devolvió una sesión activa. Vuelve a iniciar sesión.');
  };

  const finishClerkAuthentication = async () => {
    setAuthMode('clerk');
    try {
      const token = await waitForClerkToken();
      await provisionClerkAccount(token);
      await clearLegacyAuthToken();
      setLegacyTokenAvailable(false);
      await onAuthSuccess?.();
      return true;
    } catch (cause) {
      const authError = cause as Error & { status?: number; code?: string };
      setError(authError.message || 'No se pudo crear o recuperar la cuenta.');
      if (authError.status === 409 || authError.code === 'identity_conflict') setLinkExisting(true);
      return false;
    }
  };

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
        else await finishClerkAuthentication();
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
      if (!hasCompletedClerkSsoFlow(result)) {
        setError('Google devolvió requisitos adicionales que esta pantalla aún no puede completar.');
        return;
      }
      await finishClerkAuthentication();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar Google SSO con Clerk.');
    } finally {
      setBusy(false);
    }
  };

  const linkLegacyAccount = async () => {
    setError(null);
    setBusy(true);
    try {
      await submitExplicitLegacyLink({
        getStoredLegacyToken: getStoredLegacyAuthToken,
        verifyLegacyCredentials: async () => (await verifyLegacyCredentials(legacyEmail.trim(), legacyPassword)).token,
        hasLegacyCredentials: Boolean(legacyEmail.trim() && legacyPassword),
        getClerkToken: waitForClerkToken,
        sendLink: async (legacyToken, clerkToken) => { await linkClerkToLegacyAccount(legacyToken, clerkToken); },
        clearLegacyToken: clearLegacyAuthToken,
      });
      setLegacyPassword('');
      setLegacyTokenAvailable(false);
      await onAuthSuccess?.();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo vincular la cuenta anterior.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen kind="form" style={Platform.OS === 'web' ? styles.webContainer : undefined}>
      <View style={[styles.content, Platform.OS === 'web' && styles.webContent]}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Entra o crea una cuenta con Google. Si ya guardabas renovaciones, vincula tu cuenta anterior para conservarlas.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle} disabled={busy}>
          {busy ? <ActivityIndicator color="#333" /> : <>
            <FontAwesome name="google" size={18} color="#333" />
            <Text style={styles.googleText}>Continuar con Google</Text>
          </>}
        </TouchableOpacity>
        <View nativeID="clerk-captcha" />
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
        {linkExisting ? (
          <View style={styles.linkPanel}>
            <Text style={styles.linkTitle}>Vincular cuenta anterior</Text>
            <Text style={styles.linkHint}>Al pulsar, usaremos tu sesión anterior activa o verificaremos sus credenciales. Solo se enlaza esa cuenta; tus renovaciones conservan su propietario.</Text>
            <TextInput
              accessibilityLabel="Correo de la cuenta anterior"
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderSubtle, borderRadius: radius.lg }]}
              placeholder="Correo de la cuenta anterior"
              autoCapitalize="none"
              keyboardType="email-address"
              value={legacyEmail}
              onChangeText={setLegacyEmail}
              editable={!busy}
            />
            <TextInput
              accessibilityLabel="Contraseña de la cuenta anterior"
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderSubtle, borderRadius: radius.lg }]}
              placeholder="Contraseña anterior"
              secureTextEntry
              value={legacyPassword}
              onChangeText={setLegacyPassword}
              editable={!busy}
            />
            <Button title="Verificar y vincular" onPress={linkLegacyAccount} loading={busy} disabled={busy || (!(legacyEmail && legacyPassword) && !legacyTokenAvailable)} size="lg" />
          </View>
        ) : null}
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
  linkPanel: { marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: '#F8FAFC' },
  linkTitle: { color: '#15181D', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  linkHint: { color: '#5D6672', lineHeight: 20, marginBottom: 14 },
});
