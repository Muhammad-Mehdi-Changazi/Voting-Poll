import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  console.log({ user, loading });


  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
