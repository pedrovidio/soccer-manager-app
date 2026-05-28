import { httpClient } from '@lib/httpClient';
import { groupApi } from './groupApi';

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

describe('groupApi contract', () => {
  const groupId = '22222222-2222-4222-8222-222222222222';
  const requesterId = '11111111-1111-4111-8111-111111111111';
  const targetAthleteId = '33333333-3333-4333-8333-333333333333';

  it('requests group home with requesterId query params', async () => {
    await groupApi.getHome(groupId, requesterId);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      `/groups/${groupId}/home`,
      { params: { requesterId } },
    );
  });

  it('updates groups with the requesterId required by UpdateGroupRequestDTO', async () => {
    await groupApi.update(groupId, { requesterId, name: 'Pelada das Quartas' });

    expect(mockedHttp.patch).toHaveBeenCalledWith(
      `/groups/${groupId}`,
      { requesterId, name: 'Pelada das Quartas' },
    );
  });

  it('searches athletes using the server search filters', async () => {
    await groupApi.searchAthletes('Ana', groupId, requesterId);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      '/groups/athletes/search',
      { params: { name: 'Ana', groupId, requesterId } },
    );
  });

  it('sends admin delegation fields expected by the server DTO', async () => {
    await groupApi.promoteAdmin(groupId, requesterId, targetAthleteId);

    expect(mockedHttp.post).toHaveBeenCalledWith(
      `/groups/${groupId}/admin/delegate`,
      { requesterId, delegatedTo: targetAthleteId, isPermanent: true },
    );
  });
});
