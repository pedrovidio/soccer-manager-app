import { appLogger } from './logger';

type ErrorHandler = (error: Error, isFatal?: boolean) => void;

const globalWithErrorUtils = globalThis as typeof globalThis & {
  ErrorUtils?: {
    getGlobalHandler?: () => ErrorHandler;
    setGlobalHandler?: (handler: ErrorHandler) => void;
  };
};

const previousHandler = globalWithErrorUtils.ErrorUtils?.getGlobalHandler?.();

globalWithErrorUtils.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
  appLogger.error('[App] Unhandled JS error', error, { isFatal });
  previousHandler?.(error, isFatal);
});

if (typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    appLogger.error('[App] Unhandled promise rejection', event.reason);
  });
}

