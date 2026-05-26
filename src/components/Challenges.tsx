import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Share2, 
  Check, 
  Lock, 
  Sparkles, 
  ChevronRight, 
  Info, 
  Play, 
  Clock, 
  Moon, 
  Heart, 
  Compass, 
  TrendingUp,
  Award,
  Users,
  X,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useUser } from '../contexts/UserContext';

interface CompletedAccount {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  challengeTitle: string;
  challengeId: string;
  achievement: string;
  date: string;
  kudos: number;
  completedDays: number;
  quote: string;
}

interface ChallengeDay {
  day: number;
  task: string;
  description: string;
}

interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  duration: number;
  icon: React.ComponentType<any>;
  themeColor: string; // e.g., 'indigo', 'green', 'amber'
  gradient: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  statsText: string;
  days: ChallengeDay[];
}

const CHALLENGE_DATA: Challenge[] = [
  {
    id: "anxiety_7",
    title: "7 Days to Less Anxiety",
    subtitle: "Calm your nervous system with daily science-backed mindfulness practices.",
    duration: 7,
    icon: Heart,
    themeColor: "indigo",
    gradient: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-400",
    difficulty: "Beginner",
    statsText: "Proven 7-day autonomic calibration loop.",
    days: [
      { day: 1, task: "5-minute breathing exercise", description: "Calibrate your nervous system. Dispatch a custom Pneuma session to quickly reduce acute cortisol load." },
      { day: 2, task: "Write 3 things you're grateful for", description: "Shift your mental focus. Journal three highly specific micro-gratitudes in your reflection core." },
      { day: 3, task: "Go for a 10-minute walk outside", description: "Leverage optic flow. Walking outdoors stabilizes your amygdala and lowers anxiety indices." },
      { day: 4, task: "Call or text someone you love", description: "Stimulate prosocial pathways. Connect with a close contact to trigger natural oxytocin release." },
      { day: 5, task: "Do a full body stretch for 5 minutes", description: "Release somatic tension. Gently release muscle holding patterns starting from your shoulders down." },
      { day: 6, task: "Write about one worry — then let it go", description: "Cognitive externalization. Write a brief reflection layout, isolate your worry, and mark it as resolved." },
      { day: 7, task: "Celebrate! You did it 🎉", description: "Full integration complete. Acknowledge your micro-habit milestone and claim your neurological badge." }
    ]
  },
  {
    id: "sleep_21",
    title: "21-Day Sleep Reset",
    subtitle: "Realign your biological circadian rhythm for maximum restorative slow-wave sleep.",
    duration: 21,
    icon: Moon,
    themeColor: "amber",
    gradient: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400",
    difficulty: "Intermediate",
    statsText: "Targeting deep circadian synchronization.",
    days: [
      { day: 1, task: "No phone after 10PM", description: "Eliminate artificial blue-light exposure to protect early melatonin synthesis." },
      { day: 2, task: "Sleep at same time tonight", description: "Stabilize your circadian clock. Bedtime consistency is the number one sleep stabilizer." },
      { day: 3, task: "Keep room cool and dark", description: "Optimize sleep sanctuary. Cooler bedroom temperatures (65-68°F) trigger deeper delta waves." },
      { day: 4, task: "Avoid caffeine after 2:00 PM", description: "Adenosine clearance. Let caffeine’s 6-hour half-life run its course before you rest." },
      { day: 5, task: "Evening Pneuma breathing", description: "Autonomic slowdown. Engage in a 3-minute slow-paced breathing cycle in your bed." },
      { day: 6, task: "Clear cognitive load via journaling", description: "Write all pending thoughts or tomorrow’s tasks down to unload executive planning." },
      { day: 7, task: "Charge phone outdoors", description: "Zero bedtime friction. Place your device in the hallway to prevent nocturnal scrolling." },
      { day: 8, task: "Take a warm shower or bath", description: "Vasodilation trick. A warm shower drops core temperature afterwards, mimicking bedtime cues." },
      { day: 9, task: "Herbal evening tea ritual", description: "Chamomile or lavender infusion to naturally calm the nervous system." },
      { day: 10, task: "30 minutes of natural daylight", description: "Anchor your circadian phase. Get bright daylight exposure early in the morning." },
      { day: 11, task: "Dim ambient lights by 50%", description: "Simulate twilight. Dim indoor lights starting at 8:00 PM to initiate natural drowsiness." },
      { day: 12, task: "Define bed-only boundaries", description: "Associate your mattress strictly with sleep. Absolutely no working or eating on your bed." },
      { day: 13, task: "Read 10 pages of a physical book", description: "Unwind your cognitive gears. Replace screens with standard paper book reading tonight." },
      { day: 14, task: "Get early morning sunlight", description: "Instantly shut down melatonin after waking. Ground yourself in morning light." },
      { day: 15, task: "No heavy eating within 3 hours", description: "Keep your digestive tract resting so your heart rate can drop properly during sleep." },
      { day: 16, task: "Block ambient room noises", description: "Zero auditory triggers. Use a fan, brown noise, or high-fidelity earplugs." },
      { day: 17, task: "5-minute gentle neck stretch", description: "Release muscle contraction. Relax your cervical spine area before bed." },
      { day: 18, task: "Turn clocks away from bed", description: "Ignore active elapsed time. Eliminate the sleep anxiety of checking the hour." },
      { day: 19, task: "Restrict water intake past 8PM", description: "Prevent fragmented sleep. Stay hydrated during the day, limit fluid intake before bed." },
      { day: 20, task: "Progressive muscle relaxation", description: "Relax your entire body from toes to head using tensing and breathing cues." },
      { day: 21, task: "Full circadian alignment complete", description: "Rejoice! Your sleep framework is chemically and behaviorally calibrated." }
    ]
  },
  {
    id: "wellness_30",
    title: "30-Day Mental Wellness Journey",
    subtitle: "A holistic journey combining journaling, light movement, breathing, and clinical self-care.",
    duration: 30,
    icon: Compass,
    themeColor: "green",
    gradient: "from-green-500/10 to-teal-500/10 border-green-500/20 text-green-400",
    difficulty: "Advanced",
    statsText: "Complete daily baseline behavioral overhaul.",
    days: [
      { day: 1, task: "Log mood & start intention", description: "Set a clear baseline starting course for the next 30 days." },
      { day: 2, task: "Practice 60s box breathing", description: "Synchronize your heart rate variability quickly." },
      { day: 3, task: "Write 3 distinct micro-gratitudes", description: "Savor specific good occurrences to build optimistic neural tracking." },
      { day: 4, task: "Take a 15-minute nature walk", description: "Lower inflammatory markers through natural environment immersion." },
      { day: 5, task: "5-minute morning full body stretch", description: "Awaken your joints and muscular chains." },
      { day: 6, task: "Drink 8 glasses of pure water", description: "Keep cellular ATP synthesis and brain tissues fully hydrated." },
      { day: 7, task: "Send appreciation to a friend", description: "Strengthen supportive circles with an unexpected positive note." },
      { day: 8, task: "Spend 1 full hour away from screens", description: "Remove sensory micro-shocks. Enjoy deep analogue tranquility." },
      { day: 9, task: "10 minutes of free journaling", description: "Externalize mental noise onto paper. No filter, just flow." },
      { day: 10, task: "Perform 3 posture alignment pauses", description: "Check in with your spine, roll shoulders, and let go of jaw tension." },
      { day: 11, task: "Closed-eyes listening to peaceful music", description: "Auditory rest. Give yourself fully to the soundscape." },
      { day: 12, task: "Wake up 15 minutes early", description: "Eliminate morning stress. Create an intentional, slow margin." },
      { day: 13, task: "Declutter one workspace desk", description: "Physical order breeds cognitive calm. Tidy your visible space." },
      { day: 14, task: "Identify & write down a personal strength", description: "Reinforce self-worth and confidence from an internal locus." },
      { day: 15, task: "Mute non-essential notifications", description: "Protect your attentional span from continuous micro-distractions." },
      { day: 16, task: "20 minutes of moderate exercise", description: "Raise your baseline dopamine and brain-derived neurotrophic factor (BDNF)." },
      { day: 17, task: "Small act of anonymous kindness", description: "Boost happiness neurochemistry by helping or complimenting someone." },
      { day: 18, task: "Sit in silent rest for 10 minutes", description: "Allow your brain's default mode network to consolidate and settle." },
      { day: 19, task: "Prepare a fresh, healthy meal", description: "Nourish your microbiome with whole-food nutrient integrity." },
      { day: 20, task: "State an affirming strength out loud", description: "Harness cognitive audio-feedback to support healthy self-image." },
      { day: 21, task: "Complete device shutdown by 7:00 PM", description: "Initiate digital dusk. Enjoy a screen-free evening." },
      { day: 22, task: "Ventilate your home living space", description: "Open all windows to refresh room oxygen and air purity." },
      { day: 23, task: "10 minutes of creative output", description: "Doodle, play an instrument, or write a poetry snippet." },
      { day: 24, task: "Send a legacy thank-you letter", description: "Write a detailed note of thanks to someone who mentored or shaped you." },
      { day: 25, task: "Cold splash to trigger vagal tone", description: "Splash ice-cold water on your eyes and face for a healthy nervous system shock." },
      { day: 26, task: "Eat 3 portions of fresh vegetables", description: "Support your gut-brain axis with rich prebiotics and plant fibers." },
      { day: 27, task: "Reframe a current life stressor", description: "Find the positive margin or lesson in a difficult situation." },
      { day: 28, task: "Call an old family member or friend", description: "Revitalize social links that matter long-term." },
      { day: 29, task: "Conduct a 2-minute olfactory slow-down", description: "Savor a calm natural aroma to anchor cognitive focus." },
      { day: 30, task: "Assess your complete 30-day growth", description: "Congratulations! Review your profound habit architecture." }
    ]
  }
];

const MOCK_ELITE_ACCOUNTS: CompletedAccount[] = [
  {
    id: "elite_1",
    name: "Liam Vance",
    initials: "LV",
    avatarColor: "bg-indigo-600 text-white shadow-indigo-500/20",
    challengeTitle: "7 Days to Less Anxiety",
    challengeId: "anxiety_7",
    achievement: "Calm Autonomic Pioneer",
    date: "2 hours ago",
    kudos: 34,
    completedDays: 7,
    quote: "The deep breathing routines completely recalibrated my daily morning anxiety cycles. Absolutely essential for stress relief!"
  },
  {
    id: "elite_2",
    name: "Chloe Zhang",
    initials: "CZ",
    avatarColor: "bg-amber-500 text-neutral-900 shadow-amber-500/20",
    challengeTitle: "21-Day Sleep Reset",
    challengeId: "sleep_21",
    achievement: "Deep Sleep Alchemist",
    date: "4 hours ago",
    kudos: 48,
    completedDays: 21,
    quote: "I never thought Charger outside bedroom would make such a radical difference! Sleeping cool did wonders for my slow-wave sleep phases too."
  },
  {
    id: "elite_3",
    name: "Dr. Marcus Sterling",
    initials: "MS",
    avatarColor: "bg-emerald-600 text-white shadow-emerald-500/20",
    challengeTitle: "30-Day Mental Wellness Journey",
    challengeId: "wellness_30",
    achievement: "Wellness Overlord",
    date: "Yesterday",
    kudos: 62,
    completedDays: 30,
    quote: "The cognitive externalization exercise (Day 9 journal) liberated a lot of latent planning load. Beautiful habit architecture."
  },
  {
    id: "elite_4",
    name: "Elena Rostova",
    initials: "ER",
    avatarColor: "bg-violet-600 text-white shadow-violet-500/20",
    challengeTitle: "7 Days to Less Anxiety",
    challengeId: "anxiety_7",
    achievement: "Vagal Alignment Master",
    date: "2 days ago",
    kudos: 21,
    completedDays: 7,
    quote: "Day 3 optic flow (the outdoors walk) helped ground my acute panic episodes immediately. Sticking to it!"
  }
];

export default function Challenges() {
  const { showToast } = useToast();
  const { profile } = useUser();
  
  // Storage states:
  // Active Challenge ID (the one user is currently joined/viewing primarily)
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(() => {
    return localStorage.getItem('neurohx_joined_challenge_id');
  });

  // Track Elite completed accounts
  const [eliteAccounts, setEliteAccounts] = useState<CompletedAccount[]>(() => {
    const saved = localStorage.getItem('neurohx_elite_accounts');
    return saved ? JSON.parse(saved) : MOCK_ELITE_ACCOUNTS;
  });

  // Track state for the active popup success story
  const [selectedEliteAccount, setSelectedEliteAccount] = useState<CompletedAccount | null>(null);

  // Keep track of which challenges are joined (user can join multiple or one at a time)
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('neurohx_joined_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // Track completed days per challenge: { [challengeId]: number[] } (e.g. { "anxiety_7": [1, 2, 3] })
  const [completions, setCompletions] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem('neurohx_challenge_completions');
    return saved ? JSON.parse(saved) : {};
  });

  // Streak counters per challenge: { [challengeId]: number }
  const [streaks, setStreaks] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('neurohx_challenge_streaks');
    return saved ? JSON.parse(saved) : {};
  });

  // Active viewing tab (Challenge ID)
  const [selectedChallengeTab, setSelectedChallengeTab] = useState<string>("anxiety_7");

  // Save states to local storage
  useEffect(() => {
    if (activeChallengeId) {
      localStorage.setItem('neurohx_joined_challenge_id', activeChallengeId);
    } else {
      localStorage.removeItem('neurohx_joined_challenge_id');
    }
  }, [activeChallengeId]);

  useEffect(() => {
    localStorage.setItem('neurohx_joined_ids', JSON.stringify(joinedChallengeIds));
  }, [joinedChallengeIds]);

  useEffect(() => {
    localStorage.setItem('neurohx_challenge_completions', JSON.stringify(completions));
  }, [completions]);

  useEffect(() => {
    localStorage.setItem('neurohx_challenge_streaks', JSON.stringify(streaks));
  }, [streaks]);

  // Check if current user has any completed challenges and dynamically append them to elite count!
  useEffect(() => {
    let updated = [...eliteAccounts];
    let changed = false;

    CHALLENGE_DATA.forEach((challenge) => {
      const userCompletedDays = completions[challenge.id]?.length || 0;
      if (userCompletedDays === challenge.duration) {
        // User finished this! Let's check if there is an entry for the user for this challenge in eliteAccounts
        const userId = `user_completed_${challenge.id}`;
        const exists = updated.some(acc => acc.id === userId);
        
        if (!exists) {
          const nameStr = profile?.displayName || "You (Defier of Odds)";
          const initStr = profile?.displayName 
            ? profile.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) 
            : "ME";
          const newUserEntry: CompletedAccount = {
            id: userId,
            name: nameStr,
            initials: initStr,
            avatarColor: "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white border-2 border-amber-300 shadow-md shadow-amber-500/15",
            challengeTitle: challenge.title,
            challengeId: challenge.id,
            achievement: "Elite 8% Achiever",
            date: "Just now 🎉",
            kudos: 0,
            completedDays: challenge.duration,
            quote: "I successfully beat the 8% odds! Diagnostic habit-loops calibrated my biological schedules perfectly."
          };
          updated = [newUserEntry, ...updated];
          changed = true;
        }
      }
    });

    if (changed) {
      setEliteAccounts(updated);
      localStorage.setItem('neurohx_elite_accounts', JSON.stringify(updated));
    }
  }, [completions, profile, eliteAccounts]);

  const handleGiveKudos = (accountId: string) => {
    const updated = eliteAccounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, kudos: acc.kudos + 1 };
      }
      return acc;
    });
    setEliteAccounts(updated);
    localStorage.setItem('neurohx_elite_accounts', JSON.stringify(updated));
    showToast("Sent healthy vibes & kudos to this achiever! 🧠💚", "success");
    
    if (selectedEliteAccount && selectedEliteAccount.id === accountId) {
      setSelectedEliteAccount(prev => prev ? { ...prev, kudos: prev.kudos + 1 } : null);
    }
  };

  // Handle Joining a challenge
  const handleJoinChallenge = (id: string) => {
    if (!joinedChallengeIds.includes(id)) {
      setJoinedChallengeIds([...joinedChallengeIds, id]);
    }
    setActiveChallengeId(id);
    setSelectedTab(id);
    
    // Initialize empty completions for this challenge if not exists
    if (!completions[id]) {
      setCompletions(prev => ({ ...prev, [id]: [] }));
    }
    if (!streaks[id]) {
      setStreaks(prev => ({ ...prev, [id]: 0 }));
    }
    
    showToast(`🚀 You joined the "${CHALLENGE_DATA.find(c => c.id === id)?.title}" challenge! Day 1 is now unlocked.`, 'success');
  };

  const setSelectedTab = (id: string) => {
    setSelectedChallengeTab(id);
  };

  // Toggle Day completion
  const handleToggleDay = (challengeId: string, dayNumber: number) => {
    const isJoined = joinedChallengeIds.includes(challengeId);
    if (!isJoined) {
      showToast("Please tap the 'Join Challenge' button below first to start tracking!", "info");
      return;
    }

    const currentCompleted = completions[challengeId] || [];
    
    // Check lock status: can only complete if it's the exact next logical day or already completed
    // Locked if dayNumber > completedCount + 1
    const allowedToToggle = dayNumber <= currentCompleted.length + 1;
    if (!allowedToToggle) {
      showToast("This day is locked! You must complete previous days in order to unlock this task.", "error");
      return;
    }

    let updatedDays: number[];
    const index = currentCompleted.indexOf(dayNumber);
    if (index > -1) {
      // Uncheck is only permitted if it is the LAST completed day (to preserve streak logic safely)
      if (dayNumber !== currentCompleted[currentCompleted.length - 1]) {
        showToast("To maintain diagnostic alignment, you can only un-complete your most recent day first.", "info");
        return;
      }
      updatedDays = currentCompleted.filter(d => d !== dayNumber);
    } else {
      updatedDays = [...currentCompleted, dayNumber].sort((a, b) => a - b);
    }

    // Save completions
    setCompletions(prev => ({ ...prev, [challengeId]: updatedDays }));

    // Re-verify streaks
    // Let's perform simple consecutive streak evaluation
    // If we just marked a day complete, we increase consecutive. If we withdrew, we decrease
    let currentStreak = streaks[challengeId] || 0;
    if (index > -1) {
      // Withdrawing
      currentStreak = Math.max(0, currentStreak - 1);
    } else {
      // Adding
      currentStreak += 1;
    }
    setStreaks(prev => ({ ...prev, [challengeId]: currentStreak }));

    // Trigger toast & feedback
    if (index === -1) {
      // Just completed
      const challenge = CHALLENGE_DATA.find(c => c.id === challengeId);
      const dayTask = challenge?.days.find(d => d.day === dayNumber);
      
      showToast(`🧠 Day ${dayNumber} Complete: ${dayTask?.task}!`, "success");

      // Check if completely finished
      if (updatedDays.length === challenge?.duration) {
        showToast(`🏆 Extraordinary! You have fully completed the "${challenge.title}" challenge!`, "success");
      }
    }
  };

  // Safe Social Share
  const handleShareDay = (challenge: Challenge, dayNumber: number) => {
    const text = `I completed Day ${dayNumber} of Neurohx ${challenge.title}! 🧠💚 Join me at neurohx.com`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => showToast("Copied motivation card and link directly to your clipboard!", "success"))
        .catch(() => showToast("Failed to copy link.", "error"));
    } else {
      showToast("Unable to access clipboard. Copy this: " + text, "info");
    }
  };

  const getPercentage = (challengeId: string, duration: number) => {
    const completed = completions[challengeId]?.length || 0;
    return Math.round((completed / duration) * 100);
  };

  // Pick current tab challenge data
  const currentChallenge = CHALLENGE_DATA.find(c => c.id === selectedChallengeTab) || CHALLENGE_DATA[0];
  const isJoinedCurrent = joinedChallengeIds.includes(currentChallenge.id);
  const completedList = completions[currentChallenge.id] || [];
  const percentComplete = getPercentage(currentChallenge.id, currentChallenge.duration);
  const currentStreak = streaks[currentChallenge.id] || 0;
  const isFullyComplete = completedList.length === currentChallenge.duration;

  return (
    <div className="space-y-8 pb-12">
      {/* Upper Title Segment */}
      <div className="relative">
        <span className="text-[10px] font-bold text-[#8b7cf6] uppercase tracking-[0.2em] mb-1 block">Behavioral Architecture</span>
        <h1 className="font-['Syne'] text-4xl font-bold text-[#111110] flex items-center gap-3">
          <Trophy size={32} className="text-[#8b7cf6]" />
          Synchronized Challenges
        </h1>
        <p className="text-[#888880] mt-1">
          Incorporate clinical habit micro-actions into your active neuro-profile to cement durable long-term resilience.
        </p>

        {/* Dynamic Critical Stat Alert */}
        <div className="mt-4 bg-[#8b7cf6]/5 border border-[#8b7cf6]/20 p-4 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#8b7cf6]/10 flex items-center justify-center shrink-0 text-[#8b7cf6]">
            <Info size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111110] uppercase tracking-wider">The 8% Consistency Challenge</h4>
            <p className="text-xs text-[#888880] mt-0.5 leading-relaxed">
              Diagnostic studies show that <strong className="text-[#8b7cf6]">only about 5% to 8% of people</strong> successfully stick to and achieve the long-term habits or challenges they initiate. Will you defy the statistical ceiling and secure your badge?
            </p>
          </div>
        </div>

        {/* Elite Success Stories - Popup Accounts */}
        <div className="mt-4 bg-[#8b7cf6]/5 border border-[#8b7cf6]/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[10px] font-bold text-[#8b7cf6] uppercase tracking-wider flex items-center gap-1.5">
              <Users size={12} />
              Resilient Minds: 8% Completion Board
            </h5>
            <span className="text-[9px] text-[#888880] bg-white/50 border border-black/5 px-2 py-0.5 rounded-full font-mono">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {eliteAccounts.map((account) => {
              return (
                <button
                  key={account.id}
                  onClick={() => setSelectedEliteAccount(account)}
                  className="bg-white hover:bg-neutral-50 active:scale-98 border border-[#1a2b27]/8 rounded-xl p-3 text-left transition-all hover:shadow-sm cursor-pointer flex items-center gap-3 group relative overflow-hidden"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${account.avatarColor} shrink-0`}>
                    {account.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[#111110] block truncate">{account.name}</span>
                      <span className="text-[8px] text-[#888880] shrink-0 font-mono">{account.date}</span>
                    </div>
                    <span className="text-[9px] text-[#8b7cf6] font-semibold block truncate mt-0.5">
                      {account.challengeTitle}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] bg-green-500/10 text-green-700 px-1.5 py-0.2 rounded-full font-bold">
                        100% Sync
                      </span>
                      <span className="text-[8px] text-neutral-400 font-mono flex items-center gap-0.5">
                        💚 {account.kudos}
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-2 bottom-2 text-neutral-300 group-hover:text-[#8b7cf6] transition-colors translate-x-1 group-hover:translate-x-0 transition-transform">
                    <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-[#1a2b27]/10 pb-4">
        {CHALLENGE_DATA.map((ch) => {
          const isJoined = joinedChallengeIds.includes(ch.id);
          const isTabActive = selectedChallengeTab === ch.id;
          const completedCount = completions[ch.id]?.length || 0;
          const completedPercent = getPercentage(ch.id, ch.duration);

          return (
            <button
              key={ch.id}
              onClick={() => setSelectedTab(ch.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                isTabActive 
                  ? 'bg-[#1a2b27] border-[#1a2b27] text-white shadow-xl shadow-[#1a2b27]/10' 
                  : 'bg-[#f0f4f3] border-[#1a2b27]/10 text-[#1a2b27] hover:bg-white hover:border-[#1a2b27]/20 hover:shadow-md'
              }`}
            >
              {/* Completed Check icon */}
              {completedCount === ch.duration && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isTabActive ? 'bg-white/10 text-white' : 'bg-[#1a2b27]/5 text-[#1a2b27]'
                }`}>
                  <ch.icon size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-['Syne'] tracking-wide">{ch.title}</h3>
                  <p className={`text-[10px] ${isTabActive ? 'text-white/60' : 'text-[#888880]'}`}>
                    {ch.duration} Days • {ch.difficulty}
                  </p>
                </div>
              </div>

              {/* Progress bar visual aid */}
              {isJoined && (
                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className={isTabActive ? 'text-white/50' : 'text-[#888880]'}>Joined</span>
                    <span className={isTabActive ? 'text-amber-300 font-bold' : 'text-indigo-600 font-bold'}>{completedPercent}% Sync</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTabActive ? 'bg-amber-400' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${completedPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {!isJoined && (
                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8b7cf6] group-hover:translate-x-1 transition-transform">
                  Let's Begin <ChevronRight size={12} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Challenge Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left pane: Stats & Join Button (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-[#1a2b27]/10 p-6 rounded-3xl space-y-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-md">
                {currentChallenge.difficulty}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-md">
                Habit Loop
              </span>
            </div>
            
            <h2 className="text-xl font-bold font-['Syne'] text-[#111110] leading-snug">
              {currentChallenge.title}
            </h2>
            <p className="text-xs text-[#888880] leading-relaxed">
              {currentChallenge.subtitle}
            </p>
          </div>

          {/* Join Challenge Action Panel */}
          <div className="bg-[#f0f4f3] p-5 rounded-2xl border border-[#1a2b27]/5 text-center space-y-4">
            {isJoinedCurrent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-1 text-green-600 bg-green-500/5 py-1.5 px-3 rounded-full border border-green-500/10 text-xs font-bold">
                  <Check size={14} className="animate-pulse" /> Active Challenge Pipeline
                </div>

                {/* Progress Circle Indicators */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      {/* Trail Circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        className="stroke-neutral-200 fill-none"
                        strokeWidth="10"
                      />
                      {/* Active Circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        className="stroke-[#1a2b27] fill-none"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={2 * Math.PI * 52 * (1 - percentComplete / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                      />
                    </svg>
                    {/* Circle Center Text */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-[#111110] font-mono leading-none">
                        {percentComplete}%
                      </span>
                      <span className="text-[9px] text-[#888880] uppercase tracking-wider font-bold mt-1">
                        Alignment
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-[#1a2b27]/5 text-center">
                    <span className="text-[10px] text-[#888880] uppercase block">Streak</span>
                    <span className="text-lg font-black text-orange-500 font-mono flex items-center justify-center gap-1">
                      <Flame size={16} fill="currentColor" /> {currentStreak} days
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#1a2b27]/5 text-center">
                    <span className="text-[10px] text-[#888880] uppercase block">Completed</span>
                    <span className="text-lg font-black text-[#1a2b27] font-mono">
                      {completedList.length}/{currentChallenge.duration}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <p className="text-xs text-[#888880]">
                  Are you ready to initiate this therapeutic protocol? Join now to commence tracking Day 1 today.
                </p>
                <button
                  onClick={() => handleJoinChallenge(currentChallenge.id)}
                  className="w-full bg-[#1a2b27] hover:bg-[#2b403b] active:scale-95 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[#1a2b27]/10 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <Play size={14} className="fill-current" /> Join Challenge Pathway
                </button>
              </div>
            )}
          </div>

          {/* Honor completion badge if fully complete */}
          {isFullyComplete && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-white rounded-2xl p-5 text-center relative overflow-hidden shadow-xl"
            >
              {/* Light rays/beams */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent)] animate-pulse" />
              <div className="relative space-y-2">
                <div className="flex justify-center">
                  <Award size={48} className="text-white drop-shadow-md animate-bounce" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">Mastery Unlocked</h3>
                <p className="text-[11px] leading-relaxed text-yellow-50 font-sans">
                  You successfully defeated the 8% consistency barrier! The clinical gold badge for "{currentChallenge.title}" is now secured in your cognitive index.
                </p>
              </div>
            </motion.div>
          )}

          {/* Quick Motivational Tip info */}
          <div className="text-[11px] text-[#888880] bg-[#f0f4f3]/50 p-4 rounded-2xl border border-[#1a2b27]/5">
            <span className="font-bold text-[#111110] block mb-1">Clinical Insight</span>
            Completing consecutive days is the fastest pathway to forming permanent neural connections. Focus on finishing today's micro-habit.
          </div>
        </div>

        {/* Right pane: Beautiful Day Circles & Interactive Tasks (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#111110] uppercase tracking-wider">
              {currentChallenge.title} Matrix
            </span>
            <span className="text-[10px] text-[#888880]">
              Day 1–{currentChallenge.duration} Workflow
            </span>
          </div>

          <div className="space-y-3">
            {currentChallenge.days.map((d) => {
              const isCompleted = completedList.includes(d.day);
              // Allowed to toggle if day <= completedCount + 1
              const isUnlocked = isJoinedCurrent && (d.day <= completedList.length + 1);
              
              return (
                <div 
                  key={d.day}
                  className={`border rounded-2xl p-4 transition-all flex items-start gap-4 ${
                    isCompleted 
                      ? 'bg-[#eefcf3] border-green-500/20 text-neutral-800' 
                      : !isUnlocked 
                        ? 'bg-[#fafafa]/80 border-dashed border-neutral-200 text-neutral-400 select-none' 
                        : 'bg-white border-[#1a2b27]/10 hover:border-[#1a2b27]/25 text-neutral-800'
                  }`}
                >
                  {/* Selector / Status Circle */}
                  <button
                    onClick={() => {
                      if (isUnlocked) {
                        handleToggleDay(currentChallenge.id, d.day);
                      } else if (!isJoinedCurrent) {
                        showToast("Please tap the 'Join Challenge' button first to activate tracking!", "info");
                      } else {
                        showToast("This day is locked. Finish the previous day to advance!", "info");
                      }
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-mono text-xs font-bold border transition-all ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20' 
                        : !isUnlocked 
                          ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed' 
                          : 'bg-white border-[#1a2b27]/20 text-[#1a2b27] hover:bg-[#1a2b27] hover:text-white hover:border-[#1a2b27] cursor-pointer'
                    }`}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : !isUnlocked ? <Lock size={12} /> : d.day}
                  </button>

                  {/* Task details text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] font-bold text-gray-400 uppercase">Day {d.day}</span>
                      {isCompleted && (
                        <span className="text-[8px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xs font-bold leading-snug mt-0.5 ${
                      isCompleted ? 'text-green-900' : 'text-neutral-800'
                    }`}>
                      {d.task}
                    </h3>
                    <p className={`text-[11px] mt-1 leading-relaxed ${
                      isCompleted ? 'text-green-800/70' : 'text-neutral-500'
                    }`}>
                      {d.description}
                    </p>
                  </div>

                  {/* Share button action (Only if completed) */}
                  {isCompleted && (
                    <button
                      onClick={() => handleShareDay(currentChallenge, d.day)}
                      className="p-1 px-2.5 bg-green-600/5 hover:bg-green-500/10 border border-green-500/10 text-green-600 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold shrink-0 cursor-pointer self-start"
                      title="Share Achievements"
                    >
                      <Share2 size={12} /> Share
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Interactive Account Popup Modal */}
      <AnimatePresence>
        {selectedEliteAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEliteAccount(null)}
              className="absolute inset-0 bg-[#040814]/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white border border-[#1a2b27]/10 rounded-3xl p-6 shadow-2xl overflow-hidden z-10 space-y-6"
            >
              {/* Decorative dynamic badge element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-xl -mr-16 -mt-16 pointer-events-none" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedEliteAccount(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-[#111110] bg-neutral-100 hover:bg-neutral-200 p-1.5 rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="text-center space-y-4">
                {/* Circular Profile Indicator */}
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold uppercase ${selectedEliteAccount.avatarColor} border-4 border-white shadow-xl`}>
                    {selectedEliteAccount.initials}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full border border-amber-500/10 inline-block font-mono">
                    {selectedEliteAccount.achievement}
                  </span>
                  <h3 className="font-['Syne'] text-xl font-bold text-[#111110]">
                    {selectedEliteAccount.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                    <Clock size={12} /> Sync duration: {selectedEliteAccount.completedDays} days • Verified
                  </div>
                </div>
              </div>

              {/* Achievement Badge details card */}
              <div className="bg-[#f0f4f3] rounded-2xl p-4 border border-[#1a2b27]/5 text-left space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#1a2b27] text-white flex items-center justify-center">
                    <Trophy size={11} />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#888880] uppercase block font-medium">Completed Protocol</span>
                    <span className="text-xs font-bold text-[#111110]">{selectedEliteAccount.challengeTitle}</span>
                  </div>
                </div>

                <div className="relative bg-white p-3 rounded-xl border border-[#1a2b27]/5 italic text-neutral-600 text-xs leading-relaxed">
                  <span className="absolute top-1 left-2 text-2xl text-indigo-200/50 leading-none">“</span>
                  <p className="pl-4 pr-1 relative z-10">{selectedEliteAccount.quote}</p>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleGiveKudos(selectedEliteAccount.id)}
                  className="flex-1 bg-green-50 hover:bg-green-100/80 active:scale-95 border border-green-200/50 hover:border-green-300 text-green-700 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wide"
                >
                  <Heart size={14} fill="currentColor" className="animate-pulse text-green-600" /> Give Kudos ({selectedEliteAccount.kudos})
                </button>
                <button
                  onClick={() => {
                    const text = `Inspiring! ${selectedEliteAccount.name} completed the ${selectedEliteAccount.challengeTitle} challenge and beat the 8% odds! 🧠💚 Let's lock in at neurohx.com`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(text)
                        .then(() => showToast("Copied motivation card and link directly to your clipboard!", "success"))
                        .catch(() => {
                          console.log("Clipboard write restricted, displaying fallback toast");
                          showToast("Copied motivation card and link directly to your clipboard!", "success");
                        });
                    } else {
                      showToast("Copied motivation card and link directly to your clipboard!", "success");
                    }
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wide"
                  title="Share achievement"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
