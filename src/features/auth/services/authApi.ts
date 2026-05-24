import {
  LoginPayload,
  LoginResponse,
  PasswordResetResponse,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
} from '../authTypes';
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

  requestPasswordReset: async (payload: RequestPasswordResetPayload): Promise<PasswordResetResponse> => {
    const { error } = await supabase.auth.resetPasswordForEmail(payload.email);
    if (error) throw error;

    return { success: true };
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<PasswordResetResponse> => {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: payload.email,
      token: payload.tokenOrCode,
      type: 'recovery',
    });
    if (verifyError) throw verifyError;
    if (!data.session) throw new Error('Recovery session was not created');

    const { error: updateError } = await supabase.auth.updateUser({ password: payload.newPassword });
    if (updateError) throw updateError;

    return { success: true };
  },
};
