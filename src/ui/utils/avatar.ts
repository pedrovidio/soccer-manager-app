export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}
