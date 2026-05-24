import { httpClient } from '@lib/httpClient';
import type { LiveMatchData, LiveMatchEvent, LiveMatchEventType, LiveMatchSponsor, LiveMatchTeam } from '../types';

type LiveMatchResponse = Omit<LiveMatchData, 'sponsor'> & {
  sponsor?: LiveMatchSponsor;
};

export interface RegisterLiveMatchEventPayload {
  type: LiveMatchEventType;
  teamType: LiveMatchTeam;
  athleteId?: string | null;
  minute: number;
}

const DEFAULT_SPONSOR: LiveMatchSponsor = {
  name: 'Espaco disponivel para patrocinador',
  logoUri: '',
};

export const liveMatchApi = {
  getLive: (matchId: string) =>
    httpClient.get<LiveMatchResponse>(`/matches/${matchId}/live`).then((response) => ({
      ...response.data,
      sponsor: response.data.sponsor ?? DEFAULT_SPONSOR,
    })),

  start: (matchId: string) =>
    httpClient.post(`/matches/${matchId}/live/start`, {}).then((response) => response.data),

  registerEvent: (matchId: string, payload: RegisterLiveMatchEventPayload) =>
    httpClient.post<LiveMatchEvent>(`/matches/${matchId}/live/events`, payload).then((response) => response.data),

  finish: (matchId: string) =>
    httpClient.post(`/matches/${matchId}/live/finish`, {}).then((response) => response.data),
};
