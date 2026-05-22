import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useSemanticTheme } from '@/constants/design-tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'form';
}

const isWeb = Platform.OS === 'web';

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors, radius } = useSemanticTheme();

  if (isWeb) {
    return (
      <View
        style={[
          styles.webCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: colors.borderSubtle,
            borderWidth: 1,
            borderRadius: variant === 'form' ? radius.xl : radius.lg,
          },
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
        { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle, borderRadius: radius.lg },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  webCard: {
    padding: 24,
    overflow: 'hidden',
  },
});
