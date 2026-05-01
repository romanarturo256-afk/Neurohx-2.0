import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Sparkles, RefreshCw, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

const QUOTES = [
  {
    text: "The state of your life is nothing more than a reflection of your state of mind.",
    author: "Wayne Dyer",
    category: "Mindset"
  },
  {
    text: "Deep work is not some nostalgic affectation of writers and early-twentieth-century philosophers. It's instead a skill that has great value today.",
    author: "Cal Newport",
    category: "Productivity"
  },
  {
    text: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
    category: "Peace"
  },
  {
    text: "Resilience is not what happens to you. It's how you react to, respond to, and recover from what happens to you.",
    author: "Jeffrey Gitomer",
    category: "Resilience"
  },
  {
    text: "The greatest weapon against stress is our ability to choose one thought over another.",
    author: "William James",
    category: "Strength"
  },
  {
    text: "Focus is a matter of deciding what things you're not going to do.",
    author: "John Carmack",
    category: "Focus"
  },
  {
    text: "Wellness is a connection of paths: knowledge and action.",
    author: "Joshua Oshea",
    category: "Wellness"
  },
  {
    text: "Your calm mind is the ultimate weapon against your challenges. So relax.",
    author: "Bryant McGill",
    category: "Mindfulness"
  },
  {
    text: "The secret of change is to focus all of your energy, not on fighting the old, but on building the new.",
    author: "Socrates",
    category: "Growth"
  }
];

export default function DailyInspiration() {
  const [quote, setQuote] = useState(QUOTES[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set initial daily quote based on date
  useEffect(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setQuote(QUOTES[dayOfYear % QUOTES.length]);
  }, []);

  const getNewQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * QUOTES.length);
      } while (QUOTES[nextIndex].text === quote.text);
      
      setQuote(QUOTES[nextIndex]);
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="bg-white rounded-[40px] border border-[#1a2b27]/5 shadow-sm overflow-hidden p-8 md:p-10 relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Quote size={80} />
      </div>

      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-[0.2em] border border-primary/10">
            <Sparkles size={10} />
            Daily Insight
          </div>
          <button 
            onClick={getNewQuote}
            disabled={isRefreshing}
            className="p-2 text-[#4a5a57]/40 hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={cn(isRefreshing && "animate-spin")} />
          </button>
        </div>

        <div className="flex-1 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={quote.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <p className="font-['Syne'] text-xl md:text-2xl font-bold text-[#1a2b27] leading-tight">
                "{quote.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/20" />
                <span className="text-[12px] font-bold text-primary uppercase tracking-widest">— {quote.author}</span>
                <span className="text-[10px] font-medium text-[#4a5a57]/40 uppercase tracking-widest ml-auto">{quote.category}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-4 border-t border-[#1a2b27]/5 flex items-center justify-between">
          <p className="text-[10px] text-[#4a5a57]/50 font-medium italic">
            Rooted in cognitive behavioral logic and stoic principle.
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-tighter">
            Share Wisdom
            <Share2 size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
