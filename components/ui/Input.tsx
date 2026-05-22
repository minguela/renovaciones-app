import React from 'react';
import { TextInput, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSemanticTheme } from '@/constants/design-tokens';

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
  const { colors, radius } = useSemanticTheme();

  return (
    <View style={style}>
      {label && (
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.bgSurface,
            color: colors.textPrimary,
            borderColor: error ? colors.statusDanger : colors.borderSubtle,
            borderWidth: 1,
            borderRadius: radius.lg,
          },
          multiline && { height: numberOfLines ? numberOfLines * 24 : 100, textAlignVertical: 'top' },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && <Text style={[styles.errorText, { color: colors.statusDanger }]}>{error}</Text>}
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
