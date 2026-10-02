import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import 'react-native-reanimated';
import '@/theme.css';
import { ToastProvider } from '@/components/ui/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontLoader } from '@/components/FontLoader';
import { WebMetaTags } from '@/components/WebMetaTags';
import { setTokenStore, setAuthModeStorage, handleOAuthCallback } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { WebAnalytics } from '@/components/WebAnalytics';
import { ClerkRuntime } from '@/components/ClerkRuntime';

const isWeb = Platform.OS === 'web';

// Configure token storage
if (typeof localStorage !== 'undefined') {
  setTokenStore({
    getToken: async () => localStorage.getItem('auth_token'),
    setToken: async (t) => t ? localStorage.setItem('auth_token', t) : localStorage.removeItem('auth_token'),
  });
  setAuthModeStorage({
    getMode: async () => localStorage.getItem('auth_mode'),
    setMode: async (mode) => { localStorage.setItem('auth_mode', mode); },
  });
  // Handle OAuth callback token from URL (Google Sign-In redirect)
  handleOAuthCallback();
} else if (Platform.OS !== 'web') {
  setTokenStore({
    getToken: () => SecureStore.getItemAsync('legacy_auth_token'),
    setToken: async (token) => {
      if (token) await SecureStore.setItemAsync('legacy_auth_token', token);
      else await SecureStore.deleteItemAsync('legacy_auth_token');
    },
  });
  setAuthModeStorage({
    getMode: () => SecureStore.getItemAsync('legacy_auth_mode'),
    setMode: async (mode) => SecureStore.setItemAsync('legacy_auth_mode', mode),
  });
}
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize global auth listener (handles session restore + polling)
  useAuth();

  const activeTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ToastProvider>
      <ClerkRuntime>
        {isWeb ? <WebAnalytics /> : null}
        <FontLoader />
        <WebMetaTags />
        <ThemeProvider value={activeTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen
              name="renewal/[id]"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
        <ToastContainer />
      </ClerkRuntime>
    </ToastProvider>
  );
}
