import { useMemo } from 'react';
import { Match } from '../../matchmaking/types';

const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    date: 'Sáb, 31 Mai',
    time: '16:00',
    location: 'Arena Show',
    city: 'São Paulo, SP',
    type: 'Campo',
    status: 'SCHEDULED',
    totalSlots: 16,
    confirmedSlots: 10,
    minOverall: 72,
    distanceKm: 2.3,
    teamA: 'Resenha FC',
    teamB: 'Amigos FC',
  },
  {
    id: '2',
    date: 'Ter, 03 Jun',
    time: '19:00',
    location: 'Arena Society',
    city: 'São Paulo, SP',
    type: 'Society',
    status: 'SCHEDULED',
    totalSlots: 14,
    confirmedSlots: 6,
    minOverall: 65,
    distanceKm: 1.1,
    teamA: 'Time Azul',
    teamB: 'Time Verde',
  },
  {
    id: '3',
    date: 'Qui, 29 Mai',
    time: '19:00',
    location: 'Arena Society',
    city: 'São Paulo, SP',
    type: 'Society',
    status: 'FINISHED',
    totalSlots: 14,
    confirmedSlots: 14,
    teamA: 'Time Azul',
    teamB: 'Time Verm.',
    scoreA: 3,
    scoreB: 1,
  },
  {
    id: '4',
    date: 'Seg, 26 Mai',
    time: '20:00',
    location: 'Quadra Central',
    city: 'São Paulo, SP',
    type: 'Futsal',
    status: 'FINISHED',
    totalSlots: 10,
    confirmedSlots: 10,
    teamA: 'Resenha FC',
    teamB: 'Galera FC',
    scoreA: 2,
    scoreB: 2,
  },
];

export function useHomeData() {
  const upcoming = useMemo(
    () => MOCK_MATCHES.filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS'),
    []
  );
  const past = useMemo(
    () => MOCK_MATCHES.filter((m) => m.status === 'FINISHED' || m.status === 'CANCELLED'),
    []
  );
  return { upcoming, past };
}
