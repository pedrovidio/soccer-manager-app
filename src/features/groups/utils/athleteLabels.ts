export function positionLabel(position: string) {
  const labels: Record<string, string> = {
    Goalkeeper: 'GOL',
    Defender: 'ZAG',
    Midfielder: 'MEI',
    Forward: 'ATA',
    Undefined: '-',
  };

  return labels[position] ?? position.slice(0, 3).toUpperCase();
}
