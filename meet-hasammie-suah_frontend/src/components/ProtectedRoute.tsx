import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Used as a layout route — renders <Outlet> when authenticated
// or redirects to login when not
export const ProtectedRoute: React.FC = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/admin" replace />;
};
