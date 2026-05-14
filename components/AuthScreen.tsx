import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';

const isWeb = Platform.OS === 'web';

const AIRBNB = {
  canvas: '#f7f7f7',
  card: '#ffffff',
  carbon: '#222222',
  slate: '#6a6a6a',
  mist: '#ebebeb',
  coral: '#ff385c',
  coralDeep: '#e00b41',
};

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
  loading?: boolean;
  authMessage?: string | null;
  authError?: string | null;
}

export function AuthScreen({
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  onAppleSignIn,
  loading = false,
  authMessage,
  authError,
}: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (isLogin) {
      onSignIn(email, password);
    } else {
      onSignUp(email, password);
    }
  };

  const displayedError = validationError || authError || null;

  return (
    <SafeAreaView style={[styles.container, isWeb && styles.webContainer]}>
      <View style={[styles.content, isWeb && styles.webContent]}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isLogin ? 'Bienvenido' : 'Crear cuenta'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Inicia sesión para gestionar tus renovaciones'
              : 'Regístrate para empezar'}
          </Text>
        </View>

        {authMessage ? (
          <View style={[styles.banner, styles.bannerSuccess]}>
            <Text style={[styles.bannerText, styles.bannerSuccessText]}>{authMessage}</Text>
          </View>
        ) : null}

        {displayedError ? (
          <View style={[styles.banner, styles.bannerError]}>
            <Text style={[styles.bannerText, styles.bannerErrorText]}>{displayedError}</Text>
          </View>
        ) : null}

        <View style={[styles.oauthContainer, isWeb && styles.webOAuthContainer]}>
          <TouchableOpacity
            style={[
              styles.oauthButton,
              styles.appleButton,
              isWeb && styles.webOAuthButton,
            ]}
            onPress={onAppleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <FontAwesome name="apple" size={20} color="#FFFFFF" style={styles.oauthIcon} />
                <Text style={[styles.oauthText, styles.appleText]}>Continuar con Apple</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.oauthButton,
              styles.googleButton,
              isWeb && styles.webOAuthButton,
            ]}
            onPress={onGoogleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#333333" />
            ) : (
              <>
                <FontAwesome name="google" size={18} color="#333333" style={styles.oauthIcon} />
                <Text style={[styles.oauthText, styles.googleText]}>Continuar con Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.separator}>
          <View style={[styles.separatorLine, { backgroundColor: isWeb ? AIRBNB.mist : '#E5E5EA' }]} />
          <Text style={[styles.separatorText, { color: isWeb ? AIRBNB.slate : '#666666' }]}>o</Text>
          <View style={[styles.separatorLine, { backgroundColor: isWeb ? AIRBNB.mist : '#E5E5EA' }]} />
        </View>

        <View style={[styles.form, isWeb && styles.webForm]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isWeb ? AIRBNB.carbon : '#3C3C43' }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isWeb ? AIRBNB.card : '#F2F2F7',
                  color: isWeb ? AIRBNB.carbon : '#000000',
                  borderColor: isWeb ? AIRBNB.mist : 'transparent',
                  borderWidth: isWeb ? 1 : 0,
                  borderRadius: isWeb ? 14 : 8,
                },
              ]}
              placeholder="tu@email.com"
              placeholderTextColor={isWeb ? AIRBNB.slate : '#8E8E93'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isWeb ? AIRBNB.carbon : '#3C3C43' }]}>Contraseña</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isWeb ? AIRBNB.card : '#F2F2F7',
                  color: isWeb ? AIRBNB.carbon : '#000000',
                  borderColor: isWeb ? AIRBNB.mist : 'transparent',
                  borderWidth: isWeb ? 1 : 0,
                  borderRadius: isWeb ? 14 : 8,
                },
              ]}
              placeholder="******"
              placeholderTextColor={isWeb ? AIRBNB.slate : '#8E8E93'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <Button
            title={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? AIRBNB.canvas : '#F2F2F7',
  },
  webContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  webContent: {
    maxWidth: 420,
    width: '100%',
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
    color: isWeb ? AIRBNB.carbon : '#000000',
    letterSpacing: -0.02,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: isWeb ? AIRBNB.slate : '#666666',
  },
  banner: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  bannerSuccess: {
    backgroundColor: '#e6f9ed',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  bannerError: {
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  bannerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bannerSuccessText: {
    color: '#1e8449',
  },
  bannerErrorText: {
    color: '#c0392b',
  },
  oauthContainer: {
    gap: 12,
    marginBottom: 24,
  },
  webOAuthContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  webOAuthButton: {
    borderRadius: 8,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: isWeb ? AIRBNB.mist : 'rgba(0, 0, 0, 0.1)',
  },
  oauthIcon: {
    marginRight: 10,
  },
  oauthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appleText: {
    color: '#FFFFFF',
  },
  googleText: {
    color: '#333333',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    backgroundColor: isWeb ? AIRBNB.card : '#FFFFFF',
    borderRadius: isWeb ? 20 : 16,
    padding: 24,
    ...(isWeb
      ? {
          borderColor: AIRBNB.mist,
          borderWidth: 1,
          boxShadow:
            'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 6px 0px, rgba(0, 0, 0, 0.1) 0px 4px 8px 0px',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }),
  },
  webForm: {
    // inherits from form
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
});
