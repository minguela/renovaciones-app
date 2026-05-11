import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontLoader } from '@/components/FontLoader';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';

  // On web, force dark theme
  const activeTheme = isWeb ? DarkTheme : (colorScheme === 'dark' ? DarkTheme : DefaultTheme);

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
