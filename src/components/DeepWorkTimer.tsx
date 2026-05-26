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
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12 text-[#F0F4FF]">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4C8]/10 text-[#00D4C8] text-[10px] font-bold uppercase tracking-widest border border-[#00D4C8]/25 shadow-[0_0_10px_rgba(0,212,200,0.1)]">
          <Brain size={12} />
          Cognitive Optimization
        </div>
        <h1 className="font-['Syne'] text-4xl lg:text-5xl font-bold text-white leading-tight">
          Master your <span className="italic text-[#00D4C8] text-glow-accent">Flow.</span>
        </h1>
        <p className="text-[#A0A5C0] max-w-md text-sm leading-relaxed">
          The biological limit for high-intensity focus is roughly 90 minutes. Use these intervals to train your prefrontal cortex.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Timer Display */}
        <div className="lg:col-span-12">
          <div className="bg-white/[0.05] rounded-[48px] border border-white/10 p-8 md:p-16 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
            {/* Background Decorative Rings */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <div className="w-[600px] h-[600px] border-[40px] border-[#00D4C8] rounded-full" />
              <div className="absolute w-[400px] h-[400px] border-[20px] border-[#00D4C8] rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-2xl">
              <div className="relative">
                <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    className="stroke-white/5 fill-none"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    className="stroke-[#00D4C8] fill-none"
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
                    className="font-['JetBrains_Mono'] text-6xl md:text-7xl font-bold tracking-tighter text-white"
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00D4C8] mt-2">
                    {isActive ? 'Session Active' : 'Ready to Start'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={resetTimer}
                  className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-[#A0A5C0] hover:bg-white/[0.05] hover:text-white transition-all active:scale-90 cursor-pointer"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={toggleTimer}
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer",
                    isActive ? "bg-white/[0.08] border border-white/20 text-[#00D4C8]" : "bg-[#00D4C8] text-[#0A0F2C]"
                  )}
                >
                  {isActive ? <Pause size={32} /> : <Play size={32} className="translate-x-1" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn(
                    "w-14 h-14 rounded-full border border-white/10 flex items-center justify-center transition-all active:scale-90 cursor-pointer",
                    isMuted ? "bg-red-500/20 text-red-400 border-red-500/30" : "text-[#A0A5C0] hover:bg-white/[0.05]"
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
                  "p-6 lg:p-8 rounded-[40px] border text-left transition-all duration-300 group hover:shadow-xl hover:shadow-[#00D4C8]/5 backdrop-blur-md cursor-pointer flex flex-col justify-between h-full min-h-[220px]",
                  initialTime === preset.minutes * 60 
                    ? "bg-white/[0.1] border-[#00D4C8] border-2 shadow-[0_0_15px_rgba(0,212,200,0.1)]" 
                    : "bg-white/[0.05] border-white/10 hover:border-[#00D4C8]/30"
                )}
              >
                <div>
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", preset.color)}>
                    <preset.icon size={20} />
                  </div>
                  <h3 className="font-['Syne'] text-lg font-bold text-white mb-1 leading-snug">{preset.label}</h3>
                </div>
                <div className="flex items-center justify-between w-full mt-auto pt-4">
                  <span className="text-[13px] text-[#A0A5C0] font-medium whitespace-nowrap">{preset.minutes} Minutes</span>
                  <ChevronRight size={14} className="text-[#00D4C8] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Focus Tips */}
        <div className="lg:col-span-12">
          <div className="bg-white/[0.05] rounded-[40px] p-8 md:p-12 text-white border border-white/10 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles size={80} />
            </div>
            <div className="max-w-2xl space-y-6 relative z-10">
              <h2 className="font-['Syne'] text-2xl font-bold text-white">Scientific Deep Work Protocols</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h4 className="text-[#00D4C8] font-bold text-sm uppercase tracking-widest">Environment</h4>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Visual clutter competing for your attention. Clear your workspace and silent all non-essential notifications before starting a 90-minute block.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[#9B8EC4] font-bold text-sm uppercase tracking-widest">Bioluminance</h4>
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
