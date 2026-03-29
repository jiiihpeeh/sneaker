const DEBUG = process.env.LOGGER === "debug";

const _log = (namespace: string, message: string, ...args: unknown[]): void => {
  if (DEBUG) {
    console.log(`[${namespace}] ${message}`, ...args);
  }
};

type DebugFn = (message: string, ...args: unknown[]) => void;

export const debug: Record<string, DebugFn> = {
  outgoing: (message: string, ...args: unknown[]) => _log("outgoing", message, ...args),
  cache: (message: string, ...args: unknown[]) => _log("cache", message, ...args),
  rateLimit: (message: string, ...args: unknown[]) => _log("rate-limit", message, ...args),
  engines: (message: string, ...args: unknown[]) => _log("engines", message, ...args),
};
