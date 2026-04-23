import React, { useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { useToast } from './Toast';
import { Brain, Star, Clock, Wind, Book, BarChart2 } from 'lucide-react';

export default function SmartReminders() {
  const { profile } = useUser();
  const { showToast } = useToast();
  const nudgedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!profile?.uid || !profile?.settings?.notifications?.smartReminders?.enabled) return;

    const smartSettings = profile.settings.notifications.smartReminders;
    const today = new Date().toISOString().split('T')[0];

    // Helper to check if nudged today
    const checkNudge = (key: string) => {
      const lastNudge = localStorage.getItem(`nudge_${key}`);
      return lastNudge === today;
    };

    const setNudge = (key: string) => {
      localStorage.setItem(`nudge_${key}`, today);
      nudgedRef.current.add(key);
    };

    // --- PROACTIVE DAILY CHECKS ---
    const runProactiveChecks = async () => {
      if (!profile?.uid) return;

      // 1. Daily Mood Check-In
      if (!checkNudge('mood')) {
        const moodQ = query(
          collection(db, 'users', profile.uid, 'moods'),
          where('date', '==', today),
          limit(1)
        );
        const moodSnap = await getDocs(moodQ);
        if (moodSnap.empty) {
          showToast("Daily Baseline: You haven't tracked your mood yet today. Technical self-awareness is key to growth.", 'info');
          setNudge('mood');
        }
      }

      // 2. Journal Reflection (Evening Focus)
      const hour = new Date().getHours();
      if (hour >= 18 && !checkNudge('journal_evening')) {
        const journalQ = query(
          collection(db, 'users', profile.uid, 'journals'),
          where('date', '==', today),
          limit(1)
        );
        const journalSnap = await getDocs(journalQ);
        if (journalSnap.empty) {
          showToast("Evening Reflection: A neural unload via journaling is recommended before sleep to improve cognitive recovery.", 'info');
          setNudge('journal_evening');
        }
      }

      // 3. Morning Breathing
      if (hour >= 6 && hour <= 10 && !checkNudge('breathing_morning')) {
        showToast("Morning Pneuma: Start your day with a 60s breathing cycle to calibrate your autonomic nervous system.", 'info');
        setNudge('breathing_morning');
      }
    };

    // Run proactive checks on mount
    runProactiveChecks();

    // --- REACTIVE LISTENERS ---
    
    // 1. Clinical Red Flags (Assessment Nudges)
    let assessmentUnsubscribe: (() => void) | undefined;
    if (smartSettings.assessmentNudges) {
      const q = query(
        collection(db, 'users', profile.uid, 'assessments'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      assessmentUnsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latest = snapshot.docs[0].data();
          // Logic for PHQ-9 (ID: phq9) or GAD-7 (ID: gad7)
          if ((latest.assessmentId === 'phq9' || latest.assessmentId === 'gad7') && latest.score >= 10) {
            // Only nudge if recently completed (within last 24h)
            const createdAt = latest.createdAt instanceof Timestamp ? latest.createdAt.toDate() : new Date(latest.createdAt);
            const timeDiff = Date.now() - createdAt.getTime();
            if (timeDiff < 24 * 60 * 60 * 1000) {
              showToast(
                `Smart Nudge: Your recent ${latest.assessmentId.toUpperCase()} score suggests moderate levels. Consider a guided breathing session.`, 
                'info'
              );
            }
          }
        }
      });
    }

    // 3. Journaling Gaps
    let journalUnsubscribe: (() => void) | undefined;
    if (smartSettings.journalNudges) {
      const q = query(
        collection(db, 'users', profile.uid, 'journals'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      journalUnsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latest = snapshot.docs[0].data();
          const createdAt = latest.createdAt instanceof Timestamp ? latest.createdAt.toDate() : new Date(latest.createdAt);
          const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince > 3) {
            showToast("Smart Reminder: It's been 3 days since your last reflection. Neural unloading via journaling is highly recommended today.", 'info');
          }
        }
      });
    }

    // 2. Mood-based Nudges
    let moodUnsubscribe: (() => void) | undefined;
    if (smartSettings.enabled) {
      const q = query(
        collection(db, 'users', profile.uid, 'moods'),
        orderBy('date', 'desc'),
        limit(1)
      );

      moodUnsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latest = snapshot.docs[0].data();
          if (latest.value <= 2) {
            showToast("Smart Nudge: We noticed your mood is a bit low. Reflecting in your journal might help process these feelings.", 'info');
          }
        }
      });
    }

    // 4. Inactivity Detection (Breathing Exercise)
    let inactivityTimer: any;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        showToast("Smart Nudge: You've been focused for a while. A 60-second Pneuma breathing session could help reset your nervous system.", 'info');
      }, 300000); // 5 minutes of inactivity
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      assessmentUnsubscribe?.();
      moodUnsubscribe?.();
      journalUnsubscribe?.();
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [profile?.uid, profile?.settings?.notifications?.smartReminders]);

  return null; // Logic only component
}
