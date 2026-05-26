import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Snowflake, 
  Compass, 
  Sparkles, 
  Calendar, 
  Lock, 
  Info, 
  CheckCircle2, 
  Trophy, 
  Zap, 
  ArrowRight,
  RefreshCw,
  Gift,
  HelpCircle,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';

// Cute Duolingo-style neural advice lines based on streak
const MASCOT_MESSAGES = [
  "You're building reliable neural pathways! Keep this momentum up.",
  "Dopamine levels are stabilizing. Just 5 minutes of mindful focus today keeps the streak blazing!",
  "A habit freeze is equipped to bulletproof your consistency. Excellent defense!",
  "Clinical studies show that 7+ day alignment creates massive long-term synaptogenesis.",
  "Your prefrontal cortex is glowing today! Let's conquer one simple clinical task.",
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

export default function DuolingoStreak() {
  const { profile, updateProfile } = useUser();
  const [clickParticles, setClickParticles] = useState<Particle[]>([]);
  const [activeTab, setActiveTab] = useState<'tracker' | 'shop' | 'badges'>('tracker');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Determine if login today is registered
  const todayStr = new Date().toISOString().split('T')[0];
  const claimedXPToday = profile?.lastClaimedXPDate === todayStr;

  // Fallback defaults for gamification properties
  const streakCount = profile?.streak?.count ?? 0;
  const lastLoginStr = profile?.streak?.lastLoginDate ?? '';
  const lastFreezeStr = profile?.streak?.lastFreezeUsed ?? '';
  const currentXP = profile?.xp ?? 120; // Default startup XP if undefined
  const freezesCount = profile?.streakFreezes ?? 1; // Default startup freeze if undefined

  const loggedInToday = lastLoginStr === todayStr;

  // Sound triggering function
  const playSound = (freqAndType: 'success' | 'click' | 'freeze') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (freqAndType === 'success') {
        // Double sweet note
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (freqAndType === 'freeze') {
        // High shimmery chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Simple subtle clean click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      console.log('Audio Context suppressed or unavailable:', e);
    }
  };

  // Generate embers upon clicking the flame
  const handleFlameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    playSound('click');
    const rect = e.currentTarget.getBoundingClientRect();
    const count = 12;
    const newParticles: Particle[] = [];

    const colors = streakIceActive 
      ? ['#60a5fa', '#38bdf8', '#7dd3fc', '#e0f2fe'] 
      : ['#f97316', '#ef4444', '#facc15', '#fef08a'];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: (e.clientX - rect.left) + (Math.random() * 40 - 20),
        y: (e.clientY - rect.top) + (Math.random() * 40 - 20),
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 1.2 + 0.6
      });
    }

    setClickParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setClickParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1800);
  };

  // Weekly check-in Mon-Sun evaluation
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday is index 0

  // Determine if a streak freeze saved the day yesterday
  const wasFreezeYesterday = lastFreezeStr === new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const streakIceActive = freezesCount > 0 && lastFreezeStr !== '';

  const getDayStatus = (index: number) => {
    if (index === todayIndex) {
      return loggedInToday ? 'completed' : 'today';
    }
    if (index < todayIndex) {
      // Prior days of the week are marked completed or freeze-repaired
      if (index === todayIndex - 1 && wasFreezeYesterday) {
        return 'frozen';
      }
      // Simple representation of standard check-in for aesthetic consistency
      return 'completed';
    }
    return 'upcoming';
  };

  // Buy a Streak Freeze
  const buyStreakFreeze = async () => {
    if (currentXP < 50) {
      playSound('click');
      showToast("Not enough Mindfulness XP! Complete focus tasks, write journals, or check in daily to accumulate XP.");
      return;
    }

    const nextXP = currentXP - 50;
    const nextFreezes = freezesCount + 1;

    try {
      await updateProfile({
        xp: nextXP,
        streakFreezes: nextFreezes
      });
      playSound('freeze');
      showToast("Frozen shield expanded! 1 Streak Freeze successfully equipped.");
    } catch (err) {
      console.error('Failed to buy streak freeze:', err);
    }
  };

  const claimDailyBonus = async () => {
    if (claimedXPToday) return;
    const nextXP = currentXP + 15;
    
    // Also trigger profile increment in count if they haven't logged in today
    let updateObj: any = { 
      xp: nextXP,
      lastClaimedXPDate: todayStr
    };
    
    if (!loggedInToday) {
      updateObj.streak = {
        count: streakCount + 1,
        lastLoginDate: todayStr,
        lastFreezeUsed: lastFreezeStr || null
      };
    }

    try {
      await updateProfile(updateObj);
      playSound('success');
      showToast("+15 Mindful XP added directly to your profile!");
    } catch (err) {
      console.error('Failed to claim daily bonus:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Static list of fun milestones
  const achievementBadges = [
    { title: "Spark", desc: "Start a 3-day focus series", unlocked: streakCount >= 3, max: 3, icon: Sparkles, color: "text-amber-500 bg-amber-50" },
    { title: "Wildfire", desc: "Reach 7-day neurological alignment", unlocked: streakCount >= 7, max: 7, icon: Flame, color: "text-orange-500 bg-orange-50" },
    { title: "Zen Frost", desc: "Equip a defensive streak freeze shield", unlocked: freezesCount > 0, max: 1, icon: Snowflake, color: "text-sky-500 bg-sky-50" },
    { title: "Cognitive Sage", desc: "Acquire over 200 total Mindful XP", unlocked: currentXP >= 200, max: 200, icon: Trophy, color: "text-violet-500 bg-violet-50" },
  ];

  return (
    <div className="bg-white rounded-[40px] border border-[#e0dbd0] p-5 sm:p-8 md:p-10 shadow-sm relative overflow-hidden flex flex-col justify-between h-full group">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 inset-x-8 z-30 bg-gray-900 text-white p-4 rounded-3xl text-xs font-semibold shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <span className="flex-1 leading-relaxed">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 sm:space-y-8">
        
        {/* Header containing metadata, XP indicator and sound controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-[0.15em] bg-red-500/10 text-red-600 px-2.5 py-1 rounded-full border border-red-500/15 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Dynamic Streak Engine
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Mindful XP Counter */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/15 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
              <Zap size={10} fill="currentColor" />
              <span>{currentXP} XP</span>
            </div>

            {/* Frost Shield status indicator */}
            <div className="flex items-center gap-1.5 bg-sky-500/10 text-sky-600 border border-sky-500/15 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
              <Snowflake size={10} />
              <span>{freezesCount} Saved</span>
            </div>

            {/* Sound Effects Toggle Button */}
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
              title={soundEnabled ? "Mute sound effects" : "Unmute sound effects"}
            >
              {soundEnabled ? <Volume2 size={14} className="text-primary" /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>

        {/* Section Tabs (Dashboard / Store / Badges) */}
        <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-[24px]">
          <button
            onClick={() => { playSound('click'); setActiveTab('tracker'); }}
            className={cn(
              "flex-1 py-1.5 sm:py-2 px-1 rounded-[18px] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all truncate cursor-pointer",
              activeTab === 'tracker' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Tracker
          </button>
          <button
            onClick={() => { playSound('click'); setActiveTab('shop'); }}
            className={cn(
              "flex-1 py-1.5 sm:py-2 px-1 rounded-[18px] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all truncate cursor-pointer",
              activeTab === 'shop' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Freeze Store
          </button>
          <button
            onClick={() => { playSound('click'); setActiveTab('badges'); }}
            className={cn(
              "flex-1 py-1.5 sm:py-2 px-1 rounded-[18px] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all truncate cursor-pointer",
              activeTab === 'badges' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Milestones ({achievementBadges.filter(b => b.unlocked).length})
          </button>
        </div>

        {/* Main Tab Views */}
        <AnimatePresence mode="wait">
          {activeTab === 'tracker' && (
            <motion.div
              key="tracker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              
              {/* Interactive Flame/Frost Render Section */}
              <div className="flex flex-col items-center justify-center py-6 relative">
                
                {/* Floating ember particles inside the containment card */}
                {clickParticles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute rounded-full pointer-events-none z-10"
                    style={{
                      left: particle.x,
                      top: particle.y,
                      backgroundColor: particle.color,
                      width: particle.size,
                      height: particle.size
                    }}
                    initial={{ scale: 1, opacity: 1, y: 0 }}
                    animate={{ 
                      y: -120 + Math.random() * -60, 
                      x: (Math.random() * 80 - 40),
                      scale: 0, 
                      opacity: 0 
                    }}
                    transition={{ duration: particle.duration, ease: "easeOut" }}
                  />
                ))}

                {/* Big interactive Flame container */}
                <div 
                  onClick={handleFlameClick}
                  className="cursor-pointer relative flex items-center justify-center transition-all group/flame"
                >
                  {/* Decorative glowing background rings */}
                  <div className={cn(
                    "absolute w-44 h-44 rounded-full blur-3xl opacity-25 group-hover/flame:scale-110 transition-transform duration-500",
                    streakIceActive 
                      ? "bg-gradient-to-tr from-sky-400 to-indigo-500" 
                      : "bg-gradient-to-tr from-orange-400 to-red-600"
                  )} />

                  {/* Pulsing ring */}
                  <div className={cn(
                    "absolute w-36 h-36 rounded-full border-2 animate-ping opacity-15 pointer-events-none",
                    streakIceActive ? "border-sky-400" : "border-orange-500"
                  )} />

                  {/* Actual Flame/Frost Icon Card */}
                  <div className={cn(
                    "w-32 h-32 rounded-full flex items-center justify-center relative shadow-2xl transition-transform hover:scale-105 active:scale-95 duration-300",
                    streakIceActive 
                      ? "bg-gradient-to-tr from-sky-400 to-blue-600 border-4 border-white" 
                      : "bg-gradient-to-tr from-orange-500 to-red-600 border-4 border-white text-white"
                  )}>
                    {streakIceActive ? (
                      <div className="relative text-white flex flex-col items-center justify-center">
                        <Snowflake size={52} className="animate-spin-slow text-sky-100" />
                        <Flame size={24} fill="currentColor" className="absolute text-cyan-300 fill-cyan-400 bottom-2" />
                      </div>
                    ) : (
                      <Flame size={56} fill="currentColor" className="animate-pulse" />
                    )}
                  </div>

                  {/* Absolute streak count badge offset */}
                  <span className="absolute bottom-0 bg-gray-900 border border-white/20 text-white font-mono text-sm px-4 py-1.5 rounded-full shadow-lg font-black tracking-tight select-none">
                    {streakCount} {streakCount === 1 ? 'DAY' : 'DAYS'}
                  </span>
                </div>

                <div className="mt-8 text-center max-w-sm space-y-1.5">
                  <h4 className="font-['Syne'] text-lg font-black text-gray-900 uppercase">
                    {streakCount > 0 ? "STREAK COMPLETED" : "INACTIVE BURST"}
                  </h4>
                  <p className="text-[11px] text-[#888880] font-medium leading-relaxed">
                    {streakCount > 0 
                      ? `Fantastic alignment! You checked in successfully. Next milestone is unlocked in ${Math.max(1, 7 - (streakCount % 7))} days.`
                      : "Log in every day to light up your prefrontal spark and safeguard your clinic metrics."
                    }
                  </p>
                </div>
              </div>

              {/* Mon-Sun Calendar Row */}
              <div className="bg-[#fcfaf7] border border-[#e0dbd0]/40 rounded-[32px] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#888880] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={11} className="text-secondary" />
                    Current Week Progress
                  </span>
                  <span className="text-[9px] text-[#4a5a57] font-bold bg-[#f5f2eb] px-2 py-0.5 rounded-full">
                    Week of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day, idx) => {
                    const status = getDayStatus(idx);
                    const isToday = idx === todayIndex;

                    return (
                      <div key={day} className="flex flex-col items-center space-y-2">
                        <span className={cn(
                          "text-[9px] font-bold uppercase",
                          isToday ? "text-[#111110] font-extrabold" : "text-gray-400"
                        )}>
                          {day}
                        </span>

                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all relative border",
                          status === 'completed' && "bg-gradient-to-tr from-orange-400 to-red-500 text-white border-transparent shadow-md shadow-orange-500/10",
                          status === 'frozen' && "bg-gradient-to-tr from-sky-400 to-blue-500 text-white border-transparent shadow-md shadow-sky-500/10",
                          status === 'today' && "bg-white text-gray-900 border-[#1a2b27] border-2 animate-pulse",
                          status === 'upcoming' && "bg-[#f5f2eb] text-[#888880] border-[#e0dbd0]/20"
                        )}>
                          {status === 'completed' && <Flame size={14} fill="currentColor" />}
                          {status === 'frozen' && <Snowflake size={14} />}
                          {status === 'today' && <span className="w-2 h-2 bg-primary rounded-full" />}
                          {status === 'upcoming' && <Lock size={10} className="text-[#888880]/30" />}

                          {/* Highlight current selection ring */}
                          {isToday && (
                            <span className="absolute -inset-1 rounded-full border border-dashed border-[#1a2b27]/30" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete Daily Nudge (claim initial XP or show lock) */}
              {!claimedXPToday && (
                <div className="flex items-center justify-between bg-gradient-to-br from-[#1a2b27] to-[#253f39] text-white p-6 rounded-[32px] overflow-hidden relative">
                  <div className="absolute right-0 bottom-0 pointer-events-none opacity-10">
                    <Gift size={120} />
                  </div>
                  <div className="space-y-1 z-10 max-w-[200px] sm:max-w-xs">
                    <h5 className="text-[12px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Sparkles size={11} fill="currentColor" />
                      Daily Check-In Reward
                    </h5>
                    <p className="text-[10px] text-white/70 leading-relaxed">
                      Grab your day-to-day bio-balance stimulus to earn freezes and bonus trophies.
                    </p>
                  </div>

                  <button
                    onClick={claimDailyBonus}
                    disabled={claimedXPToday}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md z-10 shrink-0",
                      "bg-amber-400 text-gray-900 hover:bg-amber-300 hover:scale-[1.03]"
                    )}
                  >
                    Claim +15 XP
                  </button>
                </div>
              )}

            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center py-4">
                <h4 className="font-['Syne'] text-base font-bold text-gray-900">STREAK FREEZE STORE</h4>
                <p className="text-[11px] text-[#888880] mt-1">Spend your Mindful XP accrued to acquire safety shields.</p>
              </div>

              {/* Freeze Marketplace Card */}
              <div className="border border-[#e0dbd0]/50 rounded-[32px] p-6 bg-gradient-to-r from-sky-50 to-indigo-50/30 flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-16 h-16 rounded-[24px] bg-white text-sky-500 border border-[#e0dbd0] flex items-center justify-center shadow-md animate-pulse">
                    <Snowflake size={32} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-black uppercase tracking-wider text-gray-900">Streak Freeze Seal</h5>
                    <p className="text-[10px] text-[#888880] leading-relaxed max-w-xs">
                      Prevents your login series from resetting if you miss check-in routines. Triggers automatically upon missed logins.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-extrabold text-blue-600 bg-blue-100/60 border border-blue-200/50 px-3 py-1 rounded-full">
                    50 XP
                  </span>
                  <button
                    onClick={buyStreakFreeze}
                    disabled={currentXP < 50}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all"
                  >
                    <Plus size={10} /> Buy & Equip
                  </button>
                </div>
              </div>

              {/* Helpful FAQ snippet */}
              <div className="bg-[#fcfaf7] border border-[#e0dbd0]/30 rounded-[24px] p-5 flex items-start gap-3">
                <Info size={14} className="text-[#888880] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#888880] leading-relaxed">
                  <strong>When does it activate?</strong> If you spend over 36 hours offline, your freeze count decreases by 1 to shield your record. Weekly regeneration is capped at one defense use.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-center py-2">
                <h4 className="font-['Syne'] text-base font-bold text-gray-900">Milestones & Relics</h4>
                <p className="text-[11px] text-[#888880] mt-1">Strengthen consistency to claim rare neural badges.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievementBadges.map((badge, idx) => (
                  <div 
                    key={badge.title}
                    className={cn(
                      "p-5 rounded-[28px] border flex items-center gap-4 transition-all duration-350",
                      badge.unlocked 
                        ? "bg-white border-green-200/50 shadow-sm" 
                        : "bg-gray-50/50 border-gray-100 opacity-60"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0", badge.color)}>
                      <badge.icon size={20} className={cn(badge.unlocked && "animate-pulse")} />
                    </div>

                    <div className="text-left space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-gray-900 truncate">{badge.title}</h5>
                        {badge.unlocked && (
                          <span className="text-[8px] bg-green-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                            Claimed
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-[#888880] leading-snug">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Duolingo Mascot Bubble Row */}
      <div className="pt-6 mt-6 border-t border-[#e0dbd0]/40 flex items-center gap-4 text-left">
        <div className="w-12 h-12 rounded-[20px] bg-[#1a2b27] flex items-center justify-center text-white shrink-0 shadow-lg relative group-hover:scale-105 transition-transform">
          <Compass size={24} className="text-amber-400 fill-amber-400/10 animate-bounce" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
        </div>

        <div className="bg-[#fcfaf7] border border-[#e0dbd0]/50 p-4 rounded-3xl relative flex-1">
          <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-[#fcfaf7] border-l border-b border-[#e0dbd0]/50 rotate-45" />
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-1 select-none">DUAL ADVISORY</p>
          <p className="text-[10px] text-[#4a5a57] leading-relaxed font-semibold italic">
            "{MASCOT_MESSAGES[Math.min(MASCOT_MESSAGES.length - 1, Math.max(0, streakCount % MASCOT_MESSAGES.length))]}"
          </p>
        </div>
      </div>

    </div>
  );
}
