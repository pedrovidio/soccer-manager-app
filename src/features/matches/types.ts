export type LiveMatchTeam = 'HOME' | 'AWAY';
export type LiveMatchEventType = 'GOAL' | 'OWN_GOAL' | 'YELLOW_CARD' | 'RED_CARD';

export interface LiveMatchEvent {
  id: string;
  type: LiveMatchEventType;
  teamType: LiveMatchTeam;
  minute: number;
  athleteName?: string | null;
  createdAt: string;
}

export interface LiveMatchSponsor {
  name: string;
  logoUri: string;
}

export interface LiveMatchData {
  id: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  scorekeeperId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  isAdmin: boolean;
  canStartMatch: boolean;
  events: LiveMatchEvent[];
  sponsor: LiveMatchSponsor;
}
