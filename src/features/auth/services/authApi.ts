import { LoginPayload, LoginResponse } from '../authTypes';
import { supabase } from '@lib/supabase';

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword(payload);
    if (error) throw error;
    if (!data.session || !data.user) throw new Error('Supabase session was not created');

    return {
      token: data.session.access_token,
      athleteId: data.user.id,
      name: data.user.user_metadata?.['name'] ?? data.user.email ?? '',
    };
  },

  signUp: async (payload: LoginPayload & { name: string }): Promise<LoginResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: { data: { name: payload.name } },
    });
    if (error) throw error;
    if (!data.session || !data.user) {
      throw new Error('Confirme seu e-mail antes de concluir o cadastro.');
    }

    return {
      token: data.session.access_token,
      athleteId: data.user.id,
      name: payload.name,
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
    return null;
  },
};
