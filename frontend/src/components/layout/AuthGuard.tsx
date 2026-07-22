import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps protected routes. Redirects unauthenticated users to /login,
 * preserving the attempted URL so they can be redirected back after login.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { session, loading, isDemoMode } = useAuth();
  const location = useLocation();

  // Show nothing while auth state is being determined (avoids flash of login page)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-950">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session && !isDemoMode) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
