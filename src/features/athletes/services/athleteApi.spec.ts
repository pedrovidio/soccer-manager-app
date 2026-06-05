import { httpClient } from '@lib/httpClient';
import { uploadImageToSupabaseStorage } from '@lib/supabase';
import { athleteApi } from './athleteApi';

jest.mock('@lib/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@lib/supabase', () => ({
  uploadImageToSupabaseStorage: jest.fn(),
}));

jest.mock('@lib/logger', () => ({
  appLogger: {
    warn: jest.fn(),
  },
}));

const mockedHttp = httpClient as jest.Mocked<typeof httpClient>;
const mockedUploadImageToSupabaseStorage = uploadImageToSupabaseStorage as jest.MockedFunction<typeof uploadImageToSupabaseStorage>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedHttp.get.mockResolvedValue({ data: 'ok' } as never);
  mockedHttp.post.mockResolvedValue({ data: 'ok' } as never);
  mockedHttp.patch.mockResolvedValue({ data: 'ok' } as never);
  mockedHttp.delete.mockResolvedValue({ data: 'ok' } as never);
  mockedUploadImageToSupabaseStorage.mockResolvedValue('https://cdn.supabase.test/athlete-photo.jpg');
});

describe('athleteApi contract', () => {
  const athleteId = '11111111-1111-4111-8111-111111111111';

  it('normalizes the notifications response returned by the server', async () => {
    mockedHttp.get.mockResolvedValueOnce({
      data: {
        unreadCount: 1,
        notifications: [
          { id: 'n1', title: 'Pagamento', message: 'Pix recebido', isRead: true },
          { id: 'n2', title: 'Jogo', message: 'Hoje', read: false, avatarInitials: 'JG' },
        ],
      },
    } as never);

    const notifications = await athleteApi.notifications(athleteId);

    expect(mockedHttp.get).toHaveBeenCalledWith(`/athletes/${athleteId}/notifications`);
    expect(notifications).toEqual([
      expect.objectContaining({ id: 'n1', read: true, avatarInitials: 'PA' }),
      expect.objectContaining({ id: 'n2', read: false, avatarInitials: 'JG' }),
    ]);
  });

  it('updates location using latitude and longitude bounds handled by the server DTO', async () => {
    await athleteApi.updateLocation(athleteId, -23.55, -46.63);

    expect(mockedHttp.patch).toHaveBeenCalledWith(
      `/athletes/${athleteId}/location`,
      { latitude: -23.55, longitude: -46.63 },
    );
  });

  it('marks all notifications as read on the athlete-scoped route', async () => {
    await athleteApi.markAllNotificationsRead(athleteId);

    expect(mockedHttp.patch).toHaveBeenCalledWith(`/athletes/${athleteId}/notifications/read-all`);
  });

  it('uploads athlete photos to Supabase Storage and persists the public URL', async () => {
    const result = await athleteApi.uploadPhoto(athleteId, 'file:///tmp/photo.jpg');

    expect(mockedUploadImageToSupabaseStorage).toHaveBeenCalledWith({
      bucket: 'athlete-photos',
      ownerId: athleteId,
      uri: 'file:///tmp/photo.jpg',
    });
    expect(mockedHttp.patch).toHaveBeenCalledWith(
      `/athletes/${athleteId}/photo-url`,
      { photoUrl: 'https://cdn.supabase.test/athlete-photo.jpg' },
    );
    expect(result).toBe('ok');
  });

  it('falls back to the API photo upload when Supabase Storage upload fails', async () => {
    mockedUploadImageToSupabaseStorage.mockRejectedValueOnce(new Error('Bucket not found'));

    const result = await athleteApi.uploadPhoto(athleteId, 'file:///tmp/photo.jpg');

    expect(mockedHttp.patch).toHaveBeenCalledWith(
      `/athletes/${athleteId}/photo`,
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    expect(result).toBe('ok');
  });
});
