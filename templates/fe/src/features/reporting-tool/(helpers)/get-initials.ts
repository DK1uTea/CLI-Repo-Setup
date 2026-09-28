export function getInitials(name: string) {
  return name
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}
