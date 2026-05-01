export type GoalkeeperPaymentMode = 'SPLIT' | 'MONTHLY' | 'FREE';

export interface CreateGroupPayload {
  adminId: string;
  name: string;
  description?: string;
  pixKey?: string;
  monthlyFee?: number;
  goalkeeperPaymentMode?: GoalkeeperPaymentMode;
}

export interface GroupResponse {
  id: string;
  name: string;
  description?: string;
  adminIds: string[];
  memberIds: string[];
  pixKey?: string;
  monthlyFee: number;
  goalkeeperPaymentMode: GoalkeeperPaymentMode;
  status: string;
}

export interface CreateGroupFormData {
  name: string;
  description: string;
  pixKey: string;
  monthlyFee: string;
  goalkeeperPaymentMode: GoalkeeperPaymentMode;
}

export interface UpdateGroupPayload {
  requesterId: string;
  name?: string;
  description?: string;
  pixKey?: string;
  monthlyFee?: number;
  goalkeeperPaymentMode?: GoalkeeperPaymentMode;
}

export interface GroupMember {
  id: string;
  name: string;
  position: string;
  overall: number;
  isAdmin: boolean;
  isInjured: boolean;
  hasDebt: boolean;
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

export interface GroupHomeData {
  group: {
    id: string;
    name: string;
    description?: string;
    monthlyFee: number;
    pixKey?: string;
    goalkeeperPaymentMode: GoalkeeperPaymentMode;
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
