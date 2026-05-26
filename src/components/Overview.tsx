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
  Users,
  Timer
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

import DailyInspiration from './DailyInspiration';
import DashboardReviews from './DashboardReviews';
import DuolingoStreak from './DuolingoStreak';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

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
    }, (err) => {
      console.warn('Overview stats snapshot error:', err);
    });

    // Fetch habits for status
    const habitsQuery = query(
      collection(db, 'users', auth.currentUser.uid, 'habits')
    );
    const unsubHabits = onSnapshot(habitsQuery, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error('Overview habits snapshot error:', err);
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

        // Deep Work
        tasks.push({ id: 'focus-timer', label: 'Deep Work Block', icon: Timer, path: '/dashboard/timer' });

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 pb-12 relative text-[#F0F4FF]">
      {/* Header */}
      <div className="flex justify-between items-start relative z-40">
        <div>
          <p className="text-[10px] font-bold text-[#00D4C8] uppercase tracking-[0.2em] mb-1">Personal Dashboard</p>
          <h1 className="font-['Syne'] text-4xl font-bold text-white text-glow-accent">
            {getGreeting()}, {profile?.displayName || 'User'}.
          </h1>
          <p className="text-[#A0A5C0] mt-1 italic">How is your mind today?</p>
        </div>
        <div className="flex items-center gap-4 relative">
          
          {/* Notification Bell Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setHasUnreadNotifications(false);
              }}
              className="p-3 bg-white/[0.05] border border-white/10 rounded-2xl text-[#A0A5C0] hover:text-[#00D4C8] hover:border-[#00D4C8]/30 active:scale-95 transition-all shadow-sm cursor-pointer relative"
              title="Notifications & Smart Nudges"
            >
              <Bell size={20} />
              {hasUnreadNotifications && (
                <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0F2C] animate-pulse" />
              )}
            </button>

            {/* Notification Center Dropdown */}
            {showNotifications && (
              <>
                {/* Overlay layer to close by clicking anywhere outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)} 
                />
                
                <div className="absolute right-0 mt-3 w-80 bg-[#0D1B4B]/95 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-5 z-50 space-y-4 animate-in fade-in slide-in-from-top-3 duration-250">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Smart Diagnostics</h4>
                    <span className="text-[9px] bg-[#00D4C8]/10 text-[#00D4C8] font-extrabold px-2 py-0.5 rounded-full">4 Nudges</span>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    
                    {/* Breathing Nudge */}
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-breathing'));
                        setShowNotifications(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer block border border-transparent hover:border-white/5"
                    >
                      <span className="text-[9px] font-bold text-[#00D4C8] uppercase tracking-wider block">Autonomic Balancing</span>
                      <span className="text-xs font-bold text-[#F0F4FF] block mt-0.5">Calibrate Autonomic System</span>
                      <p className="text-[10px] text-[#A0A5C0] mt-1 leading-relaxed">
                        Acute autonomic tension detected. Start a 60-second Pneuma session now.
                      </p>
                    </button>

                    {/* Challenge Nudge */}
                    <button 
                      onClick={() => {
                        navigate('/dashboard/challenges');
                        setShowNotifications(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer block border border-transparent hover:border-white/5"
                    >
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">Consistency Boost</span>
                      <span className="text-xs font-bold text-[#F0F4FF] block mt-0.5">Synchronized Challenges</span>
                      <p className="text-[10px] text-[#A0A5C0] mt-1 leading-relaxed">
                        Don't let your habit streak break today! Complete your next task.
                      </p>
                    </button>

                    {/* Mood check-in nudge */}
                    <button 
                      onClick={() => {
                        navigate('/dashboard/mood');
                        setShowNotifications(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer block border border-transparent hover:border-white/5"
                    >
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Daily Baseline</span>
                      <span className="text-xs font-bold text-[#F0F4FF] block mt-0.5">Track Your Daily Mood Value</span>
                      <p className="text-[10px] text-[#A0A5C0] mt-1 leading-relaxed">
                        Mind metrics are empty. Log your mood to sync real-time analytics.
                      </p>
                    </button>

                    {/* Sleep reset nudge */}
                    <button 
                      onClick={() => {
                        navigate('/dashboard/sleep-tracker');
                        setShowNotifications(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer block border border-transparent hover:border-white/5"
                    >
                      <span className="text-[9px] font-bold text-[#9B8EC4] uppercase tracking-wider block">Circadian Sync</span>
                      <span className="text-xs font-bold text-[#F0F4FF] block mt-0.5">Check Circadian Sleep Reset</span>
                      <p className="text-[10px] text-[#A0A5C0] mt-1 leading-relaxed">
                        Check sleep quality insights and stabilize your resting environment.
                      </p>
                    </button>

                  </div>
                </div>
              </>
            )}
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => auth.signOut().catch(e => console.error('Sign out error:', e))}
            className="p-3 bg-white/[0.05] border border-white/10 hover:border-white/20 rounded-2xl text-[#A0A5C0] hover:text-red-400 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Log Out Securely"
          >
            <LogOut size={20} />
          </button>

          {/* Profile Avatar Button (Navigates to Settings) */}
          <button 
            onClick={() => navigate('/dashboard/settings')}
            className="w-12 h-12 bg-white/[0.05] rounded-2xl overflow-hidden border border-white/20 hover:border-[#00D4C8] active:scale-95 transition-all shadow-md cursor-pointer block"
            title="Account Settings"
          >
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
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Sanctuary Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-[#0D1B4B]/80 border border-white/10 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.05] border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#00D4C8]">
              <div className="w-1.5 h-1.5 bg-[#00D4C8] rounded-full animate-pulse shadow-[0_0_8px_#00D4C8]" />
              Welcome to Your Sanctuary
            </div>
            <h2 className="font-['Syne'] text-5xl font-bold leading-tight">
              A Private Haven for Your Mind.
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Explore custom metrics, trace your mood, track your routine habits, and write reflections in our clinical diary.
            </p>
            <button 
              onClick={() => navigate('/dashboard/journal')}
              className="inline-flex items-center gap-3 bg-[#00D4C8] text-[#0A0F2C] hover:bg-[#00D4C8]/80 px-8 py-4 rounded-full font-bold transition-all shadow-lg active:scale-95 text-sm cursor-pointer"
            >
              Start Journaling
              <ArrowRight size={18} />
            </button>
          </div>
          
          {/* Abstract Shapes */}
          <div className="absolute right-0 bottom-0 w-64 h-64 opacity-20">
            <div className="absolute right-10 bottom-10 w-32 h-32 border-8 border-[#00D4C8]/35 rounded-full" />
            <div className="absolute right-24 bottom-24 w-24 h-24 border-8 border-[#00D4C8]/20 rounded-full" />
            <div className="absolute right-4 bottom-32 w-16 h-16 border-8 border-[#00D4C8]/10 rounded-full" />
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.05] rounded-[32px] p-6 border border-white/10 shadow-sm flex items-center gap-4 group hover:border-[#00D4C8]/40 transition-all text-white"
          >
            <div className="w-12 h-12 bg-white/[0.05] rounded-2xl flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest">Global Community</p>
              <h4 className="text-xl font-bold text-white">{totalUsers.toLocaleString()} Members</h4>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/[0.05] rounded-[32px] p-6 border border-white/10 shadow-sm flex items-center gap-4 group hover:border-[#00D4C8]/40 transition-all text-white"
          >
            <div className="w-12 h-12 bg-white/[0.05] rounded-2xl flex items-center justify-center text-[#00D4C8] group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest">Daily Focus</p>
              <h4 className="text-xl font-bold text-white">84%</h4>
            </div>
            <div className="ml-auto text-emerald-400 text-[10px] font-bold">+12%</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/dashboard/assessments')}
            className="bg-white/[0.05] rounded-[32px] p-6 border border-white/10 shadow-sm flex items-center gap-4 group hover:border-[#00D4C8]/40 transition-all cursor-pointer text-white"
          >
            <div className="w-12 h-12 bg-white/[0.05] rounded-2xl flex items-center justify-center text-[#9B8EC4] group-hover:scale-110 transition-transform">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest">Psych Baseline</p>
              <h4 className="text-xl font-bold text-white">
                {latestAssessment ? latestAssessment.label : 'Take Test'}
              </h4>
            </div>
            {!latestAssessment && <div className="ml-auto w-2 h-2 bg-[#00D4C8] rounded-full animate-pulse shadow-[0_0_8px_#00D4C8]" />}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/dashboard/habits')}
            className="bg-white/[0.05] border border-white/10 rounded-[32px] p-6 shadow-xl flex items-center gap-4 group cursor-pointer text-white hover:border-[#00D4C8]/40 transition-all"
          >
            <div className="w-12 h-12 bg-white/[0.05] rounded-2xl flex items-center justify-center text-[#00D4C8] group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest">Habit Progress</p>
              <h4 className="text-xl font-bold text-white">
                {habits.length > 0 ? (Math.round((habits.filter(h => h.completedDates?.includes(new Date().toISOString().split('T')[0])).length / habits.length) * 100)) : 0}%
              </h4>
            </div>
            <div className="ml-auto text-[#00D4C8] text-[10px] font-bold">
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

      <div className="grid grid-cols-1 grid-rows-none lg:grid-cols-3 gap-8">
        {/* Proactive Neural Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.05] rounded-[40px] p-8 border border-white/10 shadow-sm overflow-hidden text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-[#00D4C8]" />
              Neural Tasks
            </h3>
            <span className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
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
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#00D4C8]/30 group transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#00D4C8] group-hover:scale-110 transition-transform shadow-sm">
                  <task.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{task.label}</p>
                  <p className="text-[10px] text-[#A0A5C0] uppercase tracking-wider">Required focus</p>
                </div>
                <ChevronRight size={16} className="text-[#A0A5C0] group-hover:text-[#00D4C8]" />
              </button>
            ))}
            {pendingTasks.length === 0 && (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm text-[#A0A5C0] font-medium italic">Neural pathways synchronized.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Daily Mood */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.05] rounded-[40px] p-10 border border-white/10 shadow-sm flex flex-col items-center text-center space-y-6 text-white"
        >
          <div className="flex justify-between w-full items-center">
            <h3 className="font-bold text-white">Daily Mood</h3>
            <button className="text-[#A0A5C0] hover:text-white" onClick={() => navigate('/dashboard/mood')}>
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center text-5xl shadow-inner bg-white/[0.02]">
              {recentMood ? getMoodEmoji(recentMood.value) : '✨'}
            </div>
            <div className="absolute -inset-2 border-2 border-[#00D4C8] rounded-full border-t-transparent animate-[spin_3s_linear_infinite]" />
          </div>

          <div>
            <h4 className="font-['Syne'] text-2xl font-bold text-white">
              {recentMood ? getMoodLabel(recentMood.value) : 'Radiant'}
            </h4>
            <p className="text-xs text-[#A0A5C0] font-bold uppercase tracking-widest mt-1">
              75% Positive Average
            </p>
          </div>

          <button 
            onClick={() => navigate('/dashboard/mood')}
            className="w-full py-4 bg-white/[0.08] text-[#00D4C8] hover:bg-[#00D4C8] hover:text-[#0A0F2C] rounded-2xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
          >
            Update Mood
          </button>
        </motion.div>

        {/* Daily Inspiration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col"
        >
          <DailyInspiration />
        </motion.div>

        {/* Work Progress / Productivity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white/[0.05] rounded-[40px] p-10 border border-white/10 shadow-sm text-white"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-white">Productivity Pulse</h3>
              <p className="text-xs text-[#A0A5C0]">Real-time work status and focus trends</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <Clock size={12} className="text-[#00D4C8]" />
              <span className="text-[10px] font-bold text-[#00D4C8] uppercase tracking-widest">Last 7 Days</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              {[
                { label: 'Deep Work', value: 75, color: 'bg-[#00D4C8]' },
                { label: 'Creative Flow', value: 60, color: 'bg-[#9B8EC4]' },
                { label: 'Admin Tasks', value: 40, color: 'bg-white/20' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white">{item.label}</span>
                    <span className="text-[#A0A5C0]">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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

            <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center text-[#00D4C8] shadow-sm">
                  <Clock size={16} />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Optimal Rhythm Insight</span>
              </div>
              <p className="text-xs text-[#A0A5C0] leading-relaxed italic">
                "Your deep work sessions are 24% more effective when started before 10 AM. Try scheduling your most complex tasks for the morning."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0A0F2C] bg-[#A0A5C0]" />
                  ))}
                </div>
                <span className="text-[9px] font-bold text-[#A0A5C0] uppercase tracking-widest">+12 users similar to you</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-white">
        {/* Recent Journal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.05] rounded-[40px] p-10 border border-white/10 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-white">Recent Journal Entry</h3>
            <button onClick={() => navigate('/dashboard/journal')}>
              <BookOpen size={20} className="text-[#A0A5C0] hover:text-[#00D4C8] transition-colors" />
            </button>
          </div>
          
          {recentJournal ? (
            <div className="flex-1 space-y-6">
              <p className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest">
                {new Date(recentJournal.date).toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}
              </p>
              <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 relative">
                <p className="text-[#F0F4FF] text-sm leading-relaxed italic line-clamp-3">
                  "{recentJournal.content}"
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/[0.05] text-[#00D4C8] text-[10px] font-bold rounded-full uppercase tracking-widest border border-white/5">Reflection</span>
                <span className="px-3 py-1 bg-white/[0.03] text-[#A0A5C0] text-[10px] font-bold rounded-full uppercase tracking-widest">+2 more tags</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-white/[0.05] border border-white/10 rounded-3xl flex items-center justify-center text-[#A0A5C0]">
                <BookOpen size={32} />
              </div>
              <p className="text-sm text-[#A0A5C0] italic">No journal entries yet.</p>
              <button 
                onClick={() => navigate('/dashboard/journal')}
                className="text-xs font-bold text-[#00D4C8] uppercase tracking-widest hover:underline cursor-pointer"
              >
                Write your first entry
              </button>
            </div>
          )}
        </motion.div>

        {/* Duolingo-style Streak System */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="lg:col-span-2 flex flex-col"
        >
          <DuolingoStreak />
        </motion.div>

        {/* Community Reviews */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.05] rounded-[40px] border border-white/10 shadow-sm flex flex-col overflow-hidden"
        >
          <DashboardReviews />
        </motion.div>

        {/* Social Presence */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[#111110] rounded-[40px] p-10 text-white flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Users size={80} />
          </div>
          
          <div className="relative z-10">
            <h3 className="font-['Syne'] text-2xl font-bold mb-2 uppercase tracking-tight">Join Our Community</h3>
            <p className="text-white/60 text-xs font-medium leading-relaxed mb-8">
              Stay connected with the Neurohx collective. Exclusive clinical insights, neural practices, and community updates across all platforms.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://www.instagram.com/neurohx_?igsh=MXh4ZjdveWwwcGs2eg==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Instagram</span>
              </a>
              <a 
                href="https://www.facebook.com/share/1Cdf4hjnCW/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Facebook</span>
              </a>
              <a 
                href="https://www.threads.net/@neurohx_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10c0-1.5-.5-3.5-3.5-3.5s-3.5 2-3.5 3.5a3.5 3.5 0 1 1-7 0 7 7 0 1 1 13 3.5" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Threads</span>
              </a>
              <a 
                href="https://x.com/hineurohx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Twitter</span>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#8b7cf6] rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Verified Collective</span>
          </div>
        </motion.div>
      </div>

      {/* Weekly Clarity Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.05] rounded-[40px] p-10 border border-white/10 shadow-sm text-white"
      >
        <div className="flex justify-between items-center mb-10">
          <h3 className="font-['Syne'] text-2xl font-bold text-white">Weekly Clarity</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white/20 rounded-full" />
              <span className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest">Previous</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00D4C8] rounded-full" />
              <span className="text-[10px] font-bold text-[#A0A5C0] uppercase tracking-widest">Current</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full gpu-accelerated">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#A0A5C0', fontWeight: 'bold' }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ 
                  borderRadius: '20px', 
                  backgroundColor: '#0D1B4B',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  fontSize: '12px',
                  color: '#white',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="activity" fill="rgba(255,255,255,0.15)" radius={[10, 10, 10, 10]} barSize={12} />
              <Bar dataKey="mood" fill="#00D4C8" radius={[10, 10, 10, 10]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#00D4C8] uppercase tracking-[0.3em]">
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
            <Activity size={12} className="hidden" />
            Secure Sync Active
          </div>
        </div>
      </motion.div>
    </div>
  );
}
