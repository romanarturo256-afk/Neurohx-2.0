import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Leaf, 
  Wind, 
  ShieldCheck, 
  Heart,
  Menu,
  X,
  Users,
  Star,
  Sparkles
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import NeuroScene from '../components/NeuroScene';

const LeafNeuronLogo = ({ size = 32 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-[0_0_8px_rgba(140,122,242,0.45)]"
  >
    {/* Base Leaf Silhouette */}
    <path 
      d="M50 15C68 25 85 40 85 62C85 78 72 85 50 85C28 85 15 78 15 62C15 40 32 25 50 15Z" 
      fill="url(#leafGradient)" 
      stroke="#8c7af2" 
      strokeWidth="2.5" 
    />
    
    {/* Center Spine of the Leaf */}
    <path 
      d="M50 18V83" 
      stroke="#8c7af2" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />

    {/* Connected Synaptic Veins representing intelligence */}
    <line x1="50" y1="35" x2="72" y2="28" stroke="#8c7af2" strokeWidth="2.5" strokeDasharray="1.5 2" />
    <line x1="50" y1="48" x2="28" y2="42" stroke="#8c7af2" strokeWidth="2.5" />
    <line x1="50" y1="62" x2="76" y2="58" stroke="#8c7af2" strokeWidth="2.5" />
    <line x1="50" y1="72" x2="30" y2="68" stroke="#8c7af2" strokeWidth="2.5" strokeDasharray="1.5 2" />

    {/* Glowing Synaptic Terminals (Neuron Nodes) */}
    <circle cx="72" cy="28" r="4.5" fill="#a69bf7" />
    <circle cx="28" cy="42" r="3.5" fill="#8c7af2" />
    <circle cx="76" cy="58" r="5" fill="#6250db" />
    <circle cx="30" cy="68" r="4" fill="#8c7af2" />
    <circle cx="50" cy="35" r="3.5" fill="#ffffff" />
    <circle cx="50" cy="62" r="3.5" fill="#ffffff" />

    <defs>
      <linearGradient id="leafGradient" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#faf9fc" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#e2daf8" stopOpacity="0.95" />
      </linearGradient>
    </defs>
  </svg>
);

const JourneyButton = () => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [...prev, { id: Date.now() + Math.random(), x, y }]);
  };

  useEffect(() => {
    if (ripples.length > 3) {
      setRipples((prev) => prev.slice(1));
    }
  }, [ripples]);

  return (
    <motion.div
      animate={{
        y: [0, -5, 0]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative z-10"
    >
      <Link
        to="/auth"
        onClick={handleClick}
        className="group relative px-10 py-5 rounded-full bg-[#8c7af2] text-white font-bold flex items-center gap-3 overflow-hidden shadow-[0_4px_22px_rgba(140,122,242,0.35)] hover:shadow-[0_8px_32px_rgba(140,122,242,0.55)] hover:bg-[#7a68e8] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-white/20"
      >
        <span className="relative z-10 tracking-wider font-display uppercase text-[11px] tracking-[0.2em]">Start Your Journey</span>
        <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform relative z-10" />
        
        {/* Soft Ripple Wave Elements overlay */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        {/* Render interactive ripples on click or hover triggers */}
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute rounded-full bg-white/25 pointer-events-none"
            style={{
              width: 32,
              height: 32,
              left: r.x - 16,
              top: r.y - 16,
            }}
          />
        ))}

        {/* Outer glowing pulsing aura */}
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </Link>
    </motion.div>
  );
};

const Atmosphere = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Soft Premium Outer Space Background base */}
      <div className="absolute inset-0 bg-transparent" />
      
      {/* Floating Gentle Soft Purple Gradient Blob */}
      <motion.div 
        animate={{
          scale: [1, 1.12, 1],
          rotate: [0, 4, 0],
          x: [0, 30, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-15%] left-[-10%] w-[65%] h-[65%] bg-gradient-to-br from-[#9B8EC4]/15 to-transparent rounded-[50%] blur-[120px] opacity-75"
      />
      
      {/* Floating Sparkly Teal Glow Gradient Blob */}
      <motion.div 
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, -4, 0],
          x: [0, -25, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-15%] right-[-10%] w-[75%] h-[75%] bg-gradient-to-tl from-[#00D4C8]/12 to-transparent rounded-[50%] blur-[140px] opacity-60"
      />

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/soft-wallpaper.png')] opacity-5 mix-blend-multiply" />
      
      {/* Calm ambient background shimmer */}
      <motion.div 
        animate={{
          opacity: [0.12, 0.22, 0.12],
          x: ['-40%', '100%'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-15deg]"
      />
      
      {/* Floating Lavender Sparkles / Neuron Sparks */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 150 }}
          animate={{ 
            opacity: [0, 0.22, 0],
            y: [-100, -550],
            x: Math.sin(i) * 120,
            rotate: 180
          }}
          transition={{
            duration: 14 + i * 2,
            repeat: Infinity,
            delay: i * 2.5,
            ease: "linear"
          }}
          className="absolute bottom-0 w-6 h-6 text-[#8c7af2]/35"
          style={{ left: `${10 + i * 16}%` }}
        >
          <Sparkles size={16} />
        </motion.div>
      ))}
    </div>
  );
};

const RealTimeCounter = () => {
  const [count, setCount] = useState(52140);
  const [recentUser, setRecentUser] = useState<string | null>(null);

  useEffect(() => {
    // Listen to global stats document
    const statsDocRef = doc(db, 'system', 'stats');
    const unsubscribe = onSnapshot(statsDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.totalSignedUp) {
          // Adjust base count if desired, or just show real number
          setCount(Math.max(52140, data.totalSignedUp));
        }
        if (data.latestUserMasked) {
          setRecentUser(data.latestUserMasked);
        }
      }
    }, (err) => {
      console.warn('Stats listener notice (likely first run):', err.message);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/60 border border-white/40 shadow-sm backdrop-blur-md">
        <Users size={16} className="text-primary" />
        <span className="text-sm font-bold text-primary tracking-tight">
          Join <motion.span
            key={count}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block tabular-nums"
          >
            {count.toLocaleString()}
          </motion.span> others
        </span>
      </div>
      <AnimatePresence mode="wait">
        {recentUser && (
          <motion.div
            key={recentUser}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[10px] uppercase tracking-[0.2em] text-primary/40 font-bold"
          >
            Latest join: {recentUser}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PublicReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(12));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
    }, (err) => console.log('Reviews listener error:', err));
    return () => unsubscribe();
  }, []);

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < Math.floor(rating) ? "fill-primary text-primary" : "text-primary/20"} 
        strokeWidth={i < Math.floor(rating) ? 0 : 2}
      />
    ));
  };

  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-20 space-y-4">
        <h2 className="font-serif text-5xl md:text-7xl text-primary">Voices of <span className="italic">Healing</span></h2>
        <p className="text-text-secondary font-medium tracking-tight uppercase text-xs tracking-[0.2em] opacity-60 italic">Real stories from our community</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {reviews.length === 0 ? (
          // Placeholder reviews if empty
          [
            { id: 'p1', displayName: "Eleanor V.", rating: 5, content: "Neurohx has completely shifted my perspective on daily mindfulness. The AI is incredibly empathetic and feels like a true companion." },
            { id: 'p2', displayName: "Julian M.", rating: 5, content: "The most elegant mental wellness tool I've ever used. The simplicity is its strength and beauty." },
            { id: 'p3', displayName: "Sophia K.", rating: 5, content: "A sanctuary in my pocket. I love the breathing exercises and the aesthetic is so calming and luxurious." },
            { id: 'p4', displayName: "Marcus T.", rating: 4.5, content: "The real-time elements make me feel connected to a larger community while maintaining my privacy." },
            { id: 'p5', displayName: "Lydia H.", rating: 5, content: "Finally a wellness app that doesn't feel like a medical checklist. It feels like high-tier therapy." }
          ].map((r, i) => (
            <FadeIn key={r.id} delay={i * 0.1}>
              <div className="break-inside-avoid bg-white/[0.05] border border-white/10 p-8 rounded-[32px] backdrop-blur-md hover:bg-white/[0.08] transition-all duration-500 hover:shadow-xl hover:shadow-[#00D4C8]/5">
                <div className="flex gap-1 mb-4">{renderStars(r.rating)}</div>
                <p className="font-serif text-lg text-primary mb-6 italic leading-relaxed">"{r.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px] text-primary">{(r.displayName || 'U')[0]}</div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#A0A5C0]">{r.displayName}</span>
                </div>
              </div>
            </FadeIn>
          ))
        ) : (
          reviews.map((r, i) => (
            <FadeIn key={r.id} delay={i * 0.1}>
              <div className="break-inside-avoid bg-white/[0.05] border border-white/10 p-8 rounded-[32px] backdrop-blur-md hover:bg-white/[0.08] transition-all duration-500 hover:shadow-xl hover:shadow-[#00D4C8]/5">
                <div className="flex gap-1 mb-4">{renderStars(r.rating)}</div>
                <p className="font-serif text-lg text-primary mb-6 italic leading-relaxed">"{r.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px] text-primary">{(r.displayName || 'U')[0]}</div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#A0A5C0]">{r.displayName || 'Verified User'}</span>
                </div>
              </div>
            </FadeIn>
          ))
        )}
      </div>

      <div className="mt-20 text-center">
        <Link to="/auth" className="inline-flex items-center gap-3 px-10 py-5 rounded-full border-2 border-primary/10 text-primary font-bold text-sm uppercase tracking-widest hover:bg-white hover:border-primary/20 transition-all transform hover:-translate-y-1">
          Share your experience
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const neuroCardParallaxY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <div className="relative min-h-screen font-sans text-text-primary selection:bg-primary selection:text-white overflow-x-hidden bg-color-background">
      <Atmosphere />
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 md:py-8 flex items-center justify-between backdrop-blur-sm bg-background/5 border-b border-primary/10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="transition-transform group-hover:scale-105 duration-500">
            <LeafNeuronLogo size={38} />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-primary">neurohx</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/60">
          {['Mindfulness', 'Therapy', 'Support', 'Journal'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-primary transition-all relative group py-2">
              {item}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 rounded-full bg-primary transition-all group-hover:w-full opacity-0 group-hover:opacity-100" />
            </a>
          ))}
          <a 
            href="https://neurohx.blogspot.com/search" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-0.5"
          >
            Blog
            <motion.span 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"
            />
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/auth" className="px-8 py-3 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#7a68e8] transition-all hover:shadow-xl hover:shadow-primary/30 border border-white/10">
            Get Started
          </Link>
          <button className="md:hidden p-2 text-primary">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION (Dual column with High-fidelity 3D Interactive Sanctuary Canvas) */}
      <section className="relative pt-36 lg:pt-48 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center text-left">
          {/* Left Column: Premium copywriting elements */}
          <div className="lg:col-span-6 space-y-8 flex flex-col items-start relative z-10">
            <FadeIn>
              <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-white/[0.05] border border-white/10 shadow-sm text-[10px] md:text-xs font-semibold uppercase tracking-[0.25em] text-primary/90 backdrop-blur-md">
                <span className="inline-block w-2 h-2 rounded-full bg-[#00D4C8] shadow-[0_0_8px_#00D4C8] animate-pulse" />
                Finding clarity in the noise
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-serif text-[clamp(44px,7.5vw,78px)] leading-[1.05] tracking-[-0.035em] text-text-primary">
                Finding <span className="italic font-normal text-[#00D4C8] text-glow-accent">clarity</span> in the noise of life.
              </h1>
            </FadeIn>

            <FadeIn delay={0.18}>
              <p className="text-lg md:text-xl text-text-secondary max-w-xl font-medium leading-relaxed">
                Your personal sanctuary for mental well-being. Custom neurofeedback integration, cognitive pacing and sympathetic AI.
              </p>
            </FadeIn>

            <FadeIn delay={0.25}>
              <div className="scale-100 origin-left">
                <RealTimeCounter />
              </div>
            </FadeIn>

            <FadeIn delay={0.32}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8 pt-2">
                <JourneyButton />
                <a href="#features" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00D4C8] hover:text-[#00D4C8]/80 transition-colors py-4 border-b-2 border-transparent hover:border-[#00D4C8]/40 text-center sm:text-left">
                  Explore features
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Interactive 3D Transparency Brain Holographic Device with Parallax motion */}
          <motion.div 
            style={{ y: neuroCardParallaxY }}
            className="lg:col-span-6 w-full flex justify-center relative z-10"
          >
            <FadeIn delay={0.25}>
              <div className="relative aspect-square w-full max-w-[480px] lg:max-w-none h-[420px] lg:h-[530px] rounded-[48px] bg-white/[0.05] border border-white/10 shadow-2xl shadow-primary/5 flex items-center justify-center overflow-hidden hover:shadow-2xl hover:shadow-[#00D4C8]/10 transition-all duration-500 backdrop-blur-xl group">
                {/* Visual accents */}
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00D4C8]/30 to-transparent z-20" />
                <div className="absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-transparent via-[#00D4C8]/15 to-transparent z-20" />

                {/* Interactive cursor helper hint */}
                <div className="absolute bottom-5 right-7 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 shadow-sm text-[8px] font-extrabold uppercase tracking-widest text-[#00D4C8] z-20 pointer-events-none flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={10} className="animate-spin text-glow-accent text-[#00D4C8]" style={{ animationDuration: '4s' }} />
                  Move mouse to clear noise
                </div>

                {/* High performance 3D NeuroScene */}
                <NeuroScene />
              </div>
            </FadeIn>
          </motion.div>
        </div>

        {/* FLOATING DECORATIONS */}
        <motion.div 
          style={{ y }}
          className="absolute top-1/4 left-[-4%] hidden xl:block opacity-25 pointer-events-none"
        >
          <Wind size={80} className="text-primary/70 animate-bounce" style={{ animationDuration: '6s' }} />
        </motion.div>
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -150]) }}
          className="absolute top-1/3 right-[-4%] hidden xl:block opacity-35 pointer-events-none"
        >
          <Heart size={60} className="text-[#8c7af2]/30" />
        </motion.div>
      </section>

      {/* IMAGE SECTION */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto py-12">
        <FadeIn delay={0.4}>
          <div className="relative aspect-[16/7] rounded-[40px] md:rounded-[80px] overflow-hidden shadow-2xl group border-[12px] border-white/30 backdrop-blur-md">
            <img 
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop" 
              alt="Serenity" 
              className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="max-w-md">
                <h2 className="text-white font-serif text-4xl mb-4 italic">Breathe in. Let go.</h2>
                <p className="text-white/80 font-medium">Join 50,000+ people who have found peace through Neurohx's personalized mental health companion.</p>
              </div>
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                     <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                   </div>
                 ))}
                 <div className="w-12 h-12 rounded-full border-2 border-white bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold">+10k</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <FadeIn>
            <h3 className="font-serif text-5xl md:text-7xl text-primary leading-tight">
              Crafted for your<br /><span className="italic">mental clarity</span>.
            </h3>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-text-secondary max-w-sm text-lg font-medium">
              We combine advanced clinical insights with empathetic AI to provide a unique sanctuary for your mind.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Wind,
              title: "Smart Breathing",
              desc: "Real-time biofeedback exercises designed to calm your nervous system instantly."
            },
            {
              icon: Heart,
              title: "Compassionate AI",
              desc: "A personal companion that listens without judgment, available 24/7."
            },
            {
              icon: ShieldCheck,
              title: "Secure Sanctuary",
              desc: "Your data is encrypted and private. A safe space for your deepest thoughts."
            }
          ].map((feature, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="group bg-white/[0.05] border border-white/10 p-10 rounded-[48px] hover:bg-white/[0.08] hover:shadow-xl hover:shadow-[#00D4C8]/5 transition-all duration-500 h-full">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  <feature.icon size={32} className="text-primary" />
                </div>
                <h4 className="text-2xl font-serif text-primary mb-4">{feature.title}</h4>
                <p className="text-text-secondary leading-relaxed font-medium">{feature.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL PREVIEW */}
      <section className="py-20 overflow-hidden bg-primary/5 border-y border-black/5">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12"
        >
          {Array(10).fill(null).map((_, i) => (
            <div key={i} className="flex items-center gap-12">
              <span className="text-5xl md:text-8xl font-serif italic text-primary/20">Clarity</span>
              <span className="w-4 h-4 rounded-full bg-primary/20" />
              <span className="text-5xl md:text-8xl font-serif italic text-primary/20">Balance</span>
              <span className="w-4 h-4 rounded-full bg-primary/20" />
              <span className="text-5xl md:text-8xl font-serif italic text-primary/20">Serenity</span>
              <span className="w-4 h-4 rounded-full bg-primary/20" />
            </div>
          ))}
        </motion.div>
      </section>

      <PublicReviews />

      {/* CTA SECTION */}
      <section className="py-40 px-6 md:px-12 flex flex-col items-center text-center">
        <FadeIn>
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-12 shadow-lg animate-bounce-slow">
            <Heart size={40} className="text-primary fill-primary/10" />
          </div>
          <h2 className="font-serif text-5xl md:text-8xl text-primary mb-10 leading-[0.9]">
            Ready to find your<br /><span className="italic">peace</span>?
          </h2>
          <p className="text-xl text-text-secondary max-w-xl mb-12 font-medium">
            Join thousands of others in prioritizing their mental health. It's time to breathe and grow.
          </p>
          <Link to="/auth" className="px-12 py-6 rounded-full bg-primary text-white text-lg font-bold hover:scale-105 transition-transform hover:shadow-2xl hover:shadow-primary/40">
            Create Free Account
          </Link>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 py-20 border-t border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6 max-w-sm">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="transition-transform group-hover:scale-105 duration-500">
                <LeafNeuronLogo size={30} />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-primary">neurohx</span>
            </Link>
            <p className="text-text-secondary font-medium italic">
              "Healing is not linear, but you don't have to walk the path alone."
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16 text-sm font-bold uppercase tracking-widest text-primary/40">
            <div className="flex flex-col gap-4">
              <span className="text-primary/60">Platform</span>
              <Link to="/legal#journal" className="hover:text-primary transition-colors">Journal</Link>
              <Link to="/legal#mood" className="hover:text-primary transition-colors">Mood Tracker</Link>
              <Link to="/legal#buddy" className="hover:text-primary transition-colors">AI Buddy</Link>
              <a href="https://neurohx.blogspot.com/search" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
                Blog
                <span className="w-1 h-1 rounded-full bg-primary" />
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-primary/60">Legal</span>
              <Link to="/legal#privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/legal#terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/legal#security" className="hover:text-primary transition-colors">Security</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-primary/60">Connect</span>
              <a href="#" className="hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/30">
          <span>© 2026 Neurohx Clinical. All rights reserved.</span>
          <div className="flex items-center gap-8">
            <span>Made with Care</span>
            <span className="w-1 h-1 rounded-full bg-primary/20" />
            <span>Accredited Clinical Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
