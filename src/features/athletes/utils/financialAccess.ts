import type { AthleteDashboard } from '../athleteTypes';

export function hasFinancialBlock(dashboard?: AthleteDashboard | null) {
  return dashboard?.paymentStatus === 'PENDING' || (dashboard?.financialDebt ?? 0) > 0;
}

export function financialBlockMessage(dashboard?: AthleteDashboard | null) {
  const debt = dashboard?.financialDebt ?? 0;
  if (debt > 0) {
    return `Regularize R$ ${debt.toFixed(2).replace('.', ',')} em aberto para voltar a confirmar presenca e aceitar vagas avulsas.`;
  }
  return 'Regularize seus pagamentos em aberto para voltar a confirmar presenca e aceitar vagas avulsas.';
}
