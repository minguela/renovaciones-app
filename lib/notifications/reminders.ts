const DAY_MS = 86_400_000;

function calendarDate(value: string | Date): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

function dateParts(value: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid renewal date: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function daysBetween(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = dateParts(from);
  const [toYear, toMonth, toDay] = dateParts(to);
  return Math.round((Date.UTC(toYear, toMonth - 1, toDay) - Date.UTC(fromYear, fromMonth - 1, fromDay)) / DAY_MS);
}

function addMonthsAnchored(original: string, months: number): string {
  const [year, month, day] = dateParts(original);
  const first = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(day, lastDay));
  return first.toISOString().slice(0, 10);
}

export function nextOccurrence(originalValue: string | Date, frequency: string, todayValue: string | Date): string | null {
  const original = calendarDate(originalValue);
  const today = calendarDate(todayValue);
  if (original >= today) return original;

  const interval = ({ monthly: 1, quarterly: 3, biannual: 6, annual: 12 } as Record<string, number>)[frequency];
  if (!interval) return null;

  const [startYear, startMonth] = dateParts(original);
  const [todayYear, todayMonth] = dateParts(today);
  let cycles = Math.max(0, Math.floor(((todayYear - startYear) * 12 + todayMonth - startMonth) / interval));
  let candidate = addMonthsAnchored(original, cycles * interval);
  while (candidate < today) {
    cycles++;
    candidate = addMonthsAnchored(original, cycles * interval);
  }
  return candidate;
}

export function shouldRemind(daysUntil: number, chosenLead: number): boolean {
  if (daysUntil < 0 || daysUntil > chosenLead) return false;
  return daysUntil === chosenLead || [7, 3, 1, 0].includes(daysUntil);
}
