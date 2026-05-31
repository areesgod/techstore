// Format a number as Kazakhstani Tenge
// e.g. 24990 → "₸24 990"
export function formatPrice(amount) {
  return `₸${Math.round(amount).toLocaleString('ru-RU')}`
}
