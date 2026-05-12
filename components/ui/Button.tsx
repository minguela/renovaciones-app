import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: any;
  textStyle?: any;
}

const isWeb = Platform.OS === 'web';

export function Button({ title, onPress, variant = 'primary', disabled, loading, size = 'md', style, textStyle }: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled || loading) return isWeb ? '#f7f7f7' : '#C7C7CC';
    if (variant === 'primary') return isWeb ? '#ff385c' : '#007AFF';
    if (variant === 'danger') return isWeb ? 'transparent' : '#FF3B30';
    if (variant === 'ghost') return 'transparent';
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled || loading) return isWeb ? '#c1c1c1' : '#FFFFFF';
    if (variant === 'primary') return '#FFFFFF';
    if (variant === 'danger') return isWeb ? '#ff385c' : '#FFFFFF';
    if (variant === 'ghost') return isWeb ? '#222222' : '#007AFF';
    return isWeb ? '#222222' : '#007AFF';
  };

  const getBorderColor = () => {
    if (disabled || loading) return isWeb ? '#ebebeb' : 'transparent';
    if (variant === 'primary') return 'transparent';
    if (variant === 'danger') return isWeb ? '#ff385c' : 'transparent';
    if (variant === 'ghost') return 'transparent';
    return isWeb ? '#222222' : '#007AFF';
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
          borderRadius: isWeb ? 8 : 10,
          paddingVertical: sizeStyles[size].paddingVertical,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
        },
        (variant === 'secondary' || variant === 'danger') && { borderWidth: isWeb ? 1 : (variant === 'secondary' ? 1 : 0) },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor(), fontSize: sizeStyles[size].fontSize }, textStyle]}>
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
