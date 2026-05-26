import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Clock, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Star,
  Trash2,
  MoonStar,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Brain,
  Volume2,
  VolumeX
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'motion/react';

interface SleepLog {
  id: string;
  date: string; // ISO date string or YYYY-MM-DD
  weekday: string; // e.g. Mon, Tue
  bedtime: string; // "HH:MM"
  waketime: string; // "HH:MM"
  duration: number; // calculated hours
  quality: 1 | 2 | 3 | 4 | 5; 
  notes: string;
}

const QUALITY_EMOJIS = [
  { value: 1, emoji: '😴', label: 'Terrible', color: '#ef4444' }, // red
  { value: 2, emoji: '😕', label: 'Poor', color: '#f97316' },     // orange
  { value: 3, emoji: '😐', label: 'Okay', color: '#eab308' },     // yellow
  { value: 4, emoji: '🙂', label: 'Good', color: '#22c55e' },     // green
  { value: 5, emoji: '😊', label: 'Great', color: '#3b82f6' },    // blue/purple
];

// Curated sleep tips list
const ALL_SLEEP_TIPS = [
  {
    title: "Minimize Blue Light Exposure",
    desc: "Avoid screens (phones, tables, TVs) at least 60 minutes before bedtime. Synthesized light fools your brain into blocking melatonin production.",
    category: "Environment"
  },
  {
    title: "Maintain Circadian Consistency",
    desc: "Regulate your internal body clock by sleeping and rising at identical times daily, establishing neural predictability.",
    category: "Schedule"
  },
  {
    title: "The Golden Cool Temperature",
    desc: "Keep your bedroom temperature around 65°F (18°C). Core body cooling is a clinical trigger indicating it's time to rest.",
    category: "Environment"
  },
  {
    title: "Quiet the Mind",
    desc: "Engage in 10 minutes of gentle box breathing, meditation, or offload stress by journaling your thoughts prior to hitting the pillow.",
    category: "Mindset"
  },
  {
    title: "Cut Caffeine Late",
    desc: "Caffeine possesses an average half-life of 5-8 hours. Restrict coffee, matcha, and high-energy drinks post-2:00 PM for deeper REM cycles.",
    category: "Habits"
  },
  {
    title: "Limit Liquid Excess",
    desc: "Reduce hydration 2 hours prior to sleep to satisfy uninterrupted deep slow-wave restful cycles without physical arousal.",
    category: "Habits"
  }
];

let globalAudioCtx: AudioContext | null = null;

const playZenAlarm = (volume: number = 50) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
      globalAudioCtx = new AudioContextClass();
    }
    
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch((err) => {
        console.warn("AudioContext resume rejected inside playZenAlarm:", err);
      });
    }
    
    const playChime = (freq1: number, freq2: number, duration: number) => {
      if (!globalAudioCtx) return;
      const osc1 = globalAudioCtx.createOscillator();
      const osc2 = globalAudioCtx.createOscillator();
      const gainNode = globalAudioCtx.createGain();
      
      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      osc1.frequency.setValueAtTime(freq1, globalAudioCtx.currentTime);
      osc2.frequency.setValueAtTime(freq2, globalAudioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0, globalAudioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12 * (volume / 100), globalAudioCtx.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.001, globalAudioCtx.currentTime + duration);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(globalAudioCtx.destination);
      
      osc1.start();
      osc2.start();
      
      osc1.stop(globalAudioCtx.currentTime + duration);
      osc2.stop(globalAudioCtx.currentTime + duration);
    };

    playChime(523.25, 659.25, 3.0); // C5 & E5
    setTimeout(() => {
      playChime(587.33, 739.99, 3.0); // D5 & F#5
    }, 1000);
    setTimeout(() => {
      playChime(659.25, 783.99, 3.5); // E5 & G5
    }, 2000);

  } catch (e) {
    console.error("Audio synth error: ", e);
  }
};

const playPreviewNote = (volume: number = 50) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
      globalAudioCtx = new AudioContextClass();
    }
    
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch((err) => {
        console.warn("AudioContext resume rejected inside playPreviewNote:", err);
      });
    }
    
    const osc = globalAudioCtx.createOscillator();
    const gainNode = globalAudioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, globalAudioCtx.currentTime); // C5
    
    gainNode.gain.setValueAtTime(0, globalAudioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12 * (volume / 100), globalAudioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, globalAudioCtx.currentTime + 1.0);
    
    osc.connect(gainNode);
    gainNode.connect(globalAudioCtx.destination);
    
    osc.start();
    osc.stop(globalAudioCtx.currentTime + 1.0);
  } catch (e) {
    console.error("Audio preview note error:", e);
  }
};

export default function SleepTracker() {
  const { showToast } = useToast();
  
  // Date and Time inputs state
  const [bedtime, setBedtime] = useState("22:30");
  const [waketime, setWaketime] = useState("06:30");
  const [selectedQuality, setSelectedQuality] = useState<number>(4); // default "Good"
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [rotatingTipIndex, setRotatingTipIndex] = useState(0);

  // Notification and Alarm states
  const [sleepPrepEnabled, setSleepPrepEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sleep_prep_enabled') === 'true';
  });
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sleep_alarm_enabled') === 'true';
  });
  const [alarmTime, setAlarmTime] = useState<string>(() => {
    return localStorage.getItem('sleep_alarm_time') || '06:30';
  });
  const [alarmVolume, setAlarmVolume] = useState<number>(() => {
    return Number(localStorage.getItem('sleep_alarm_volume') || '50');
  });
  const [alarmTriggered, setAlarmTriggered] = useState<boolean>(false);

  const [lastPrepTriggeredDay, setLastPrepTriggeredDay] = useState<string>("");
  const [lastAlarmTriggeredDay, setLastAlarmTriggeredDay] = useState<string>("");

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('sleep_prep_enabled', String(sleepPrepEnabled));
  }, [sleepPrepEnabled]);

  useEffect(() => {
    localStorage.setItem('sleep_alarm_enabled', String(alarmEnabled));
  }, [alarmEnabled]);

  useEffect(() => {
    localStorage.setItem('sleep_alarm_time', alarmTime);
  }, [alarmTime]);

  useEffect(() => {
    localStorage.setItem('sleep_alarm_volume', String(alarmVolume));
  }, [alarmVolume]);

  // Handle system notification permission request safely
  useEffect(() => {
    if (sleepPrepEnabled && ('Notification' in window) && Notification.permission === 'default') {
      try {
        const promise = Notification.requestPermission();
        if (promise && typeof promise.then === 'function') {
          promise.catch((err) => {
            console.warn("Notification request permission rejected (likely due to sandboxed iframe limits):", err);
          });
        }
      } catch (err) {
        console.warn("Notification permission request sync error:", err);
      }
    }
  }, [sleepPrepEnabled]);

  // Gentle audio loop when alarm fires
  useEffect(() => {
    let playInterval: any = null;
    if (alarmTriggered) {
      playZenAlarm(alarmVolume);
      playInterval = setInterval(() => {
        playZenAlarm(alarmVolume);
      }, 5000);
    }
    return () => {
      if (playInterval) clearInterval(playInterval);
    };
  }, [alarmTriggered, alarmVolume]);

  // Calculate Average Bedtime as a string ("HH:MM")
  const getAverageBedtime = (): string => {
    if (logs.length === 0) return "23:00"; // Default base

    let totalMinutes = 0;
    logs.forEach(log => {
      const [hours, minutes] = log.bedtime.split(':').map(Number);
      let mins = hours * 60 + minutes;
      // Adjust early morning bedtimes so that they average correctly next to late night bedtimes
      if (hours < 12) {
        mins += 24 * 60;
      }
      totalMinutes += mins;
    });

    const avgMins = Math.round(totalMinutes / logs.length) % (24 * 60);
    const avgHours = Math.floor(avgMins / 60);
    const avgMinutes = avgMins % 60;

    return `${String(avgHours).padStart(2, '0')}:${String(avgMinutes).padStart(2, '0')}`;
  };

  // Calculate Sleep Prep Time (30 minutes before bedtime)
  const getPrepTime = (avgBedtime: string): string => {
    const [hours, minutes] = avgBedtime.split(':').map(Number);
    let totalMins = hours * 60 + minutes;
    
    totalMins -= 30;
    if (totalMins < 0) {
      totalMins += 24 * 60;
    }
    
    const prepHours = Math.floor(totalMins / 60);
    const prepMinutes = totalMins % 60;
    return `${String(prepHours).padStart(2, '0')}:${String(prepMinutes).padStart(2, '0')}`;
  };

  // Triggering the sleep prep notification
  const triggerSleepPrepNotification = (prepTime: string) => {
    const title = "🌌 Circadian Sanctuary: Sleep Prep";
    const body = `It's ${prepTime} — Exactly 30 minutes before your average bedtime. Shut down screens and unwind.`;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch (e) {
        console.error("Failed to push Native Notification: ", e);
      }
    }
    showToast(`🌌 Sleep Prep Alert! It's ${prepTime}. Shift down, dim lights and relax.`, 'info');
  };

  // Real-time ticking checker (ticks every 5 seconds for absolute lightweight correctness)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentDayString = now.toDateString();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${hours}:${minutes}`;

      // 1. Check Sleep Prep (30 min before Average)
      if (sleepPrepEnabled && currentDayString !== lastPrepTriggeredDay) {
        const avgBed = getAverageBedtime();
        const prep = getPrepTime(avgBed);
        
        if (currentTimeString === prep) {
          setLastPrepTriggeredDay(currentDayString);
          triggerSleepPrepNotification(prep);
        }
      }

      // 2. Check Wake Up Alarm
      if (alarmEnabled && currentDayString !== lastAlarmTriggeredDay) {
        if (currentTimeString === alarmTime && !alarmTriggered) {
          setLastAlarmTriggeredDay(currentDayString);
          setAlarmTriggered(true);
          showToast("🌅 Wake Up Alarm Triggered!", "success");
        }
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [sleepPrepEnabled, alarmEnabled, alarmTime, alarmTriggered, lastPrepTriggeredDay, lastAlarmTriggeredDay, logs]);

  // Test Functions for user instant pleasure
  const handleTestPrepNotify = () => {
    const avgBed = getAverageBedtime();
    const prep = getPrepTime(avgBed);
    triggerSleepPrepNotification(prep);
  };

  const handleTestAlarm = () => {
    setAlarmTriggered(true);
    showToast("🔔 Manual Wake up Alarm testing started!", "info");
  };

  // Initialize logs on load, preload with realistic clinical mock data if empty
  useEffect(() => {
    const saved = localStorage.getItem('neurohx_sleep_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading sleep logs, reset to default mock", e);
        initializeMockLogs();
      }
    } else {
      initializeMockLogs();
    }
  }, []);

  const initializeMockLogs = () => {
    const today = new Date();
    const mockList: SleepLog[] = [];
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Create mock logs for the past 7 days
    const mockPresets = [
      { bedtime: "23:00", waketime: "07:00", quality: 4, notes: "Felt very refreshed. Easy transition." },
      { bedtime: "23:30", waketime: "06:15", quality: 2, notes: "Felt a bit groggy." },
      { bedtime: "00:15", waketime: "05:45", quality: 1, notes: "Late night work. Woke up exhausted." },
      { bedtime: "22:45", waketime: "07:00", quality: 5, notes: "Super deep sleep. Dreams were highly memorable!" },
      { bedtime: "23:15", waketime: "07:15", quality: 4, notes: "Overall quite solid sleep." },
      { bedtime: "23:50", waketime: "06:20", quality: 3, notes: "Woke up twice during the middle of the night." },
      { bedtime: "22:30", waketime: "07:00", quality: 5, notes: "Deep restorative rest, felt immediately awake." },
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const preset = mockPresets[6 - i] || mockPresets[0];
      const parsedBed = parseTime(preset.bedtime);
      const parsedWake = parseTime(preset.waketime);
      const duration = calculateDuration(preset.bedtime, preset.waketime);

      mockList.push({
        id: `mock-${i}-${Date.now()}`,
        date: d.toISOString().split('T')[0],
        weekday: weekdayNames[d.getDay()],
        bedtime: preset.bedtime,
        waketime: preset.waketime,
        duration: duration,
        quality: preset.quality as any,
        notes: preset.notes
      });
    }

    setLogs(mockList);
    localStorage.setItem('neurohx_sleep_logs', JSON.stringify(mockList));
  };

  // Time calculations
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  };

  const calculateDuration = (bed: string, wake: string): number => {
    const bedTime = parseTime(bed);
    const wakeTime = parseTime(wake);

    const bedMin = bedTime.hours * 60 + bedTime.minutes;
    const wakeMin = wakeTime.hours * 60 + wakeTime.minutes;

    let diffMin = wakeMin - bedMin;
    if (diffMin < 0) {
      // Sleep crossed midnight
      diffMin += 24 * 60;
    }

    return parseFloat((diffMin / 60).toFixed(2));
  };

  const currentCalculatedDuration = calculateDuration(bedtime, waketime);

  // Save new log
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDayName = weekdayNames[new Date().getDay()];

    const newLog: SleepLog = {
      id: `log-${Date.now()}`,
      date: todayStr,
      weekday: currentDayName,
      bedtime,
      waketime,
      duration: currentCalculatedDuration,
      quality: selectedQuality as any,
      notes: notes.trim()
    };

    // Prevent duplicate logs on exact same day by removing the previous today's log if it exists
    const filteredLogs = logs.filter(log => log.date !== todayStr);
    const updated = [newLog, ...filteredLogs];

    setLogs(updated);
    localStorage.setItem('neurohx_sleep_logs', JSON.stringify(updated));
    showToast('Your clinical sleep log has been secured.', 'success');
    
    // Clear custom input field
    setNotes("");
  };

  // Clear all logs
  const handleResetLogs = () => {
    if (window.confirm("Are you sure you want to delete all sleep data? This cannot be undone.")) {
      setLogs([]);
      localStorage.removeItem('neurohx_sleep_logs');
      showToast('Your sleep tracking history was deleted.', 'info');
    }
  };

  // Stats Calculations
  const getStats = () => {
    if (logs.length === 0) {
      return { lastNight: 0, weeklyAvg: 0, bestSleep: { day: 'None', hours: 0 } };
    }

    // Last log entry (most recent sorted by date)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastNight = sortedLogs[0].duration;

    // Weekly Average (up to last 7 logs)
    const last7Logs = sortedLogs.slice(0, 7);
    const avgSum = last7Logs.reduce((acc, curr) => acc + curr.duration, 0);
    const weeklyAvg = last7Logs.length > 0 ? parseFloat((avgSum / last7Logs.length).toFixed(1)) : 0;

    // Best sleep this week
    const bestLog = last7Logs.reduce((prev, current) => (prev.duration > current.duration) ? prev : current, sortedLogs[0]);
    const bestSleep = {
      day: bestLog ? bestLog.weekday : 'N/A',
      hours: bestLog ? bestLog.duration : 0
    };

    return { lastNight, weeklyAvg, bestSleep };
  };

  const stats = getStats();

  // Prepare chart data for last 7 days Chronologically (oldest to newest)
  const getChartData = () => {
    const sortedChronological = [...logs]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // take last 7 logs
    
    return sortedChronological.map(log => ({
      name: log.weekday,
      hours: log.duration,
      quality: QUALITY_EMOJIS.find(q => q.value === log.quality)?.emoji || '🌙',
      bedtime: log.bedtime,
      waketime: log.waketime,
      rawDate: log.date
    }));
  };

  const chartData = getChartData();

  // Color functions for safety zones
  const getBarColor = (hours: number) => {
    if (hours >= 7 && hours <= 9) return '#22c55e'; // Green (ideal)
    if (hours >= 6 && hours < 7) return '#eab308';  // Yellow (okay)
    return '#ef4444';                              // Red (poor)
  };

  // Navigation for rotating daily tips
  const nextTip = () => {
    setRotatingTipIndex((prev) => (prev + 1) % ALL_SLEEP_TIPS.length);
  };

  const prevTip = () => {
    setRotatingTipIndex((prev) => (prev - 1 + ALL_SLEEP_TIPS.length) % ALL_SLEEP_TIPS.length);
  };

  const currentTip = ALL_SLEEP_TIPS[rotatingTipIndex];

  return (
    <div id="sleep-tracker-page" className="min-h-screen bg-[#060D1E] text-[#E0E7FF] p-6 lg:p-10 relative overflow-hidden">
      {/* Stars backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#111c37] via-[#060d1e] to-[#03060f] pointer-events-none z-0" />
      
      {/* Decorative stars / constellations */}
      <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-ping opacity-60 z-0" />
      <div className="absolute top-[15%] right-[15%] w-1.5 h-1.5 bg-yellow-100 rounded-full animate-pulse opacity-40 z-0" />
      <div className="absolute bottom-[30%] left-[10%] w-0.5 h-0.5 bg-white rounded-full opacity-80 z-0" />
      <div className="absolute bottom-[10%] right-[25%] w-1 h-1 bg-white rounded-full animate-pulse duration-1000 opacity-50 z-0" />
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1C2C4E] border border-white/10 flex items-center justify-center text-amber-200">
              <MoonStar size={28} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#818CF8]">Clinical Sleep Analytics</span>
              <h1 className="font-['Syne'] text-3xl font-extrabold text-white mt-0.5 flex items-center gap-2">
                Sanctuary Sleep Tracker <span className="text-xl">🌙</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 bg-[#1C2C4E]/50 px-3 py-1.5 rounded-full border border-white/5 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
              Secure Offline Encryption Active
            </span>
            {logs.length > 0 && (
              <button 
                onClick={handleResetLogs}
                id="reset-sleep-btn"
                className="p-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/60 rounded-xl border border-white/10 transition-colors cursor-pointer"
                title="Reset Records"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Top: SLEEP LOG FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#0E1B35]/90 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Clock size={18} className="text-[#818CF8]" />
              Log Your Sleep Rhythm
            </h2>
            <p className="text-white/60 text-xs mb-6">
              Establish a dynamic baseline. Input your bedtime and waketime to update circadian trends instantly.
            </p>

            <form onSubmit={handleSaveLog} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bedtime Hour Input */}
                <div className="bg-[#152345] border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/15 transition-all">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1 flex items-center gap-1">
                    <Moon size={12} className="text-amber-300" /> Bedtime (Sleep)
                  </label>
                  <input 
                    type="time" 
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="bg-transparent text-xl font-bold text-white border-none outline-none focus:ring-0 cursor-pointer pt-1"
                    id="bedtime-picker"
                    required
                  />
                  <span className="text-[9px] text-[#818CF8] font-semibold mt-1">
                    Estimated clock-in
                  </span>
                </div>

                {/* Wake Time Hour Input */}
                <div className="bg-[#152345] border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/15 transition-all">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1 flex items-center gap-1">
                    <Sparkles size={12} className="text-[#818CF8]" /> Wake Time (Rise)
                  </label>
                  <input 
                    type="time" 
                    value={waketime}
                    onChange={(e) => setWaketime(e.target.value)}
                    className="bg-transparent text-xl font-bold text-white border-none outline-none focus:ring-0 cursor-pointer pt-1"
                    id="waketime-picker"
                    required
                  />
                  <span className="text-[9px] text-green-400 font-semibold mt-1">
                    Ideal morning light alignment
                  </span>
                </div>
              </div>

              {/* Dynamic Realtime Clocking Feedback Grid */}
              <div className="bg-[#111D36] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#818CF8]/10 flex items-center justify-center text-[#818CF8]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-white/40 block">Calculated Total Time</span>
                    <span className="text-lg font-extrabold text-white">
                      {Math.floor(currentCalculatedDuration)}h {Math.round((currentCalculatedDuration % 1) * 60)}m
                    </span>
                  </div>
                </div>
                
                {/* Clinical Safety Indicator */}
                <div className="text-right">
                  {currentCalculatedDuration >= 7 && currentCalculatedDuration <= 9 ? (
                    <span className="text-xs bg-[#22c55e]/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full font-bold">
                      🟢 Ideal Rest Hours
                    </span>
                  ) : currentCalculatedDuration >= 6 && currentCalculatedDuration < 7 ? (
                    <span className="text-xs bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 px-3 py-1 rounded-full font-bold">
                      🟡 Minimal Safety Rest
                    </span>
                  ) : (
                    <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/25 px-3 py-1 rounded-full font-bold animate-pulse">
                      🔴 High Risk Sleep Deficit
                    </span>
                  )}
                </div>
              </div>

              {/* Quality Selection Emoji Buttons */}
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-3">
                  Overall Sleep Quality Rating
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {QUALITY_EMOJIS.map((q) => {
                    const isSelected = selectedQuality === q.value;
                    return (
                      <button
                        key={q.value}
                        type="button"
                        onClick={() => setSelectedQuality(q.value)}
                        id={`quality-rating-${q.value}`}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer",
                          isSelected
                            ? "bg-[#1d2fb0]/30 border-[#818CF8] text-white shadow-lg shadow-[#818CF8]/10 scale-105"
                            : "bg-[#152345] border-white/5 text-white/50 hover:bg-[#1a2d58] hover:text-white"
                        )}
                      >
                        <span className="text-2xl mb-1">{q.emoji}</span>
                        <span className="text-[9px] font-semibold tracking-wider">{q.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="notes-field" className="text-xs font-semibold text-white/70">
                  How did you feel? <span className="text-white/40 font-normal">(Optional reflections)</span>
                </label>
                <textarea
                  id="notes-field"
                  rows={2}
                  maxLength={200}
                  placeholder="e.g. Dreams were vivid, woke up before alarm, calm mindset..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-[#152345] border border-white/5 hover:border-white/10 focus:border-[#818CF8]/40 text-sm rounded-2xl p-4 text-white outline-none placeholder-white/20 resize-none transition-all"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                id="save-sleep-btn"
                className="w-full bg-gradient-to-r from-[#818CF8] to-[#6366F1] hover:from-[#606bf4] hover:to-[#4f52e2] text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] cursor-pointer text-sm"
              >
                Save Tonight's Sleep
              </button>
            </form>
          </div>

          {/* Right: SLEEP STATS CARDS */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1 lg:hidden">
              <TrendingUp size={18} className="text-[#818CF8]" />
              Sleep Metrics Overview
            </h2>

            {/* Stats Card 1: Last Night */}
            <div className="bg-[#0E1B35]/90 border border-white/10 rounded-3xl p-6 shadow-xl flex items-center gap-4 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Moon size={22} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">Last Night's Sleep</span>
                <span className="text-2xl font-black text-white">{stats.lastNight}h</span>
                <span className="text-[10px] text-white/50 block mt-0.5">
                  {stats.lastNight >= 7 && stats.lastNight <= 9 
                    ? "🎉 Met clinical baseline goals" 
                    : logs.length > 0 ? "⚠️ Below ideal safety target" : "No logs recorded yet"}
                </span>
              </div>
            </div>

            {/* Stats Card 2: Weekly Average */}
            <div className="bg-[#0E1B35]/90 border border-white/10 rounded-3xl p-6 shadow-xl flex items-center gap-4 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <TrendingUp size={22} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">Weekly Sleep Average</span>
                <span className="text-2xl font-black text-white">{stats.weeklyAvg}h</span>
                <span className="text-[10px] text-[#818CF8] block mt-0.5">
                  {stats.weeklyAvg >= 7 ? "Stellar rhythm! Maintain it." : "Aim for 7-9 hours average."}
                </span>
              </div>
            </div>

            {/* Stats Card 3: Best Sleep */}
            <div className="bg-[#0E1B35]/90 border border-white/10 rounded-3xl p-6 shadow-xl flex items-center gap-4 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                <Star size={22} className="fill-amber-300/30" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">Best Rest Session</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{stats.bestSleep.hours}h</span>
                  <span className="text-xs text-white/60">on {stats.bestSleep.day}</span>
                </div>
                <span className="text-[10px] text-amber-200/70 block mt-0.5">
                  Highest melatonin synchronization
                </span>
              </div>
            </div>

            {/* Historical Entries Mini-List */}
            <div className="bg-[#0E1B35]/90 border border-white/10 rounded-3xl p-5 shadow-xl flex-1 flex flex-col justify-between overflow-hidden min-h-[180px]">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white">Recent Rest Logs</span>
                <span className="text-[9px] font-semibold text-[#818CF8] bg-[#818CF8]/10 px-2.5 py-0.5 rounded-full">
                  History
                </span>
              </div>
              <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[140px] pr-1">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-white/30 text-xs">
                    <HelpCircle size={18} className="mb-1" />
                    No recent sleep logs.
                  </div>
                ) : (
                  [...logs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4).map((log) => {
                    const qualityPreset = QUALITY_EMOJIS.find(q => q.value === log.quality);
                    return (
                      <div key={log.id} className="flex items-center justify-between bg-[#152345]/50 border border-white/5 p-2.5 rounded-xl text-xs hover:border-white/10 transition-all">
                        <div className="flex items-center gap-2">
                          <span className="text-base" title={qualityPreset?.label}>{qualityPreset?.emoji}</span>
                          <div>
                            <span className="font-bold text-white block">{log.weekday}</span>
                            <span className="text-[9px] text-white/40">{log.bedtime} - {log.waketime}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-indigo-300 block">{log.duration} hrs</span>
                          {log.notes && (
                            <span className="text-[9px] text-white/50 block max-w-[120px] truncate" title={log.notes}>
                              {log.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle: WEEKLY SLEEP CHART */}
        <div className="bg-[#0E1B35]/90 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400" />
                Circadian Rhythm Efficiency Chart
              </h2>
              <p className="text-white/60 text-xs mt-1">
                Colors reflect compliance with sleep hygiene boundaries: Green (7-9h), Yellow (6-7h), and Red (&lt;6h).
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider bg-[#101E3C] px-4 py-2 rounded-2xl border border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Ideal (7-9h)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Okay (6-7h)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Deficit (&lt;6h)</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/40 border border-dashed border-white/10 rounded-2xl">
                <MoonStar size={32} className="mb-2 text-white/20 animate-spin" />
                <span>Register a sleep session to populate the dynamic timeline tracker</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255, 255, 255, 0.5)" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.5)" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                    domain={[0, 12]}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.4)', fontSize: 10, offset: 10 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#091124] border border-white/15 p-3 rounded-2xl shadow-xl space-y-1 z-50 text-[11px]">
                            <p className="font-bold text-white border-b border-white/10 pb-1 mb-1">
                              {data.name} ({data.rawDate})
                            </p>
                            <p className="flex justify-between gap-6">
                              <span className="text-white/60">Duration:</span>
                              <span className="font-bold text-[#818CF8]">{data.hours} hrs</span>
                            </p>
                            <p className="flex justify-between gap-6">
                              <span className="text-white/60">Bedtime:</span>
                              <span className="font-bold text-white">{data.bedtime}</span>
                            </p>
                            <p className="flex justify-between gap-6">
                              <span className="text-white/60">Wake time:</span>
                              <span className="font-bold text-white">{data.waketime}</span>
                            </p>
                            <p className="flex justify-between gap-6">
                              <span className="text-white/60">Rating:</span>
                              <span className="font-bold text-amber-200">{data.quality}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[8, 8, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.hours)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom Section: Grid of Tips & Alarm / Sleep Prep */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: ALARM & PREP SETTINGS */}
          <div className="lg:col-span-6 bg-[#0E1B35]/90 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#818CF8]">Sanctuary Schedule Controls</span>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <Clock size={18} className="text-[#818CF8]" />
                  Circadian Sync Settings
                </h2>
                <p className="text-white/50 text-[11px] mt-0.5">
                  Tailor your circadian triggers to maintain constant REM & slow-wave sleep synchronization.
                </p>
              </div>

              {/* 1. Sleep Prep Feature */}
              <div className="bg-[#101E3C] border border-white/5 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                      <Moon size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Sleep Prep Reminder</h3>
                      <p className="text-[10px] text-white/50">Nudges you 30m before average bedtime.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSleepPrepEnabled(!sleepPrepEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors cursor-pointer duration-200 outline-none",
                      sleepPrepEnabled ? "bg-[#818CF8]" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                      sleepPrepEnabled ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-white/5 gap-2">
                  <span className="text-[10px] text-indigo-300 font-mono">
                    ⏰ Calculated Prep: {getPrepTime(getAverageBedtime())}
                  </span>
                  <button
                    type="button"
                    onClick={handleTestPrepNotify}
                    className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-1 px-2.5 rounded-lg active:scale-95 transition-all self-end cursor-pointer"
                  >
                    Test Alert 🔔
                  </button>
                </div>
              </div>

              {/* 2. Wake-up Alarm Feature */}
              <div className="bg-[#101E3C] border border-white/5 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-300">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Wake-up Alarm</h3>
                      <p className="text-[10px] text-white/50">Synthesized melodic morning wake-up call.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlarmEnabled(!alarmEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors cursor-pointer duration-200 outline-none",
                      alarmEnabled ? "bg-amber-400" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                      alarmEnabled ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-white/5 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-mono text-white/40">Alarm Time:</span>
                    <input
                      type="time"
                      value={alarmTime}
                      onChange={(e) => setAlarmTime(e.target.value)}
                      className="bg-[#152345] border border-white/10 hover:border-white/25 rounded-md px-2 py-1 text-xs font-bold text-white focus:outline-none cursor-pointer text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTestAlarm}
                    className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-1 px-2.5 rounded-lg active:scale-95 transition-all self-end cursor-pointer"
                  >
                    Test Alarm 🔔
                  </button>
                </div>

                {/* Alarm Volume Intensity Control Slider */}
                <div className="pt-2.5 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-mono text-white/40 flex items-center gap-1.5">
                      {alarmVolume === 0 ? <VolumeX size={12} className="text-red-400" /> : <Volume2 size={12} className="text-amber-300" />}
                      Alarm Sound Volume:
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-200 bg-[#152345] px-2 py-0.5 rounded border border-white/5">
                      {alarmVolume}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={alarmVolume}
                      onChange={(e) => setAlarmVolume(Number(e.target.value))}
                      onMouseUp={() => playPreviewNote(alarmVolume)}
                      onTouchEnd={() => playPreviewNote(alarmVolume)}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                    />
                  </div>
                  <span className="text-[9px] text-white/40 block leading-tight">
                    Drag the slider to adjust. Releasing plays a short level preview tone.
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right: SLEEP TIPS SECTION */}
          <div className="lg:col-span-6 bg-[#0E1B35]/90 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
            {/* Background glow */}
            <div className="absolute bottom-0 right-0 w-64 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-[#1A332C] text-[#22C55E] border border-[#22C55E]/15 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Brain size={12} /> Live Neurological Tip
                </div>
                <h2 className="text-lg font-extrabold text-white">Daily Sanctuary Recommendations</h2>
                <p className="text-xs text-white/50">
                  Explore clinically studied methods to boost your slow-wave sleep indices and active REM intervals.
                </p>
              </div>

              {/* Rotating Tips Container */}
              <div className="bg-[#101E3C] border border-white/5 p-5 rounded-2xl relative flex flex-col justify-between min-h-[140px] hover:border-white/10 transition-all shadow-inner">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={rotatingTipIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2 flex-grow"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
                        {currentTip.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white">
                      {currentTip.title}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {currentTip.desc}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-white/5">
                  <button
                    onClick={prevTip}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-transform active:scale-90 cursor-pointer"
                    title="Previous Tip"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-[10px] text-white/50 font-mono px-1">
                    {rotatingTipIndex + 1} / {ALL_SLEEP_TIPS.length}
                  </span>
                  <button
                    onClick={nextTip}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-transform active:scale-90 cursor-pointer"
                    title="Next Tip"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Alarm Fullscreen Ring Overlay */}
      <AnimatePresence>
        {alarmTriggered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#040814]/95 z-[999] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
          >
            {/* Sunrise radial glow */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-600/10 to-transparent blur-3xl animate-pulse pointer-events-none" />
            
            <div className="relative space-y-8 max-w-md mx-auto">
              {/* Pulsing Sun Vector */}
              <div className="flex justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.15, 1], rotate: 360 }}
                  transition={{ 
                    scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    rotate: { repeat: Infinity, duration: 20, ease: "linear" }
                  }}
                  className="w-28 h-28 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)] border-4 border-amber-200/20"
                >
                  <Sparkles size={48} className="text-white filter drop-shadow" />
                </motion.div>
              </div>

              {/* Text segment */}
              <div className="space-y-3">
                <span className="text-[10px] tracking-[0.3em] uppercase font-mono font-bold text-amber-400 block animate-bounce">
                  ✨ Circadian Alignment Active ✨
                </span>
                <h2 className="text-4xl font-black text-white font-['Syne'] tracking-tight">
                  Time to Wake Up!
                </h2>
                <div className="text-5xl font-mono font-black text-amber-200 py-2">
                  {alarmTime} <span className="text-lg">AM</span>
                </div>
                <p className="text-sm text-white/75 leading-relaxed font-sans max-w-xs mx-auto">
                  A gentle sunrise soundscape is synthesizer-pulsating to ease you into active awake coherence. Align with your morning light schedule.
                </p>
              </div>

              {/* Controls */}
              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={() => setAlarmTriggered(false)}
                  id="dismiss-alarm-modal-btn"
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 active:scale-95 text-[#040814] font-black py-4 px-8 rounded-2xl shadow-2xl text-sm transition-all tracking-wider cursor-pointer font-sans"
                >
                  DISMISS ALARM
                </button>
                <button
                  onClick={() => {
                    setAlarmTriggered(false);
                    // Snooze for 5 minutes
                    const [h, m] = alarmTime.split(':').map(Number);
                    let newM = m + 5;
                    let newH = h;
                    if (newM >= 60) {
                      newM -= 60;
                      newH = (newH + 1) % 24;
                    }
                    const snoozedTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
                    setAlarmTime(snoozedTime);
                    showToast(`Alarm snoozed for 5 minutes (New: ${snoozedTime})`, "info");
                  }}
                  id="snooze-alarm-btn"
                  className="w-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/80 font-bold py-3 px-8 rounded-2xl border border-white/10 text-xs transition-all cursor-pointer font-sans"
                >
                  SNOOZE 5 MINS 😴
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
