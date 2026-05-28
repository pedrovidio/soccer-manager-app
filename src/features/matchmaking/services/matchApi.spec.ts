import { httpClient } from '@lib/httpClient';
import { matchApi } from './matchApi';

jest.mock('@lib/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedHttp = httpClient as jest.Mocked<typeof httpClient>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedHttp.get.mockResolvedValue({ data: 'ok' } as never);
  mockedHttp.post.mockResolvedValue({ data: 'ok' } as never);
  mockedHttp.patch.mockResolvedValue({ data: 'ok' } as never);
  mockedHttp.delete.mockResolvedValue({ data: 'ok' } as never);
});

describe('matchApi contract', () => {
  const athleteId = '11111111-1111-4111-8111-111111111111';
  const matchId = '22222222-2222-4222-8222-222222222222';

  it('confirms presence with the athlete id required by the server DTO', async () => {
    await matchApi.updatePresence(matchId, athleteId, 'CONFIRMED');

    expect(mockedHttp.post).toHaveBeenCalledWith(
      `/matches/${matchId}/confirm-presence`,
      { athleteId },
    );
  });

  it('closes guest vacancies using the DELETE body expected by the server', async () => {
    await matchApi.closeGuestSlots(matchId, athleteId);

    expect(mockedHttp.delete).toHaveBeenCalledWith(
      `/matches/${matchId}/open-vacancies`,
      { data: { adminId: athleteId } },
    );
  });

  it('opens guest vacancies preserving admin id, filters, and selected athletes', async () => {
    const invitedAthleteId = '33333333-3333-4333-8333-333333333333';

    await matchApi.openGuestSlots(
      matchId,
      athleteId,
      { guestVacancies: 3, minAge: 18, maxAge: 45, gender: 'ANY', spotRadiusKm: 8, minOverall: 50 },
      [invitedAthleteId],
    );

    expect(mockedHttp.post).toHaveBeenCalledWith(
      `/matches/${matchId}/open-vacancies`,
      {
        adminId: athleteId,
        guestVacancies: 3,
        minAge: 18,
        maxAge: 45,
        gender: 'ANY',
        spotRadiusKm: 8,
        minOverall: 50,
        athleteIds: [invitedAthleteId],
      },
    );
  });

  it('validates ratings locally before hitting the ratings endpoint', async () => {
    expect(() => {
      matchApi.registerRating(matchId, { evaluatedAthleteId: athleteId, stars: 6 });
    }).toThrow();

    expect(mockedHttp.post).not.toHaveBeenCalled();
  });
});
