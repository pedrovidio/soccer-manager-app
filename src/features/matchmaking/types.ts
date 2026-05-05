export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'DECLINED';
export type MatchType = 'CAMPO' | 'SOCIETY' | 'FUTSAL';
export type PresenceStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED';
export type Gender = 'M' | 'F' | 'ANY';

export interface Match {
  id: string;
  date: string;
  time: string;
  location: string;
  city: string;
  type: MatchType;
  status: MatchStatus;
  totalSlots: number;
  confirmedSlots: number;
  minOverall?: number;
  distanceKm?: number;
  teamA?: string;
  teamB?: string;
  scoreA?: number;
  scoreB?: number;
}

export interface MatchPresence {
  athleteId: string;
  name: string;
  position: string;
  overall: number;
  status: PresenceStatus;
  isGuest: boolean;
}

export interface GuestSlotConfig {
  guestVacancies: number;
  minAge: number;
  maxAge: number;
  gender: Gender;
  spotRadiusKm: number;
  minOverall: number;
}

export interface MatchDetail {
  id: string;
  groupId: string;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  type: MatchType;
  status: MatchStatus;
  totalVacancies: number;
  reserveVacancies: number;
  confirmedCount: number;
  isRecurring: boolean;
  guestConfig: GuestSlotConfig | null;
  presence: MatchPresence[];
}

export interface NearbyAthlete {
  id: string;
  name: string;
  approxLatitude: number;
  approxLongitude: number;
  overall: number;
  age: number;
  gender: Gender;
  position: string;
}
