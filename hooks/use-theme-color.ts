import { Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { semanticColors } from '@/constants/design-tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  // On web/native, resolve semantic roles first, then fallback to legacy tokens.
  if (Platform.OS === 'web') {
    const webColors: Record<string, string> = {
      text: semanticColors[theme].textPrimary,
      background: semanticColors[theme].bgCanvas,
      tint: semanticColors[theme].accentPrimary,
      icon: semanticColors[theme].textSecondary,
    };
    const colorFromProps = props[theme];
    return colorFromProps ?? webColors[colorName] ?? semanticColors[theme].textPrimary;
  }

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
