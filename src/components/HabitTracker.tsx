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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2b27]" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a2b27] rounded-2xl flex items-center justify-center text-white p-2">
              <RotateCcw size={20} />
            </div>
            <h1 className="font-['Syne'] text-4xl font-bold text-[#1a2b27] uppercase italic">Habit Matrix</h1>
          </div>
          <p className="text-[#4a5a57] font-medium max-w-md">Precision tracking for cognitive and physiological optimization. Consistency is the primary marker of mental resilience.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#2d7a36] text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#2d7a36]/20 hover:opacity-90 transition-all flex items-center justify-center gap-3"
        >
          <Plus size={16} />
          Protocol Initialized
        </button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[40px] p-8 border border-[#1a2b27]/5 shadow-sm space-y-2">
          <p className="text-[10px] font-bold text-[#4a5a57] uppercase tracking-[0.2em]">Active Protocols</p>
          <h3 className="text-5xl font-['Playfair_Display'] font-black text-[#1a2b27]">{habits.length}</h3>
        </div>
        <div className="bg-[#1a2b27] rounded-[40px] p-8 text-white space-y-2 shadow-xl shadow-[#1a2b27]/20">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Efficiency Rating</p>
          <h3 className="text-5xl font-['Playfair_Display'] font-black">
            {habits.length > 0 
              ? Math.round((habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length / habits.length) * 100)
              : 0}%
          </h3>
        </div>
        <div className="bg-white rounded-[40px] p-8 border border-[#1a2b27]/5 shadow-sm space-y-2">
          <p className="text-[10px] font-bold text-[#4a5a57] uppercase tracking-[0.2em]">Peak Performance</p>
          <h3 className="text-5xl font-['Playfair_Display'] font-black text-[#1a2b27]">
            {Math.max(0, ...habits.map(h => h.streak))} <span className="text-sm font-sans font-bold uppercase tracking-widest text-[#4a5a57]">Days</span>
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
                className="bg-white border border-[#1a2b27]/10 rounded-[32px] overflow-hidden group hover:border-[#1a2b27]/30 transition-all flex flex-col h-full"
              >
                <div className="p-8 flex items-start justify-between">
                  <div className="flex gap-5">
                    <div className={cn(
                      "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all",
                      isCompletedToday ? "bg-[#1a2b27] text-white" : "bg-[#f0f4f3] text-[#1a2b27]"
                    )}>
                      <HabitIcon size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl text-[#1a2b27]">{habit.title}</h3>
                      <p className="text-xs text-[#4a5a57] font-medium opacity-60 leading-relaxed max-w-[200px]">{habit.description || 'No system details provided.'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <button 
                      onClick={() => toggleHabit(habit)}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        isCompletedToday 
                          ? "bg-[#2d7a36]/10 text-[#2d7a36] shadow-sm transform scale-110" 
                          : "bg-[#f0f4f3] text-[#1a2b27] hover:bg-[#1a2b27] hover:text-white"
                      )}
                    >
                      {isCompletedToday ? <Check size={24} /> : <Plus size={24} />}
                    </button>
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="text-[#4a5a57]/40 hover:text-red-500 transition-colors"
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
                        <span className="text-[10px] font-bold text-[#4a5a57]/40 uppercase tracking-widest">Streak</span>
                        <div className="flex items-center gap-1 mt-1 text-[#1a2b27]">
                          <Flame size={14} className="text-orange-500" fill="currentColor" />
                          <span className="font-bold text-lg leading-none">{habit.streak}</span>
                        </div>
                      </div>
                      <div className="w-[1px] bg-[#1a2b27]/10" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#4a5a57]/40 uppercase tracking-widest">Frequency</span>
                        <div className="flex items-center gap-1 mt-1 text-[#1a2b27]">
                          <RotateCcw size={14} className="opacity-40" />
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
                            stroke={habit.color} 
                            strokeWidth={3} 
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Week Heatmap */}
                  <div className="pt-6 border-t border-[#1a2b27]/5">
                    <div className="flex justify-between items-center text-[9px] font-bold text-[#4a5a57]/40 uppercase tracking-widest mb-3">
                      <span>Protocol History (7D)</span>
                      <span>{Math.round((weekData.filter(d => d.completed).length / 7) * 100)}% Consistency</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#f0f4f3]/50 p-2 rounded-2xl">
                      {weekData.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                          <span className="text-[8px] font-black opacity-30">{day.name[0]}</span>
                          <div className={cn(
                            "w-full h-1.5 rounded-full",
                            day.completed ? "bg-[#2d7a36]" : "bg-black/5"
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
            <div className="w-24 h-24 bg-[#f0f4f3] rounded-[32px] flex items-center justify-center text-[#1a2b27]/20">
              <Activity size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-2xl text-[#1a2b27] uppercase italic tracking-tight">No Protocols Active</h3>
              <p className="text-[#4a5a57] max-w-xs mx-auto">Define your first physiological or cognitive optimization protocol to begin tracking.</p>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="text-[#1a2b27] font-bold border-b-2 border-[#1a2b27] pb-1 hover:opacity-70 transition-opacity"
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
              className="absolute inset-0 bg-[#1a2b27]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl p-10 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-['Syne'] text-2xl font-bold text-[#1a2b27] uppercase italic">Habit Entry</h2>
                  <p className="text-xs text-[#4a5a57] font-medium opacity-60">Specify optimization protocol parameters.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-10 h-10 rounded-full bg-[#f0f4f3] flex items-center justify-center text-[#1a2b27] hover:bg-[#1a2b27] hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddHabit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4a5a57]/60 uppercase tracking-[0.2em] ml-2">Protocol Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Circadian Realignment"
                      value={newHabit.title}
                      onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                      className="w-full bg-[#f0f4f3] border-none rounded-3xl p-6 text-[#1a2b27] font-bold focus:ring-2 focus:ring-[#1a2b27] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4a5a57]/60 uppercase tracking-[0.2em] ml-2">Objective Detail</label>
                    <textarea 
                      placeholder="Specify the target physiological state..."
                      value={newHabit.description}
                      onChange={e => setNewHabit({...newHabit, description: e.target.value})}
                      className="w-full bg-[#f0f4f3] border-none rounded-3xl p-6 text-[#1a2b27] font-medium focus:ring-2 focus:ring-[#1a2b27] transition-all resize-none h-32"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#4a5a57]/60 uppercase tracking-[0.2em] ml-2">Frequency</label>
                      <select 
                        value={newHabit.frequency}
                        onChange={e => setNewHabit({...newHabit, frequency: parseInt(e.target.value)})}
                        className="w-full bg-[#f0f4f3] border-none rounded-3xl p-6 text-[#1a2b27] font-bold focus:ring-2 focus:ring-[#1a2b27] transition-all"
                      >
                        {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}x / Day</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#4a5a57]/60 uppercase tracking-[0.2em] ml-2">Indicator Icon</label>
                      <div className="flex gap-2 flex-wrap bg-[#f0f4f3] p-4 rounded-3xl">
                        {ICONS.map(i => (
                          <button
                            key={i.name}
                            type="button"
                            onClick={() => setNewHabit({...newHabit, icon: i.name})}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                              newHabit.icon === i.name ? "bg-[#1a2b27] text-white" : "text-[#1a2b27]/40 hover:bg-black/5"
                            )}
                          >
                            <i.icon size={18} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4a5a57]/60 uppercase tracking-[0.2em] ml-2">Visual Mapping</label>
                    <div className="flex gap-3 bg-[#f0f4f3] p-4 rounded-3xl">
                      {COLORS.map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setNewHabit({...newHabit, color: c.value})}
                          className={cn(
                            "w-10 h-10 rounded-xl transition-all border-4",
                            newHabit.color === c.value ? "border-black/10 scale-110" : "border-transparent opacity-60"
                          )}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#1a2b27] text-white py-6 rounded-[32px] font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:opacity-90 transition-all"
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
