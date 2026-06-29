export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num || 0);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('en-IN').format(n || 0);
}

/**
 * Formats a production date string (YYYY-MM-DD) as the compact ERP format: DD-MM-YY.
 * Only changes the display format — stored dates are never mutated.
 * @example formatProductionDate('2026-06-01') → '01-06-26'
 */
export function formatProductionDate(date: string): string {
  // Parse as local date to avoid UTC shift on date-only strings
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year.slice(2)}`;
}

/**
 * Formats a production ISO datetime string as DD-MM-YY HH:mm (24-hour).
 * Used for 'Submitted At' / 'Approved At' columns.
 */
export function formatProductionDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mm}-${yy} ${hh}:${min}`;
}
