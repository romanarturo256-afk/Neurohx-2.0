import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Zap, 
  Coffee, 
  Bell, 
  BellOff,
  ChevronRight,
  Sparkles,
  Brain
} from 'lucide-react';
import { cn } from '../lib/utils';

const PRESETS = [
  { label: 'Pomodoro', minutes: 25, icon: Timer, color: 'bg-orange-500/10 text-orange-600' },
  { label: 'Deep Work', minutes: 50, icon: Brain, color: 'bg-indigo-500/10 text-indigo-600' },
  { label: 'Flow State', minutes: 90, icon: Zap, color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Short Break', minutes: 5, icon: Coffee, color: 'bg-emerald-500/10 text-emerald-600' },
];

const ALARM_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // Professional digital alarm

export default function DeepWorkTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio playback prevented:', e));
    }
    // Browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification('Deep Work Session Complete!', {
        body: 'Time to take a well-deserved break.',
        icon: '/favicon.ico'
      });
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const setPreset = (minutes: number) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
    setInitialTime(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
          <Brain size={12} />
          Cognitive Optimization
        </div>
        <h1 className="font-['Syne'] text-4xl lg:text-5xl font-bold text-[#1a2b27] leading-tight">
          Master your <span className="italic text-primary">Flow.</span>
        </h1>
        <p className="text-[#4a5a57] max-w-md text-sm leading-relaxed">
          The biological limit for high-intensity focus is roughly 90 minutes. Use these intervals to train your prefrontal cortex.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Timer Display */}
        <div className="lg:col-span-12">
          <div className="bg-white rounded-[48px] border border-[#1a2b27]/5 shadow-xl shadow-[#1a2b27]/5 p-8 md:p-16 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <div className="w-[600px] h-[600px] border-[40px] border-primary rounded-full" />
              <div className="absolute w-[400px] h-[400px] border-[20px] border-primary rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-2xl">
              <div className="relative">
                <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    className="stroke-primary/5 fill-none"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    className="stroke-primary fill-none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    animate={{ strokeDasharray: "301.59" }} // Approximate circumference for r=48%
                    style={{ 
                      strokeDashoffset: 301.59 - (301.59 * progress) / 100,
                      pathLength: 1
                    }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    key={timeLeft}
                    initial={{ opacity: 0.8, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-['JetBrains_Mono'] text-6xl md:text-7xl font-bold tracking-tighter text-[#1a2b27]"
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 mt-2">
                    {isActive ? 'Session Active' : 'Ready to Start'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={resetTimer}
                  className="w-14 h-14 rounded-full border border-primary/10 flex items-center justify-center text-[#4a5a57] hover:bg-primary/5 transition-all active:scale-90"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={toggleTimer}
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95",
                    isActive ? "bg-white border-2 border-primary text-primary" : "bg-primary text-white"
                  )}
                >
                  {isActive ? <Pause size={32} /> : <Play size={32} className="translate-x-1" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn(
                    "w-14 h-14 rounded-full border border-primary/10 flex items-center justify-center transition-all active:scale-90",
                    isMuted ? "bg-red-50 text-red-500 border-red-100" : "text-[#4a5a57] hover:bg-primary/5"
                  )}
                >
                  {isMuted ? <BellOff size={20} /> : <Bell size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="lg:col-span-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setPreset(preset.minutes)}
                className={cn(
                  "p-8 rounded-[40px] border text-left transition-all duration-300 group hover:shadow-xl hover:shadow-[#1a2b27]/5",
                  initialTime === preset.minutes * 60 
                    ? "bg-white border-primary border-2" 
                    : "bg-white border-[#1a2b27]/5 hover:border-primary/20"
                )}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", preset.color)}>
                  <preset.icon size={20} />
                </div>
                <h3 className="font-['Syne'] text-lg font-bold text-[#1a2b27] mb-1">{preset.label}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#4a5a57] font-medium">{preset.minutes} Minutes</span>
                  <ChevronRight size={14} className="text-[#4a5a57] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Focus Tips */}
        <div className="lg:col-span-12">
          <div className="bg-[#1a2b27] rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles size={80} />
            </div>
            <div className="max-w-2xl space-y-6 relative z-10">
              <h2 className="font-['Syne'] text-2xl font-bold">Scientific Deep Work Protocols</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h4 className="text-primary font-bold text-sm uppercase tracking-widest">Environment</h4>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Visual clutter competing for your attention. Clear your workspace and silent all non-essential notifications before starting a 90-minute block.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-primary font-bold text-sm uppercase tracking-widest">Bioluminance</h4>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Exposure to natural blue light in the morning stabilizes dopamine. Use the Flow State preset after your morning sunlight exposure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={ALARM_URL} preload="auto" />
    </div>
  );
}
