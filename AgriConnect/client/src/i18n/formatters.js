const localeByLanguage = {
  en: 'en-IN',
  kn: 'kn-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN'
};

export function formatNumber(value, language, options = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return new Intl.NumberFormat(localeByLanguage[language] || localeByLanguage.en, options).format(number);
}

export function formatDate(value, language, options = {}) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat(localeByLanguage[language] || localeByLanguage.en, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  }).format(date);
}

export function formatCurrency(value, language, options = {}) {
  return formatNumber(value, language, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    ...options
  });
}
