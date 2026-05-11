import { View, type ViewProps, Platform } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View
      style={[
        { backgroundColor },
        Platform.OS === 'web' && { minHeight: '100vh' as any },
        style,
      ]}
      {...otherProps}
    />
  );
}
