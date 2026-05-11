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
import { useThemeColor } from '@/hooks/use-theme-color';

const isWeb = Platform.OS === 'web';

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

  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = isWeb ? '#9da7ba' : useThemeColor({ light: '#666666', dark: '#999999' }, 'text');

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
          <Text style={[styles.title, { color: textColor }]}>
            {isLogin ? 'Bienvenido' : 'Crear cuenta'}
          </Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            {isLogin
              ? 'Inicia sesión para gestionar tus renovaciones'
              : 'Regístrate para empezar'}
          </Text>
        </View>

        {authMessage ? (
          <View style={[styles.banner, styles.bannerSuccess, isWeb && styles.webBannerSuccess]}>
            <Text style={[styles.bannerText, styles.bannerSuccessText]}>{authMessage}</Text>
          </View>
        ) : null}

        {displayedError ? (
          <View style={[styles.banner, styles.bannerError, isWeb && styles.webBannerError]}>
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
                <IconSymbol name="apple.logo" size={20} color="#FFFFFF" style={styles.oauthIcon} />
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
          <View style={[styles.separatorLine, { backgroundColor: isWeb ? 'rgba(186, 215, 247, 0.12)' : '#E5E5EA' }]} />
          <Text style={[styles.separatorText, { color: secondaryTextColor }]}>o</Text>
          <View style={[styles.separatorLine, { backgroundColor: isWeb ? 'rgba(186, 215, 247, 0.12)' : '#E5E5EA' }]} />
        </View>

        <View style={[styles.form, isWeb && styles.webForm]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isWeb ? '#d1e4fa' : '#3C3C43' }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isWeb ? 'rgba(199, 211, 234, 0.06)' : '#F2F2F7',
                  color: textColor,
                  borderColor: isWeb ? 'rgba(186, 215, 247, 0.12)' : 'transparent',
                  borderWidth: isWeb ? 1 : 0,
                  borderRadius: isWeb ? 4 : 8,
                },
              ]}
              placeholder="tu@email.com"
              placeholderTextColor={isWeb ? '#9da7ba' : '#8E8E93'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isWeb ? '#d1e4fa' : '#3C3C43' }]}>Contraseña</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isWeb ? 'rgba(199, 211, 234, 0.06)' : '#F2F2F7',
                  color: textColor,
                  borderColor: isWeb ? 'rgba(186, 215, 247, 0.12)' : 'transparent',
                  borderWidth: isWeb ? 1 : 0,
                  borderRadius: isWeb ? 4 : 8,
                },
              ]}
              placeholder="******"
              placeholderTextColor={isWeb ? '#9da7ba' : '#8E8E93'}
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

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: secondaryTextColor }]}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </Text>
          <TouchableOpacity onPress={() => {
            setIsLogin(!isLogin);
            setValidationError(null);
          }}>
            <Text style={[styles.footerLink, { color: isWeb ? '#b6d9fc' : '#007AFF' }]}>
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? '#05060f' : '#F2F2F7',
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
    fontSize: isWeb ? 32 : 32,
    fontWeight: isWeb ? '500' : '700',
    marginBottom: 8,
    letterSpacing: isWeb ? 0 : 0,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
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
  webBannerSuccess: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: 'rgba(46, 204, 113, 0.4)',
  },
  bannerError: {
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  webBannerError: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.4)',
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
    borderRadius: 999,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: isWeb ? 'rgba(186, 215, 247, 0.2)' : 'rgba(0, 0, 0, 0.1)',
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
    backgroundColor: isWeb ? 'rgba(5, 6, 15, 0.97)' : '#FFFFFF',
    borderRadius: isWeb ? 16 : 16,
    padding: 24,
    ...(isWeb
      ? {
          borderColor: 'rgba(186, 215, 247, 0.12)',
          borderWidth: 1,
          boxShadow:
            'rgba(216, 236, 248, 0.2) 0px 1px 1px 0px inset, rgba(168, 216, 245, 0.06) 0px 24px 48px 0px inset, rgba(0, 0, 0, 0.3) 0px 16px 32px 0px',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
