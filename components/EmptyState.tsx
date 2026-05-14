import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AIRBNB } from '@/constants/airbnb-colors';

const isWeb = Platform.OS === 'web';

export function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconSymbol name="doc.text" size={48} color={isWeb ? AIRBNB.slate : '#C7C7CC'} />
      </View>
      <Text style={[styles.title, { color: isWeb ? AIRBNB.carbon : '#000000' }]}>
        No hay renovaciones
      </Text>
      <Text style={[styles.subtitle, { color: isWeb ? AIRBNB.slate : '#666666' }]}>
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