const POSITION_LABELS: Record<string, string> = {
  goalkeeper: 'Goleiro',
  defender: 'Zagueiro',
  midfielder: 'Meia',
  forward: 'Atacante',
  undefined: '—',
};

export function formatPositionLabel(position?: string | null): string {
  if (!position) return '—';

  const normalized = position.trim().replace(/[_\s-]/g, '').toLowerCase();
  return POSITION_LABELS[normalized] ?? position;
}
