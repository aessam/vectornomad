export type Lang = 'en' | 'ar';

export function fmtDate(d: Date, lang: Lang = 'en'): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

// Accepts "2882", "48:02" or "1:02:15". Returns "48 min".
export function fmtDuration(raw?: string): string | undefined {
  if (!raw) return undefined;
  const parts = raw.split(':').map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  const seconds = parts.length === 1 ? parts[0] : parts.reduce((acc, p) => acc * 60 + p, 0);
  const min = Math.round(seconds / 60);
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
}

// Feed items carry no language. Detect Arabic script so cards can set lang and dir per item.
export function langOf(text: string): Lang {
  return /[؀-ۿ]/.test(text) ? 'ar' : 'en';
}
