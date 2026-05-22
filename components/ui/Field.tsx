import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSemanticTheme } from '@/constants/design-tokens';

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, required, hint, error, children }: FieldProps) {
  const { colors, spacing } = useSemanticTheme();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>
        {label}{required ? ' *' : ''}
      </Text>
      {children}
      {error ? <Text style={[styles.error, { color: colors.statusDanger }]}>{error}</Text> : null}
      {!error && hint ? <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
