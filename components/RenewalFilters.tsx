import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  RENEWAL_TYPES,
  RENEWAL_FREQUENCIES,
  STATUS_OPTIONS,
  PAYMENT_METHODS,
  NOTIFICATION_METHODS,
  COLORS,
  type Renewal,
} from '@/types/renewal';

const isWeb = Platform.OS === 'web';

const AIRBNB = {
  canvas: '#f7f7f7',
  card: '#ffffff',
  carbon: '#222222',
  slate: '#6a6a6a',
  mist: '#ebebeb',
  coral: '#ff385c',
};

export interface FilterState {
  status: string | null;
  type: string | null;
  frequency: string | null;
  paymentMethod: string | null;
  notificationMethod: string | null;
  notificationDaysBefore: number | null;
  dateRange: 'all' | '7d' | '30d' | '90d' | 'thisYear' | null;
  searchQuery: string;
}

export const DEFAULT_FILTERS: FilterState = {
  status: 'active',
  type: null,
  frequency: null,
  paymentMethod: null,
  notificationMethod: null,
  notificationDaysBefore: null,
  dateRange: null,
  searchQuery: '',
};

interface RenewalFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  renewals: Renewal[];
  customTypes?: { value: string; label: string; icon: string }[];
}

const NOTIFICATION_DAYS_OPTIONS = [
  { value: 1, label: '1 día' },
  { value: 3, label: '3 días' },
  { value: 7, label: '7 días' },
  { value: 14, label: '14 días' },
  { value: 30, label: '30 días' },
];

const DATE_RANGE_OPTIONS = [
  { value: '7d' as const, label: '7 días' },
  { value: '30d' as const, label: '30 días' },
  { value: '90d' as const, label: '90 días' },
  { value: 'thisYear' as const, label: 'Este año' },
];

export function RenewalFilters({ filters, onChange, renewals, customTypes = [] }: RenewalFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const allTypes = [...RENEWAL_TYPES, ...customTypes];

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchQuery') return !!value;
    return value !== null;
  }).length;

  const toggleFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const current = filters[key];
    onChange({ ...filters, [key]: current === value ? null : value });
  };

  const pill = (label: string, active: boolean, onPress: () => void, key?: string) => (
    <TouchableOpacity
      key={key || label}
      style={[
        styles.pill,
        active && styles.pillActive,
        isWeb && !active && styles.pillWeb,
        isWeb && active && styles.pillActiveWeb,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.pillText,
          active && styles.pillTextActive,
          isWeb && !active && styles.pillTextWeb,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isWeb && styles.containerWeb]}>
      {/* Search + toggle */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setExpanded(!expanded)}
        >
          <IconSymbol name="line.3.horizontal.decrease" size={16} color={isWeb ? AIRBNB.carbon : '#007AFF'} />
          <Text style={[styles.toggleText, { color: isWeb ? AIRBNB.carbon : '#007AFF' }]}>
            Filtros {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Text>
          <IconSymbol
            name={expanded ? 'chevron.up' : 'chevron.down'}
            size={14}
            color={isWeb ? AIRBNB.slate : '#8E8E93'}
          />
        </TouchableOpacity>

        {activeFilterCount > 0 && (
          <TouchableOpacity onPress={() => onChange(DEFAULT_FILTERS)}>
            <Text style={[styles.clearText, { color: AIRBNB.coral }]}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {expanded && (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Estado */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>Estado</Text>
            <View style={styles.pillRow}>
              {pill('Todas', filters.status === null, () => toggleFilter('status', null), 'status-all')}
              {STATUS_OPTIONS.map((s) => pill(s.label, filters.status === s.value, () => toggleFilter('status', s.value), `status-${s.value}`))}
            </View>
          </View>

          {/* Tipo */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>Tipo</Text>
            <View style={styles.pillRow}>
              {pill('Todos', filters.type === null, () => toggleFilter('type', null), 'type-all')}
              {allTypes.map((t) => pill(t.label, filters.type === t.value, () => toggleFilter('type', t.value), `type-${t.value}`))}
            </View>
          </View>

          {/* Frecuencia */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>Frecuencia</Text>
            <View style={styles.pillRow}>
              {pill('Todas', filters.frequency === null, () => toggleFilter('frequency', null), 'freq-all')}
              {RENEWAL_FREQUENCIES.map((f) => pill(f.label, filters.frequency === f.value, () => toggleFilter('frequency', f.value), `freq-${f.value}`))}
            </View>
          </View>

          {/* Método de pago */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>Método de pago</Text>
            <View style={styles.pillRow}>
              {pill('Todos', filters.paymentMethod === null, () => toggleFilter('paymentMethod', null), 'pay-all')}
              {PAYMENT_METHODS.map((p) => pill(p.label, filters.paymentMethod === p.value, () => toggleFilter('paymentMethod', p.value), `pay-${p.value}`))}
            </View>
          </View>

          {/* Método de notificación */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>Canal de notificación</Text>
            <View style={styles.pillRow}>
              {pill('Todos', filters.notificationMethod === null, () => toggleFilter('notificationMethod', null), 'notif-all')}
              {NOTIFICATION_METHODS.map((n) => pill(n.label, filters.notificationMethod === n.value, () => toggleFilter('notificationMethod', n.value), `notif-${n.value}`))}
            </View>
          </View>

          {/* Días antes de notificar */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>Avisar con antelación</Text>
            <View style={styles.pillRow}>
              {pill('Cualquiera', filters.notificationDaysBefore === null, () => toggleFilter('notificationDaysBefore', null), 'days-all')}
              {NOTIFICATION_DAYS_OPTIONS.map((d) => pill(d.label, filters.notificationDaysBefore === d.value, () => toggleFilter('notificationDaysBefore', d.value), `days-${d.value}`))}
            </View>
          </View>

          {/* Rango de fecha */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>Fecha de renovación</Text>
            <View style={styles.pillRow}>
              {pill('Todas', filters.dateRange === null, () => toggleFilter('dateRange', null), 'date-all')}
              {DATE_RANGE_OPTIONS.map((d) => pill(d.label, filters.dateRange === d.value, () => toggleFilter('dateRange', d.value), `date-${d.value}`))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function applyFilters(renewals: Renewal[], filters: FilterState): Renewal[] {
  return renewals.filter((r) => {
    if (filters.status !== null && (r.status || 'active') !== filters.status) return false;
    if (filters.type !== null && r.type !== filters.type) return false;
    if (filters.frequency !== null && r.frequency !== filters.frequency) return false;
    if (filters.paymentMethod !== null && r.paymentMethod !== filters.paymentMethod) return false;
    if (filters.notificationMethod !== null && r.notificationMethod !== filters.notificationMethod) return false;
    if (filters.notificationDaysBefore !== null && r.notificationDaysBefore !== filters.notificationDaysBefore) return false;
    if (filters.dateRange) {
      const days = getDaysUntil(r.renewalDate);
      switch (filters.dateRange) {
        case '7d':
          if (days < 0 || days > 7) return false;
          break;
        case '30d':
          if (days < 0 || days > 30) return false;
          break;
        case '90d':
          if (days < 0 || days > 90) return false;
          break;
        case 'thisYear':
          const renewalYear = new Date(r.renewalDate).getFullYear();
          if (renewalYear !== new Date().getFullYear()) return false;
          break;
      }
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const text = `${r.name} ${r.provider || ''} ${r.notes || ''}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  containerWeb: {
    backgroundColor: AIRBNB.card,
    borderWidth: 1,
    borderColor: AIRBNB.mist,
    marginHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scroll: {
    maxHeight: 400,
    paddingBottom: 12,
  },
  section: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillWeb: {
    backgroundColor: AIRBNB.canvas,
    borderColor: AIRBNB.mist,
  },
  pillActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pillActiveWeb: {
    backgroundColor: AIRBNB.carbon,
    borderColor: AIRBNB.carbon,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3C3C43',
  },
  pillTextWeb: {
    color: AIRBNB.carbon,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
