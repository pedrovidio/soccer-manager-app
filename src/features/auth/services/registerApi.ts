import { httpClient } from '../../../lib/httpClient';
import { RegisterPayload, AssessmentPayload } from '../registerTypes';

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  hasCompletedAssessment: boolean;
}

export const registerApi = {
  register: (payload: RegisterPayload) =>
    httpClient.post<RegisterResponse>('/athletes', payload).then((r) => r.data),

  submitAssessment: (athleteId: string, payload: AssessmentPayload) =>
    httpClient.post(`/athletes/${athleteId}/assessment`, payload).then((r) => r.data),
};
