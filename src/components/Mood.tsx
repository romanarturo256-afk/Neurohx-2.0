import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  limit,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { GoogleGenAI } from "@google/genai";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Smile, 
  Meh, 
  Frown, 
  Heart, 
  Star, 
  Info, 
  TrendingUp, 
  Lock,
  Calendar,
  Zap,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const moods = [
  { value: 1, emoji: '😔', label: 'Low', color: '#f87171' },
  { value: 2, emoji: '😕', label: 'Meh', color: '#fb923c' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#fbbf24' },
  { value: 4, emoji: '🙂', label: 'Good', color: '#4ade80' },
  { value: 5, emoji: '✨', label: 'Great', color: '#8b7cf6' },
];

const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#8b7cf6'];

export default function Mood() {
  const { showToast } = useToast();
  const { isPlanAtLeast } = useUser();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canUseMood = isPlanAtLeast('starter');
  const canSeeCharts = isPlanAtLeast('pro');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'moods'),
      orderBy('date', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHistory(data);
        
        if (data.length >= 5 && canSeeCharts) {
          generateAIInsight(data);
        }
      } catch (err) {
        console.error('Error in mood snapshot:', err);
      }
    }, (err) => console.error('Mood snapshot error:', err));

    return () => unsubscribe();
  }, []);

  const generateAIInsight = async (data: any[]) => {
    if (isAnalyzing || aiInsight) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const moodData = data.slice(-14).map(h => ({
        date: h.date,
        value: h.value,
        note: h.note || 'No note'
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these mood logs for a mental wellness app. Provide 1 concise, powerful, empathetic insight (max 30 words) about their recent emotional trend and resilience. 
        Data (value 1-5, where 5 is Great): ${JSON.stringify(moodData)}`,
      });

      setAiInsight(response.text || '');
    } catch (error) {
      console.error('AI Insight error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveMood = async () => {
    if (!selectedMood || !auth.currentUser) return;
    
    if (!canUseMood) {
      showToast('Upgrade to Starter to log your mood.', 'info');
      navigate('/dashboard/settings');
      return;
    }

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const path = `users/${auth.currentUser.uid}/moods`;
      await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        value: selectedMood,
        note: note,
        date: today,
        createdAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, 'create', path));
      setSelectedMood(null);
      setNote('');
      showToast('Mood logged successfully!', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to log mood.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const averageMood = history.length > 0 
    ? (history.reduce((acc, curr) => acc + curr.value, 0) / history.length).toFixed(1)
    : '0.0';

  const chartData = React.useMemo(() => {
    const groups: { [key: string]: { sum: number; count: number } } = {};
    history.forEach(item => {
      if (!groups[item.date]) groups[item.date] = { sum: 0, count: 0 };
      groups[item.date].sum += item.value;
      groups[item.date].count += 1;
    });

    return Object.keys(groups).sort().map(d => ({
      date: d,
      displayDate: new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Number((groups[d].sum / groups[d].count).toFixed(1))
    })).slice(-30);
  }, [history]);

  const moodDistribution = moods.map(m => ({
    name: m.label,
    value: history.filter(h => h.value === m.value).length,
    color: m.color
  })).filter(m => m.value > 0);

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-bold text-[#8b7cf6] uppercase tracking-[0.2em] mb-1">Emotional Intelligence</p>
        <h1 className="font-['Syne'] text-4xl font-bold text-[#111110]">Mood Analytics</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-[40px] border border-[#e0dbd0] shadow-sm relative overflow-hidden"
          >
            {!canSeeCharts && (
              <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[4px] flex items-center justify-center p-8 text-center">
                <div className="max-w-xs space-y-4">
                  <div className="w-16 h-16 bg-[#f0eeff] rounded-3xl flex items-center justify-center text-[#8b7cf6] mx-auto">
                    <Lock size={32} />
                  </div>
                  <h4 className="font-['Syne'] text-2xl font-bold text-[#111110]">Mood Charts are Locked</h4>
                  <p className="text-sm text-[#888880] leading-relaxed">Upgrade to the <span className="font-bold">Pro</span> plan to visualize your emotional trends over time.</p>
                  <button
                    onClick={() => navigate('/dashboard/settings')}
                    className="px-8 py-3 bg-[#8b7cf6] text-white rounded-full font-bold hover:bg-[#7c6df0] transition-all shadow-lg shadow-[#8b7cf6]/20"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6]">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-[#111110]">Mood Trends (Last 30 Days)</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#8b7cf6] rounded-full"></div>
                  <span className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Mood Level</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={canSeeCharts ? chartData : []}>
                  <defs>
                    <linearGradient id="moodTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b7cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b7cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f2eb" />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#888880', fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    ticks={[1, 2, 3, 4, 5]} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#888880', fontWeight: 'bold' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
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
                    fill="url(#moodTrendGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-10 rounded-[40px] border border-[#e0dbd0] shadow-sm"
            >
              <h3 className="font-bold text-[#111110] mb-8">Mood Distribution</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodDistribution.length > 0 ? moodDistribution : [{ name: 'Empty', value: 1, color: '#f5f2eb' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(moodDistribution.length > 0 ? moodDistribution : [{ color: '#f5f2eb' }]).map((entry: any, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {moods.map((m, i) => (
                  <div key={m.value} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">{m.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111110] p-10 rounded-[40px] text-white relative overflow-hidden"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2 text-[#8b7cf6]">
                  <Sparkles size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">AI Insight</span>
                </div>
                <p className="text-xl font-['Syne'] font-bold leading-relaxed">
                  {history.length < 5 
                    ? "Log your mood for 5 more days to unlock personalized AI emotional insights."
                    : aiInsight || "Analyzing your emotional resilience..."}
                </p>
                <div className="pt-4 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111110] bg-[#8b7cf6] flex items-center justify-center text-[10px] font-bold">
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shared by 2k+ users</span>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#8b7cf6] rounded-full blur-3xl opacity-20" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Log */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[40px] border border-[#e0dbd0] shadow-sm"
          >
            <h3 className="font-['Syne'] text-2xl font-bold text-[#111110] mb-8">How are you now?</h3>
            <div className="grid grid-cols-5 gap-3 mb-8">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(m.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all duration-300",
                    selectedMood === m.value 
                      ? "bg-[#f0eeff] border-[#8b7cf6] border-2 scale-110 shadow-xl shadow-[#8b7cf6]/10" 
                      : "bg-[#fcfaf7] border-transparent border-2 hover:border-[#e0dbd0]"
                  )}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-[8px] font-bold uppercase tracking-tighter text-[#888880]">{m.label}</span>
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any specific reason? (Optional)"
              className="w-full p-6 bg-[#fcfaf7] border-none rounded-[32px] text-sm focus:ring-2 focus:ring-[#8b7cf6] outline-none transition-all resize-none h-32 mb-8 placeholder:text-[#e0dbd0]"
            />
            <button
              onClick={saveMood}
              disabled={!selectedMood || loading}
              className="w-full bg-[#8b7cf6] text-white py-5 rounded-[32px] font-bold text-sm uppercase tracking-widest hover:bg-[#7c6df0] transition-all disabled:opacity-50 shadow-xl shadow-[#8b7cf6]/20 flex items-center justify-center gap-3"
            >
              {!canUseMood && <Lock size={18} />}
              {loading ? 'Logging...' : 'Log Mood'}
            </button>
          </motion.div>

          {/* Summary Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-10 rounded-[40px] border border-[#e0dbd0] shadow-sm space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#f0eeff] rounded-[24px] flex items-center justify-center text-[#8b7cf6]">
                <Heart size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Average Mood</p>
                <p className="text-3xl font-bold font-['Syne'] text-[#111110]">{averageMood} / 5.0</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#eaf4f0] rounded-[24px] flex items-center justify-center text-[#4ade80]">
                <Calendar size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">Total Logs</p>
                <p className="text-3xl font-bold font-['Syne'] text-[#111110]">{history.length} Days</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


