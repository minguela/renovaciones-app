import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'form';
}

const isWeb = Platform.OS === 'web';

export function Card({ children, style, variant = 'default' }: CardProps) {
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1C1C1E' },
    'background'
  );

  if (isWeb) {
    const webBg =
      variant === 'form'
        ? 'rgba(5, 6, 15, 0.97)'
        : variant === 'glass'
        ? 'rgba(186, 214, 247, 0.03)'
        : 'rgba(186, 214, 247, 0.03)';

    return (
      <View
        style={[
          styles.webCard,
          {
            backgroundColor: webBg,
            borderColor: 'rgba(186, 215, 247, 0.12)',
            borderWidth: 1,
            borderRadius: variant === 'form' ? 16 : 12,
          },
          variant === 'glass' && styles.webGlass,
          variant === 'form' && styles.webForm,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor, borderColor: useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'border') },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  webCard: {
    padding: 24,
    marginHorizontal: 0,
    marginVertical: 8,
    overflow: 'hidden',
  },
  webGlass: {
    boxShadow: 'rgba(199, 211, 234, 0.12) 0px 1px 1px 0px inset, rgba(199, 211, 234, 0.05) 0px 24px 48px 0px inset, rgba(6, 6, 14, 0.7) 0px 24px 32px 0px',
  } as any,
  webForm: {
    boxShadow: 'rgba(216, 236, 248, 0.2) 0px 1px 1px 0px inset, rgba(168, 216, 245, 0.06) 0px 24px 48px 0px inset, rgba(0, 0, 0, 0.3) 0px 16px 32px 0px',
  } as any,
});
