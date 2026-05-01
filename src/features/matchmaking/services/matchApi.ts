import { httpClient } from '../../../lib/httpClient';
import { Match } from '../types';

export const matchApi = {
  listByGroup: (groupId: string) =>
    httpClient.get<Match[]>(`/groups/${groupId}/matches`).then((r) => r.data),
};
