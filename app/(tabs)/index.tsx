import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, RefreshControl, ScrollView, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
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
import { useAuth } from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { calculateYearlyCost, calculateMonthlyCost, groupByMonth } from '@/lib/calculations';
import { getDaysUntilRenewal, type Renewal, STATUS_OPTIONS } from '@/types/renewal';
import { exportRenewalsToCSV, exportToCSVFile } from '@/lib/export';

const isWeb = Platform.OS === 'web';

const AIRBNB = {
  canvas: '#f7f7f7',
  card: '#ffffff',
  carbon: '#222222',
  slate: '#6a6a6a',
  mist: '#ebebeb',
  coral: '#ff385c',
  coralDeep: '#e00b41',
};

type FilterStatus = 'all' | 'active' | 'pending_cancellation' | 'cancelled';

const FILTER_CHIPS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'pending_cancellation', label: 'Pendientes' },
  { value: 'cancelled', label: 'Canceladas' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = isWeb && width >= 1024;

  const {
    user,
    isAuthenticated,
    loading: authLoading,
    authProcessing,
    signOut,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    authMessage,
    authError,
  } = useAuth();
  const { renewals, loading, error, refresh } = useRenewals(user?.id);
  const [showSettings, setShowSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const tintColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  const handleSignOut = async () => {
    await signOut();
  };

  const handleExportCSV = async () => {
    if (filteredRenewals.length === 0) return;
    const csv = exportRenewalsToCSV(filteredRenewals);
    const dateStr = new Date().toISOString().split('T')[0];
    await exportToCSVFile(csv, `renovaciones-${dateStr}.csv`);
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

  if (authLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
        onGoogleSignIn={signInWithGoogle}
        onAppleSignIn={signInWithApple}
        loading={authProcessing}
        authMessage={authMessage}
        authError={authError}
      />
    );
  }

  if (loading && renewals.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  const mainContent = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={isWeb ? styles.webScrollContent : undefined}
      style={{ flex: 1 }}
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
                    !isActive && isWeb && styles.filterChipWeb,
                    isActive && (isWeb ? styles.filterChipActiveWeb : styles.filterChipActive),
                  ]}
                  onPress={() => setFilterStatus(chip.value)}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      !isActive && isWeb && styles.filterChipTextWeb,
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
  );

  const sidePanel = isLargeScreen ? (
    <View style={styles.sidePanel}>
      <View style={styles.sidePanelContent}>
        <ThemedText style={styles.sidePanelTitle}>Acciones</ThemedText>

        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => router.push('/renewal/new')}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.primaryActionButtonText}>+ Nueva renovación</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryActionButton}
          onPress={handleExportCSV}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.secondaryActionButtonText}>Exportar CSV</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryActionButton}
          onPress={() => setShowSettings(!showSettings)}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.secondaryActionButtonText}>
            {showSettings ? 'Ocultar ajustes' : 'Ajustes de notificación'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryActionButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.secondaryActionButtonText, { color: AIRBNB.coral }]}>
            Cerrar sesión
          </ThemedText>
        </TouchableOpacity>

        {showSettings && (
          <View style={{ marginTop: 16 }}>
            <NotificationSettings />
          </View>
        )}
      </View>
    </View>
  ) : null;

  return (
    <SafeAreaView style={[styles.container, isWeb && styles.webContainer]}>
      <Stack.Screen
        options={{
          title: 'Mis Renovaciones',
          headerRight: () =>
            isLargeScreen ? null : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {isWeb ? (
                  <TouchableOpacity
                    style={styles.exportButtonWeb}
                    onPress={handleExportCSV}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.exportButtonWebText}>Exportar CSV</ThemedText>
                  </TouchableOpacity>
                ) : (
                  <Button
                    title="Exportar"
                    onPress={handleExportCSV}
                    variant="secondary"
                    size="sm"
                  />
                )}
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

      {isLargeScreen ? (
        <View style={styles.splitLayout}>
          <View style={styles.leftPanel}>{mainContent}</View>
          {sidePanel}
        </View>
      ) : (
        <>
          {mainContent}
          <View style={styles.fabContainer}>
            {isWeb && (
              <TouchableOpacity
                style={styles.exportButtonWeb}
                onPress={handleExportCSV}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.exportButtonWebText}>Exportar CSV</ThemedText>
              </TouchableOpacity>
            )}
            <Button
              title="+ Añadir Renovación"
              onPress={() => router.push('/renewal/new')}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    backgroundColor: AIRBNB.canvas,
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1.4,
    paddingRight: 24,
    borderRightWidth: 1,
    borderRightColor: AIRBNB.mist,
  },
  sidePanel: {
    flex: 0.6,
    backgroundColor: AIRBNB.card,
  },
  sidePanelContent: {
    padding: 24,
  },
  sidePanelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AIRBNB.carbon,
    marginBottom: 20,
  },
  primaryActionButton: {
    backgroundColor: AIRBNB.coral,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    backgroundColor: AIRBNB.canvas,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AIRBNB.mist,
  },
  secondaryActionButtonText: {
    color: AIRBNB.carbon,
    fontSize: 14,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webScrollContent: {
    maxWidth: 900,
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  webHeader: {
    marginTop: 32,
    marginBottom: 24,
    alignItems: 'center',
  },
  webTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: AIRBNB.carbon,
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.02,
  },
  webSubtitle: {
    textAlign: 'center',
    color: AIRBNB.slate,
    fontSize: 16,
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
    backgroundColor: AIRBNB.card,
    borderColor: AIRBNB.mist,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  kpiLabel: {
    fontSize: 12,
    color: isWeb ? AIRBNB.slate : '#007AFF',
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
    color: AIRBNB.carbon,
  },
  timelineContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  webTimelineContainer: {
    paddingHorizontal: 0,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: AIRBNB.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AIRBNB.mist,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
    color: isWeb ? AIRBNB.slate : '#8E8E93',
  },
  webSectionTitle: {
    color: AIRBNB.slate,
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
    backgroundColor: AIRBNB.canvas,
    borderWidth: 1,
    borderColor: AIRBNB.mist,
  },
  timelineMonth: {
    fontSize: 13,
    fontWeight: '600',
    color: isWeb ? AIRBNB.carbon : '#000000',
    marginBottom: 4,
    fontFamily: isWeb ? 'monospace' : undefined,
  },
  webTimelineMonth: {
    color: AIRBNB.carbon,
    fontFamily: 'monospace',
  },
  timelineNames: {
    fontSize: 13,
    color: isWeb ? AIRBNB.slate : '#666666',
  },
  webTimelineNames: {
    color: AIRBNB.slate,
  },
  savingsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  webSavingsContainer: {
    paddingHorizontal: 0,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: AIRBNB.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AIRBNB.mist,
    padding: 16,
  },
  savingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: isWeb ? AIRBNB.mist : '#E5E5EA',
  },
  webSavingRow: {
    borderBottomColor: AIRBNB.mist,
  },
  savingName: {
    fontSize: 14,
    color: isWeb ? AIRBNB.carbon : '#000000',
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
  filterChipWeb: {
    backgroundColor: AIRBNB.canvas,
    borderWidth: 1,
    borderColor: AIRBNB.mist,
  },
  filterChipActive: {
    backgroundColor: '#007AFF15',
  },
  filterChipActiveWeb: {
    backgroundColor: AIRBNB.carbon,
    borderWidth: 1,
    borderColor: AIRBNB.carbon,
  },
  filterChipText: {
    fontSize: 13,
    color: '#3C3C43',
  },
  filterChipTextWeb: {
    color: AIRBNB.carbon,
  },
  filterChipTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  filterChipTextActiveWeb: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyList: {
    flexGrow: 1,
  },
  fabContainer: {
    paddingHorizontal: isWeb ? 0 : 16,
    paddingVertical: 16,
  },
  exportButtonWeb: {
    backgroundColor: AIRBNB.carbon,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  exportButtonWebText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
