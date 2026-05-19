import { AthleteFinancePayment, AthleteFinanceType } from '../athleteTypes';

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(value?: string | null) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function typeLabel(type: AthleteFinanceType) {
  return type === 'SPOT' ? 'Jogo avulso' : 'Mensalidade';
}

export function statusLabel(payment: AthleteFinancePayment) {
  if (payment.isOverdue) return 'Vencido';
  if (payment.status === 'PAID') return 'Pago';
  if (payment.status === 'CANCELLED') return 'Cancelado';
  return payment.paymentReportedAt ? 'Informado' : 'Pendente';
}
