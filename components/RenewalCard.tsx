import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Card } from '@/components/ui/Card';
import type { Renewal } from '@/types/renewal';
import { getDaysUntilRenewal, getRenewalStatus, formatCurrency } from '@/types/renewal';
import { useThemeColor } from '@/hooks/use-theme-color';

interface RenewalCardProps {
  renewal: Renewal;
}

export function RenewalCard({ renewal }: RenewalCardProps) {
  const router = useRouter();
  const daysUntil = getDaysUntilRenewal(renewal.renewalDate);
  const status = getRenewalStatus(daysUntil);
  
  const getStatusColor = () => {
    switch (status) {
      case 'overdue': return '#FF3B30';
      case 'soon': return '#FF9500';
      case 'upcoming': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getStatusText = () => {
    if (daysUntil < 0) return `Vencido hace ${Math.abs(daysUntil)} días`;
    if (daysUntil === 0) return 'Vence hoy';
    if (daysUntil === 1) return 'Vence mañana';
    return `Vence en ${daysUntil} días`;
  };

  const iconColor = renewal.color || '#007AFF';
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = useThemeColor({ light: '#666666', dark: '#999999' }, 'text');

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/renewal/${renewal.id}`)}
    >
      <Card>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <IconSymbol 
              name={(renewal.icon as any) || 'tag.fill'} 
              size={24} 
              color={iconColor} 
            />
          </View>
          
          <View style={styles.content}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {renewal.name}
            </Text>
            {renewal.provider && (
              <Text style={[styles.provider, { color: secondaryTextColor }]} numberOfLines={1}>
                {renewal.provider}
              </Text>
            )}
            <View style={styles.footer}>
              <Text style={[styles.cost, { color: textColor }]}>
                {formatCurrency(renewal.cost, renewal.currency)}
                <Text style={[styles.frequency, { color: secondaryTextColor }]}>
                  {' '}/ {getFrequencyLabel(renewal.frequency)}
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    monthly: 'mes',
    quarterly: 'trimestre',
    biannual: 'semestre',
    annual: 'año',
    'one-time': 'pago único',
  };
  return labels[frequency] || frequency;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  provider: {
    fontSize: 13,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cost: {
    fontSize: 14,
    fontWeight: '500',
  },
  frequency: {
    fontSize: 12,
    fontWeight: '400',
  },
  statusContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
