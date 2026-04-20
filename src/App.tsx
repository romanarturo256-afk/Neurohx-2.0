/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { ToastProvider } from './components/Toast';
import { UserProvider } from './contexts/UserContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import { useUser } from './contexts/UserContext';
import { Loader2 } from 'lucide-react';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <UserProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthRedirect />} />
              <Route path="/dashboard/*" element={<DashboardGuard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </UserProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function AuthRedirect() {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#9ba9a6] flex items-center justify-center">
        <Loader2 className="animate-spin text-white/50" size={48} />
      </div>
    );
  }
  return profile ? <Navigate to="/dashboard/chat" replace /> : <Auth />;
}

function DashboardGuard() {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#9ba9a6] flex items-center justify-center">
        <Loader2 className="animate-spin text-white/50" size={48} />
      </div>
    );
  }
  return profile ? <Dashboard /> : <Navigate to="/auth" replace />;
}


