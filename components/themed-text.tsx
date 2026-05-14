import { StyleSheet, Text, type TextProps, Platform } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { AIRBNB } from '@/constants/airbnb-colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'heading' | 'display';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'heading' ? styles.heading : undefined,
        type === 'display' ? styles.display : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  default: {
    fontSize: isWeb ? 14 : 16,
    lineHeight: isWeb ? 21 : 24,
    letterSpacing: isWeb ? -0.01 : 0,
    fontFamily: isWeb ? Fonts.sans : undefined,
  },
  defaultSemiBold: {
    fontSize: isWeb ? 14 : 16,
    lineHeight: isWeb ? 21 : 24,
    fontWeight: '600',
    letterSpacing: isWeb ? -0.01 : 0,
    fontFamily: isWeb ? Fonts.sans : undefined,
  },
  title: {
    fontSize: isWeb ? 28 : 32,
    fontWeight: isWeb ? '500' : 'bold',
    lineHeight: isWeb ? 33.6 : 32,
    letterSpacing: isWeb ? 0 : 0,
    fontFamily: isWeb ? Fonts.display : undefined,
  },
  subtitle: {
    fontSize: isWeb ? 18 : 20,
    fontWeight: isWeb ? '500' : 'bold',
    lineHeight: isWeb ? 25.74 : 24,
    letterSpacing: isWeb ? -0.01 : 0,
    fontFamily: isWeb ? Fonts.sans : undefined,
  },
  link: {
    lineHeight: isWeb ? 21 : 30,
    fontSize: isWeb ? 14 : 16,
    color: isWeb ? AIRBNB.coral : '#0a7ea4',
    letterSpacing: isWeb ? -0.01 : 0,
    fontFamily: isWeb ? Fonts.sans : undefined,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: isWeb ? -0.01 : 0,
    fontFamily: isWeb ? Fonts.sans : undefined,
  },
  heading: {
    fontSize: isWeb ? 24 : 24,
    fontWeight: '600',
    lineHeight: isWeb ? 31.92 : 32,
    letterSpacing: isWeb ? -0.01 : 0,
    fontFamily: isWeb ? Fonts.sans : undefined,
  },
  display: {
    fontSize: isWeb ? 44 : 48,
    fontWeight: isWeb ? '400' : 'bold',
    lineHeight: isWeb ? 51.04 : 56,
    letterSpacing: 0,
    fontFamily: isWeb ? Fonts.display : undefined,
  },
});