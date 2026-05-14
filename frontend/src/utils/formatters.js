export function formatINR(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value, options = {}) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', ...options }).format(new Date(value));
}

export function dateToISO(date) {
  return date.toISOString().slice(0, 10);
}

export function cabinLabel(cabin) {
  return {
    economy: 'Economy',
    premium_economy: 'Premium Economy',
    business: 'Business',
    first: 'First Class'
  }[cabin] || 'Economy';
}
