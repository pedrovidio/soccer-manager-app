import { httpClient } from '../../../lib/httpClient';
import { Match, MatchDetail, GuestSlotConfig, NearbyAthlete } from '../types';

export interface CreateMatchPayload {
  adminId: string;
  groupId: string;
  type: 'CAMPO' | 'SOCIETY' | 'FUTSAL';
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  totalVacancies: number;
  reserveVacancies: number;
  spotRadiusKm: number;
  minOverall: number;
  minAge: number;
  maxAge: number;
  isRecurring: boolean;
}

export const matchApi = {
  listByGroup: (groupId: string) =>
    httpClient.get<Match[]>(`/groups/${groupId}/matches`).then((r) => r.data),

  create: (payload: CreateMatchPayload) =>
    httpClient.post('/matches', payload).then((r) => r.data),

  update: (matchId: string, payload: Partial<CreateMatchPayload> & { adminId: string }) =>
    httpClient.patch(`/matches/${matchId}`, payload).then((r) => r.data),

  getDetail: (matchId: string) =>
    httpClient.get<MatchDetail>(`/matches/${matchId}`).then((r) => r.data),

  updatePresence: (matchId: string, athleteId: string, status: 'CONFIRMED' | 'DECLINED') =>
    httpClient.patch(`/matches/${matchId}/presence/${athleteId}`, { status }).then((r) => r.data),

  openGuestSlots: (matchId: string, adminId: string, config: GuestSlotConfig) =>
    httpClient.post(`/matches/${matchId}/guest-slots`, { adminId, ...config }).then((r) => r.data),

  closeGuestSlots: (matchId: string, adminId: string) =>
    httpClient.delete(`/matches/${matchId}/guest-slots`, { data: { adminId } }).then((r) => r.data),

  nearbyAthletes: (matchId: string, config: Partial<GuestSlotConfig>) =>
    httpClient.get<NearbyAthlete[]>(`/matches/${matchId}/nearby-athletes`, { params: config }).then((r) => r.data),

  respondInvite: (inviteId: string, athleteId: string, accept: boolean) =>
    httpClient.patch(`/match-invites/${inviteId}/respond`, { athleteId, accept }).then((r) => r.data),

  cancelMatch: (matchId: string, adminId: string, reason: string) =>
    httpClient.patch(`/matches/${matchId}/cancel`, { adminId, reason }).then((r) => r.data),

  finishMatch: (matchId: string, adminId: string, comment?: string) =>
    httpClient.patch(`/matches/${matchId}/finish`, { adminId, comment }).then((r) => r.data),
};
