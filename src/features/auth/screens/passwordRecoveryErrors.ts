type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

function readAuthError(error: unknown): AuthErrorLike {
  return typeof error === 'object' && error !== null ? (error as AuthErrorLike) : {};
}

export function getResetRequestErrorMessage(error: unknown) {
  const { code, message = '', status } = readAuthError(error);

  if (code === 'over_email_send_rate_limit' || status === 429 || /rate limit/i.test(message)) {
    return 'Muitas tentativas. Aguarde um pouco antes de solicitar outro código.';
  }

  return 'Não foi possível enviar o código agora. Tente novamente.';
}

export function getResetPasswordErrorMessage(error: unknown) {
  const { code, message = '' } = readAuthError(error);

  if (code === 'otp_expired' || /expired|invalid.*otp|token.*invalid/i.test(message)) {
    return 'Código inválido ou expirado. Solicite um novo código e tente novamente.';
  }

  if (code === 'weak_password' || /password/i.test(message)) {
    return 'A nova senha não atende aos requisitos de segurança.';
  }

  return 'Não foi possível redefinir a senha agora. Tente novamente.';
}
