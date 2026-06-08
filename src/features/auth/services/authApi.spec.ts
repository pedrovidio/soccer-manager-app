import { supabase } from '@lib/supabase';
import { authApi } from './authApi';

jest.mock('@lib/supabase', () => ({
  clearSupabaseAuthSession: jest.fn(),
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      verifyOtp: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

const mockedAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

const session = { access_token: 'token-1' };
const user = {
  id: 'athlete-1',
  email: 'pedro@example.com',
  user_metadata: { name: 'Pedro Ovidio' },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authApi', () => {
  it('creates a Supabase auth user for a new registration', async () => {
    mockedAuth.signUp.mockResolvedValueOnce({ data: { session, user }, error: null } as never);

    const result = await authApi.signUp({
      email: 'pedro@example.com',
      password: 'secret123',
      name: 'Pedro Ovidio',
    });

    expect(mockedAuth.signUp).toHaveBeenCalledWith({
      email: 'pedro@example.com',
      password: 'secret123',
      options: { data: { name: 'Pedro Ovidio' } },
    });
    expect(result).toEqual({
      token: 'token-1',
      athleteId: 'athlete-1',
      name: 'Pedro Ovidio',
      plan: 'FREE',
      planExpiresAt: null,
    });
  });

  it('signs in when registration already created the auth user but athlete registration can continue', async () => {
    mockedAuth.signUp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: new Error('User already registered'),
    } as never);
    mockedAuth.signInWithPassword.mockResolvedValueOnce({ data: { session, user }, error: null } as never);

    const result = await authApi.signUp({
      email: 'pedro@example.com',
      password: 'secret123',
      name: 'Pedro Ovidio',
    });

    expect(mockedAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'pedro@example.com',
      password: 'secret123',
    });
    expect(result.athleteId).toBe('athlete-1');
  });
});
