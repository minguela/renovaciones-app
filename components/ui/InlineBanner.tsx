import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSemanticTheme } from '@/constants/design-tokens';

type BannerKind = 'error' | 'info' | 'success';

interface InlineBannerProps {
  kind?: BannerKind;
  message: string;
}

export function InlineBanner({ kind = 'info', message }: InlineBannerProps) {
  const { colors, radius } = useSemanticTheme();

  const colorMap = {
    info: { border: colors.statusInfo, bg: `${colors.statusInfo}1A`, text: colors.statusInfo },
    success: { border: colors.statusSuccess, bg: `${colors.statusSuccess}1A`, text: colors.statusSuccess },
    error: { border: colors.statusDanger, bg: `${colors.statusDanger}1A`, text: colors.statusDanger },
  };

  const tone = colorMap[kind];

  return (
    <View style={[styles.container, { borderColor: tone.border, backgroundColor: tone.bg, borderRadius: radius.md }]}>
      <Text style={[styles.text, { color: tone.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
