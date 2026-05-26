export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  athleteId: string;
  name: string;
  plan: AthletePlan;
  planExpiresAt: string | null;
}

export type AthletePlan = 'FREE' | 'PREMIUM';

export interface RequestPasswordResetPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  tokenOrCode: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  success: true;
}

export interface AuthState {
  token: string | null;
  athleteId: string | null;
  name: string | null;
  plan: AthletePlan;
  planExpiresAt: string | null;
  hasCompletedAssessment: boolean;
  isAuthenticated: boolean;
}
