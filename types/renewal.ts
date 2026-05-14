export type RenewalType = string;
export type RenewalFrequency = 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'one-time';
export type RenewalStatus = 'active' | 'pending_cancellation' | 'cancelled' | 'renewed';
export type PaymentMethod = 'visa' | 'mastercard' | 'paypal' | 'revolut' | 'apple_pay' | 'direct_debit' | 'bizum' | 'other';
export type NotificationMethod = 'email' | 'sms' | 'whatsapp' | 'telegram' | 'push';

export interface RenewalHistory {
  id: string;
  renewalId: string;
  oldCost: number;
  newCost: number;
  oldFrequency: RenewalFrequency;
  newFrequency: RenewalFrequency;
  changedAt: string;
}

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
  status?: RenewalStatus;
  paymentMethod?: PaymentMethod;
  bankAccount?: string;
  tags?: string[];
  autoRenew?: boolean;
  contractEndDate?: string;
  yearlyCost?: number;
  notificationMethods?: NotificationMethod[];
}

export interface RenewalFormData {
  name: string;
  type: RenewalType;
  frequency: RenewalFrequency;
  cost: string;
  currency: string;
  renewalDate: Date | undefined;
  provider?: string;
  notes?: string;
  color?: string;
  icon?: string;
  notificationEnabled: boolean;
  notificationDaysBefore: number;
  status?: RenewalStatus;
  paymentMethod?: PaymentMethod;
  bankAccount?: string;
  tags?: string[];
  autoRenew?: boolean;
  contractEndDate?: Date;
  attachments?: string[];
  notificationMethods?: NotificationMethod[];
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

export const STATUS_OPTIONS: { value: RenewalStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Activa', color: '#34C759' },
  { value: 'pending_cancellation', label: 'Pendiente cancelar', color: '#FF9500' },
  { value: 'cancelled', label: 'Cancelada', color: '#FF3B30' },
  { value: 'renewed', label: 'Renovada', color: '#5856D6' },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'visa', label: 'Visa', icon: 'creditcard.fill' },
  { value: 'mastercard', label: 'Mastercard', icon: 'creditcard.fill' },
  { value: 'paypal', label: 'PayPal', icon: 'doc.text.fill' },
  { value: 'revolut', label: 'Revolut', icon: 'creditcard.fill' },
  { value: 'apple_pay', label: 'Apple Pay', icon: 'apple.logo' },
  { value: 'direct_debit', label: 'Domiciliación bancaria', icon: 'building.columns.fill' },
];
export const NOTIFICATION_METHODS: { value: NotificationMethod; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'push', label: 'Push' },
];

export const TAG_OPTIONS: { value: string; label: string }[] = [
  { value: 'Trabajo', label: 'Trabajo' },
  { value: 'Casa', label: 'Casa' },
  { value: 'Personal', label: 'Personal' },
  { value: 'IA', label: 'IA' },
  { value: 'Streaming', label: 'Streaming' },
  { value: 'Seguros', label: 'Seguros' },
  { value: 'Deporte', label: 'Deporte' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Mascotas', label: 'Mascotas' },
  { value: 'Otros', label: 'Otros' },
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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
