import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BreathingExercise from './BreathingExercise';
import SmartReminders from './SmartReminders';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showBreathing, setShowBreathing] = useState(false);

  useEffect(() => {
    const handleOpen = () => setShowBreathing(true);
    window.addEventListener('open-breathing', handleOpen);
    return () => window.removeEventListener('open-breathing', handleOpen);
  }, []);

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      <SmartReminders />
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
    </div>
  );
}
