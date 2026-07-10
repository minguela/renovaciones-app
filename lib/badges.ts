import type { Renewal } from '@/types/renewal'
import { getDaysUntilRenewal } from '@/types/renewal'
import { calculateYearlyCost } from './calculations'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earnedAt: string
}

export function analyzeBadges(renewals: Renewal[]): Badge[] {
  const badges: Badge[] = []
  const now = new Date()
  const active = renewals.filter(r => (r.status || 'active') !== 'cancelled')

  // 🛡️ "Negociador nato" — has negotiated at least one renewal (has history of price drops)
  const hasRenegotiated = active.some(r => r.notes?.toLowerCase().includes('renegociado'))
  if (hasRenegotiated) {
    badges.push({
      id: 'negotiator',
      name: 'Negociador nato',
      description: 'Has renegociado al menos una renovación y conseguido mejor precio',
      icon: '🤝',
      color: '#34C759',
      earnedAt: now.toISOString(),
    })
  }

  // 💰 "Ahorrador premium" — yearly spend below catalog average for same type
  const yearlySpend = active.reduce((sum, r) => sum + calculateYearlyCost(r.cost, r.frequency), 0)
  if (yearlySpend < 3000 && active.length >= 5) {
    badges.push({
      id: 'saver',
      name: 'Ahorrador premium',
      description: 'Gastas menos de 3.000€/año con 5+ renovaciones activas',
      icon: '💰',
      color: '#FFD700',
      earnedAt: now.toISOString(),
    })
  }

  // 🔔 "Alerta temprana" — has notifications enabled on ALL renewals
  const allNotify = active.length > 0 && active.every(r => r.notificationEnabled)
  if (allNotify && active.length >= 3) {
    badges.push({
      id: 'early-bird',
      name: 'Alerta temprana',
      description: 'Todas tus renovaciones tienen notificaciones activadas',
      icon: '🔔',
      color: '#007AFF',
      earnedAt: now.toISOString(),
    })
  }

  // 🏆 "Veterano" — has renewals older than 1 year
  const oldest = active.reduce((min, r) => {
    const d = new Date(r.createdAt)
    return d < min ? d : min
  }, new Date())
  const ageMonths = (now.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24 * 30)
  if (ageMonths >= 12) {
    badges.push({
      id: 'veteran',
      name: 'Veterano',
      description: 'Llevas más de un año gestionando tus renovaciones',
      icon: '🏆',
      color: '#AF52DE',
      earnedAt: now.toISOString(),
    })
  }

  // 🎯 "Cazador de ofertas" — has at least 3 renewals approaching in next 30 days
  const approaching = active.filter(r => {
    const days = getDaysUntilRenewal(r.renewalDate)
    return days >= 0 && days <= 30
  })
  if (approaching.length >= 3) {
    badges.push({
      id: 'hunter',
      name: 'Cazador de ofertas',
      description: 'Tienes 3 o más renovaciones en los próximos 30 días',
      icon: '🎯',
      color: '#FF9500',
      earnedAt: now.toISOString(),
    })
  }

  // 🌟 "Diversificado" — has renewals across 4+ different types
  const types = new Set(active.map(r => r.type))
  if (types.size >= 4) {
    badges.push({
      id: 'diversified',
      name: 'Diversificado',
      description: 'Gestionas 4 o más tipos diferentes de renovaciones',
      icon: '🌟',
      color: '#5AC8FA',
      earnedAt: now.toISOString(),
    })
  }

  // 📉 "Bajada histórica" — has at least one renewal that decreased in price
  const hasPriceDrop = active.some(r => r.notes?.toLowerCase().includes('bajada'))
  if (hasPriceDrop) {
    badges.push({
      id: 'price-drop',
      name: 'Bajada histórica',
      description: 'Conseguiste bajar el precio de al menos una renovación',
      icon: '📉',
      color: '#34C759',
      earnedAt: now.toISOString(),
    })
  }

  // 👑 "Rey de las suscripciones" — 10+ active renewals
  if (active.length >= 10) {
    badges.push({
      id: 'king',
      name: 'Rey de las suscripciones',
      description: 'Gestionas 10 o más renovaciones activas',
      icon: '👑',
      color: '#FFD700',
      earnedAt: now.toISOString(),
    })
  }

  return badges
}

export function getBadgeColor(color: string): { bg: string; text: string } {
  const opacity = '20'
  return { bg: `${color}${opacity}`, text: color }
}
