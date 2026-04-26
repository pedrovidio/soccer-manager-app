// ─── Enums ────────────────────────────────────────────────────────────────────
export type FootballLevel = 'PROFESSIONAL' | 'AMATEUR' | 'CASUAL';
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
export type MatchType = 'CAMPO' | 'SOCIETY' | 'FUTSAL';
export type TransactionStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type TransactionType = 'MONTHLY' | 'SPOT' | 'GOALKEEPER_SERVICE';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type NotificationType =
  | 'GROUP_INVITE' | 'INVITE_ACCEPTED' | 'INVITE_DECLINED'
  | 'MATCH_INVITE' | 'MATCH_INVITE_ACCEPTED' | 'MATCH_INVITE_DECLINED'
  | 'SYSTEM';
export type YearsPlaying = 'LESS_THAN_2' | '2_TO_5' | '6_TO_10' | 'MORE_THAN_10';
export type WeeklyFrequency = 'RARELY' | '1_TO_2' | '3_OR_MORE';
export type PreferredPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

// ─── Athlete ──────────────────────────────────────────────────────────────────
export interface Athlete {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  position: string;
  footballLevel: FootballLevel;
  statsPace: number;
  statsShooting: number;
  statsPassing: number;
  statsDribbling: number;
  statsDefense: number;
  statsPhysical: number;
  latitude?: number;
  longitude?: number;
  isGoalkeeperForHire: boolean;
  isInjured: boolean;
  financialDebt: number;
  hasCompletedAssessment: boolean;
  pixKey?: string;
  photoUrl?: string;
}

export interface RegisterAthleteInput {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  age: number;
  gender: 'M' | 'F';
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  isGoalkeeperForHire?: boolean;
  latitude?: number;
  longitude?: number;
  password: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  athleteId: string;
  name: string;
}

// ─── Assessment ───────────────────────────────────────────────────────────────
export interface SubmitAssessmentInput {
  playedProfessionally: boolean;
  highestLevel: FootballLevel;
  yearsPlaying: YearsPlaying;
  weeklyFrequency: WeeklyFrequency;
  selfRatedPace: number;
  selfRatedShooting: number;
  selfRatedPassing: number;
  selfRatedDribbling: number;
  selfRatedDefense: number;
  selfRatedPhysical: number;
  preferredPosition: PreferredPosition;
}

// ─── Match ────────────────────────────────────────────────────────────────────
export interface Match {
  id: string;
  groupId: string;
  type: MatchType;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  totalVacancies: number;
  reserveVacancies: number;
  spotRadiusKm: number;
  minOverall: number;
  minAge: number;
  maxAge: number;
  confirmedIds: string[];
  checkedInIds: string[];
  status: MatchStatus;
}

export interface MatchListItem {
  id: string;
  type: MatchType;
  date: string;
  location: string;
  totalVacancies: number;
  reserveVacancies: number;
  confirmedCount: number;
  checkedInCount: number;
  status: MatchStatus;
}

export interface CreateMatchInput {
  groupId: string;
  adminId: string;
  type: MatchType;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  totalVacancies: number;
  reserveVacancies?: number;
  spotRadiusKm?: number;
  minOverall?: number;
  minAge?: number;
  maxAge?: number;
}

export interface MatchTeam {
  teamName: string;
  players: { athleteId: string; name: string; position: string; overall: number }[];
}

// ─── Group ────────────────────────────────────────────────────────────────────
export interface Group {
  id: string;
  name: string;
  description?: string;
  adminIds: string[];
  memberIds: string[];
  pixKey?: string;
  photoUrl?: string;
  monthlyFee: number;
  status: string;
}

export interface CreateGroupInput {
  adminId: string;
  name: string;
  description?: string;
  pixKey?: string;
  baseLocation?: { latitude: number; longitude: number };
  goalkeeperPaymentMode?: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  athleteId: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Financial ────────────────────────────────────────────────────────────────
export interface FinancialTransaction {
  id: string;
  athleteId: string;
  matchId?: string;
  groupId?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  platformFee: number;
  createdAt: string;
}

export interface GroupBalance {
  totalPaid: number;
  totalPending: number;
  transactions: FinancialTransaction[];
}

// ─── GroupInvite ──────────────────────────────────────────────────────────────
export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  status: InviteStatus;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface AthleteDashboard {
  totalMatches: number;
  averageStats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defense: number;
    physical: number;
    overall: number;
  };
  overallEvolution: { matchId: string; date: string; overall: number }[];
  recentMatches: MatchListItem[];
}

// ─── Rating ───────────────────────────────────────────────────────────────────
export interface RegisterRatingInput {
  ratedBy: string;
  ratedAthlete: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
}

// ─── Court ────────────────────────────────────────────────────────────────────
export interface AvailableCourt {
  id: string;
  courtId: string;
  courtName: string;
  venueName: string;
  address: string;
  type: MatchType;
  isCovered: boolean;
  rentalPrice: number;
  date: string;
  startTime: string;
  endTime: string;
}
