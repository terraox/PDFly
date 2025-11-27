import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  
  // 1. If loading state is still true (checking localStorage), show a loader.
  if (loading) {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white dark:text-zinc-400">
            Checking Authentication...
        </div>
    );
  }

  // 2. If loading is false AND not authenticated, redirect to login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If loading is false AND authenticated, render the child route component
  // We return just the Outlet (the Profile page itself)
  return <Outlet />;
}