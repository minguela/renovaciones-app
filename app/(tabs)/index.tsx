import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, RefreshControl, ScrollView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RenewalCard } from '@/components/RenewalCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/Button';
import { AuthScreen } from '@/components/AuthScreen';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useRenewals } from '@/hooks/useRenewals';
import { useThemeColor } from '@/hooks/use-theme-color';
import { signOut, getCurrentUser } from '@/lib/supabase';

const isWeb = Platform.OS === 'web';

export default function HomeScreen() {
  const router = useRouter();
  const { renewals, loading, error, refresh, isAuthenticated } = useRenewals();
  const [user, setUser] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const tintColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen onAuthSuccess={() => checkUser()} />;
  }

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
    <SafeAreaView style={[styles.container, isWeb && styles.webContainer]}>
      <Stack.Screen
        options={{
          title: 'Mis Renovaciones',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                title="⚙️"
                onPress={() => setShowSettings(!showSettings)}
                variant="secondary"
                size="sm"
              />
              <Button
                title="Salir"
                onPress={handleSignOut}
                variant="danger"
                size="sm"
              />
            </View>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isWeb ? styles.webScrollContent : undefined}
      >
        {isWeb && (
          <View style={styles.webHeader}>
            <ThemedText type="display" style={styles.webTitle}>
              Renovaciones
            </ThemedText>
            <ThemedText type="subtitle" style={styles.webSubtitle}>
              Gestiona tus seguros, suscripciones y servicios
            </ThemedText>
          </View>
        )}

        {showSettings && (
          <View style={styles.settingsContainer}>
            <NotificationSettings />
          </View>
        )}

        {renewals.length > 0 && (
          <View style={[styles.summaryContainer, isWeb && styles.webSummaryContainer]}>
            <View style={[styles.summaryCard, isWeb && styles.webSummaryCard]}>
              <ThemedText style={styles.summaryLabel}>Gasto mensual</ThemedText>
              <ThemedText style={[styles.summaryValue, isWeb && styles.webSummaryValue]}>
                €{totalMonthly.toFixed(2)}
              </ThemedText>
            </View>
            <View style={[styles.summaryCard, isWeb && styles.webSummaryCard]}>
              <ThemedText style={styles.summaryLabel}>Gasto anual</ThemedText>
              <ThemedText style={[styles.summaryValue, isWeb && styles.webSummaryValue]}>
                €{totalAnnual.toFixed(2)}
              </ThemedText>
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
          scrollEnabled={false}
        />
      </ScrollView>

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
  webContainer: {
    backgroundColor: '#05060f',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webScrollContent: {
    maxWidth: 720,
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  webHeader: {
    marginTop: 48,
    marginBottom: 32,
    alignItems: 'center',
  },
  webTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  webSubtitle: {
    textAlign: 'center',
    color: '#9da7ba',
  },
  settingsContainer: {
    paddingHorizontal: isWeb ? 0 : 16,
    paddingTop: isWeb ? 0 : 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  webSummaryContainer: {
    paddingHorizontal: 0,
    gap: 16,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#007AFF15',
    borderRadius: 12,
    padding: 16,
  },
  webSummaryCard: {
    backgroundColor: 'rgba(186, 214, 247, 0.03)',
    borderColor: 'rgba(186, 215, 247, 0.12)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    ...(isWeb ? {
      boxShadow: 'rgba(199, 211, 234, 0.12) 0px 1px 1px 0px inset, rgba(199, 211, 234, 0.05) 0px 24px 48px 0px inset, rgba(6, 6, 14, 0.7) 0px 24px 32px 0px',
    } : {}),
  },
  summaryLabel: {
    fontSize: 13,
    color: isWeb ? '#9da7ba' : '#007AFF',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  webSummaryValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#d8ecf8',
  },
  emptyList: {
    flexGrow: 1,
  },
  fabContainer: {
    paddingHorizontal: isWeb ? 0 : 16,
    paddingVertical: 16,
  },
});
