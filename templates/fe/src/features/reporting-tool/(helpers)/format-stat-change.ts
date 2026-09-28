export function formatStatChange(change: number) {
  return `${change >= 0 ? '+' : ''}${change}%`
}
