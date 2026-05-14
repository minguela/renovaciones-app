import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Card } from '@/components/ui/Card';
import type { Renewal } from '@/types/renewal';
import { getDaysUntilRenewal, getRenewalStatus, formatCurrency } from '@/types/renewal';
import { AIRBNB } from '@/constants/airbnb-colors';

const isWeb = Platform.OS === 'web';

interface RenewalCardProps {
  renewal: Renewal;
  onPress?: (renewal: Renewal) => void;
  onDelete?: (renewal: Renewal) => void;
  onEdit?: (renewal: Renewal) => void;
}

export function RenewalCard({ renewal, onPress, onDelete, onEdit }: RenewalCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const daysUntil = getDaysUntilRenewal(renewal.renewalDate);
  const status = getRenewalStatus(daysUntil);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [menuOpen]);

  const getStatusColor = () => {
    switch (status) {
      case 'overdue': return '#FF3B30';
      case 'soon': return '#FF9500';
      case 'upcoming': return '#30D158';
      default: return AIRBNB.slate;
    }
  };

  const getStatusText = () => {
    if (daysUntil < 0) return `Vencido hace ${Math.abs(daysUntil)} días`;
    if (daysUntil === 0) return 'Vence hoy';
    if (daysUntil === 1) return 'Vence mañana';
    return `Vence en ${daysUntil} días`;
  };

  const iconColor = renewal.color || (isWeb ? AIRBNB.carbon : '#007AFF');
  const textPrimary = isWeb ? AIRBNB.carbon : '#000000';
  const textSecondary = isWeb ? AIRBNB.slate : '#666666';

  const handlePress = () => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    if (onPress) {
      onPress(renewal);
    } else {
      router.push(`/renewal/${renewal.id}`);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
      <Card variant="default">
        <View style={styles.container}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
            <IconSymbol
              name={(renewal.icon as any) || 'tag.fill'}
              size={20}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.content}>
            <Text style={[styles.name, { color: textPrimary }]} numberOfLines={1}>
              {renewal.name}
            </Text>
            {renewal.provider && (
              <Text style={[styles.provider, { color: textSecondary }]} numberOfLines={1}>
                {renewal.provider}
              </Text>
            )}
            <View style={styles.footer}>
              <Text style={[styles.cost, { color: textPrimary }]}>
                {formatCurrency(renewal.cost, renewal.currency)}
                <Text style={[styles.frequency, { color: textSecondary }]}>
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

        {/* Menu button */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          hitSlop={8}
        >
          <IconSymbol
            name="ellipsis"
            size={20}
            color={isWeb ? AIRBNB.slate : '#8E8E93'}
          />
        </TouchableOpacity>

        {/* Inline action menu */}
        {menuOpen && (
          <Animated.View style={[styles.actionMenu, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                router.push(`/renewal/${renewal.id}`);
              }}
            >
              <IconSymbol name="eye" size={14} color={AIRBNB.carbon} />
              <Text style={styles.actionText}>Ver detalles</Text>
            </TouchableOpacity>

            {onEdit && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(renewal);
                }}
              >
                <IconSymbol name="pencil" size={14} color={AIRBNB.carbon} />
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={[styles.actionItem, styles.actionItemDanger]}
                onPress={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(renewal);
                }}
              >
                <IconSymbol name="trash" size={14} color={AIRBNB.coral} />
                <Text style={[styles.actionText, styles.actionTextDanger]}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
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
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  provider: {
    fontSize: 12,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cost: {
    fontSize: 14,
    fontWeight: '600',
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
  menuBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 2,
  },
  actionMenu: {
    marginTop: 12,
    marginHorizontal: -4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    flexDirection: 'row',
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  actionItemDanger: {
    backgroundColor: '#FFE5E5',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  actionTextDanger: {
    color: '#FF3B30',
  },
});
