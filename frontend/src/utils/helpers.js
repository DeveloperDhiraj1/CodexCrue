export function formatPercentage(value) {
  return `${Math.round(value * 100)}%`;
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}