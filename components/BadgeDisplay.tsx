import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { ThemedText } from './themed-text'
import { ThemedView } from './themed-view'
import { analyzeBadges, getBadgeColor, type Badge } from '@/lib/badges'
import type { Renewal } from '@/types/renewal'

interface Props {
  renewals: Renewal[]
}

export function BadgeDisplay({ renewals }: Props) {
  const badges = React.useMemo(() => analyzeBadges(renewals), [renewals])

  if (badges.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyIcon}>🏅</ThemedText>
        <ThemedText style={styles.emptyTitle}>Aún no tienes insignias</ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Sigue gestionando tus renovaciones para desbloquear logros
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {badges.map(badge => {
        const colors = getBadgeColor(badge.color)
        return (
          <ThemedView key={badge.id} style={[styles.badge, { borderColor: badge.color }]}>
            <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
            <ThemedText style={[styles.badgeName, { color: badge.color }]}>{badge.name}</ThemedText>
            <ThemedText style={styles.badgeDesc} numberOfLines={2}>{badge.description}</ThemedText>
          </ThemedView>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: 16 },
  badge: {
    width: 160,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  badgeIcon: { fontSize: 32, marginBottom: 6 },
  badgeName: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  badgeDesc: { fontSize: 11, color: '#8E8E93', textAlign: 'center', lineHeight: 15 },
  emptyContainer: { padding: 24, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: '#8E8E93', textAlign: 'center' },
})
