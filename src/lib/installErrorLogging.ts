import { appLogger } from './logger';

type ErrorHandler = (error: Error, isFatal?: boolean) => void;

const globalWithErrorUtils = globalThis as typeof globalThis & {
  ErrorUtils?: {
    getGlobalHandler?: () => ErrorHandler;
    setGlobalHandler?: (handler: ErrorHandler) => void;
  };
};

const previousHandler = globalWithErrorUtils.ErrorUtils?.getGlobalHandler?.();

function isKeepAwakeActivationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message.includes('Unable to activate keep awake');
}

globalWithErrorUtils.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
  if (isKeepAwakeActivationError(error)) {
    appLogger.warn('[App] Ignoring non-fatal Expo keep-awake activation error', { isFatal });
    return;
  }

  appLogger.error('[App] Unhandled JS error', error, { isFatal });
  previousHandler?.(error, isFatal);
});

if (typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (isKeepAwakeActivationError(event.reason)) {
      event.preventDefault?.();
      appLogger.warn('[App] Ignoring non-fatal Expo keep-awake promise rejection');
      return;
    }

    appLogger.error('[App] Unhandled promise rejection', event.reason);
  });
}
