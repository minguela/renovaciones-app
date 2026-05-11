import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontLoader } from '@/components/FontLoader';
import { supabase } from '@/lib/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';

  // On web, force dark theme
  const activeTheme = isWeb ? DarkTheme : (colorScheme === 'dark' ? DarkTheme : DefaultTheme);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  // Process URL hash on web for OAuth callbacks
  useEffect(() => {
    if (isWeb && typeof window !== 'undefined' && window.location.hash) {
      supabase.auth.getSession();
    }
  }, [isWeb]);

  // Listen to deep links for OAuth callbacks on native
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (url) {
        supabase.auth.getSession();
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        supabase.auth.getSession();
      }
    });

    return () => subscription.remove();
  }, []);

  // Listen to auth state changes and clean up URL on sign in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Remove OAuth callback hash from URL on web
        if (isWeb && typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [isWeb]);

  return (
    <>
      <FontLoader />
      <ThemeProvider value={activeTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="renewal/[id]" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }} 
          />
        </Stack>
        <StatusBar style={isWeb ? 'light' : 'auto'} />
      </ThemeProvider>
    </>
  );
}
