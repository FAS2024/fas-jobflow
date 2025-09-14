import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode; 
  allowedRoles?: string[]; 
}

export const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { accessToken, role } = useContext(AuthContext);

  if (!accessToken) return <Navigate to="/login" replace />;

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    // Redirect based on actual role
    if (role === 'SUPERVISOR') return <Navigate to="/admin" replace />;
    if (role === 'REQUESTER' || role === 'RESOLVER') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
