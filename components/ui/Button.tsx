import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const isWeb = Platform.OS === 'web';

export function Button({ title, onPress, variant = 'primary', disabled, loading, size = 'md' }: ButtonProps) {
  const tintColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');
  const dangerColor = isWeb ? '#FF453A' : '#FF3B30';

  const getBackgroundColor = () => {
    if (disabled || loading) return isWeb ? 'rgba(186, 214, 247, 0.06)' : '#C7C7CC';
    if (variant === 'primary') return isWeb ? 'rgba(186, 214, 247, 0.06)' : tintColor;
    if (variant === 'danger') return isWeb ? 'rgba(255, 69, 58, 0.1)' : dangerColor;
    if (variant === 'ghost') return 'transparent';
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled || loading) return isWeb ? '#81899b' : '#FFFFFF';
    if (variant === 'primary') return isWeb ? '#ffffff' : '#FFFFFF';
    if (variant === 'danger') return isWeb ? '#FF453A' : '#FFFFFF';
    if (variant === 'ghost') return isWeb ? '#d1e4fa' : tintColor;
    return isWeb ? '#d1e4fa' : tintColor;
  };

  const getBorderColor = () => {
    if (disabled || loading) return isWeb ? 'rgba(186, 214, 247, 0.06)' : 'transparent';
    if (variant === 'primary') return isWeb ? 'rgba(255, 255, 255, 0.2)' : 'transparent';
    if (variant === 'danger') return isWeb ? 'rgba(255, 69, 58, 0.3)' : 'transparent';
    if (variant === 'ghost') return 'transparent';
    return isWeb ? 'rgba(186, 215, 247, 0.12)' : tintColor;
  };

  const sizeStyles = {
    sm: { paddingVertical: isWeb ? 8 : 10, paddingHorizontal: isWeb ? 16 : 20, fontSize: isWeb ? 12 : 14 },
    md: { paddingVertical: isWeb ? 12 : 14, paddingHorizontal: isWeb ? 24 : 24, fontSize: isWeb ? 14 : 16 },
    lg: { paddingVertical: isWeb ? 16 : 16, paddingHorizontal: isWeb ? 32 : 32, fontSize: isWeb ? 16 : 18 },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderRadius: isWeb ? 999 : 10,
          paddingVertical: sizeStyles[size].paddingVertical,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
        },
        variant === 'secondary' && { borderWidth: isWeb ? 1 : 1 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor(), fontSize: sizeStyles[size].fontSize }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    fontWeight: '600',
    letterSpacing: isWeb ? -0.01 : 0,
  },
});
