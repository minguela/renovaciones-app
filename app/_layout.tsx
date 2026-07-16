import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Platform } from 'react-native';
import '@/theme.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontLoader } from '@/components/FontLoader';
import { WebMetaTags } from '@/components/WebMetaTags';
import { setTokenStore, handleOAuthCallback } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

// Configure token storage
if (typeof localStorage !== 'undefined') {
  setTokenStore({
    getToken: async () => localStorage.getItem('auth_token'),
    setToken: async (t) => t ? localStorage.setItem('auth_token', t) : localStorage.removeItem('auth_token'),
  });
  // Handle OAuth callback token from URL (Google Sign-In redirect)
  handleOAuthCallback();
}
import { ToastProvider } from '@/components/ui/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';

  // Initialize global auth listener (handles session restore + polling)
  useAuth();

  const activeTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}
