import { httpClient } from '../../../lib/httpClient';
import { CreateGroupPayload, UpdateGroupPayload, GroupResponse, GroupHomeData, GroupInviteItem, AthleteSearchResult } from '../groupTypes';

export const groupApi = {
  create: (payload: CreateGroupPayload) =>
    httpClient.post<GroupResponse>('/groups', payload).then((r) => r.data),

  findById: (groupId: string) =>
    httpClient.get<GroupResponse>(`/groups/${groupId}`).then((r) => r.data),

  getHome: (groupId: string, requesterId: string) =>
    httpClient
      .get<GroupHomeData>(`/groups/${groupId}/home`, { params: { requesterId } })
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
};
