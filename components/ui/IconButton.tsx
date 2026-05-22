import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useSemanticTheme } from '@/constants/design-tokens';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface IconButtonProps {
  icon: any;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export function IconButton({ icon, label, onPress, destructive }: IconButtonProps) {
  const { colors, radius } = useSemanticTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: radius.md,
          borderColor: colors.borderSubtle,
          backgroundColor: pressed ? colors.bgCanvas : colors.bgSurface,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <IconSymbol
        name={icon}
        size={18}
        color={destructive ? colors.statusDanger : colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { cursor: 'pointer' as any }
      : {}),
  },
});
