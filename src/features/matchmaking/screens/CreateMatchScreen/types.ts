export type MatchType = 'CAMPO' | 'SOCIETY' | 'FUTSAL';
export type CancelMode = 'single' | 'series';

export type MatchTypeOption = {
  value: MatchType;
  label: string;
  vacancies: number;
};

export type MatchCoords = {
  latitude: number;
  longitude: number;
};
