import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, RefreshControl, ScrollView, Platform, TouchableOpacity } from 'react-native';
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
import { calculateYearlyCost, calculateMonthlyCost, groupByMonth } from '@/lib/calculations';
import { getDaysUntilRenewal, type Renewal, STATUS_OPTIONS } from '@/types/renewal';

const isWeb = Platform.OS === 'web';

type FilterStatus = 'all' | 'active' | 'pending_cancellation' | 'cancelled';

const FILTER_CHIPS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'pending_cancellation', label: 'Pendientes' },
  { value: 'cancelled', label: 'Canceladas' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { renewals, loading, error, refresh, isAuthenticated } = useRenewals();
  const [user, setUser] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
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

  const filteredRenewals = useMemo(() => {
    if (filterStatus === 'all') return renewals;
    return renewals.filter((r) => (r.status || 'active') === filterStatus);
  }, [renewals, filterStatus]);

  const kpiData = useMemo(() => {
    const totalMonthly = renewals.reduce((sum, r) => {
      if ((r.status || 'active') !== 'cancelled') {
        return sum + calculateMonthlyCost(r.cost, r.frequency);
      }
      return sum;
    }, 0);

    const totalYearly = renewals.reduce((sum, r) => {
      if ((r.status || 'active') !== 'cancelled') {
        return sum + calculateYearlyCost(r.cost, r.frequency);
      }
      return sum;
    }, 0);

    const upcoming30 = renewals.filter((r) => {
      const days = getDaysUntilRenewal(r.renewalDate);
      return days >= 0 && days <= 30 && (r.status || 'active') !== 'cancelled';
    }).length;

    const categoryCosts: Record<string, number> = {};
    renewals.forEach((r) => {
      if ((r.status || 'active') !== 'cancelled') {
        const yearly = calculateYearlyCost(r.cost, r.frequency);
        categoryCosts[r.type] = (categoryCosts[r.type] || 0) + yearly;
      }
    });
    const mostExpensiveCategory = Object.entries(categoryCosts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalMonthly,
      totalYearly,
      upcoming30,
      mostExpensiveCategory,
    };
  }, [renewals]);

  const timeline = useMemo(() => {
    const activeRenewals = renewals.filter((r) => (r.status || 'active') !== 'cancelled');
    return groupByMonth(activeRenewals);
  }, [renewals]);

  const savings = useMemo(() => {
    return renewals
      .filter((r) => r.status === 'pending_cancellation' || r.status === 'cancelled')
      .map((r) => ({
        ...r,
        yearlySaving: calculateYearlyCost(r.cost, r.frequency),
      }));
  }, [renewals]);

  if (!user) {
    return <AuthScreen onAuthSuccess={() => checkUser()} />;
  }

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
          <>
            <View style={[styles.kpiContainer, isWeb && styles.webKpiContainer]}>
              <View style={[styles.kpiCard, isWeb && styles.webKpiCard]}>
                <ThemedText style={styles.kpiLabel}>Gasto mensual</ThemedText>
                <ThemedText style={[styles.kpiValue, isWeb && styles.webKpiValue]}>
                  €{kpiData.totalMonthly.toFixed(2)}
                </ThemedText>
              </View>
              <View style={[styles.kpiCard, isWeb && styles.webKpiCard]}>
                <ThemedText style={styles.kpiLabel}>Gasto anual</ThemedText>
                <ThemedText style={[styles.kpiValue, isWeb && styles.webKpiValue]}>
                  €{kpiData.totalYearly.toFixed(2)}
                </ThemedText>
              </View>
              <View style={[styles.kpiCard, isWeb && styles.webKpiCard]}>
                <ThemedText style={styles.kpiLabel}>Próximas 30d</ThemedText>
                <ThemedText style={[styles.kpiValue, isWeb && styles.webKpiValue]}>
                  {kpiData.upcoming30}
                </ThemedText>
              </View>
              <View style={[styles.kpiCard, isWeb && styles.webKpiCard]}>
                <ThemedText style={styles.kpiLabel}>Categoría más cara</ThemedText>
                <ThemedText style={[styles.kpiValue, isWeb && styles.webKpiValue]}>
                  {kpiData.mostExpensiveCategory
                    ? kpiData.mostExpensiveCategory[0].charAt(0).toUpperCase() +
                      kpiData.mostExpensiveCategory[0].slice(1)
                    : '-'}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.timelineContainer, isWeb && styles.webTimelineContainer]}>
              <ThemedText style={[styles.sectionTitle, isWeb && styles.webSectionTitle]}>
                Timeline de renovaciones
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timelineScroll}
              >
                {Object.entries(timeline).map(([month, items]) => (
                  <View key={month} style={[styles.timelineItem, isWeb && styles.webTimelineItem]}>
                    <ThemedText style={[styles.timelineMonth, isWeb && styles.webTimelineMonth]}>
                      {month}
                    </ThemedText>
                    <ThemedText style={[styles.timelineNames, isWeb && styles.webTimelineNames]}>
                      {items.map((i) => i.name).join(', ')}
                    </ThemedText>
                  </View>
                ))}
              </ScrollView>
            </View>

            {savings.length > 0 && (
              <View style={[styles.savingsContainer, isWeb && styles.webSavingsContainer]}>
                <ThemedText style={[styles.sectionTitle, isWeb && styles.webSectionTitle]}>
                  Posibles ahorros
                </ThemedText>
                {savings.map((item) => (
                  <View key={item.id} style={[styles.savingRow, isWeb && styles.webSavingRow]}>
                    <ThemedText style={styles.savingName}>{item.name}</ThemedText>
                    <ThemedText style={[styles.savingAmount, isWeb && styles.webSavingAmount]}>
                      -€{item.yearlySaving.toFixed(2)}/año
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {FILTER_CHIPS.map((chip) => {
                const isActive = filterStatus === chip.value;
                return (
                  <TouchableOpacity
                    key={chip.value}
                    style={[
                      styles.filterChip,
                      isActive && (isWeb ? styles.filterChipActiveWeb : styles.filterChipActive),
                    ]}
                    onPress={() => setFilterStatus(chip.value)}
                  >
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        isActive && (isWeb ? styles.filterChipTextActiveWeb : styles.filterChipTextActive),
                      ]}
                    >
                      {chip.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <FlatList
          data={filteredRenewals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RenewalCard renewal={item} />}
          contentContainerStyle={filteredRenewals.length === 0 && styles.emptyList}
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
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  webKpiContainer: {
    paddingHorizontal: 0,
    gap: 12,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#007AFF15',
    borderRadius: 12,
    padding: 14,
    minWidth: 100,
  },
  webKpiCard: {
    backgroundColor: 'rgba(186, 214, 247, 0.03)',
    borderColor: 'rgba(186, 215, 247, 0.12)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    ...(isWeb ? {
      boxShadow: 'rgba(199, 211, 234, 0.12) 0px 1px 1px 0px inset, rgba(199, 211, 234, 0.05) 0px 24px 48px 0px inset, rgba(6, 6, 14, 0.7) 0px 24px 32px 0px',
    } : {}),
  },
  kpiLabel: {
    fontSize: 12,
    color: isWeb ? '#9da7ba' : '#007AFF',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  webKpiValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#d8ecf8',
  },
  timelineContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  webTimelineContainer: {
    paddingHorizontal: 0,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#0d0f1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 215, 247, 0.08)',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
    color: isWeb ? '#9da7ba' : '#8E8E93',
  },
  webSectionTitle: {
    color: '#9da7ba',
  },
  timelineScroll: {
    gap: 12,
    paddingRight: 16,
  },
  timelineItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
    minWidth: 160,
  },
  webTimelineItem: {
    backgroundColor: 'rgba(186, 214, 247, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(186, 215, 247, 0.12)',
  },
  timelineMonth: {
    fontSize: 13,
    fontWeight: '600',
    color: isWeb ? '#b6d9fc' : '#000000',
    marginBottom: 4,
    fontFamily: isWeb ? 'monospace' : undefined,
  },
  webTimelineMonth: {
    color: '#b6d9fc',
    fontFamily: 'monospace',
  },
  timelineNames: {
    fontSize: 13,
    color: isWeb ? '#9da7ba' : '#666666',
  },
  webTimelineNames: {
    color: '#9da7ba',
  },
  savingsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  webSavingsContainer: {
    paddingHorizontal: 0,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#0d0f1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 215, 247, 0.08)',
    padding: 16,
  },
  savingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: isWeb ? 'rgba(186, 215, 247, 0.08)' : '#E5E5EA',
  },
  webSavingRow: {
    borderBottomColor: 'rgba(186, 215, 247, 0.08)',
  },
  savingName: {
    fontSize: 14,
    color: isWeb ? '#d8ecf8' : '#000000',
  },
  savingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  webSavingAmount: {
    color: '#FF453A',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
  },
  filterChipActive: {
    backgroundColor: '#007AFF15',
  },
  filterChipActiveWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(102, 58, 243, 0.3)',
  },
  filterChipText: {
    fontSize: 13,
    color: '#3C3C43',
  },
  filterChipTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  filterChipTextActiveWeb: {
    color: '#b6d9fc',
    fontWeight: '500',
  },
  emptyList: {
    flexGrow: 1,
  },
  fabContainer: {
    paddingHorizontal: isWeb ? 0 : 16,
    paddingVertical: 16,
  },
});
