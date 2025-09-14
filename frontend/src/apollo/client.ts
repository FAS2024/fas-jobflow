import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { jwtDecode } from 'jwt-decode';
import type { GraphQLError } from 'graphql';
import { logger } from '../utils/logger';

// --- GraphQL API ---
const GRAPHQL_API = import.meta.env.VITE_API_URL;
if (!GRAPHQL_API) throw new Error('VITE_API_URL must be defined in .env');

// --- Token refresh state ---
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

// --- JWT decode type ---
interface JwtPayload {
  exp: number;
  [key: string]: any;
}

// --- Exponential backoff ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Silent logout ---
const silentLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  // Optionally clear app state/store here
  window.location.href = '/login';
};

// --- Dev-only logger ---
const devLog = (...args: any[]) => {
  if (import.meta.env.MODE === 'development') {
    logger.info(...args);
  }
};

// --- Refresh token helper with dev-only logging ---
export const refreshToken = async (
  attempt = 1,
  maxAttempts = 3
): Promise<string | null> => {
  if (isRefreshing) {
    devLog('[Auth] Token refresh already in progress, queueing request.');
    return new Promise(resolve =>
      pendingRequests.push(() => resolve(null)) // resolve later with new token
    );
  }

  isRefreshing = true;
  devLog('[Auth] Refreshing token via HttpOnly cookie...');

  try {
    const res = await fetch(`${GRAPHQL_API.replace('/graphql','')}/refresh-token`, {
      method: 'POST',
      credentials: 'include', // sends HttpOnly cookie automatically
    });

    const data = await res.json();
    const newToken = data?.access_token ?? null;
    if (!newToken) throw new Error('No access token returned');

    // Resolve pending requests with the new token
    pendingRequests.forEach(cb => cb(newToken));
    pendingRequests = [];

    devLog('[Auth] Token refreshed successfully.');
    return newToken;
  } catch (err) {
    devLog('[Auth] Token refresh failed:', err);

    if (attempt < maxAttempts) {
      const backoff = Math.pow(2, attempt) * 500;
      devLog(`[Auth] Retrying token refresh in ${backoff}ms (attempt ${attempt + 1})`);
      await delay(backoff);
      return refreshToken(attempt + 1, maxAttempts);
    }

    pendingRequests.forEach(cb => cb(null));
    pendingRequests = [];
    devLog('[Auth] Max refresh attempts reached. Logging out.');
    silentLogout();
    return null;
  } finally {
    isRefreshing = false;
  }
};


// --- Check if token expired ---
export const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

// --- Auth link (concurrency-safe with setContext) ---
const authLink = setContext(async (_, { headers }) => {
  let token = localStorage.getItem('token');

  if (isTokenExpired(token)) {
    token = await refreshToken();
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// --- Error link ---
const errorLink = onError(
  (error: {
    graphQLErrors?: readonly GraphQLError[];
    networkError?: Error | null;
    response?: any;
    operation?: any;
    forward?: any;
  }) => {
    const { graphQLErrors, networkError } = error;

    if (graphQLErrors?.length) {
      graphQLErrors.forEach((err: GraphQLError) => {
        const code = (err.extensions as Record<string, any>)?.code;
        if (code === 'UNAUTHENTICATED') {
          devLog('[Auth] GraphQL returned UNAUTHENTICATED, logging out.');
          silentLogout();
        } else {
          devLog('[GraphQL error]:', err.message);
        }
      });
    }

    if (networkError) {
      devLog('[Network error]:', networkError);
    }
  }
);

// --- HTTP link ---
const httpLink = createHttpLink({
  uri: GRAPHQL_API,
  credentials: 'include',
});

// --- Retry link ---
const retryLink = new RetryLink({
  attempts: { max: 3, retryIf: error => !!error },
  delay: { initial: 300, max: 2000, jitter: true },
});

// --- Apollo Client ---
export const client = new ApolloClient({
  link: from([errorLink, authLink, retryLink, httpLink]),
  cache: new InMemoryCache(),
});


export { silentLogout};
