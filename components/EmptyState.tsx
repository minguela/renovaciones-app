import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSemanticTheme } from '@/constants/design-tokens';

interface EmptyStateProps {
  onPrimaryAction?: () => void;
}

export function EmptyState({ onPrimaryAction }: EmptyStateProps) {
  const { colors } = useSemanticTheme();
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconSymbol name="doc.text" size={48} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Aún no tienes renovaciones
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Empieza con un seguro, suscripción o licencia. Tarda menos de un minuto.
      </Text>
      {onPrimaryAction ? (
        <TouchableOpacity style={[styles.cta, { backgroundColor: colors.accentPrimary }]} onPress={onPrimaryAction}>
          <Text style={styles.ctaText}>Nueva renovación</Text>
        </TouchableOpacity>
      ) : null}
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
  cta: {
    marginTop: 20,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
