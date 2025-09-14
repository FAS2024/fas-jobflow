import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { jwtDecode } from 'jwt-decode';
import type { GraphQLError } from 'graphql';
import { logger } from '../utils/logger';

// --- GraphQL API ---
const GRAPHQL_API = import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql';

// --- Token refresh state ---
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

// --- JWT decode type ---
interface JwtPayload {
  exp: number;
  [key: string]: any;
}

// --- Utility: exponential backoff ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Silent logout (safe) ---
const silentLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// --- Refresh token helper with retry ---
const refreshToken = async (attempt = 1, maxAttempts = 3): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise(resolve =>
      pendingRequests.push(() => resolve(localStorage.getItem('token')))
    );
  }

  const oldRefreshToken = localStorage.getItem('refresh_token');
  if (!oldRefreshToken) {
    silentLogout();
    return null;
  }

  isRefreshing = true;
  try {
    const res = await fetch(GRAPHQL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        query: `
          mutation RefreshToken($token: String!) {
            refreshToken(refreshToken: $token) {
              access_token
              refresh_token
            }
          }
        `,
        variables: { token: oldRefreshToken },
      }),
    });

    const data = await res.json();
    const newToken = data?.data?.refreshToken?.access_token ?? null;
    const newRefreshToken = data?.data?.refreshToken?.refresh_token ?? null;

    if (!newToken || !newRefreshToken) throw new Error('No token returned from refresh');

    localStorage.setItem('token', newToken);
    localStorage.setItem('refresh_token', newRefreshToken);

    pendingRequests.forEach(cb => cb());
    pendingRequests = [];

    return newToken;
  } catch (err) {
    logger.error(`[Auth] Refresh token attempt ${attempt} failed:`, err);

    if (attempt < maxAttempts) {
      await delay(Math.pow(2, attempt) * 500);
      return refreshToken(attempt + 1, maxAttempts);
    }

    pendingRequests.forEach(cb => cb());
    pendingRequests = [];
    silentLogout();
    return null;
  } finally {
    isRefreshing = false;
  }
};

// --- Check if token is expired ---
const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

// --- Auth Link ---
const authLink = setContext(async (_, { headers }) => {
  let token = localStorage.getItem('token');

  // Only refresh if not on login page
  if (window.location.pathname !== '/login' && isTokenExpired(token)) {
    token = await refreshToken();
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// --- Error Link ---
// ---------- error link ----------
export const errorLink: ApolloLink = onError(
  (error: {
    graphQLErrors?: readonly GraphQLError[];
    networkError?: Error | null;
    operation?: any;
    forward?: ((op: any) => any) | null;
  }) => {
    const { graphQLErrors, networkError } = error;

    if (graphQLErrors?.length) {
      graphQLErrors.forEach((err: GraphQLError) => {
        const code = (err.extensions as Record<string, any>)?.code;
        if (code === 'UNAUTHENTICATED') {
          logger.error('[Auth error]: token expired or unauthenticated');
          // Inline logout for production
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          logger.error('[GraphQL error]:', err.message);
        }
      });
    }

    if (networkError) {
      logger.error('[Network error]:', networkError);
    }
  }
);

// const errorLink: ApolloLink = onError(({ graphQLErrors, networkError }) => {
//   if (graphQLErrors?.length) {
//     graphQLErrors.forEach((err: GraphQLError) => {
//       const code = (err.extensions as Record<string, any>)?.code;
//       if (code === 'UNAUTHENTICATED') {
//         logger.error('[Auth error]: token expired or unauthenticated');
//         silentLogout();
//       } else {
//         logger.error('[GraphQL error]:', err.message);
//       }
//     });
//   }

//   if (networkError) {
//     logger.error('[Network error]:', networkError);
//   }
// });

// --- HTTP Link ---
const httpLink = createHttpLink({
  uri: GRAPHQL_API,
  credentials: 'include',
});

// --- Retry Link ---
const retryLink = new RetryLink({
  attempts: { max: 3, retryIf: error => !!error },
  delay: { initial: 300, max: 2000, jitter: true },
});

// --- Apollo Client ---
export const client = new ApolloClient({
  link: from([errorLink, authLink, retryLink, httpLink]),
  cache: new InMemoryCache(),
});

export { refreshToken, silentLogout, isTokenExpired };

