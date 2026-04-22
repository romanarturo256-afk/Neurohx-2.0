import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  Timestamp,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { Users, Activity, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RealTimeStatus() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalSignedUp, setTotalSignedUp] = useState(0);
  const [activeList, setActiveList] = useState<{ uid: string, displayName: string }[]>([]);

  // 1. Presence Update Loop
  useEffect(() => {
    if (!auth.currentUser) return;

    const updatePresence = async () => {
      try {
        await setDoc(doc(db, 'presence', auth.currentUser!.uid), {
          uid: auth.currentUser!.uid,
          displayName: auth.currentUser!.displayName || 'Anonymous User',
          lastActive: serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.error('Failed to update presence:', err);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  // 2. Statistics Listeners
  useEffect(() => {
    // Total Signed Up
    const statsUnsubscribe = onSnapshot(doc(db, 'system', 'stats'), (doc) => {
      if (doc.exists()) {
        setTotalSignedUp(doc.data().totalSignedUp || 0);
      }
    });

    // Active Users (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const presenceQuery = query(
      collection(db, 'presence'),
      where('lastActive', '>=', Timestamp.fromDate(fiveMinutesAgo))
    );

    const presenceUnsubscribe = onSnapshot(presenceQuery, (snapshot) => {
      setActiveUsers(snapshot.size);
      const list = snapshot.docs.map(doc => ({
        uid: doc.id,
        displayName: doc.data().displayName
      }));
      setActiveList(list);
    });

    return () => {
      statsUnsubscribe();
      presenceUnsubscribe();
    };
  }, []);

  return (
    <div className="bg-[#1a2b27]/5 backdrop-blur-sm rounded-3xl p-6 border border-[#1a2b27]/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2d7a36]/10 flex items-center justify-center text-[#2d7a36]">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#1a2b27]/40 uppercase tracking-widest">Global Community</p>
            <h4 className="font-['Syne'] font-bold text-[#1a2b27]">Network Pulse</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/40 rounded-2xl p-4 border border-[#1a2b27]/5">
          <p className="text-[10px] font-bold text-[#1a2b27]/40 uppercase tracking-widest mb-1">Signed Up</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-['Syne'] font-bold text-[#1a2b27]">{totalSignedUp}</span>
          </div>
        </div>

        <div className="bg-white/40 rounded-2xl p-4 border border-[#1a2b27]/5 relative overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-[#2d7a36]/10 rounded-full">
            <Circle size={4} className="fill-[#2d7a36] text-[#2d7a36] animate-pulse" />
            <span className="text-[8px] font-bold text-[#2d7a36] uppercase tracking-tighter">Live</span>
          </div>
          <p className="text-[10px] font-bold text-[#1a2b27]/40 uppercase tracking-widest mb-1">Active Now</p>
          <span className="text-2xl font-['Syne'] font-bold text-[#1a2b27]">{activeUsers}</span>
        </div>
      </div>

      {/* Mini Active Avatars */}
      <div className="flex items-center gap-1.5 px-1 overflow-x-auto no-scrollbar py-1">
        <AnimatePresence>
          {activeList.slice(0, 5).map((user, i) => (
            <motion.div
              key={user.uid}
              initial={{ scale: 0, x: -10 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-8 h-8 rounded-full border-2 border-white bg-[#1a2b27] flex items-center justify-center text-[10px] font-bold text-white uppercase"
              title={user.displayName}
            >
              {user.displayName.substring(0, 1)}
            </motion.div>
          ))}
        </AnimatePresence>
        {activeUsers > 5 && (
          <div className="text-[10px] font-bold text-[#1a2b27]/40 pl-2">
            +{activeUsers - 5}
          </div>
        )}
      </div>
    </div>
  );
}
