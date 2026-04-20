import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  limit
} from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Sparkles, 
  Lock, 
  ChevronRight,
  Clock,
  Calendar,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Habits() {
  const { showToast } = useToast();
  const { isPlanAtLeast, profile } = useUser();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<any[]>([]);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(false);

  const canUseHabits = isPlanAtLeast('starter');
  const habitLimit = profile?.plan === 'starter' ? 1 : Infinity;

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'habits'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        const habitsData = snapshot.docs.map(doc => {
          const data = doc.data();
          const completedDates = data.completedDates || [];
          const isCompletedToday = completedDates.includes(today);
          const wasCompletedYesterday = completedDates.includes(yesterday);
          
          // If not completed today AND not completed yesterday, streak is effectively 0
          let displayStreak = data.streak || 0;
          if (!isCompletedToday && !wasCompletedYesterday) {
            displayStreak = 0;
          }

          return { id: doc.id, ...data, displayStreak };
        });
        setHabits(habitsData);
      } catch (err) {
        console.error('Error in habits snapshot:', err);
      }
    }, (err) => console.error('Habits onSnapshot error:', err));

    // Fetch mood history for the chart
    const moodQ = query(
      collection(db, 'users', auth.currentUser.uid, 'moods'),
      orderBy('date', 'asc'),
      limit(7)
    );
    const unsubMood = onSnapshot(moodQ, (snapshot) => {
      try {
        setMoodHistory(snapshot.docs.map(doc => ({
          day: new Date(doc.data().date).toLocaleDateString('en-US', { weekday: 'short' }),
          value: doc.data().value
        })));
      } catch (err) {
        console.error('Error in mood history snapshot:', err);
      }
    }, (err) => console.error('Mood history onSnapshot error:', err));

    return () => {
      unsubscribe();
      unsubMood();
    };
  }, []);

  const toggleHabit = async (habit: any) => {
    if (!auth.currentUser) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      const completedDates = habit.completedDates || [];
      const isCompletedToday = completedDates.includes(today);
      const wasCompletedYesterday = completedDates.includes(yesterday);

      let newDates;
      let newStreak;

      if (isCompletedToday) {
        // Unmarking today
        newDates = completedDates.filter((d: string) => d !== today);
        newStreak = 0; // Streak is broken if not completed today
      } else {
        // Marking today as completed
        newDates = [...completedDates, today];
        newStreak = wasCompletedYesterday ? (habit.streak || 0) + 1 : 1;
      }

      const path = `users/${auth.currentUser.uid}/habits/${habit.id}`;
      await updateDoc(doc(db, path), {
        completedDates: newDates,
        completedToday: !isCompletedToday,
        streak: newStreak
      }).catch(e => handleFirestoreError(e, 'update', path));
      
      if (!isCompletedToday) {
        if (newStreak >= 7) {
          showToast(`Incredible! You've reached a ${newStreak} day streak! Keep that momentum going! 🚀`, 'success');
        } else {
          showToast(`Habit completed! ${newStreak} day streak!`, 'success');
        }
      }
    } catch (error) {
      showToast('Failed to update habit.', 'error');
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim() || !auth.currentUser) return;

    if (!canUseHabits) {
      showToast('Upgrade to Starter to track habits.', 'info');
      navigate('/dashboard/settings');
      return;
    }

    if (habits.length >= habitLimit) {
      showToast(`Habit limit reached for ${profile?.plan} plan.`, 'info');
      navigate('/dashboard/settings');
      return;
    }

    setLoading(true);
    try {
      const path = `users/${auth.currentUser.uid}/habits`;
      await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        name: newHabit,
        streak: 0,
        completedToday: false,
        completedDates: [],
        createdAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, 'create', path));
      setNewHabit('');
      setIsAdding(false);
      showToast('Habit added!', 'success');
    } catch (error) {
      showToast('Failed to add habit.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-bold text-[#8b7cf6] uppercase tracking-[0.2em] mb-1">Performance & Wellness</p>
        <h1 className="font-['Syne'] text-4xl font-bold text-[#111110]">Your Progress Journey</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Mood Trends Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-[40px] border border-[#e0dbd0] shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="font-['Syne'] text-2xl font-bold text-[#111110] mb-1">Mood Trends</h3>
                <p className="text-xs text-[#888880] font-bold uppercase tracking-widest">Stability: High (88%)</p>
              </div>
              <div className="px-4 py-1.5 bg-[#f0eeff] text-[#8b7cf6] text-[10px] font-bold rounded-full uppercase tracking-widest">
                Last 7 Days
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodHistory.length > 0 ? moodHistory : [
                  { day: 'MON', value: 3 }, { day: 'TUE', value: 4 }, { day: 'WED', value: 3 },
                  { day: 'THU', value: 5 }, { day: 'FRI', value: 4 }, { day: 'SAT', value: 5 }, { day: 'SUN', value: 4 }
                ]}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b7cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b7cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f2eb" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#888880', fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis hide domain={[1, 5]} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: '1px solid #e0dbd0',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b7cf6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#moodGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Insight Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#8b7cf6] rounded-[40px] p-10 text-white relative overflow-hidden shadow-xl shadow-[#8b7cf6]/20"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">AI Insight Summary</span>
              </div>
              <p className="text-2xl font-['Syne'] font-bold leading-relaxed">
                "Your mood peaks consistently on Thursday mornings after <span className="underline decoration-2 underline-offset-4">deep meditation</span>. Consider shifting your creative work to this window."
              </p>
              <button 
                onClick={() => navigate('/dashboard/mood')}
                className="text-xs font-bold uppercase tracking-widest border-b-2 border-white/30 pb-1 hover:border-white transition-all"
              >
                Explore patterns
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Daily Habits */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[40px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-['Syne'] text-2xl font-bold text-[#111110]">Daily Habits</h3>
              <button className="p-2 bg-[#f0eeff] text-[#8b7cf6] rounded-xl">
                <TrendingUp size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {habits.map((habit) => (
                <motion.div 
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleHabit(habit)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden",
                    habit.completedToday 
                      ? "bg-[#f0eeff] border-[#8b7cf6]/30" 
                      : "bg-[#fcfaf7] border-[#e0dbd0] hover:border-[#8b7cf6]"
                  )}
                >
                  {habit.completedToday && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.1 }}
                      className="absolute inset-0 bg-[#8b7cf6]"
                    />
                  )}
                  <div className="flex items-center gap-4 relative z-10">
                    <motion.div 
                      animate={habit.completedToday ? { 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, 0]
                      } : {}}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        habit.completedToday ? "bg-[#8b7cf6] text-white" : "bg-white border-2 border-[#e0dbd0] text-transparent"
                      )}
                    >
                      <CheckCircle2 size={20} />
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-[#111110] text-sm">{habit.name}</h4>
                      <p className="text-[10px] text-[#888880] font-bold uppercase tracking-widest">10 mins • 08:30 AM</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <motion.p 
                      key={habit.displayStreak}
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-lg font-bold text-[#111110] leading-none"
                    >
                      {habit.displayStreak}
                    </motion.p>
                    <p className="text-[8px] text-[#888880] font-bold uppercase tracking-tighter">Day Streak</p>
                  </div>
                </motion.div>
              ))}
              
              {habits.length === 0 && (
                <div className="text-center py-8 text-[#888880] italic text-sm">
                  No habits added yet.
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-4 bg-[#fcfaf7] border border-[#e0dbd0] text-[#111110] rounded-3xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#f5f2eb] transition-all"
            >
              {!canUseHabits && <Lock size={14} className="text-[#8b7cf6]" />}
              <Plus size={16} />
              Add Habit
            </button>

            <AnimatePresence>
              {isAdding && (
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onSubmit={addHabit}
                  className="mt-4 p-4 bg-white border border-[#8b7cf6] rounded-3xl space-y-4"
                >
                  <input 
                    type="text"
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    placeholder="Habit name..."
                    className="w-full bg-[#fcfaf7] border-none rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#8b7cf6] outline-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="text-xs font-bold text-[#888880]">Cancel</button>
                    <button type="submit" className="text-xs font-bold text-[#8b7cf6]">Add</button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Milestone Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a2e26] rounded-[40px] p-10 text-white relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest mb-2">Mastery Status</p>
              <h3 className="font-['Syne'] text-2xl font-bold mb-4">21 Day Milestone Near</h3>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-[#4ade80] rounded-full" />
              </div>
            </div>
            {/* Abstract Icon */}
            <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <Zap size={120} className="text-[#4ade80]" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
