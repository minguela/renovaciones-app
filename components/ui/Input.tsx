import React from 'react';
import { TextInput, StyleSheet, Text, View, ViewStyle, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  error?: string;
}

const isWeb = Platform.OS === 'web';

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry,
  multiline,
  numberOfLines,
  style,
  error,
}: InputProps) {
  const backgroundColor = isWeb
    ? '#ffffff'
    : useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const placeholderColor = isWeb ? '#6a6a6a' : useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'text');

  return (
    <View style={style}>
      {label && (
        <Text style={[styles.label, { color: isWeb ? '#222222' : '#3C3C43' }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor,
            color: textColor,
            borderColor: isWeb
              ? error
                ? 'rgba(255, 69, 58, 0.5)'
                : '#ebebeb'
              : error
              ? '#FF3B30'
              : 'transparent',
            borderWidth: isWeb ? 1 : error ? 1 : 0,
            borderRadius: isWeb ? 14 : 8,
          },
          multiline && { height: numberOfLines ? numberOfLines * 24 : 100, textAlignVertical: 'top' },
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && <Text style={[styles.errorText, { color: isWeb ? '#FF453A' : '#FF3B30' }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
