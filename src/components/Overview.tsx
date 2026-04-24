import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  MessageSquare,
  BookOpen,
  TrendingUp,
  Bell,
  LogOut,
  ChevronRight,
  Activity,
  Zap,
  Target,
  Clock,
  ClipboardCheck,
  Flame,
  X,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useUser } from '../contexts/UserContext';
import { auth, db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where, doc, getCountFromServer } from 'firebase/firestore';
import { cn } from '../lib/utils';

const weeklyData = [
  { day: 'MON', activity: 40, mood: 30 },
  { day: 'TUE', activity: 30, mood: 40 },
  { day: 'WED', activity: 20, mood: 35 },
  { day: 'THU', activity: 27, mood: 50 },
  { day: 'FRI', activity: 18, mood: 45 },
  { day: 'SAT', activity: 23, mood: 60 },
  { day: 'SUN', activity: 34, mood: 55 },
];

export default function Overview() {
  const { profile } = useUser();
  const navigate = useNavigate();
  const [recentJournal, setRecentJournal] = useState<any>(null);
  const [recentMood, setRecentMood] = useState<any>(null);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Fetch total signed up
    const fetchTotalUsers = async () => {
      // If admin, we can get the real count directly
      if (profile?.email === 'failfunandmotivation@gmail.com') {
        try {
          const coll = collection(db, 'users');
          const snap = await getCountFromServer(coll);
          setTotalUsers(snap.data().count);
        } catch (err) {
          console.error('Admin failover user count:', err);
        }
      }
    };
    fetchTotalUsers();

    // Fetch total signed up (stats doc) for real-time updates and non-admins
    const unsubStats = onSnapshot(doc(db, 'system', 'stats'), (doc) => {
      if (doc.exists()) {
        const docCount = doc.data().totalSignedUp || 0;
        // If we already set a higher count (from getCountFromServer), keep the higher one
        setTotalUsers(prev => Math.max(prev, docCount));
      }
    });

    // Fetch habits for status
    const habitsQuery = query(
      collection(db, 'users', auth.currentUser.uid, 'habits')
    );
    const unsubHabits = onSnapshot(habitsQuery, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch latest assessment
    const assessmentQuery = query(
      collection(db, 'users', auth.currentUser.uid, 'assessments'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsubAss = onSnapshot(assessmentQuery, (snapshot) => {
      try {
        if (!snapshot.empty) {
          setLatestAssessment(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error('Error in assessment snapshot:', err);
      }
    }, (err) => console.error('Assessment snapshot error:', err));

    // Fetch recent journal
    const journalQuery = query(
      collection(db, 'users', auth.currentUser.uid, 'journals'),
      orderBy('date', 'desc'),
      limit(1)
    );
    const unsubJournal = onSnapshot(journalQuery, (snapshot) => {
      try {
        if (!snapshot.empty) {
          setRecentJournal(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error('Error in journal snapshot:', err);
      }
    }, (err) => console.error('Journal snapshot error:', err));

    // Fetch recent mood
    const moodQuery = query(
      collection(db, 'users', auth.currentUser.uid, 'moods'),
      orderBy('date', 'desc'),
      limit(1)
    );
    const unsubMood = onSnapshot(moodQuery, (snapshot) => {
      try {
        if (!snapshot.empty) {
          setRecentMood(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error('Error in mood snapshot:', err);
      }
    }, (err) => console.error('Mood snapshot error:', err));

    // Fetch recent chats
    const chatsQuery = query(
      collection(db, 'users', auth.currentUser.uid, 'chats'),
      orderBy('updatedAt', 'desc'),
      limit(3)
    );
    const unsubChats = onSnapshot(chatsQuery, (snapshot) => {
      try {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentChats(chats);
      } catch (err) {
        console.error('Error in chats snapshot:', err);
      }
    }, (err) => console.error('Chats snapshot error:', err));

    return () => {
      unsubStats();
      unsubHabits();
      unsubAss();
      unsubJournal();
      unsubMood();
      unsubChats();
    };
  }, []);

  const [pendingTasks, setPendingTasks] = useState<{ id: string, label: string, icon: any, path: string }[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Check pending tasks
    const checkPending = async () => {
      try {
        const tasks = [];
        const today = new Date().toISOString().split('T')[0];
        
        // Mood
        const moodQ = query(
          collection(db, 'users', auth.currentUser!.uid, 'moods'),
          where('date', '==', today),
          limit(1)
        );
        const moodSnap = await getDocs(moodQ);
        if (moodSnap.empty) {
          tasks.push({ id: 'mood', label: 'Track Daily Mood', icon: Activity, path: '/dashboard/mood' });
        }

        // Journal
        const journalQ = query(
          collection(db, 'users', auth.currentUser!.uid, 'journals'),
          where('date', '==', today),
          limit(1)
        );
        const journalSnap = await getDocs(journalQ);
        if (journalSnap.empty) {
          tasks.push({ id: 'journal', label: 'Evening Reflection', icon: BookOpen, path: '/dashboard/journal' });
        }

        // Breathing (Always suggest if fewer than 2 tasks or just as a default healthy nudge)
        tasks.push({ id: 'breathing', label: 'Pneuma Breathing', icon: Sparkles, path: '#breathing' });

        setPendingTasks(tasks);
      } catch (err) {
        console.error('Error checking pending tasks:', err);
      }
    };

    checkPending();
  }, []);

  const getMoodEmoji = (value: number) => {
    if (value >= 5) return '✨';
    if (value >= 4) return '🙂';
    if (value >= 3) return '😐';
    if (value >= 2) return '😕';
    return '😔';
  };

  const getMoodLabel = (value: number) => {
    if (value >= 5) return 'Radiant';
    if (value >= 4) return 'Good';
    if (value >= 3) return 'Okay';
    if (value >= 2) return 'Meh';
    return 'Low';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-[#8b7cf6] uppercase tracking-[0.2em] mb-1">Personal Dashboard</p>
          <h1 className="font-['Syne'] text-4xl font-bold text-[#111110]">
            Good morning, {profile?.displayName || 'User'}.
          </h1>
          <p className="text-[#888880] mt-1 italic">How is your mind today?</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white border border-[#e0dbd0] rounded-2xl text-[#888880] hover:text-[#8b7cf6] transition-all shadow-sm">
            <Bell size={20} />
          </button>
          <button className="p-3 bg-white border border-[#e0dbd0] rounded-2xl text-[#888880] hover:text-[#8b7cf6] transition-all shadow-sm">
            <LogOut size={20} />
          </button>
          <div className="w-12 h-12 bg-[#8b7cf6] rounded-2xl overflow-hidden border-2 border-white shadow-md">
            {profile?.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.email}`} 
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Chat Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-[#8b7cf6] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-[#8b7cf6]/30"
        >
          <div className="relative z-10 max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              Neurohx AI is At Capacity
            </div>
            <h2 className="font-['Syne'] text-5xl font-bold leading-tight">
              Assistant Offline for Maintenance.
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              We're currently scaling our infrastructure to handle high demand. Please focus on your personal journals and metrics in the meantime.
            </p>
            <div className="flex items-center gap-3 bg-white/10 text-white/50 px-8 py-4 rounded-full font-bold cursor-not-allowed border border-white/20">
              Session Unavailable
              <X size={20} />
            </div>
          </div>
          
          {/* Abstract Shapes */}
          <div className="absolute right-0 bottom-0 w-64 h-64 opacity-20">
            <div className="absolute right-10 bottom-10 w-32 h-32 border-8 border-white rounded-full" />
            <div className="absolute right-24 bottom-24 w-24 h-24 border-8 border-white rounded-full" />
            <div className="absolute right-4 bottom-32 w-16 h-16 border-8 border-white rounded-full" />
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[32px] p-6 border border-[#e0dbd0] shadow-sm flex items-center gap-4 group hover:border-[#8b7cf6] transition-all"
          >
            <div className="w-12 h-12 bg-[#fefce8] rounded-2xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Global Community</p>
              <h4 className="text-xl font-bold text-[#111110]">{totalUsers.toLocaleString()} Members</h4>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-[32px] p-6 border border-[#e0dbd0] shadow-sm flex items-center gap-4 group hover:border-[#8b7cf6] transition-all"
          >
            <div className="w-12 h-12 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6] group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Daily Focus</p>
              <h4 className="text-xl font-bold text-[#111110]">84%</h4>
            </div>
            <div className="ml-auto text-[#4ade80] text-[10px] font-bold">+12%</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/dashboard/assessments')}
            className="bg-white rounded-[32px] p-6 border border-[#e0dbd0] shadow-sm flex items-center gap-4 group hover:border-[#8b7cf6] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#eaf4f0] rounded-2xl flex items-center justify-center text-[#4ade80] group-hover:scale-110 transition-transform">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Psych Baseline</p>
              <h4 className="text-xl font-bold text-[#111110]">
                {latestAssessment ? latestAssessment.label : 'Take Test'}
              </h4>
            </div>
            {!latestAssessment && <div className="ml-auto w-2 h-2 bg-[#8b7cf6] rounded-full animate-pulse" />}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/dashboard/habits')}
            className="bg-[#111110] rounded-[32px] p-6 shadow-xl flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#8b7cf6] rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Habit Progress</p>
              <h4 className="text-xl font-bold text-white">
                {habits.length > 0 ? (Math.round((habits.filter(h => h.completedDates?.includes(new Date().toISOString().split('T')[0])).length / habits.length) * 100)) : 0}%
              </h4>
            </div>
            <div className="ml-auto text-[#8b7cf6] text-[10px] font-bold">
              {habits.filter(h => h.completedDates?.includes(new Date().toISOString().split('T')[0])).length}/{habits.length}
            </div>
          </motion.div>

          {profile?.streak && profile.streak.count > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[32px] p-6 shadow-xl flex items-center gap-4 group text-white"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Flame size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Login Streak</p>
                <h4 className="text-xl font-bold">{profile.streak.count} Days</h4>
              </div>
              {profile.streak.lastFreezeUsed === new Date().toISOString().split('T')[0] && (
                <div className="ml-auto bg-white/20 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase">Repaired</div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Proactive Neural Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-8 border border-[#e0dbd0] shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[#111110] flex items-center gap-2">
              <Zap size={18} className="text-[#8b7cf6]" />
              Neural Tasks
            </h3>
            <span className="text-[10px] font-bold text-[#888880] uppercase tracking-widest bg-[#f5f2eb] px-2 py-1 rounded-md">
              {pendingTasks.length} Pending
            </span>
          </div>
          
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  if (task.id === 'breathing') {
                    window.dispatchEvent(new CustomEvent('open-breathing'));
                  } else {
                    navigate(task.path);
                  }
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#fcfaf7] border border-[#e0dbd0] hover:border-[#8b7cf6] group transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#e0dbd0] flex items-center justify-center text-[#8b7cf6] group-hover:scale-110 transition-transform shadow-sm">
                  <task.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#111110]">{task.label}</p>
                  <p className="text-[10px] text-[#888880] uppercase tracking-wider">Required focus</p>
                </div>
                <ChevronRight size={16} className="text-[#e0dbd0] group-hover:text-[#8b7cf6]" />
              </button>
            ))}
            {pendingTasks.length === 0 && (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm text-[#888880] font-medium italic">Neural pathways synchronized.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Daily Mood */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[40px] p-10 border border-[#e0dbd0] shadow-sm flex flex-col items-center text-center space-y-6"
        >
          <div className="flex justify-between w-full items-center">
            <h3 className="font-bold text-[#111110]">Daily Mood</h3>
            <button className="text-[#888880] hover:text-[#111110]">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-[#f0eeff] flex items-center justify-center text-5xl shadow-inner">
              {recentMood ? getMoodEmoji(recentMood.value) : '✨'}
            </div>
            <div className="absolute -inset-2 border-2 border-[#8b7cf6] rounded-full border-t-transparent animate-[spin_3s_linear_infinite]" />
          </div>

          <div>
            <h4 className="font-['Syne'] text-2xl font-bold text-[#111110]">
              {recentMood ? getMoodLabel(recentMood.value) : 'Radiant'}
            </h4>
            <p className="text-xs text-[#888880] font-bold uppercase tracking-widest mt-1">
              75% Positive Average
            </p>
          </div>

          <button 
            onClick={() => navigate('/dashboard/mood')}
            className="w-full py-4 bg-[#f5f2eb] text-[#111110] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#ede9df] transition-all"
          >
            Update Mood
          </button>
        </motion.div>

        {/* Work Progress / Productivity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-[#e0dbd0] shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-[#111110]">Productivity Pulse</h3>
              <p className="text-xs text-[#888880]">Real-time work status and focus trends</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#f0eeff] rounded-full">
              <Clock size={12} className="text-[#8b7cf6]" />
              <span className="text-[10px] font-bold text-[#8b7cf6] uppercase tracking-widest">Last 7 Days</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              {[
                { label: 'Deep Work', value: 75, color: 'bg-[#8b7cf6]' },
                { label: 'Creative Flow', value: 60, color: 'bg-[#c4bbfc]' },
                { label: 'Admin Tasks', value: 40, color: 'bg-[#e0dbd0]' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-[#111110]">{item.label}</span>
                    <span className="text-[#888880]">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-[#f5f2eb] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={cn("h-full rounded-full", item.color)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#fcfaf7] rounded-3xl p-6 border border-[#e0dbd0] flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#8b7cf6] shadow-sm">
                  <Sparkles size={16} />
                </div>
                <span className="text-[10px] font-bold text-[#111110] uppercase tracking-widest">AI Performance Insight</span>
              </div>
              <p className="text-xs text-[#555550] leading-relaxed italic">
                "Your deep work sessions are 24% more effective when started before 10 AM. Try scheduling your most complex tasks for the morning."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-[#e0dbd0]" />
                  ))}
                </div>
                <span className="text-[9px] font-bold text-[#888880] uppercase tracking-widest">+12 users similar to you</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Journal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[40px] p-10 border border-[#e0dbd0] shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-[#111110]">Recent Journal Entry</h3>
            <button onClick={() => navigate('/dashboard/journal')}>
              <BookOpen size={20} className="text-[#888880] hover:text-[#8b7cf6]" />
            </button>
          </div>
          
          {recentJournal ? (
            <div className="flex-1 space-y-6">
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">
                {new Date(recentJournal.date).toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}
              </p>
              <div className="bg-[#fcfaf7] p-6 rounded-3xl border border-[#e0dbd0] relative">
                <p className="text-[#111110] text-sm leading-relaxed italic line-clamp-3">
                  "{recentJournal.content}"
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-[#f0eeff] text-[#8b7cf6] text-[10px] font-bold rounded-full uppercase tracking-widest">Reflection</span>
                <span className="px-3 py-1 bg-[#f5f2eb] text-[#888880] text-[10px] font-bold rounded-full uppercase tracking-widest">+2 more tags</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-[#f5f2eb] rounded-3xl flex items-center justify-center text-[#888880]">
                <BookOpen size={32} />
              </div>
              <p className="text-sm text-[#888880] italic">No journal entries yet.</p>
              <button 
                onClick={() => navigate('/dashboard/journal')}
                className="text-xs font-bold text-[#8b7cf6] uppercase tracking-widest hover:underline"
              >
                Write your first entry
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Conversations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-[40px] p-10 border border-[#e0dbd0] shadow-sm flex flex-col gpu-accelerated"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-[#111110]">Recent Conversations</h3>
            <button onClick={() => navigate('/dashboard/chat')}>
              <MessageSquare size={20} className="text-[#888880] hover:text-[#8b7cf6]" />
            </button>
          </div>
          
          <div className="space-y-4 flex-1">
            {recentChats.length > 0 ? (
              recentChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => navigate('/dashboard/chat')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#f5f2eb] hover:border-[#8b7cf6]/30 hover:bg-[#fcfaf7] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#f5f2eb] flex items-center justify-center text-[#888880] group-hover:text-[#8b7cf6]">
                      <MessageSquare size={14} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#111110] truncate max-w-[120px]">
                        {chat.messages?.[0]?.content?.slice(0, 30) || 'New Conversation'}
                      </p>
                      <p className="text-[10px] text-[#888880]">
                        {chat.updatedAt?.toDate ? chat.updatedAt.toDate().toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#e0dbd0] group-hover:text-[#8b7cf6]" />
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-[#f5f2eb] rounded-3xl flex items-center justify-center text-[#888880]">
                  <MessageSquare size={32} />
                </div>
                <p className="text-sm text-[#888880] italic">No conversations yet.</p>
                <button 
                  onClick={() => navigate('/dashboard/chat')}
                  className="text-xs font-bold text-[#8b7cf6] uppercase tracking-widest hover:underline"
                >
                  Start a session
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Weekly Clarity Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-[40px] p-10 border border-[#e0dbd0] shadow-sm"
      >
        <div className="flex justify-between items-center mb-10">
          <h3 className="font-['Syne'] text-2xl font-bold text-[#111110]">Weekly Clarity</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#e0dbd0] rounded-full" />
              <span className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Previous</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8b7cf6] rounded-full" />
              <span className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Current</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full gpu-accelerated">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f2eb" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#888880', fontWeight: 'bold' }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#fcfaf7' }}
                contentStyle={{ 
                  borderRadius: '20px', 
                  border: '1px solid #e0dbd0',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="activity" fill="#e0dbd0" radius={[10, 10, 10, 10]} barSize={12} />
              <Bar dataKey="mood" fill="#8b7cf6" radius={[10, 10, 10, 10]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 pt-8 border-t border-[#f5f2eb] flex justify-center">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#8b7cf6] uppercase tracking-[0.3em]">
            <img 
              src="/logo.png" 
              alt="" 
              className="w-4 h-4 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <Sparkles size={12} className="hidden" />
            AI Connection Active
          </div>
        </div>
      </motion.div>
    </div>
  );
}
