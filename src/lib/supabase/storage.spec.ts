import { uploadImageToSupabaseStorage } from './storage';
import { supabase } from './client';

const uploadMock = jest.fn();
const getPublicUrlMock = jest.fn();

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((uri: string) => ({
    uri,
    type: 'image/jpeg',
    base64: jest.fn().mockResolvedValue('aGVsbG8='),
  })),
}));

jest.mock('./client', () => ({
  getSupabaseSessionSafe: jest.fn(),
  supabase: {
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock('../logger', () => ({
  appLogger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  uploadMock.mockResolvedValue({ error: null });
  getPublicUrlMock.mockReturnValue({ data: { publicUrl: 'https://storage.test/photo.jpg' } });
  const { getSupabaseSessionSafe } = require('./client');
  getSupabaseSessionSafe.mockResolvedValue({ user: { id: 'auth-user-1' } });
  (supabase.storage.from as jest.Mock).mockReturnValue({
    upload: uploadMock,
    getPublicUrl: getPublicUrlMock,
  });
});

describe('uploadImageToSupabaseStorage', () => {
  it('uploads React Native files as ArrayBuffer data', async () => {
    const publicUrl = await uploadImageToSupabaseStorage({
      bucket: 'athlete-photos',
      ownerId: 'athlete-1',
      uri: 'file:///cache/photo.jpg',
    });

    const { getSupabaseSessionSafe } = require('./client');
    expect(getSupabaseSessionSafe).toHaveBeenCalled();
    expect(supabase.storage.from).toHaveBeenCalledWith('athlete-photos');
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringMatching(/^auth-user-1\/\d+\.jpg$/),
      expect.any(ArrayBuffer),
      { contentType: 'image/jpeg', upsert: false },
    );
    expect(publicUrl).toBe('https://storage.test/photo.jpg');
  });
});
