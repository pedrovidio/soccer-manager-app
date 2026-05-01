import { httpClient } from '../../../lib/httpClient';
import { LoginPayload, LoginResponse } from '../authTypes';

export const authApi = {
  login: (payload: LoginPayload) =>
    httpClient.post<LoginResponse>('/auth/login', payload).then((r) => r.data),

  logout: () =>
    httpClient.post('/auth/logout').then((r) => r.data).catch(() => null),
};
