import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/authApi';

export function useAuthMutations() {
  const requestPasswordResetMutation = useMutation({
    mutationFn: authApi.requestPasswordReset,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
  });

  return {
    requestPasswordReset: requestPasswordResetMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    requestPasswordResetState: {
      isLoading: requestPasswordResetMutation.isPending,
      isError: requestPasswordResetMutation.isError,
      error: requestPasswordResetMutation.error,
      reset: requestPasswordResetMutation.reset,
    },
    resetPasswordState: {
      isLoading: resetPasswordMutation.isPending,
      isError: resetPasswordMutation.isError,
      error: resetPasswordMutation.error,
      reset: resetPasswordMutation.reset,
    },
  };
}
