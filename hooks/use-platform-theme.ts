import { Platform, useColorScheme } from 'react-native';
import { WebColors, MobileColors } from '@/constants/theme';

export function usePlatformTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return {
      isWeb: true,
      colors: WebColors,
      colorScheme: 'dark' as const, // Web is always dark
    };
  }

  return {
    isWeb: false,
    colors: MobileColors[colorScheme],
    colorScheme,
  };
}
