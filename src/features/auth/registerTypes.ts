export type FootballLevel = 'PROFESSIONAL' | 'AMATEUR' | 'CASUAL';
export type Gender = 'M' | 'F';
export type YearsPlaying = 'LESS_THAN_2' | '2_TO_5' | '6_TO_10' | 'MORE_THAN_10';
export type WeeklyFrequency = 'RARELY' | '1_TO_2' | '3_OR_MORE';

export interface RegisterPayload {
  name: string;
  email: string;
  birthDate: string;
  gender: Gender;
  password?: string;
}

export interface AssessmentPayload {
  playedProfessionally: boolean;
  highestLevel: FootballLevel;
  yearsPlaying: YearsPlaying;
  weeklyFrequency: WeeklyFrequency;
  selfRatedPace: number;
  selfRatedShooting: number;
  selfRatedPassing: number;
  selfRatedDribbling: number;
  selfRatedDefense: number;
  selfRatedPhysical: number;
  preferredPosition: string;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface RegisterFormData {
  // Step 1 — dados pessoais
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: Gender | '';
  // Step 2 — questionário
  preferredPosition: string;
  highestLevel: FootballLevel | '';
  yearsPlaying: YearsPlaying | '';
  weeklyFrequency: WeeklyFrequency | '';
  playedProfessionally: boolean;
  // Step 3 — atributos
  selfRatedPace: number;
  selfRatedShooting: number;
  selfRatedPassing: number;
  selfRatedDribbling: number;
  selfRatedDefense: number;
  selfRatedPhysical: number;
  // Step 4 — disponibilidade
  wantsAvailability: boolean;
  availabilitySlots: AvailabilitySlot[];
}
