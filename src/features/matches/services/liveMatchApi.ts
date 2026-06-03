import { httpClient } from '@lib/httpClient';
import type { LiveMatchData, LiveMatchEvent, LiveMatchEventType, LiveMatchTeam } from '../types';

type LiveMatchResponse = LiveMatchData;

export interface RegisterLiveMatchEventPayload {
  type: LiveMatchEventType;
  teamType: LiveMatchTeam;
  athleteId?: string | null;
  minute: number;
}

export const liveMatchApi = {
  getLive: (matchId: string) =>
    httpClient.get<LiveMatchResponse>(`/matches/${matchId}/live`).then((response) => response.data),

  start: (matchId: string) =>
    httpClient.post(`/matches/${matchId}/live/start`, {}).then((response) => response.data),

  registerEvent: (matchId: string, payload: RegisterLiveMatchEventPayload) =>
    httpClient.post<LiveMatchEvent>(`/matches/${matchId}/live/events`, payload).then((response) => response.data),

  deleteEvent: (matchId: string, eventId: string) =>
    httpClient.delete(`/matches/${matchId}/live/events/${eventId}`).then((response) => response.data),

  finish: (matchId: string) =>
    httpClient.post(`/matches/${matchId}/live/finish`, {}).then((response) => response.data),
};
