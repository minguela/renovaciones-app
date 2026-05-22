import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useSemanticTheme } from '@/constants/design-tokens';

export default function SettingsScreen() {
  const { colors, spacing } = useSemanticTheme();

  return (
    <Screen kind="form">
      <Stack.Screen options={{ title: 'Ajustes', headerShown: true }} />
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Recordatorios y contacto</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Configura cómo quieres recibir avisos.
          </Text>
        </View>
        <NotificationSettings />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
