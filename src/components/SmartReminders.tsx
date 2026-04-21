import React, { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { useToast } from './Toast';
import { Brain, Star, Clock } from 'lucide-react';

export default function SmartReminders() {
  const { profile } = useUser();
  const { showToast } = useToast();

  useEffect(() => {
    if (!profile?.uid || !profile?.settings?.notifications?.smartReminders?.enabled) return;

    const smartSettings = profile.settings.notifications.smartReminders;

    // 1. Clinical Red Flags (Assessment Nudges)
    let assessmentUnsubscribe: (() => void) | undefined;
    if (smartSettings.assessmentNudges) {
      const q = query(
        collection(db, 'assessment_results'),
        where('userId', '==', profile.uid),
        orderBy('completedAt', 'desc'),
        limit(1)
      );

      assessmentUnsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latest = snapshot.docs[0].data();
          // Logic for PHQ-9 (ID: phq9) or GAD-7 (ID: gad7)
          if ((latest.assessmentId === 'phq9' || latest.assessmentId === 'gad7') && latest.score >= 10) {
            // Only nudge if recently completed (within last 24h)
            const completedAt = latest.completedAt instanceof Timestamp ? latest.completedAt.toDate() : new Date(latest.completedAt);
            const timeDiff = Date.now() - completedAt.getTime();
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
        collection(db, 'journals'),
        where('userId', '==', profile.uid),
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

    return () => {
      assessmentUnsubscribe?.();
      journalUnsubscribe?.();
    };
  }, [profile?.uid, profile?.settings?.notifications?.smartReminders]);

  return null; // Logic only component
}
