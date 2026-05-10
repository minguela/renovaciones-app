export type RenewalType = 'insurance' | 'subscription' | 'license' | 'other';
export type RenewalFrequency = 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'one-time';

export interface Renewal {
  id: string;
  name: string;
  type: RenewalType;
  frequency: RenewalFrequency;
  cost: number;
  currency: string;
  renewalDate: string; // ISO date string
  provider?: string;
  notes?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  notificationEnabled: boolean;
  notificationDaysBefore: number; // days before renewal to notify
}

export interface RenewalFormData {
  name: string;
  type: RenewalType;
  frequency: RenewalFrequency;
  cost: string;
  currency: string;
  renewalDate: Date;
  provider?: string;
  notes?: string;
  color?: string;
  icon?: string;
  notificationEnabled: boolean;
  notificationDaysBefore: number;
}

export const RENEWAL_TYPES: { value: RenewalType; label: string; icon: string }[] = [
  { value: 'insurance', label: 'Seguro', icon: 'shield.fill' },
  { value: 'subscription', label: 'Suscripción', icon: 'creditcard.fill' },
  { value: 'license', label: 'Licencia', icon: 'key.fill' },
  { value: 'other', label: 'Otro', icon: 'tag.fill' },
];

export const RENEWAL_FREQUENCIES: { value: RenewalFrequency; label: string }[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'biannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
  { value: 'one-time', label: 'Única vez' },
];

export const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];

export const COLORS = [
  '#007AFF', // Blue
  '#34C759', // Green
  '#FF9500', // Orange
  '#FF3B30', // Red
  '#5856D6', // Purple
  '#AF52DE', // Pink
  '#5AC8FA', // Cyan
  '#FFCC00', // Yellow
];

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getDaysUntilRenewal(renewalDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = new Date(renewalDate);
  renewal.setHours(0, 0, 0, 0);
  const diffTime = renewal.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getRenewalStatus(daysUntil: number): 'overdue' | 'soon' | 'upcoming' | 'far' {
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 7) return 'soon';
  if (daysUntil <= 30) return 'upcoming';
  return 'far';
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  };
  const symbol = symbols[currency] || currency;
  return `${amount.toFixed(2)} ${symbol}`;
}
