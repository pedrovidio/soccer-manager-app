import React from 'react';
import { render } from '@testing-library/react-native';
import { LiveMatchScreen } from '../LiveMatchScreen';
import { useLiveMatchController } from '../../hooks/useLiveMatchController';
import type { LiveMatchData } from '../../types';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@features/auth/useAuthStore', () => ({
  useAuthStore: (selector: (state: { athleteId: string }) => unknown) =>
    selector({ athleteId: 'scorekeeper-1' }),
}));

const mockUseFeatureAccess = jest.fn();

jest.mock('@features/app-config/hooks/useFeatureAccess', () => ({
  useFeatureAccess: () => mockUseFeatureAccess(),
}));

const liveMatchAccess = {
    feature: null,
    hasAccess: true,
    isFeatureActive: true,
    isKnown: true,
    isLoading: false,
    reason: null,
    requiresPremium: false,
};

jest.mock('../../hooks/useLiveMatchController', () => ({
  useLiveMatchController: jest.fn(),
}));

const mockedUseLiveMatchController = useLiveMatchController as jest.MockedFunction<
  typeof useLiveMatchController
>;

const match: LiveMatchData = {
  id: 'match-live-1',
  status: 'IN_PROGRESS',
  scorekeeperId: 'scorekeeper-1',
  startedAt: '2026-05-25T20:00:00.000Z',
  endedAt: null,
  homeTeamName: 'Time Amarelo',
  awayTeamName: 'Time Azul',
  homeScore: 2,
  awayScore: 1,
  homePlayers: [
    { id: 'athlete-home-1', name: 'Ana Silva', position: 'ATA', overall: 85 },
  ],
  awayPlayers: [
    { id: 'athlete-away-1', name: 'Bruno Souza', position: 'ATA', overall: 84 },
  ],
  isAdmin: true,
  canStartMatch: false,
  events: [],
  sponsorData: { imageUrl: 'https://cdn.test/live-master.png', targetUrl: null },
};

describe('<LiveMatchScreen />', () => {
  beforeEach(() => {
    mockUseFeatureAccess.mockReturnValue(liveMatchAccess);
  });

  it('renders the live scoreboard and match controls for a valid match', () => {
    mockedUseLiveMatchController.mockReturnValue({
      match,
      isLoading: false,
      isError: false,
      isSubmitting: false,
      refetch: jest.fn(),
      startMatch: jest.fn(),
      addGoal: jest.fn(),
      finishMatch: jest.fn(),
    });

    const { getByLabelText, getByText } = render(<LiveMatchScreen matchId={match.id} />);

    getByText('Transmissao ao Vivo');
    getByText('AO VIVO');
    getByText('2 x 1');
    getByText('Encerrar Partida');
    getByText('Linha do tempo');
    getByLabelText('Banner do patrocinador');
  });

  it('renders only the result view when live score access is blocked', () => {
    mockUseFeatureAccess.mockReturnValue({
      ...liveMatchAccess,
      hasAccess: false,
      isFeatureActive: false,
      reason: 'disabled',
    });
    mockedUseLiveMatchController.mockReturnValue({
      match,
      isLoading: false,
      isError: false,
      isSubmitting: false,
      refetch: jest.fn(),
      startMatch: jest.fn(),
      addGoal: jest.fn(),
      finishMatch: jest.fn(),
    });

    const { getAllByText, getByText, queryByText } = render(<LiveMatchScreen matchId={match.id} />);

    expect(getAllByText('Resultado da partida')).toHaveLength(2);
    getByText('2 x 1');
    expect(queryByText('Encerrar Partida')).toBeNull();
    expect(queryByText('Linha do tempo')).toBeNull();
  });
});
