export function formatCurrency(amount, currency = 'INR', locale = 'en-IN') {
  try {
    if (typeof amount !== 'number') amount = Number(amount) || 0;
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    // Fallback formatting
    const symbol = currency === 'INR' ? '₹' : '';
    return `${symbol}${(amount || 0).toFixed(2)}`;
  }
}

