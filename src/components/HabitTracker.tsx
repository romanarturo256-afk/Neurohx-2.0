import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  ChevronRight, 
  Flame, 
  Calendar, 
  Trash2, 
  MoreVertical,
  Activity,
  Award,
  Zap,
  RotateCcw,
  PlusCircle,
  X,
  Target
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip 
} from 'recharts';

interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  frequency: number;
  streak: number;
  lastCompleted?: string;
  completedDates: string[];
  createdAt: any;
  updatedAt?: any;
}

const COLORS = [
  { name: 'Emerald', value: '#2d7a36', bg: 'bg-[#2d7a36]/10', text: 'text-[#2d7a36]' },
  { name: 'Amethyst', value: '#8b7cf6', bg: 'bg-[#8b7cf6]/10', text: 'text-[#8b7cf6]' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
  { name: 'Rose', value: '#e11d48', bg: 'bg-[#e11d48]/10', text: 'text-[#e11d48]' },
  { name: 'Sky', value: '#0ea5e9', bg: 'bg-[#0ea5e9]/10', text: 'text-[#0ea5e9]' },
];

const ICONS = [
  { name: 'Target', icon: Target },
  { name: 'Flame', icon: Flame },
  { name: 'Zap', icon: Zap },
  { name: 'Activity', icon: Activity },
  { name: 'Award', icon: Award },
];

export default function HabitTracker() {
  const { profile } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    frequency: 1,
    color: '#2d7a36',
    icon: 'Target'
  });

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'users', profile.uid, 'habits')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];
      setHabits(habitsData);
      setLoading(false);
    }, (err) => {
      console.error('HabitTracker snapshot error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const toggleHabit = async (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates.includes(today);

    let newCompletedDates = [...habit.completedDates];
    let newStreak = habit.streak;

    if (isCompletedToday) {
      newCompletedDates = newCompletedDates.filter(d => d !== today);
      // Simple streak decrement (not perfect history matching but works for basic UI)
      newStreak = Math.max(0, newStreak - 1);
    } else {
      newCompletedDates.push(today);
      
      // Calculate streak
      const lastDate = habit.lastCompleted;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else if (!lastDate || lastDate < yesterdayStr) {
        newStreak = 1;
      }
    }

    try {
      await updateDoc(doc(db, 'users', profile!.uid, 'habits', habit.id), {
        completedDates: newCompletedDates,
        streak: newStreak,
        lastCompleted: today,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Error toggling habit:', e);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.title || !profile?.uid) return;

    try {
      await addDoc(collection(db, 'users', profile.uid, 'habits'), {
        userId: profile.uid,
        ...newHabit,
        streak: 0,
        completedDates: [],
        createdAt: serverTimestamp()
      });
      setNewHabit({
        title: '',
        description: '',
        frequency: 1,
        color: '#2d7a36',
        icon: 'Target'
      });
      setIsAdding(false);
    } catch (e) {
      console.error('Error adding habit:', e);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!profile?.uid) return;
    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'habits', id));
    } catch (e) {
      console.error('Error deleting habit:', e);
    }
  };

  const getWeekData = (habit: Habit) => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: habit.completedDates.includes(dateStr) ? 1 : 0
      });
    }
    return data;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4C8]" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 space-y-12 text-[#F0F4FF]">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#00D4C8] p-2">
              <RotateCcw size={20} />
            </div>
            <h1 className="font-['Syne'] text-4xl font-bold text-white uppercase italic">Habit Matrix</h1>
          </div>
          <p className="text-[#A0A5C0] font-medium max-w-md">Precision tracking for cognitive and physiological optimization. Consistency is the primary marker of mental resilience.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#00D4C8] text-[#0A0F2C] px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#00D4C8]/10 hover:bg-[#00bdae] transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Plus size={16} />
          Protocol Initialized
        </button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.05] rounded-[40px] p-8 border border-white/10 shadow-sm space-y-2 backdrop-blur-xl">
          <p className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-[0.2em]">Active Protocols</p>
          <h3 className="text-5xl font-['Syne'] font-black text-white">{habits.length}</h3>
        </div>
        <div className="bg-gradient-to-br from-[#0D1B4B] to-[#0A0F2C] rounded-[40px] p-8 border border-[#00D4C8]/20 text-white space-y-2 shadow-xl shadow-[#00D4C8]/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4C8] rounded-full blur-[80px] opacity-10 pointer-events-none" />
          <p className="text-[10px] font-bold text-[#00D4C8] uppercase tracking-[0.2em]">Efficiency Rating</p>
          <h3 className="text-5xl font-['Syne'] font-black">
            {habits.length > 0 
              ? Math.round((habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length / habits.length) * 100)
              : 0}%
          </h3>
        </div>
        <div className="bg-white/[0.05] rounded-[40px] p-8 border border-white/10 shadow-sm space-y-2 backdrop-blur-xl">
          <p className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-[0.2em]">Peak Performance</p>
          <h3 className="text-5xl font-['Syne'] font-black text-white">
            {Math.max(0, ...habits.map(h => h.streak))} <span className="text-sm font-sans font-bold uppercase tracking-widest text-[#A0A5C0]">Days</span>
          </h3>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => {
            const today = new Date().toISOString().split('T')[0];
            const isCompletedToday = habit.completedDates.includes(today);
            const HabitIcon = ICONS.find(i => i.name === habit.icon)?.icon || Target;
            const weekData = getWeekData(habit);

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/[0.05] border border-white/10 rounded-[32px] overflow-hidden group hover:border-[#00D4C8]/40 transition-all flex flex-col h-full backdrop-blur-xl"
              >
                <div className="p-8 flex items-start justify-between">
                  <div className="flex gap-5">
                    <div className={cn(
                      "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all border",
                      isCompletedToday 
                        ? "bg-[#00D4C8] border-[#00D4C8] text-[#0A0F2C]" 
                        : "bg-white/5 border-white/10 text-[#00D4C8]"
                    )}>
                      <HabitIcon size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl text-white">{habit.title}</h3>
                      <p className="text-xs text-[#A0A5C0] font-medium opacity-60 leading-relaxed max-w-[200px]">{habit.description || 'No system details provided.'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleHabit(habit)}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer border-2",
                        isCompletedToday 
                          ? "bg-[#00D4C8]/10 text-[#00D4C8] border-[#00D4C8]/30 shadow-md transform scale-110" 
                          : "bg-white/5 text-white/50 border-white/10 hover:bg-[#00D4C8] hover:text-[#0A0F2C] hover:border-[#00D4C8]"
                      )}
                    >
                      {isCompletedToday ? <Check size={24} /> : <Plus size={24} />}
                    </button>
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
                      title="Delete Protocol"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="px-8 pb-8 flex-1 flex flex-col justify-end gap-6">
                  {/* Streak & Info */}
                  <div className="flex items-center gap-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest">Streak</span>
                        <div className="flex items-center gap-1 mt-1 text-white">
                          <Flame size={14} className="text-orange-500" fill="currentColor" />
                          <span className="font-bold text-lg leading-none">{habit.streak}</span>
                        </div>
                      </div>
                      <div className="w-[1px] bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest">Frequency</span>
                        <div className="flex items-center gap-1 mt-1 text-white">
                          <RotateCcw size={14} className="text-[#00D4C8] opacity-60" />
                          <span className="font-bold text-lg leading-none">{habit.frequency}x</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 h-8 bg-transparent">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weekData}>
                          <Line 
                            type="stepAfter" 
                            dataKey="completed" 
                            stroke="#00D4C8" 
                            strokeWidth={3} 
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Week Heatmap */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center text-[9px] font-bold text-[#A0A5C0] uppercase tracking-widest mb-3">
                      <span>Protocol History (7D)</span>
                      <span>{Math.round((weekData.filter(d => d.completed).length / 7) * 100)}% Consistency</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/5">
                      {weekData.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                          <span className="text-[8px] font-black text-white/40">{day.name[0]}</span>
                          <div className={cn(
                            "w-1/2 h-1.5 rounded-full transition-all",
                            day.completed ? "bg-[#00D4C8] shadow-[0_0_8px_rgba(0,212,200,0.6)]" : "bg-white/10"
                          )} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {habits.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center text-[#A0A5C0]">
              <Activity size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-2xl text-white uppercase italic tracking-tight">No Protocols Active</h3>
              <p className="text-[#A0A5C0] max-w-xs mx-auto">Define your first physiological or cognitive optimization protocol to begin tracking.</p>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="text-[#00D4C8] font-bold border-b-2 border-[#00D4C8] pb-1 hover:opacity-70 transition-opacity cursor-pointer"
            >
              Initialize protocol
            </button>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-[#0A0F2C]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0D1B4B]/95 border border-white/10 rounded-[48px] shadow-2xl p-10 space-y-8 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-['Syne'] text-2xl font-bold text-white uppercase italic">Protocol Entry</h2>
                  <p className="text-xs text-[#A0A5C0] font-medium opacity-60">Specify optimization protocol parameters.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-10 h-10 rounded-full bg-white/5 text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer border border-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddHabit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Protocol Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Circadian Realignment"
                      value={newHabit.title}
                      onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold focus:ring-2 focus:ring-[#00D4C8] focus:border-[#00D4C8] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Objective Detail</label>
                    <textarea 
                      placeholder="Specify the target physiological state..."
                      value={newHabit.description}
                      onChange={e => setNewHabit({...newHabit, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-medium focus:ring-2 focus:ring-[#00D4C8] focus:border-[#00D4C8] outline-none transition-all resize-none h-32"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Frequency</label>
                      <select 
                        value={newHabit.frequency}
                        onChange={e => setNewHabit({...newHabit, frequency: parseInt(e.target.value)})}
                        className="w-full bg-[#0D1B4B] border border-white/10 rounded-3xl p-6 text-white font-bold focus:ring-2 focus:ring-[#00D4C8] focus:border-[#00D4C8] outline-none transition-all"
                      >
                        {[1,2,3,4,5,6,7].map(n => <option key={n} value={n} className="bg-[#0D1B4B]">{n}x / Day</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Indicator Icon</label>
                      <div className="flex gap-2 flex-wrap bg-white/5 border border-white/10 p-4 rounded-3xl">
                        {ICONS.map(i => (
                          <button
                            key={i.name}
                            type="button"
                            onClick={() => setNewHabit({...newHabit, icon: i.name})}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                              newHabit.icon === i.name ? "bg-[#00D4C8] text-[#0A0F2C]" : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <i.icon size={18} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Visual Mapping</label>
                    <div className="flex gap-3 bg-white/5 border border-white/10 p-4 rounded-3xl">
                      {COLORS.map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setNewHabit({...newHabit, color: c.value})}
                          className={cn(
                            "w-10 h-10 rounded-xl transition-all border-4 cursor-pointer",
                            newHabit.color === c.value ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-transparent opacity-60"
                          )}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#00D4C8] text-[#0A0F2C] py-6 rounded-[32px] font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#00D4C8]/10 hover:bg-[#00C4B8] active:scale-95 transition-all cursor-pointer"
                >
                  Confirm Strategy
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
