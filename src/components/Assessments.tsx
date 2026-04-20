import React from 'react';
import { History, Sparkles, Lock, ShieldCheck, Microscope } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Assessments() {
  return (
    <div className="max-w-6xl mx-auto py-20 px-4 lg:px-8">
      <div className="text-center mb-16 reveal">
        <h1 className="font-['Syne'] text-6xl font-bold text-[#1a2b27] mb-4 tracking-tight italic uppercase">Clinical Metrics</h1>
        <p className="text-[#4a5a57] text-xl font-medium opacity-80 max-w-2xl mx-auto">
          Our proprietary psychological assessments are currently undergoing rigorous clinical validation and ethical review.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[64px] border border-[#1a2b27]/10 p-12 md:p-24 shadow-2xl relative overflow-hidden text-center group"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#f0f4f3_0%,transparent_70%)] opacity-50" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-12">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-[32px] bg-[#1a2b27] flex items-center justify-center text-white shadow-2xl transform rotate-12">
                <Microscope size={40} />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-[#2d7a36] rounded-full flex items-center justify-center text-white shadow-xl"
              >
                <Sparkles size={20} />
              </motion.div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-['Syne'] text-4xl font-bold text-[#1a2b27] tracking-tight">System Update Underway</h2>
            <p className="text-lg text-[#4a5a57] font-medium leading-relaxed italic opacity-70">
              We are enhancing our diagnostic accuracy by integrating the latest APA-standard biomarkers and longitudinal data models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#1a2b27]/5">
            {[
              { icon: ShieldCheck, label: 'Ethical Review' },
              { icon: Lock, label: 'Data Privacy' },
              { icon: History, label: 'History Preserved' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f0f4f3] flex items-center justify-center text-[#1a2b27]/40">
                  <item.icon size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a2b27]/60">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-10">
            <div className="inline-flex items-center gap-3 px-8 py-3 bg-[#f0f4f3] rounded-full border border-[#1a2b27]/5">
              <div className="w-2 h-2 bg-[#2d7a36] rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-[#1a2b27] uppercase tracking-widest">Expected Release: Q4 2026</span>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#2d7a36]/5 rounded-full blur-3xl" />
        <div className="absolute top-20 -left-20 w-60 h-60 bg-[#1a2b27]/5 rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}
