import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Plus, 
  CheckCircle2,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }, []);

  return (
    <div className="bg-[#9ba9a6] text-[#1a2b27] font-['Inter'] min-h-screen overflow-x-hidden selection:bg-[#2d7a36] selection:text-white">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-8 relative z-[100]">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <div className="font-['Syne'] text-2xl font-bold tracking-tighter text-[#1a2b27] flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#1a2b27] flex items-center justify-center p-1">
                <div className="w-full h-full bg-[#1a2b27] rounded-full" />
              </div>
              neurohx:
            </div>
            <p className="text-[10px] text-[#4a5a57] font-medium tracking-tight mt-1">Accredited. Trusted. Compassionate.</p>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Services', 'Locations', 'Resources'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium hover:text-[#2d7a36] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <a href="#contact" className="text-sm font-medium hidden sm:block hover:text-[#2d7a36] transition-colors">Contact</a>
          <Link to="/auth" className="px-8 py-3 bg-[#1a2b27]/10 border border-[#1a2b27]/20 rounded-md text-sm font-bold hover:bg-[#1a2b27] hover:text-white transition-all">
            Login
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-[1600px] mx-auto px-8 md:px-16 pt-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          
          {/* LEFT DECORATION */}
          <div className="hidden xl:flex flex-col items-start gap-4 self-start mt-20">
            <div className="h-px w-24 bg-[#1a2b27]/20" />
            <div className="flex flex-col">
              <div className="flex items-start gap-1">
                <span className="text-5xl font-['Syne'] font-bold leading-none">40</span>
                <Plus size={20} className="mt-1" />
              </div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60 mt-2">
                Years<br />of expertise
              </p>
            </div>
          </div>

          {/* MAIN IMAGE */}
          <div className="relative flex-1 group">
            <div className="absolute -inset-4 bg-[#8a9996] rounded-[64px] blur-3xl opacity-20" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.2, ease: "easeOut" }}
               className="relative aspect-[3/4] max-w-[500px] mx-auto overflow-hidden rounded-[80px] bg-[#1a2b27] shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" 
                alt="Cognitive Clarity" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-125 opacity-80 mix-blend-luminosity scale-110 group-hover:scale-100 transition-transform duration-[2s]"
              />
              {/* Artistic Overlay Slices Effect */}
              <div className="absolute inset-0 flex">
                <div className="w-1/3 h-full border-r border-[#9ba9a6]/20 bg-gradient-to-r from-transparent to-[#1a2b27]/20" />
                <div className="w-1/3 h-full border-r border-[#9ba9a6]/10" />
              </div>
            </motion.div>
          </div>

          {/* CONTENT RIGHT */}
          <div className="flex-1 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-['Syne'] text-[clamp(60px,8vw,120px)] font-bold text-[#1a2b27] leading-[0.8] tracking-[-0.04em] mb-12 uppercase">
                Cognitive<br />
                <span className="italic">Clarity</span>
              </h1>
              <p className="text-xl text-[#3a4a47] max-w-md font-medium leading-relaxed mb-12">
                Helping you or your employees find balance, focus, and resilience through premium clinical AI companionship.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-[#2d7a36] text-white overflow-hidden rounded shadow-lg group">
                  <Link to="/auth" className="px-10 py-5 font-bold tracking-tight">Book a Session</Link>
                  <div className="bg-white text-[#2d7a36] p-5 border-l border-[#2d7a36]">
                    <Plus size={24} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* BENTO CARDS BOTTOM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
              <div className="bg-[#8a9996] rounded-[40px] p-10 flex flex-col justify-center items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-full border border-[#1a2b27]/20 flex items-center justify-center text-[#1a2b27]">
                  <Award size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold uppercase tracking-[0.2em] text-[13px]">Level II</h3>
                  <p className="text-sm opacity-60">Accredited Psychiatrists<br />Network</p>
                </div>
              </div>

              <div className="bg-transparent border border-[#1a2b27]/10 rounded-[40px] p-10 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#1a2b27] flex items-center justify-center">
                     <div className="w-1 h-3 bg-white" />
                   </div>
                   <h3 className="font-bold text-lg">Managing stress?</h3>
                </div>
                <p className="text-sm leading-relaxed opacity-70">
                  We give you the tools to heal, grow, and thrive with real-time biofeedback and AI coaching.
                </p>
                <div className="pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">Featured in</p>
                  <div className="flex items-center gap-8 opacity-40 grayscale">
                    <span className="font-serif font-bold text-xl">Forbes</span>
                    <span className="font-serif font-bold text-lg">The New York Times</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACCREDITATION CARD */}
        <div className="mt-32 max-w-5xl mx-auto">
          <div className="bg-[#8a9996]/40 backdrop-blur-xl rounded-[60px] p-8 md:p-16 flex flex-col md:flex-row gap-16 items-center border border-white/10 shadow-xl">
             <div className="w-full md:w-1/3 aspect-[4/5] rounded-[40px] overflow-hidden grayscale contrast-110">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=2070&auto=format&fit=crop" 
                  alt="Professional" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
             </div>
             <div className="flex-1 space-y-8">
                <div className="flex justify-between items-start">
                  <h2 className="font-['Syne'] text-4xl md:text-5xl font-bold leading-tight">
                    Accredited. Trusted.<br />Compassionate.
                  </h2>
                  <ArrowUpRight size={32} className="opacity-40" />
                </div>
                <p className="text-lg text-[#3a4a47] font-medium leading-relaxed max-w-xl">
                  Dr. Angela Doe is Level II accredited, ensuring the highest standards of care, professionalism, and results through our proprietary AI engine.
                </p>
                <Link to="/auth" className="inline-flex items-center gap-2 group">
                  <span className="font-bold text-sm tracking-widest uppercase border-b border-[#1a2b27] pb-1">Learn More</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
          </div>
        </div>

      </main>

      {/* FOOTER MINI */}
      <footer className="px-16 py-12 border-t border-[#1a2b27]/10 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">
        <div className="flex items-center gap-8">
           <span>Terms of Use</span>
           <span>Privacy Policy</span>
           <span>Accreditation</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full border-2 border-[#1a2b27] flex items-center justify-center p-0.5">
             <div className="w-full h-full bg-[#1a2b27] rounded-full" />
           </div>
           <span>© 2026 neurohx clinical</span>
        </div>
      </footer>
    </div>
  );
}
