export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'DECLINED';
export type MatchType = 'Campo' | 'Society' | 'Futsal';

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
