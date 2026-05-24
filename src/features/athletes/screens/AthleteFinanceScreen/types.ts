import { AthleteFinanceStatus, AthleteFinanceType } from '../../athleteTypes';

export type AthleteFinanceTab = 'due' | 'history' | 'reports';
export type StatusFilter = 'ALL' | AthleteFinanceStatus;
export type TypeFilter = 'ALL' | AthleteFinanceType;
export type Tone = 'success' | 'warning' | 'error' | 'neutral';
