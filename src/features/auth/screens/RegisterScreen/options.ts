import { FootballLevel, Gender, RegisterFormData, WeeklyFrequency, YearsPlaying } from '../../registerTypes';

export const TOTAL_STEPS = 4;

export const INITIAL_REGISTER_FORM: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  cpf: '',
  phone: '',
  age: '',
  gender: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  preferredPosition: '',
  highestLevel: '',
  yearsPlaying: '',
  weeklyFrequency: '',
  playedProfessionally: false,
  selfRatedPace: 50,
  selfRatedShooting: 50,
  selfRatedPassing: 50,
  selfRatedDribbling: 50,
  selfRatedDefense: 50,
  selfRatedPhysical: 50,
  wantsAvailability: false,
  availabilitySlots: [],
};

export const POSITIONS: { value: string; label: string }[] = [
  { value: 'Goalkeeper', label: 'Goleiro' },
  { value: 'Defender', label: 'Zagueiro' },
  { value: 'Midfielder', label: 'Meia' },
  { value: 'Forward', label: 'Atacante' },
];

export const LEVELS: { value: FootballLevel; label: string; desc: string; icon: string }[] = [
  { value: 'PROFESSIONAL', label: 'Profissional', desc: 'Jogou em clube ou competição oficial', icon: '🏆' },
  { value: 'AMATEUR', label: 'Amador', desc: 'Joga em várzea ou campeonatos locais', icon: '⚽' },
  { value: 'CASUAL', label: 'Casual', desc: 'Joga por lazer e diversão', icon: '🎮' },
];

export const YEARS: { value: YearsPlaying; label: string }[] = [
  { value: 'LESS_THAN_2', label: '< 2 anos' },
  { value: '2_TO_5', label: '2 a 5 anos' },
  { value: '6_TO_10', label: '6 a 10 anos' },
  { value: 'MORE_THAN_10', label: '+ de 10 anos' },
];

export const FREQUENCIES: { value: WeeklyFrequency; label: string }[] = [
  { value: 'RARELY', label: 'Raramente' },
  { value: '1_TO_2', label: '1 a 2x/semana' },
  { value: '3_OR_MORE', label: '3x ou mais' },
];

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
];

export const ATTRIBUTES: {
  key: keyof Pick<
    RegisterFormData,
    | 'selfRatedPace'
    | 'selfRatedShooting'
    | 'selfRatedPassing'
    | 'selfRatedDribbling'
    | 'selfRatedDefense'
    | 'selfRatedPhysical'
  >;
  label: string;
}[] = [
  { key: 'selfRatedPace', label: 'Velocidade' },
  { key: 'selfRatedShooting', label: 'Finalização' },
  { key: 'selfRatedPassing', label: 'Passe' },
  { key: 'selfRatedDribbling', label: 'Drible' },
  { key: 'selfRatedDefense', label: 'Defesa' },
  { key: 'selfRatedPhysical', label: 'Físico' },
];

export const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
