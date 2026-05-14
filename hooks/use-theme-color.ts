import { Platform } from 'react-native';
import { Colors, WebColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const colorScheme = useColorScheme() ?? 'light';
  // On web, force light theme to prevent dark mode from inverting input colors
  const theme = Platform.OS === 'web' ? 'light' : colorScheme;

  // On web, respect the system color scheme but default to light
  if (Platform.OS === 'web') {
    const webColors: Record<string, string> = {
      text: WebColors.text,
      background: WebColors.background,
      tint: WebColors.tint,
      icon: WebColors.icon,
    };
    const colorFromProps = props[theme];
    return colorFromProps ?? webColors[colorName] ?? WebColors.text;
  }

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
