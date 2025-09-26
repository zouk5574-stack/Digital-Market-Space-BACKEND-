export function toCents(amount) {
  // amount is numeric or string
  return Math.round(Number(amount) * 100);
}

export function centsToDisplay(cents) {
  return (Number(cents) / 100).toFixed(2);
}
