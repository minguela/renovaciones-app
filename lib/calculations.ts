import type { Renewal, RenewalFrequency } from '@/types/renewal';

export function calculateYearlyCost(cost: number, frequency: RenewalFrequency): number {
  switch (frequency) {
    case 'monthly': return cost * 12;
    case 'quarterly': return cost * 4;
    case 'biannual': return cost * 2;
    case 'annual': return cost;
    case 'one-time': return cost;
    default: return cost;
  }
}

export function calculateMonthlyCost(cost: number, frequency: RenewalFrequency): number {
  switch (frequency) {
    case 'monthly': return cost;
    case 'quarterly': return cost / 3;
    case 'biannual': return cost / 6;
    case 'annual': return cost / 12;
    case 'one-time': return cost / 12;
    default: return cost;
  }
}

export function groupByMonth(renewals: Renewal[]): Record<string, Renewal[]> {
  const grouped: Record<string, Renewal[]> = {};

  const sorted = [...renewals].sort((a, b) =>
    new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
  );

  for (const renewal of sorted) {
    const date = new Date(renewal.renewalDate);
    const monthYear = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(renewal);
  }

  return grouped;
}
