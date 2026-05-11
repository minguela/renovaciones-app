import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

const isWeb = Platform.OS === 'web';

export function EmptyState() {
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = isWeb ? '#9da7ba' : useThemeColor({ light: '#666666', dark: '#999999' }, 'text');

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, isWeb && styles.webIconContainer]}>
        <IconSymbol name="doc.text" size={48} color={isWeb ? '#3f4959' : '#C7C7CC'} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>Sin renovaciones</Text>
      <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
        Añade tu primera renovación para empezar a gestionar tus seguros y suscripciones
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 16,
  },
  webIconContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(186, 214, 247, 0.03)',
    borderColor: 'rgba(186, 215, 247, 0.12)',
    borderWidth: 1,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
});
