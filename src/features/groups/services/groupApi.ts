import { httpClient } from '../../../lib/httpClient';
import { CreateGroupPayload, UpdateGroupPayload, GroupResponse, GroupHomeData, GroupInviteItem, AthleteSearchResult, FavoriteSpotAthlete, GroupFinanceFilters, GroupFinanceReport } from '../groupTypes';

export const groupApi = {
  create: (payload: CreateGroupPayload) =>
    httpClient.post<GroupResponse>('/groups', payload).then((r) => r.data),

  findById: (groupId: string) =>
    httpClient.get<GroupResponse>(`/groups/${groupId}`).then((r) => r.data),

  getHome: (groupId: string, requesterId: string) =>
    httpClient
      .get<GroupHomeData>(`/groups/${groupId}/home`, { params: { requesterId } })
      .then((r) => r.data),

  financeReport: (groupId: string, requesterId: string, filters: GroupFinanceFilters = {}) =>
    httpClient
      .get<GroupFinanceReport>(`/groups/${groupId}/finance/report`, {
        params: { requesterId, ...filters },
      })
      .then((r) => r.data),

  update: (groupId: string, payload: UpdateGroupPayload) =>
    httpClient.patch(`/groups/${groupId}`, payload).then((r) => r.data),

  listByAthlete: (athleteId: string) =>
    httpClient.get<GroupResponse[]>(`/athletes/${athleteId}/groups`).then((r) => r.data),

  listGroupInvites: (groupId: string) =>
    httpClient.get<GroupInviteItem[]>(`/groups/${groupId}/invites`).then((r) => r.data),

  searchAthletes: (query: string, groupId?: string, requesterId?: string) =>
    httpClient
      .get<AthleteSearchResult[]>('/groups/athletes/search', {
        params: {
          name: query,
          ...(groupId     && { groupId }),
          ...(requesterId && { requesterId }),
        },
      })
      .then((r) => r.data),

  inviteAthlete: (groupId: string, adminId: string, athleteId: string) =>
    httpClient
      .post(`/groups/${groupId}/invites`, { adminId, athleteId })
      .then((r) => r.data),

  promoteAdmin: (groupId: string, requesterId: string, targetAthleteId: string) =>
    httpClient
      .post(`/groups/${groupId}/admin/delegate`, { requesterId, delegatedTo: targetAthleteId, isPermanent: true })
      .then((r) => r.data)
      .catch((e) => { console.error('[promoteAdmin]', e?.response?.status, JSON.stringify(e?.response?.data)); throw e; }),

  demoteAdmin: (groupId: string, requesterId: string, targetAthleteId: string) =>
    httpClient
      .delete(`/groups/${groupId}/admin/delegate`, { data: { requesterId, delegatedTo: targetAthleteId } })
      .then((r) => r.data)
      .catch((e) => { console.error('[demoteAdmin]', e?.response?.status, JSON.stringify(e?.response?.data)); throw e; }),

  setInjured: (groupId: string, requesterId: string, targetAthleteId: string, isInjured: boolean) =>
    httpClient
      .patch(`/groups/${groupId}/members/${targetAthleteId}/injured`, { requesterId, isInjured })
      .then((r) => r.data),

  setBlocked: (groupId: string, requesterId: string, targetAthleteId: string, isBlocked: boolean) =>
    httpClient
      .patch(`/groups/${groupId}/members/${targetAthleteId}/blocked`, { requesterId, isBlocked })
      .then((r) => r.data),

  respondGroupInvite: (inviteId: string, athleteId: string, accept: boolean) =>
    httpClient.patch(`/invites/${inviteId}/respond`, { athleteId, accept }).then((r) => r.data),

  removeMember: (groupId: string, requesterId: string, targetAthleteId: string) =>
    httpClient
      .delete(`/groups/${groupId}/members/${targetAthleteId}`, { data: { requesterId } })
      .then((r) => r.data),

  listFavoriteSpotAthletes: (groupId: string, requesterId: string) =>
    httpClient
      .get<FavoriteSpotAthlete[]>(`/groups/${groupId}/favorite-spot-athletes`, { params: { requesterId } })
      .then((r) => r.data),

  favoriteSpotAthlete: (groupId: string, requesterId: string, athleteId: string) =>
    httpClient
      .post(`/groups/${groupId}/favorite-spot-athletes/${athleteId}`, { requesterId })
      .then((r) => r.data),

  unfavoriteSpotAthlete: (groupId: string, requesterId: string, athleteId: string) =>
    httpClient
      .delete(`/groups/${groupId}/favorite-spot-athletes/${athleteId}`, { data: { requesterId } })
      .then((r) => r.data),
};
