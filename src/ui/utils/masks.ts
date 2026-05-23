/** Aplica máscara de CPF: 000.000.000-00 */
export function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000 */
export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Aplica máscara de CEP: 00000-000 */
export function maskCep(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** Remove todos os caracteres não numéricos */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Aplica máscara de moeda: R$ 0.000,00 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const numValue = (parseInt(digits, 10) / 100).toFixed(2);
  const formatted = numValue.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${formatted}`;
}

/** Converte moeda mascarada em numero decimal para API. Ex: "R$ 1.234,56" -> 1234.56 */
export function parseCurrency(value: string): number | undefined {
  const digits = value.replace(/\D/g, '');
  if (!digits) return undefined;
  return Number(digits) / 100;
}
