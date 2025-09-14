import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// Landing page redirect logic
const LandingRedirect = () => {
  const { accessToken } = useContext(AuthContext);
  return accessToken ? <Navigate to="/dashboard" replace /> : <Landing />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Landing / root */}
          <Route path="/" element={<LandingRedirect />} />

          {/* Dashboard for all authenticated users */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Admin panel for SUPERVISOR only */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['SUPERVISOR']}>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          {/* Unknown routes fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
