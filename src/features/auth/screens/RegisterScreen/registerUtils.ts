import { RegisterFormData } from '@features/auth/registerTypes';

export function validatePersonalStep(form: RegisterFormData) {
  if (!form.name.trim()) return 'Informe seu nome.';
  if (!form.email.includes('@')) return 'E-mail inválido.';
  if (form.password.length < 6) return 'Senha deve ter ao menos 6 caracteres.';
  if (form.password !== form.confirmPassword) return 'As senhas não coincidem.';
  if (!form.birthDate.trim()) return 'Informe sua data de nascimento.';

  const parts = form.birthDate.split('/');
  if (parts.length !== 3) return 'Formato de data inválido. Use DD/MM/AAAA.';
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const birthDate = new Date(year, month, day);
  if (isNaN(birthDate.getTime()) || birthDate.getFullYear() !== year || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
    return 'Data de nascimento inválida.';
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 16 || age > 99) return 'Idade deve ser entre 16 e 99 anos.';
  if (!form.gender) return 'Selecione seu gênero.';
  return null;
}

export function validateProfileStep(form: RegisterFormData) {
  if (!form.preferredPosition) return 'Selecione sua posição.';
  if (!form.highestLevel) return 'Selecione seu nível.';
  if (!form.yearsPlaying) return 'Selecione há quantos anos joga.';
  if (!form.weeklyFrequency) return 'Selecione sua frequência semanal.';
  return null;
}

export function parseApiError(e: unknown): string {
  const err = e as { response?: { data?: { error?: string; errors?: Array<{ message: string }> } }; message?: string } | null;
  const data = err?.response?.data;
  if (data?.errors?.length) return data.errors.map((x) => x.message).join('\n');
  if (data?.error) return data.error;
  if (err?.message) return err.message;
  return 'Não foi possível completar a operação.';
}

export function addOneHour(time: string) {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  const nextHour = (hour + 1) % 24;
  return `${String(nextHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
