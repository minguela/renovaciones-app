import { Platform } from 'react-native';
import { Colors, WebColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';

  // On web, always use dark theme colors from the new system
  if (Platform.OS === 'web') {
    const webColors: Record<string, string> = {
      text: WebColors.text,
      background: WebColors.background,
      tint: WebColors.tint,
      icon: WebColors.icon,
    };
    // Web theme is light (Airbnb Clean), prefer light prop then fall back to web system colors
    const colorFromProps = props.light ?? props.dark;
    return colorFromProps ?? webColors[colorName] ?? WebColors.text;
  }

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
