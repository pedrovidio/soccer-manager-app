export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  athleteId: string;
  name: string;
}

export interface AuthState {
  token: string | null;
  athleteId: string | null;
  name: string | null;
  hasCompletedAssessment: boolean;
  isAuthenticated: boolean;
}
