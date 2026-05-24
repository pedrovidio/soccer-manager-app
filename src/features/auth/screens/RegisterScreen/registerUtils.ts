import { RegisterFormData } from '../../registerTypes';

export function validatePersonalStep(form: RegisterFormData) {
  if (!form.name.trim()) return 'Informe seu nome.';
  if (!form.email.includes('@')) return 'E-mail inválido.';
  if (form.cpf.replace(/\D/g, '').length !== 11) return 'CPF deve ter 11 dígitos.';
  if (form.password.length < 6) return 'Senha deve ter ao menos 6 caracteres.';
  if (form.password !== form.confirmPassword) return 'As senhas não coincidem.';
  if (!form.phone.trim()) return 'Informe seu telefone.';
  if (!form.age || Number.isNaN(Number(form.age))) return 'Informe sua idade.';
  if (!form.gender) return 'Selecione seu gênero.';
  if (!form.cep.trim()) return 'Informe o CEP.';
  if (!form.street.trim()) return 'Informe a rua.';
  if (!form.number || Number.isNaN(Number(form.number))) return 'Informe o número.';
  if (!form.neighborhood.trim()) return 'Informe o bairro.';
  if (!form.city.trim()) return 'Informe a cidade.';
  if (!form.state.trim()) return 'Informe o estado (UF).';
  return null;
}

export function validateProfileStep(form: RegisterFormData) {
  if (!form.preferredPosition) return 'Selecione sua posição.';
  if (!form.highestLevel) return 'Selecione seu nível.';
  if (!form.yearsPlaying) return 'Selecione há quantos anos joga.';
  if (!form.weeklyFrequency) return 'Selecione sua frequência semanal.';
  return null;
}

export function parseApiError(e: any): string {
  const data = e?.response?.data;
  if (data?.errors?.length) return data.errors.map((x: any) => x.message).join('\n');
  if (data?.error) return data.error;
  if (e?.message) return e.message;
  return 'Não foi possível completar a operação.';
}

export function addOneHour(time: string) {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  const nextHour = (hour + 1) % 24;
  return `${String(nextHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
