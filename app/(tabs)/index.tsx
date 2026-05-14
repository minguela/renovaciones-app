import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, RefreshControl, ScrollView, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RenewalCard } from '@/components/RenewalCard';
import { EmptyState } from '@/components/EmptyState';
import { RenewalFilters, DEFAULT_FILTERS, applyFilters, type FilterState } from '@/components/RenewalFilters';
import { Button } from '@/components/ui/Button';
import { AuthScreen } from '@/components/AuthScreen';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useRenewals } from '@/hooks/useRenewals';
import { useAuth } from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { calculateYearlyCost, calculateMonthlyCost } from '@/lib/calculations';
import { getDaysUntilRenewal, type Renewal, STATUS_OPTIONS } from '@/types/renewal';
import { exportRenewalsToCSV, exportToCSVFile } from '@/lib/export';
import { AIRBNB } from '@/constants/airbnb-colors';

const isWeb = Platform.OS === 'web';

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
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
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
    return applyFilters(renewals, filters);
  }, [renewals, filters]);

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

      {renewals.length > 0 && savings.length > 0 && (
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

      <RenewalFilters
        filters={filters}
        onChange={setFilters}
        renewals={renewals}
      />

      <FlatList
        data={filteredRenewals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RenewalCard
            renewal={item}
            onDelete={(renewal) => {
              Alert.alert(
                'Eliminar renovación',
                `¿Eliminar "${renewal.name}"?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => deleteRenewal(renewal.id),
                  },
                ]
              );
            }}
          />
        )}
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
              {showSettings ? 'Ocultar datos de contacto' : 'Datos de contacto'}
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

  const kpiBar = renewals.length > 0 ? (
    <View style={[styles.kpiBar, isWeb && styles.webKpiBar]}>
      <View style={styles.kpiBarItem}>
        <ThemedText style={styles.kpiBarLabel}>Mensual</ThemedText>
        <ThemedText style={styles.kpiBarValue}>€{kpiData.totalMonthly.toFixed(0)}</ThemedText>
      </View>
      <View style={styles.kpiBarDivider} />
      <View style={styles.kpiBarItem}>
        <ThemedText style={styles.kpiBarLabel}>Anual</ThemedText>
        <ThemedText style={styles.kpiBarValue}>€{kpiData.totalYearly.toFixed(0)}</ThemedText>
      </View>
      <View style={styles.kpiBarDivider} />
      <View style={styles.kpiBarItem}>
        <ThemedText style={styles.kpiBarLabel}>30d</ThemedText>
        <ThemedText style={styles.kpiBarValue}>{kpiData.upcoming30}</ThemedText>
      </View>
      <View style={styles.kpiBarDivider} />
      <View style={[styles.kpiBarItem, { flex: 1.5 }]}>
        <ThemedText style={styles.kpiBarLabel}>Top</ThemedText>
        <ThemedText style={styles.kpiBarValue} numberOfLines={1}>
          {kpiData.mostExpensiveCategory
            ? kpiData.mostExpensiveCategory[0].charAt(0).toUpperCase() +
              kpiData.mostExpensiveCategory[0].slice(1)
            : '-'}
        </ThemedText>
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
          <View style={styles.leftPanel}>
            {mainContent}
            {kpiBar}
          </View>
          {sidePanel}
        </View>
      ) : (
        <>
          <View style={{ flex: 1 }}>
            {mainContent}
            {kpiBar}
          </View>
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
    alignItems: 'center',
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
    alignSelf: 'center',
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
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  webSectionTitle: {
    color: AIRBNB.carbon,
  },
  savingsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  webSavingsContainer: {
    paddingHorizontal: 24,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  savingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  webSavingRow: {
    borderBottomColor: AIRBNB.mist,
  },
  savingName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  savingAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
  webSavingAmount: {
    color: AIRBNB.coral,
  },
  kpiBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 28,
    zIndex: 10,
  },
  webKpiBar: {
    backgroundColor: AIRBNB.card,
    borderTopColor: AIRBNB.mist,
    paddingBottom: 16,
  },
  kpiBarItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 2,
  },
  kpiBarValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  kpiBarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E5EA',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    left: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
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
    color: AIRBNB.cloud,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});