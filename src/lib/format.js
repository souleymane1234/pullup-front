const numberFormat = new Intl.NumberFormat('fr-FR');

/** @param {number} value */
export function formatNumber(value) {
  return numberFormat.format(Math.round(Number(value) || 0));
}

/** @param {number} value Montant en francs CFA. */
export function formatFcfa(value) {
  return `${formatNumber(value)} FCFA`;
}

/** 1 250 000 → « 1,3 M », 18 400 → « 18 K ». @param {number} value */
export function formatCompact(value) {
  const n = Number(value) || 0;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',')} M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} K`;
  return String(Math.round(n));
}

/** @param {number} value */
export function formatPercent(value) {
  return `${String(Math.round(Number(value) * 10) / 10).replace('.', ',')} %`;
}

/** @param {number} value */
export function formatScore(value) {
  return Number(value).toFixed(1).replace('.', ',');
}

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** @param {string|number|Date} value */
export function formatDate(value) {
  const date = toDate(value);
  return date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
}

/** « 4 oct. » @param {string|number|Date} value */
export function formatDay(value) {
  const date = toDate(value);
  return date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
}

/** @param {string|number|Date} value */
export function formatDateTime(value) {
  const date = toDate(value);
  return date
    ? date.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';
}
