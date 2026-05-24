import { httpClient } from '@lib/httpClient';
import { RegisterPayload, AssessmentPayload, AvailabilitySlot } from '../registerTypes';
import { authApi } from './authApi';

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  hasCompletedAssessment: boolean;
}

export const registerApi = {
  signUp: authApi.signUp,

  register: (payload: RegisterPayload) =>
    httpClient.post<RegisterResponse>('/athletes', payload).then((r) => r.data),

  submitAssessment: (athleteId: string, payload: AssessmentPayload) =>
    httpClient.post(`/athletes/${athleteId}/assessment`, payload).then((r) => r.data),

  saveAvailability: (athleteId: string, slots: AvailabilitySlot[]) =>
    httpClient.put(`/athletes/${athleteId}/availability`, { slots }).then((r) => r.data),
};
