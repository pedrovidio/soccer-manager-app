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
  isGroupAdmin?: boolean;
  hasMatchmaking?: boolean;
  matchmakingResult?: {
    overallDifference: number;
    teams: {
      teamNumber: number;
      athletes: { id: string; name: string; position: string; overall: number }[];
      averageOverall: number;
    }[];
  } | null;
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

export type AthleteFinanceStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type AthleteFinanceType = 'MONTHLY' | 'SPOT';

export interface AthleteFinancePayment {
  id: string;
  amount: number;
  type: AthleteFinanceType;
  status: AthleteFinanceStatus;
  dueDate?: string | null;
  paymentReportedAt?: string | null;
  createdAt: string;
  isOverdue: boolean;
  group?: {
    id: string;
    name: string;
    pixKey?: string | null;
    adminName?: string | null;
    adminPhone?: string | null;
    adminPixKey?: string | null;
  } | null;
  match?: {
    id: string;
    date: string;
    location: string;
    type: string;
    status: string;
  } | null;
}

export interface AthleteFinanceReport {
  athlete: {
    id: string;
    name: string;
    financialDebt: number;
  };
  summary: {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    totalReported: number;
    transactionsCount: number;
    pendingCount: number;
    overdueCount: number;
  };
  byType: {
    type: AthleteFinanceType;
    paid: number;
    pending: number;
    overdue: number;
    count: number;
  }[];
  byGroup: {
    groupId: string;
    groupName: string;
    paid: number;
    pending: number;
    overdue: number;
    count: number;
  }[];
  duePayments: AthleteFinancePayment[];
  payments: AthleteFinancePayment[];
}
