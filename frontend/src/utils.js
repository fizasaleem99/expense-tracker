const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD';

const full = new Intl.NumberFormat('en', { style: 'currency', currency: CURRENCY });
const compactFmt = new Intl.NumberFormat('en', { style: 'currency', currency: CURRENCY, notation: 'compact', maximumFractionDigits: 1 });

export const money = (n = 0) => full.format(n);
export const compact = (n = 0) => compactFmt.format(n);
export const currencySymbol = full.formatToParts(0).find((p) => p.type === 'currency')?.value || '$';

// Dates are stored at UTC midnight, so always format in UTC to avoid off-by-one days.
const utcDate = (iso) => new Date(iso);
export const dateLabel = (iso) =>
  utcDate(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const monthDate = (ym) => new Date(`${ym}-01T00:00:00Z`);
export const monthLong = (ym) => monthDate(ym).toLocaleDateString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });
export const monthShort = (ym) => monthDate(ym).toLocaleDateString('en', { month: 'short', timeZone: 'UTC' });
export const monthShortYear = (ym) => monthDate(ym).toLocaleDateString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' });

export const currentMonth = () => new Date().toISOString().slice(0, 7);
export const todayISO = () => new Date().toISOString().slice(0, 10);

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
