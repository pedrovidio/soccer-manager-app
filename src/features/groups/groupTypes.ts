export interface CreateGroupPayload {
  adminId: string;
  name: string;
  description?: string;
  pixKey?: string;
  courtMonthlyFee?: number;
  monthlyFee?: number;
  spotFee?: number;
  teamNames?: string[];
}

export interface GroupResponse {
  id: string;
  name: string;
  description?: string;
  adminIds: string[];
  memberIds: string[];
  pixKey?: string;
  courtMonthlyFee: number;
  monthlyFee: number;
  spotFee: number;
  teamNames: string[];
  status: string;
}

export interface CreateGroupFormData {
  name: string;
  description: string;
  pixKey: string;
  courtMonthlyFee: string;
  monthlyFee: string;
  spotFee: string;
  teamNames: string[];
}

export interface UpdateGroupPayload {
  requesterId: string;
  name?: string;
  description?: string;
  pixKey?: string;
  courtMonthlyFee?: number;
  monthlyFee?: number;
  spotFee?: number;
  teamNames?: string[];
}

export interface GroupMember {
  id: string;
  name: string;
  position: string;
  overall: number;
  averageStats?: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defense: number;
    physical: number;
    overall: number;
  };
  isAdmin: boolean;
  isInjured: boolean;
  hasDebt: boolean;
  isBlocked: boolean;
}

export interface GroupUpcomingMatch {
  id: string;
  date: string;
  location: string;
  totalVacancies: number;
  confirmedCount: number;
  status: string;
}

export interface GroupBalance {
  cashInHand: number;
  totalPending: number;
}

export type GroupFinanceStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type GroupFinanceType = 'MONTHLY' | 'SPOT' | 'COURT_RENTAL' | 'PURCHASE';

export interface GroupFinancePayment {
  id: string;
  athleteId: string;
  athleteName: string;
  athletePhone: string;
  matchId?: string | null;
  matchDate?: string | null;
  matchLocation?: string | null;
  amount: number;
  type: GroupFinanceType;
  status: GroupFinanceStatus;
  description?: string | null;
  dueDate?: string | null;
  paymentReportedAt?: string | null;
  createdAt: string;
  isOverdue: boolean;
}

export interface GroupFinanceByType {
  type: GroupFinanceType;
  paid: number;
  pending: number;
  overdue: number;
  count: number;
}

export interface GroupFinanceByMatch {
  matchId: string;
  matchDate?: string | null;
  matchLocation: string;
  matchStatus?: string | null;
  paid: number;
  pending: number;
  overdue: number;
  total: number;
  transactionCount: number;
  paidCount: number;
  pendingCount: number;
}

export interface GroupFinanceReport {
  group: {
    id: string;
    name: string;
    courtMonthlyFee: number;
    monthlyFee: number;
    spotFee: number;
    pixKey?: string | null;
  };
  summary: {
    cashInHand: number;
    totalPaid: number;
    totalExpenses: number;
    totalPending: number;
    totalOverdue: number;
    totalReported: number;
    expectedTotal: number;
    transactionsCount: number;
    pendingCount: number;
    overdueCount: number;
  };
  byType: GroupFinanceByType[];
  byMatch: GroupFinanceByMatch[];
  expenses: GroupFinancePayment[];
  defaulters: GroupFinancePayment[];
  payments: GroupFinancePayment[];
}

export interface GroupFinanceFilters {
  from?: string;
  to?: string;
  status?: GroupFinanceStatus;
  type?: GroupFinanceType;
}

export interface GroupExpensePayload {
  adminId: string;
  amount: number;
  description?: string;
  paidAt?: string;
}

export interface GroupHomeData {
  group: {
    id: string;
    name: string;
    description?: string;
    courtMonthlyFee: number;
    monthlyFee: number;
    spotFee: number;
    teamNames: string[];
    pixKey?: string;
    status: string;
  };
  isAdmin: boolean;
  members: GroupMember[];
  upcomingMatches: GroupUpcomingMatch[];
  balance: GroupBalance | null;
}

export interface GroupInviteItem {
  inviteId: string;
  athleteId: string;
  name: string;
  position: string;
  overall: number;
  email: string;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: string;
}

export interface AthleteSearchResult {
  id: string;
  name: string;
  email: string;
  position: string;
  overall: number;
}

export interface FavoriteSpotAthlete {
  athleteId: string;
  name: string;
  position: string;
  overall: number;
  age: number;
  gender: string;
  createdAt: string;
}
