import { Platform, Share } from 'react-native';
import type { Renewal } from '@/types/renewal';
import { calculateYearlyCost } from '@/lib/calculations';

const CSV_HEADER = 'nombre,tipo,frecuencia,coste,moneda,fecha renovacion,proveedor,estado,metodo pago,etiquetas,auto-renovacion,gasto anual';

function escapeCSV(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  if (needsQuotes) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function translateFrequency(frequency: string): string {
  const map: Record<string, string> = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    biannual: 'Semestral',
    annual: 'Anual',
    'one-time': 'Unica vez',
  };
  return map[frequency] || frequency;
}

function translateStatus(status?: string): string {
  const map: Record<string, string> = {
    active: 'Activa',
    pending_cancellation: 'Pendiente cancelar',
    cancelled: 'Cancelada',
    renewed: 'Renovada',
  };
  return map[status || ''] || status || '';
}

function translateType(type: string): string {
  const map: Record<string, string> = {
    insurance: 'Seguro',
    subscription: 'Suscripcion',
    license: 'Licencia',
    other: 'Otro',
  };
  return map[type] || type;
}

function translatePaymentMethod(method?: string): string {
  const map: Record<string, string> = {
    card: 'Tarjeta',
    direct_debit: 'Domiciliación bancaria',
    paypal: 'PayPal',
    bizum: 'Bizum',
    other: 'Otro',
    // legacy values for backward compatibility
    visa: 'Visa',
    mastercard: 'Mastercard',
    revolut: 'Revolut',
    apple_pay: 'Apple Pay',
    bank_transfer: 'Transferencia',
    cash: 'Efectivo',
  };
  return map[method || ''] || method || '';
}

export function exportRenewalsToCSV(renewals: Renewal[]): string {
  const lines: string[] = [CSV_HEADER];

  for (const r of renewals) {
    const fields = [
      escapeCSV(r.name),
      escapeCSV(translateType(r.type)),
      escapeCSV(translateFrequency(r.frequency)),
      String(r.cost),
      escapeCSV(r.currency),
      escapeCSV(formatDate(r.renewalDate)),
      escapeCSV(r.provider || ''),
      escapeCSV(translateStatus(r.status)),
      escapeCSV(translatePaymentMethod(r.paymentMethod)),
      escapeCSV((r.tags || []).join('; ')),
      r.autoRenew ? 'Si' : 'No',
      String(calculateYearlyCost(r.cost, r.frequency).toFixed(2)),
    ];
    lines.push(fields.join(','));
  }

  return lines.join('\n');
}

export async function exportToCSVFile(csv: string, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  if (Platform.OS === 'ios') {
    try {
      await Share.share({
        message: csv,
        title: filename,
      });
    } catch (err) {
      console.error('Error sharing CSV on iOS:', err);
    }
  }
}
