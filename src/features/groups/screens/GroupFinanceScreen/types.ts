import { GroupFinanceStatus, GroupFinanceType } from '@features/groups/groupTypes';

export type FinanceTab = 'review' | 'overview' | 'matches' | 'defaulters' | 'expenses' | 'payments';
export type StatusFilter = 'ALL' | GroupFinanceStatus;
export type TypeFilter = 'ALL' | GroupFinanceType;
export type ExpenseKind = 'COURT_RENTAL' | 'PURCHASE';

export type Tone = 'success' | 'warning' | 'error' | 'neutral';
