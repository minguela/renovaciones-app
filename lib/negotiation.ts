import type { Renewal, RenewalType } from '@/types/renewal'
import { getDaysUntilRenewal, RENEWAL_TYPES } from '@/types/renewal'
import { calculateMonthlyCost } from './calculations'

export interface NegotiationAlert {
  renewal: Renewal
  daysLeft: number
  urgency: 'critical' | 'warning' | 'info'
  message: string
  suggestedActions: string[]
  competitorNote: string
}

export interface NegotiationScript {
  greeting: string
  reason: string
  ask: string
  leverage: string
  close: string
}

export function generateNegotiationAlerts(renewals: Renewal[]): NegotiationAlert[] {
  const alerts: NegotiationAlert[] = []
  const active = renewals.filter(r => (r.status || 'active') !== 'cancelled')

  for (const renewal of active) {
    const daysLeft = getDaysUntilRenewal(renewal.renewalDate)
    if (daysLeft < 0) {
      // Overdue — critical
      alerts.push({
        renewal,
        daysLeft: Math.abs(daysLeft),
        urgency: 'critical',
        message: `¡${renewal.name} venció hace ${Math.abs(daysLeft)} días!`,
        suggestedActions: [
          'Renueva YA para evitar corte de servicio',
          'Compara precios con la competencia antes de renovar',
          'Llama y pide descuento por fidelidad',
        ],
        competitorNote: getCompetitorNote(renewal.type),
      })
    } else if (daysLeft <= 7) {
      alerts.push({
        renewal,
        daysLeft,
        urgency: 'critical',
        message: `¡${renewal.name} vence en ${daysLeft} días!`,
        suggestedActions: [
          'Contacta al proveedor HOY',
          'Pide oferta de retención (amenaza con cancelar)',
          'Compara al menos 2 alternativas antes de decidir',
        ],
        competitorNote: getCompetitorNote(renewal.type),
      })
    } else if (daysLeft <= 30) {
      alerts.push({
        renewal,
        daysLeft,
        urgency: 'warning',
        message: `${renewal.name} vence en ${daysLeft} días — ventana de negociación abierta`,
        suggestedActions: [
          'Investiga precios de la competencia',
          'Prepara argumentos para negociar',
          'Marca en calendario: llamar 15 días antes',
        ],
        competitorNote: getCompetitorNote(renewal.type),
      })
    } else if (daysLeft <= 60) {
      alerts.push({
        renewal,
        daysLeft,
        urgency: 'info',
        message: `${renewal.name}: empieza a preparar la renovación`,
        suggestedActions: [
          'Revisa si el servicio sigue siendo necesario',
          'Anota cuánto estás pagando ahora',
          'Busca ofertas equivalentes',
        ],
        competitorNote: getCompetitorNote(renewal.type),
      })
    }
  }

  return alerts.sort((a, b) => a.daysLeft - b.daysLeft)
}

function getCompetitorNote(type: RenewalType): string {
  const notes: Record<string, string> = {
    insurance: 'Los nuevos clientes suelen pagar hasta un 40% menos. Usa un comparador (Rastreator, Acierto) antes de llamar.',
    subscription: 'Muchas suscripciones ofrecen descuentos al intentar cancelar. Netflix y Spotify son conocidos por esto.',
    license: 'Las licencias anuales suelen ser un 20% más baratas que las mensuales. Considera cambiar a plan anual.',
    other: 'Siempre pregunta: "¿Hay alguna promoción activa que pueda aplicarme?"',
  }
  return notes[type] || notes.other
}

export function generateNegotiationScript(renewal: Renewal): NegotiationScript {
  const monthly = calculateMonthlyCost(renewal.cost, renewal.frequency)
  const typeLabel = RENEWAL_TYPES.find(t => t.value === renewal.type)?.label || 'servicio'

  return {
    greeting: `Buenos días, llamo porque mi ${typeLabel} "${renewal.name}" con ustedes vence próximamente.`,

    reason: `Actualmente pago ${monthly.toFixed(2)}€/mes y he estado viendo alternativas en el mercado. Me gustaría saber si pueden ofrecerme algo mejor antes de tomar una decisión.`,

    ask: `¿Tienen alguna promoción de retención o descuento por fidelidad? Estoy considerando cambiarme a ${getFakeCompetitor(renewal.type)} que me ofrece un precio más competitivo.`,

    leverage: `Si pueden igualar o mejorar esa oferta, prefiero quedarme con ustedes por comodidad. Si no, entenderé que no pueden competir y procederé con el cambio.`,

    close: `Perfecto, ¿me lo pueden enviar por escrito? Así lo reviso y confirmo en 24-48 horas. Muchas gracias.`,
  }
}

function getFakeCompetitor(type: RenewalType): string {
  const competitors: Record<string, string[]> = {
    insurance: ['Mapfre', 'AXA', 'Mutua Madrileña', 'Línea Directa'],
    subscription: ['una alternativa más económica', 'un plan familiar compartido'],
    license: ['una licencia de por vida', 'un competidor con mejores condiciones'],
    other: ['un proveedor alternativo', 'otra compañía del sector'],
  }
  const options = competitors[type] || competitors.other
  return options[Math.floor(Math.random() * options.length)]
}

export function getWidgetUpcomingPayments(renewals: Renewal[], limit = 5) {
  const active = renewals.filter(r => (r.status || 'active') !== 'cancelled')
  const upcoming = active
    .filter(r => {
      const days = getDaysUntilRenewal(r.renewalDate)
      return days >= 0 && days <= 30
    })
    .sort((a, b) => {
      return getDaysUntilRenewal(a.renewalDate) - getDaysUntilRenewal(b.renewalDate)
    })
    .slice(0, limit)

  const totalMonth = active.reduce((sum, r) => sum + calculateMonthlyCost(r.cost, r.frequency), 0)
  const totalThisMonth = upcoming.reduce((sum, r) => sum + r.cost, 0)

  return {
    upcoming,
    totalMonth: Math.round(totalMonth * 100) / 100,
    totalThisMonth: Math.round(totalThisMonth * 100) / 100,
    activeCount: active.length,
    overdueCount: active.filter(r => getDaysUntilRenewal(r.renewalDate) < 0).length,
  }
}
