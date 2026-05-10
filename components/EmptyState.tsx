import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export function EmptyState() {
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = useThemeColor({ light: '#666666', dark: '#999999' }, 'text');

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconSymbol name="doc.text" size={48} color="#C7C7CC" />
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
