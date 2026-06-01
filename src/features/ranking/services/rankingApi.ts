import { httpClient } from '@lib/httpClient';

export interface RankingAthlete {
  athleteId: string;
  name: string;
  photoUrl: string | null;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
}

export interface RankingResponse {
  items: RankingAthlete[];
  total: number;
  page: number;
  take: number;
  hasMore: boolean;
}

export interface AthleteRankingSummary {
  rankGlobal: number;
  points: number;
  goals: number;
}

export const rankingApi = {
  listGlobal: (page: number, take: number) =>
    httpClient
      .get<RankingResponse>('/api/ranking', { params: { page, take } })
      .then((response) => response.data),

  mySummary: () =>
    httpClient
      .get<AthleteRankingSummary>('/api/ranking/me')
      .then((response) => response.data),
};
