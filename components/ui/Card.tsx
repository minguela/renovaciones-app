import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AIRBNB } from '@/constants/airbnb-colors';

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
  const themeBorderColor = useThemeColor(
    { light: '#E5E5EA', dark: '#38383A' },
    'background'
  );
  const borderColor = isWeb ? AIRBNB.mist : themeBorderColor;

  if (isWeb) {
    return (
      <View
        style={[
          styles.webCard,
          {
            backgroundColor: AIRBNB.card,
            borderColor: variant === 'form' ? AIRBNB.mist : AIRBNB.mist,
            borderWidth: 1,
            borderRadius: 20,
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
        { backgroundColor, borderColor },
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
});