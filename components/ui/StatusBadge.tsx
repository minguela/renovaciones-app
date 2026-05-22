import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSemanticTheme } from '@/constants/design-tokens';

interface StatusBadgeProps {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'muted';
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const { colors, radius } = useSemanticTheme();

  const tones = {
    success: { bg: `${colors.statusSuccess}1A`, text: colors.statusSuccess },
    warning: { bg: `${colors.statusWarning}1A`, text: colors.statusWarning },
    danger: { bg: `${colors.statusDanger}1A`, text: colors.statusDanger },
    muted: { bg: colors.bgCanvas, text: colors.textSecondary },
  };

  const current = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: current.bg, borderRadius: radius.pill }]}>
      <Text style={[styles.label, { color: current.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 120,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
});
