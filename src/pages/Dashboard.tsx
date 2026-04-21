import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Overview from '../components/Overview';
import Chat from '../components/Chat';
import Journal from '../components/Journal';
import Mood from '../components/Mood';
import Assessments from '../components/Assessments';
import HabitTracker from '../components/HabitTracker';
import Settings from '../components/Settings';
import Support from '../components/Support';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="chat" element={<Chat />} />
        <Route path="journal" element={<Journal />} />
        <Route path="mood" element={<Mood />} />
        <Route path="habits" element={<HabitTracker />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="settings" element={<Settings />} />
        <Route path="support" element={<Support />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
