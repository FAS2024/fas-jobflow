import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ApolloClient } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import {
  client,
  refreshToken as apolloRefreshToken,
  silentLogout as apolloLogout,
  isTokenExpired as apolloIsTokenExpired,
} from '../apollo/client';

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  setAccessToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
  logout: () => void;
  client: ApolloClient; 
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  role: null,
  setAccessToken: () => {},
  setRole: () => {},
  logout: () => {},
  client,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [role, setRoleState] = useState<string | null>(null);

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem('token', token);
      try {
        const decoded: { role?: string } = jwtDecode(token);
        if (decoded.role) setRoleState(decoded.role);
      } catch {
        setRoleState(null);
      }
    } else {
      localStorage.removeItem('token');
      setRoleState(null);
    }
  };

  const setRole = (newRole: string | null) => setRoleState(newRole);

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem('refresh_token');
    client.clearStore();
    apolloLogout();
  };

  useEffect(() => {
    const handleTokenRefresh = async () => {
      if (window.location.pathname === '/login') return; // don't refresh on login page
      const token = localStorage.getItem('token');

      if (!token) {
        // No token yet, just stay on landing page
        setAccessTokenState(null);
        setRoleState(null);
        return;
      }

      if (apolloIsTokenExpired(token)) {
        const newToken = await apolloRefreshToken();
        if (newToken) {
          setAccessToken(newToken);
        } else {
          // Refresh failed → log out
          apolloLogout();
        }
      }
    };

    handleTokenRefresh();
    const interval = setInterval(handleTokenRefresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);


  return (
    <AuthContext.Provider
      value={{ accessToken, role, setAccessToken, setRole, logout, client }}
    >
      {children}
    </AuthContext.Provider>
  );
};
