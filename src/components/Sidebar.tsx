import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  MessageSquare, 
  BookOpen, 
  CheckCircle, 
  BarChart2, 
  Settings as SettingsIcon, 
  LogOut,
  Menu,
  X,
  Plus,
  Crown,
  LifeBuoy,
  Wind,
  ClipboardCheck,
  Flame,
  Zap,
  Timer,
  Trophy,
  Instagram,
  Facebook,
  Twitter,
  AtSign
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../contexts/UserContext';

import RealTimeStatus from './RealTimeStatus';

const SleepIcon = (props: any) => (
  <span {...props} className={cn("text-base flex items-center justify-center leading-none select-none", props.className)}>
    😴
  </span>
);

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  action?: string;
  isExternal?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Journal', path: '/dashboard/journal' },
  { icon: Timer, label: 'Focus', path: '/dashboard/timer' },
  { icon: Zap, label: 'Habits', path: '/dashboard/habits' },
  { icon: SleepIcon, label: 'Sleep Tracker', path: '/dashboard/sleep-tracker' },
  { icon: Trophy, label: 'Challenges', path: '/dashboard/challenges' },
  { icon: ClipboardCheck, label: 'Metrics', path: '/dashboard/assessments' },
  { icon: BarChart2, label: 'Analytics', path: '/dashboard/mood' },
  { icon: Wind, label: 'Pneuma', path: '#breathing', action: 'breathing' },
  { icon: BookOpen, label: 'Blog', path: '/dashboard/blog' },
];

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useUser();

  const SidebarContent = () => {
    const isAiDisabled = true; // AI chat disabled by user request

    return (
      <div className="flex flex-col h-full bg-[#0A0F2C] border-r border-white/5 transition-colors duration-300">
        <div className="p-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#00D4C8] flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(0,212,200,0.2)] transform -rotate-12">
              <div className="w-full h-full bg-[#00D4C8] rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Syne'] text-xl font-bold text-white tracking-tight leading-none uppercase italic text-glow-accent">Neurohx</span>
              <span className="text-[9px] text-[#A0A5C0] font-bold uppercase tracking-[0.2em] mt-1 opacity-60">Clinical Sage</span>
            </div>
          </Link>
          <button className="lg:hidden text-[#A0A5C0]" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto no-scrollbar py-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');
            const isSoon = item.path === '/dashboard/chat' && isAiDisabled;
            
            if (item.action === 'breathing') {
              return (
                <button
                   key={item.label}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-breathing'));
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 text-[#A0A5C0] hover:bg-white/[0.05] hover:text-[#00D4C8]"
                >
                  <item.icon size={18} className="opacity-60 group-hover:opacity-100" />
                  {item.label}
                </button>
              );
            }

            if (item.isExternal) {
              return (
                <a
                  key={item.label}
                  href={item.path}
                   target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 text-[#00D4C8] bg-[#00D4C8]/5 hover:bg-[#00D4C8]/10 hover:shadow-[0_0_15px_rgba(0,212,200,0.1)] relative group overflow-hidden border border-[#00D4C8]/20"
                >
                  <item.icon size={18} className="text-[#00D4C8]" />
                  <span className="flex-1">{item.label}</span>
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-[#00D4C8] rounded-full"
                  />
                </a>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path!}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group",
                  isActive
                    ? "bg-[#9B8EC4] text-[#0A0F2C] shadow-lg shadow-[#9B8EC4]/15"
                    : "text-[#A0A5C0] hover:bg-white/[0.05] hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100")} />
                <span className="flex-1">{item.label}</span>
                {isSoon && (
                  <span className="text-[8px] bg-[#9B8EC4] text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-sm group-hover:scale-110 transition-transform">Soon</span>
                )}
              </Link>
            );
          })}
          
          <div className="pt-6 mt-6 px-2">
            <RealTimeStatus />
          </div>
        </nav>

        <div className="p-8 space-y-4">
          <Link
            to="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300",
              location.pathname === '/dashboard/settings'
                ? "bg-[#9B8EC4] text-[#0A0F2C] shadow-lg shadow-[#9B8EC4]/15"
                : "text-[#A0A5C0] hover:bg-white/[0.05] hover:text-white"
            )}
          >
            <SettingsIcon size={18} className="opacity-60" />
            Config
          </Link>

          <Link
            to="/dashboard/support"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300",
              location.pathname === '/dashboard/support'
                ? "bg-[#9B8EC4] text-[#0A0F2C] shadow-lg shadow-[#9B8EC4]/15"
                : "text-[#A0A5C0] hover:bg-white/[0.05] hover:text-white"
            )}
          >
            <LifeBuoy size={18} className="opacity-60" />
            Support
          </Link>

          <button
            onClick={() => auth.signOut().catch(e => console.error('Sign out error:', e))}
            className="flex items-center gap-4 px-5 py-3.5 w-full rounded-2xl text-[13px] font-bold text-[#A0A5C0] hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group cursor-pointer"
          >
            <LogOut size={18} className="opacity-40 group-hover:opacity-100" />
            Sign Out
          </button>

          <div className="pt-6 mt-6 border-t border-white/5">
            <div className="flex items-center justify-center gap-4 px-2 mb-6">
              <a 
                href="https://www.instagram.com/neurohx_?igsh=MXh4ZjdveWwwcGs2eg==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#A0A5C0] hover:text-[#00D4C8] hover:border-[#00D4C8]/30 hover:shadow-lg transition-all"
                title="Instagram"
              >
                <div className="flex items-center justify-center relative">
                  <Instagram size={18} />
                </div>
              </a>
              <a 
                href="https://www.facebook.com/share/1Cdf4hjnCW/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#A0A5C0] hover:text-[#00D4C8] hover:border-[#00D4C8]/30 hover:shadow-lg transition-all"
                title="Facebook"
              >
                <div className="flex items-center justify-center">
                  <Facebook size={18} />
                </div>
              </a>
              <a 
                href="https://www.threads.net/@neurohx_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#A0A5C0] hover:text-[#00D4C8] hover:border-[#00D4C8]/30 hover:shadow-lg transition-all"
                title="Threads"
              >
                <div className="flex items-center justify-center">
                  <AtSign size={18} />
                </div>
              </a>
              <a 
                href="https://x.com/hineurohx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#A0A5C0] hover:text-[#00D4C8] hover:border-[#00D4C8]/30 hover:shadow-lg transition-all"
                title="X (Twitter)"
              >
                <div className="flex items-center justify-center">
                  <Twitter size={18} />
                </div>
              </a>
            </div>
            <div className="flex items-center gap-4 px-4 py-4 bg-white/[0.03] rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
              <div className="w-12 h-12 rounded-[18px] bg-[#9B8EC4] flex items-center justify-center text-[#0A0F2C] font-bold shadow-lg overflow-hidden shrink-0">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  profile?.displayName?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-white truncate">
                  {profile?.displayName || profile?.email?.split('@')[0] || 'User'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md",
                    profile?.plan === 'free' 
                      ? "bg-white/5 text-[#A0A5C0]" 
                      : "bg-[#00D4C8]/10 text-[#00D4C8]"
                  )}>
                    {profile?.plan || 'Free'}
                  </span>
                  {profile?.streak && profile.streak.count > 0 && (
                    <div className="flex items-center gap-1 bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-md text-[8px] font-bold">
                      <Flame size={8} fill="currentColor" />
                      <span>{profile.streak.count} DAYS</span>
                    </div>
                  )}
                </div>
              </div>
              {profile?.plan !== 'free' && (
                <Crown size={14} className="ml-auto text-[#00D4C8]" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 bg-[#0A0F2C]/80 border border-white/10 rounded-xl shadow-lg backdrop-blur-md text-white hover:text-[#00D4C8] hover:border-[#00D4C8]/30 transition-all cursor-pointer"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 bg-background border-r border-accent flex-col h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-background z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

