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
import Legal from './pages/Legal';
import { ToastProvider } from './components/Toast';
import { UserProvider } from './contexts/UserContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChatbaseIntegrator } from './components/ChatbaseIntegrator';

import { useUser } from './contexts/UserContext';
import { Loader2 } from 'lucide-react';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <UserProvider>
          <ChatbaseIntegrator />
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthRedirect />} />
              <Route path="/legal" element={<Legal />} />
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
      <div className="min-h-screen bg-[#0A0F2C] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00D4C8]" size={48} />
      </div>
    );
  }
  return profile ? <Navigate to="/dashboard" replace /> : <Auth />;
}

function DashboardGuard() {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F2C] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00D4C8]" size={48} />
      </div>
    );
  }
  return profile ? <Dashboard /> : <Navigate to="/auth" replace />;
}


