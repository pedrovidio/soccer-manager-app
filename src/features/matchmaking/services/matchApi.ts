import { httpClient } from '../../../lib/httpClient';
import { Match, MatchDetail, GuestSlotConfig, NearbyAthlete, SpotPayment, MatchmakingResult } from '../types';

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

  getDetail: (matchId: string, requesterId?: string) =>
    httpClient.get<MatchDetail>(`/matches/${matchId}`, { params: requesterId ? { requesterId } : undefined }).then((r) => r.data),

  updatePresence: (matchId: string, athleteId: string, status: 'CONFIRMED' | 'DECLINED') =>
    status === 'CONFIRMED'
      ? httpClient.post(`/matches/${matchId}/confirm-presence`, { athleteId }).then((r) => r.data)
      : Promise.reject(new Error('Decline presence requires a match invite id; use respondInvite instead.')),

  openGuestSlots: (matchId: string, adminId: string, config: GuestSlotConfig, athleteIds?: string[]) =>
    httpClient.post(`/matches/${matchId}/open-vacancies`, { adminId, ...config, ...(athleteIds ? { athleteIds } : {}) }).then((r) => r.data),

  closeGuestSlots: (matchId: string, adminId: string) =>
    httpClient.delete(`/matches/${matchId}/open-vacancies`, { data: { adminId } }).then((r) => r.data),

  nearbyAthletes: (matchId: string, config: Partial<GuestSlotConfig>) =>
    httpClient.get<NearbyAthlete[]>(`/matches/${matchId}/nearby-athletes`, { params: config }).then((r) => r.data),

  respondInvite: (inviteId: string, athleteId: string, accept: boolean) =>
    httpClient.patch(`/match-invites/${inviteId}/respond`, { athleteId, accept }).then((r) => r.data),

  checkIn: (matchId: string, athleteId: string) =>
    httpClient.post(`/matches/${matchId}/check-in`, { athleteId }).then((r) => r.data),

  cancelPresence: (matchId: string) =>
    httpClient.delete(`/matches/${matchId}/confirm-presence`).then((r) => r.data),

  matchmaking: (matchId: string, teamsCount = 2) =>
    httpClient.post<MatchmakingResult>(`/matches/${matchId}/matchmaking`, { teamsCount }).then((r) => r.data),

  registerRating: (
    matchId: string,
    ratedBy: string,
    ratedAthlete: string,
    stats: { pace: number; shooting: number; passing: number; dribbling: number; defense: number; physical: number },
  ) =>
    httpClient.post(`/matches/${matchId}/ratings`, { ratedBy, ratedAthlete, stats }).then((r) => r.data),

  registerScore: (matchId: string, registeredBy: string, scores: { teamName: string; goals: number }[]) =>
    httpClient.post(`/matches/${matchId}/score`, { registeredBy, scores }).then((r) => r.data),

  cancelMatch: (matchId: string, adminId: string, reason: string) =>
    httpClient.patch(`/matches/${matchId}/cancel`, { adminId, reason }).then((r) => r.data),

  finishMatch: (matchId: string, adminId: string, comment?: string) =>
    httpClient.patch(`/matches/${matchId}/finish`, { adminId, comment }).then((r) => r.data),

  reportSpotPayment: (matchId: string, athleteId: string) =>
    httpClient.post(`/matches/${matchId}/spot-payment/report`, { athleteId }).then((r) => r.data),

  listSpotPayments: (groupId: string, requesterId: string) =>
    httpClient.get<SpotPayment[]>(`/groups/${groupId}/spot-payments`, { params: { requesterId } }).then((r) => r.data),

  confirmSpotPayment: (transactionId: string, adminId: string) =>
    httpClient.patch(`/spot-payments/${transactionId}/confirm`, { adminId }).then((r) => r.data),
};
