export function formatMarketplaceDate(value?: string) {
  if (!value) return 'Data a confirmar';

  const date = new Date(value);
  const day = date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  const time = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${day} as ${time}`;
}

export function formatMarketplaceCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
