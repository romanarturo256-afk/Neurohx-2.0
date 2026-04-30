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
  Zap
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../contexts/UserContext';

import RealTimeStatus from './RealTimeStatus';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'Intake', path: '/dashboard/chat' },
  { icon: BookOpen, label: 'Journal', path: '/dashboard/journal' },
  { icon: Zap, label: 'Habits', path: '/dashboard/habits' },
  { icon: ClipboardCheck, label: 'Metrics', path: '/dashboard/assessments' },
  { icon: BarChart2, label: 'Analytics', path: '/dashboard/mood' },
  { icon: Wind, label: 'Pneuma', path: '#breathing', action: 'breathing' },
  { icon: BookOpen, label: 'Articles', path: 'https://neurohx.blogspot.com/search', isExternal: true },
];

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useUser();

  const SidebarContent = () => {
    const isAiDisabled = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY' || process.env.GEMINI_API_KEY === 'undefined';

    return (
      <div className="flex flex-col h-full bg-[#f0f4f3] border-r border-[#1a2b27]/10 transition-colors duration-300">
        <div className="p-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#1a2b27] flex items-center justify-center p-1.5 shadow-sm transform -rotate-12">
              <div className="w-full h-full bg-[#1a2b27] rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Syne'] text-xl font-bold text-[#1a2b27] tracking-tight leading-none uppercase italic">Neurohx</span>
              <span className="text-[9px] text-[#4a5a57] font-bold uppercase tracking-[0.2em] mt-1 opacity-60">Clinical Sage</span>
            </div>
          </Link>
          <button className="lg:hidden text-[#4a5a57]" onClick={() => setIsOpen(false)}>
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
                  className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 text-[#4a5a57] hover:bg-white hover:text-[#1a2b27] hover:shadow-sm"
                >
                  <item.icon size={18} className="opacity-60" />
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
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 text-[#1a2b27] bg-[#2d7a36]/5 hover:bg-[#2d7a36]/10 hover:shadow-sm relative group overflow-hidden border border-[#2d7a36]/10"
                >
                  <item.icon size={18} className="text-[#2d7a36]" />
                  <span className="flex-1">{item.label}</span>
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-[#2d7a36] rounded-full"
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
                    ? "bg-[#1a2b27] text-white shadow-xl shadow-[#1a2b27]/20"
                    : "text-[#4a5a57] hover:bg-white hover:text-[#1a2b27] hover:shadow-sm"
                )}
              >
                <item.icon size={18} className={cn(isActive ? "opacity-100" : "opacity-60")} />
                <span className="flex-1">{item.label}</span>
                {isSoon && (
                  <span className="text-[8px] bg-[#8b7cf6] text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-sm group-hover:scale-110 transition-transform">Soon</span>
                )}
              </Link>
            );
          })}
          
          <div className="pt-6 mt-6 px-2">
            <RealTimeStatus />
          </div>
        </nav>

        <div className="p-8 space-y-4">
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('new-chat'));
              setIsOpen(false);
            }}
            className="w-full bg-[#2d7a36] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#2d7a36]/20 hover:opacity-90 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={16} />
            New Intake
          </button>
          
          <Link
            to="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300",
              location.pathname === '/dashboard/settings'
                ? "bg-[#1a2b27] text-white shadow-xl shadow-[#1a2b27]/20"
                : "text-[#4a5a57] hover:bg-white hover:text-[#1a2b27]"
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
                ? "bg-[#1a2b27] text-white shadow-xl shadow-[#1a2b27]/20"
                : "text-[#4a5a57] hover:bg-white hover:text-[#1a2b27]"
            )}
          >
            <LifeBuoy size={18} className="opacity-60" />
            Support
          </Link>

          <button
            onClick={() => auth.signOut().catch(e => console.error('Sign out error:', e))}
            className="flex items-center gap-4 px-5 py-3.5 w-full rounded-2xl text-[13px] font-bold text-[#4a5a57] hover:bg-red-50/50 hover:text-red-600 transition-all duration-300 group"
          >
            <LogOut size={18} className="opacity-40 group-hover:opacity-100" />
            Sign Out
          </button>

          <div className="pt-6 mt-6 border-t border-[#1a2b27]/5">
            <div className="flex items-center gap-4 px-4 py-4 bg-white/50 rounded-3xl border border-[#1a2b27]/5 hover:border-[#1a2b27]/20 transition-all group">
              <div className="w-12 h-12 rounded-[18px] bg-[#1a2b27] flex items-center justify-center text-white font-bold shadow-lg overflow-hidden shrink-0">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                ) : (
                  profile?.displayName?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-[#1a2b27] truncate">
                  {profile?.displayName || profile?.email?.split('@')[0] || 'User'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md",
                    profile?.plan === 'free' 
                      ? "bg-[#1a2b27]/5 text-[#4a5a57]" 
                      : "bg-[#2d7a36]/10 text-[#2d7a36]"
                  )}>
                    {profile?.plan || 'Free'}
                  </span>
                  {profile?.streak && profile.streak.count > 0 && (
                    <div className="flex items-center gap-1 bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded-md text-[8px] font-bold">
                      <Flame size={8} fill="currentColor" />
                      <span>{profile.streak.count} DAYS</span>
                    </div>
                  )}
                </div>
              </div>
              {profile?.plan !== 'free' && (
                <Crown size={14} className="ml-auto text-[#2d7a36]" />
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
          className="p-2 bg-white border border-accent rounded-xl shadow-sm text-primary"
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

