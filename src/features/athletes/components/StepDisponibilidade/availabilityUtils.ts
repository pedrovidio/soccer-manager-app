export const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function pad2(n: string | number) {
  return String(n).padStart(2, '0');
}

export function addOneHour(time: string) {
  const [h, m] = time.split(':').map(Number);
  const nh = ((h ?? 0) + 1) % 24;
  return `${pad2(nh)}:${pad2(m ?? 0)}`;
}
