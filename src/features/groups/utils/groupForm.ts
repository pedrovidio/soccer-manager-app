import { maskCurrency, parseCurrency } from '../../common/masks';
import { CreateGroupFormData, CreateGroupPayload, GroupResponse, UpdateGroupPayload } from '../groupTypes';

export const INITIAL_GROUP_FORM: CreateGroupFormData = {
  name: '',
  description: '',
  pixKey: '',
  courtMonthlyFee: '',
  monthlyFee: '',
  monthlyFeeDueDay: '10',
  spotFee: '',
  teamNames: ['Time 1', 'Time 2'],
};

export function parseApiError(error: any, fallback = 'Nao foi possivel completar a operacao.'): string {
  const data = error?.response?.data;
  if (data?.errors?.length) return data.errors.map((item: any) => item.message).join('\n');
  if (data?.error) return data.error;
  if (error?.message) return error.message;
  return fallback;
}

export function validateGroupForm(form: CreateGroupFormData): string | null {
  if (!form.name.trim()) return 'Informe o nome do grupo.';
  if (form.name.trim().length < 3) return 'O nome deve ter ao menos 3 caracteres.';
  if (form.courtMonthlyFee && parseCurrency(form.courtMonthlyFee) === undefined) {
    return 'Aluguel mensal da quadra deve ser um valor numerico.';
  }
  if (form.monthlyFee && parseCurrency(form.monthlyFee) === undefined) {
    return 'Mensalidade deve ser um valor numerico.';
  }

  const monthlyFeeDueDay = Number(form.monthlyFeeDueDay);
  if (!Number.isInteger(monthlyFeeDueDay) || monthlyFeeDueDay < 1 || monthlyFeeDueDay > 28) {
    return 'O vencimento da mensalidade deve ser um dia entre 1 e 28.';
  }

  if (form.spotFee && parseCurrency(form.spotFee) === undefined) {
    return 'Valor do avulso deve ser um valor numerico.';
  }

  const teamNames = cleanTeamNames(form);
  if (teamNames.length < 2) return 'Informe pelo menos dois nomes de times.';
  return null;
}

export function buildCreateGroupPayload(form: CreateGroupFormData, adminId: string): CreateGroupPayload {
  return {
    adminId,
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    pixKey: form.pixKey.trim() || undefined,
    courtMonthlyFee: parseCurrency(form.courtMonthlyFee),
    monthlyFee: parseCurrency(form.monthlyFee),
    monthlyFeeDueDay: Number(form.monthlyFeeDueDay),
    spotFee: parseCurrency(form.spotFee),
    teamNames: cleanTeamNames(form),
  };
}

export function buildUpdateGroupPayload(form: CreateGroupFormData, requesterId: string): UpdateGroupPayload {
  return {
    requesterId,
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    pixKey: form.pixKey.trim() || undefined,
    courtMonthlyFee: parseCurrency(form.courtMonthlyFee) ?? 0,
    monthlyFee: parseCurrency(form.monthlyFee) ?? 0,
    monthlyFeeDueDay: Number(form.monthlyFeeDueDay),
    spotFee: parseCurrency(form.spotFee) ?? 0,
    teamNames: cleanTeamNames(form),
  };
}

export function groupToForm(group: GroupResponse): CreateGroupFormData {
  return {
    name: group.name,
    description: group.description ?? '',
    pixKey: group.pixKey ?? '',
    courtMonthlyFee: formatMoneyField(group.courtMonthlyFee),
    monthlyFee: formatMoneyField(group.monthlyFee),
    monthlyFeeDueDay: String(group.monthlyFeeDueDay ?? 10),
    spotFee: formatMoneyField(group.spotFee),
    teamNames: [...(group.teamNames ?? ['Time 1', 'Time 2']), 'Time 2'].slice(0, 2),
  };
}

function cleanTeamNames(form: CreateGroupFormData) {
  return form.teamNames.map((name) => name.trim()).filter(Boolean);
}

function formatMoneyField(value: number) {
  return value > 0 ? maskCurrency(value.toFixed(2).replace('.', '')) : '';
}
