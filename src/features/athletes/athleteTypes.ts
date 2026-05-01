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
  // fields used directly by HomeScreen (from auth store fallback)
  name?: string;
  overall?: number;
  position?: string;
  status?: string;
  groupIds?: string[];
  isInjured?: boolean;
  paymentStatus?: 'PAID' | 'PENDING' | 'DECLINED';
  // fields from server dashboard endpoint
  totalMatches: number;
  averageStats: AthleteStats;
  overallEvolution: OverallSnapshot[];
  recentMatches: RecentMatch[];
}

export interface Invite {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  status: string;
  createdAt: string;
}
