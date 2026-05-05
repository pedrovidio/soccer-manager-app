export interface AthleteStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  overall: number;
}

export interface OverallSnapshot {
  matchId: string;
  date: string;
  overall: number;
}

export interface RecentMatch {
  id: string;
  groupId: string;
  type: string;
  date: string;
  location: string;
  status: string;
  confirmedIds: string[];
  scores: { teamName: string; goals: number }[] | null;
}

export interface AthleteDashboard {
  name?: string;
  cpf?: string;
  gender?: 'M' | 'F';
  overall?: number;
  position?: string;
  status?: string;
  groupIds?: string[];
  isInjured?: boolean;
  paymentStatus?: 'PAID' | 'PENDING' | 'DECLINED';
  photoUrl?: string;
  phone?: string;
  age?: number;
  isGoalkeeperForHire?: boolean;
  pixKey?: string | null;
  address?: {
    cep: string;
    street: string;
    number: number;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  confirmedMatches: ConfirmedMatch[];
  // legacy fields (unused but kept for compat)
  totalMatches?: number;
  averageStats?: AthleteStats;
  overallEvolution?: OverallSnapshot[];
  recentMatches?: RecentMatch[];
}

export interface ConfirmedMatch {
  id: string;
  groupId: string;
  type: string;
  date: string;
  time: string;
  isoDate: string;
  location: string;
  status: string;
  totalSlots: number;
  confirmedSlots: number;
  minOverall?: number;
}

export interface Invite {
  id: string;
  type: 'GROUP' | 'MATCH';
  // group invite
  groupId?: string;
  groupName?: string;
  invitedBy?: string;
  // match invite
  matchId?: string;
  matchDate?: string;
  matchLocation?: string;
  matchGroupName?: string;
  // common
  status: string;
  createdAt: string;
  respondUrl: string;
}
