import { GroupFinanceStatus, GroupFinanceType } from '../groupTypes';

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(value?: string | null) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function statusLabel(status: GroupFinanceStatus) {
  const labels: Record<GroupFinanceStatus, string> = {
    PENDING: 'Pendente',
    PAID: 'Pago',
    CANCELLED: 'Cancelado',
  };
  return labels[status];
}

export function typeLabel(type: GroupFinanceType) {
  const labels: Record<GroupFinanceType, string> = {
    MONTHLY: 'Mensalidade',
    SPOT: 'Avulso',
    INITIAL_BALANCE: 'Saldo inicial',
    COURT_RENTAL: 'Aluguel da quadra',
    PURCHASE: 'Compra',
  };
  return labels[type];
}

export function isExpenseType(type: GroupFinanceType) {
  return type === 'COURT_RENTAL' || type === 'PURCHASE';
}

export function parseMoneyInput(value: string) {
  return Number(value.replace(/\./g, '').replace(',', '.'));
}
