import React, { useEffect } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RenewalCard } from '@/components/RenewalCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/Button';
import { useRenewals } from '@/hooks/useRenewals';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as notifications from '@/services/notifications';

export default function HomeScreen() {
  const router = useRouter();
  const { renewals, loading, error, refresh } = useRenewals();
  const tintColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  useEffect(() => {
    // Request notification permissions on mount
    notifications.registerForPushNotificationsAsync();
  }, []);

  const totalMonthly = renewals
    .filter(r => r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.cost, 0);

  const totalAnnual = renewals.reduce((sum, r) => {
    switch (r.frequency) {
      case 'monthly': return sum + r.cost * 12;
      case 'quarterly': return sum + r.cost * 4;
      case 'biannual': return sum + r.cost * 2;
      case 'annual': return sum + r.cost;
      case 'one-time': return sum + r.cost;
      default: return sum;
    }
  }, 0);

  if (loading && renewals.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Mis Renovaciones' }} />
      
      {renewals.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>Gasto mensual</ThemedText>
            <ThemedText style={styles.summaryValue}>€{totalMonthly.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>Gasto anual</ThemedText>
            <ThemedText style={styles.summaryValue}>€{totalAnnual.toFixed(2)}</ThemedText>
          </View>
        </View>
      )}

      <FlatList
        data={renewals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RenewalCard renewal={item} />}
        contentContainerStyle={renewals.length === 0 && styles.emptyList}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={tintColor} />
        }
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.fabContainer}>
        <Button
          title="+ Añadir Renovación"
          onPress={() => router.push('/renewal/new')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#007AFF15',
    borderRadius: 12,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  emptyList: {
    flexGrow: 1,
  },
  fabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
