export const logger = {
  error: (...args: any[]) => {
    if (import.meta.env.PROD) {
      // In production, you could send logs to a remote service like Sentry
      // sendToRemoteLoggingService(...args);
    } else {
      // In development, log to console
      console.error(...args);
    }
  },
  info: (...args: any[]) => {
    if (!import.meta.env.PROD) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!import.meta.env.PROD) {
      console.warn(...args);
    }
  },
};
