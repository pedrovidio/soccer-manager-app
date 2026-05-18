export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

export function posLabel(pos: string) {
  const map: Record<string, string> = {
    Goalkeeper: 'GOL',
    Defender: 'ZAG',
    Midfielder: 'MEI',
    Forward: 'ATA',
    Undefined: '-',
  };
  return map[pos] ?? pos.slice(0, 3).toUpperCase();
}
