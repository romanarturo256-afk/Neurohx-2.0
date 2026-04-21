import React, { useState } from 'react';
import { History, Sparkles, Lock, ShieldCheck, Microscope, ClipboardCheck, ArrowRight, Clock, Award, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ASSESSMENTS, AssessmentDefinition } from '../constants/assessments';
import AssessmentTake from './AssessmentTake';

export default function Assessments() {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentDefinition | null>(null);

  if (selectedAssessment) {
    return (
      <AssessmentTake 
        assessment={selectedAssessment} 
        onBack={() => setSelectedAssessment(null)} 
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl">
          <h1 className="font-['Syne'] text-4xl md:text-6xl font-bold text-[#111110] mb-4 tracking-tight uppercase italic">
            Clinical Metrics
          </h1>
          <p className="text-[#888880] text-lg font-medium">
            Evidence-based psychological instruments to help you quantify and understand your mental landscape.
          </p>
        </div>
        
        <div className="flex items-center gap-3 px-6 py-3 bg-[#f0eeff] rounded-2xl border border-[#8b7cf6]/10">
          <ShieldCheck className="text-[#8b7cf6]" size={20} />
          <span className="text-[10px] font-bold text-[#8b7cf6] uppercase tracking-widest">HIPAA Compliant Data Handling</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ASSESSMENTS.map((assessment, index) => (
          <motion.div
            key={assessment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-[40px] border border-[#e0dbd0] p-10 hover:shadow-2xl hover:border-[#8b7cf6]/30 transition-all duration-500 overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[64px] transition-colors group-hover:bg-[#f0eeff] -z-10" />
            
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#fcfaf7] border border-[#e0dbd0] flex items-center justify-center text-[#111110] group-hover:bg-[#8b7cf6] group-hover:text-white group-hover:border-transparent transition-all">
                  {index === 0 && <Sparkles size={28} />}
                  {index === 1 && <Brain size={28} />}
                  {index === 2 && <Clock size={28} />}
                  {index === 3 && <Award size={28} />}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888880] bg-[#fcfaf7] px-4 py-1.5 rounded-full border border-[#e0dbd0]">
                  {assessment.category}
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                <h3 className="font-['Syne'] text-2xl font-bold text-[#111110] group-hover:text-[#8b7cf6] transition-colors">
                  {assessment.title}
                </h3>
                <p className="text-[#555550] text-sm leading-relaxed">
                  {assessment.description}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-[#888880] uppercase tracking-widest pt-4">
                  <div className="flex items-center gap-1.5">
                    <ClipboardCheck size={14} className="text-[#8b7cf6]" />
                    {assessment.questions.length} Questions
                  </div>
                  <div className="w-1 h-1 bg-[#e0dbd0] rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <History size={14} className="text-[#8b7cf6]" />
                    ~{Math.ceil(assessment.questions.length * 0.5)} mins
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAssessment(assessment)}
                className="w-full py-5 bg-[#111110] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#8b7cf6] transition-all transform group-hover:translate-y-[-4px] shadow-xl shadow-black/10"
              >
                Start Assessment
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}

        {/* Placeholder for future assessments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ASSESSMENTS.length * 0.1 }}
          className="bg-[#fcfaf7] rounded-[40px] border border-dashed border-[#e0dbd0] p-10 flex flex-col items-center justify-center text-center space-y-6 opacity-60"
        >
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#e0dbd0] flex items-center justify-center text-[#888880]">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="font-['Syne'] text-xl font-bold text-[#111110]">More Arriving Soon</h3>
            <p className="text-xs text-[#888880] mt-1 uppercase tracking-widest font-bold">In Clinical Validation</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-24 p-12 bg-[#111110] rounded-[48px] text-white overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl space-y-6">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Microscope className="text-[#8b7cf6]" size={24} />
            </div>
            <h2 className="font-['Syne'] text-3xl font-bold tracking-tight">Our methodology is rooted in clinical excellence.</h2>
            <p className="text-white/60 leading-relaxed italic">
              "We leverage standardized psychological markers and combine them with longitudinal data tracking to provide insights that are both clinically relevant and deeply personal."
            </p>
            <div className="flex gap-4">
              <div className="px-5 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest">PHQ-9 Standard</div>
              <div className="px-5 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest">GAD-7 Protocol</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 text-center">
              <p className="text-3xl font-bold font-['Syne'] mb-1">100%</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Private</p>
            </div>
            <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 text-center">
              <p className="text-3xl font-bold font-['Syne'] mb-1">Real-time</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Analysis</p>
            </div>
          </div>
        </div>

        {/* Background Gradients */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#8b7cf6]/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#2d7a36]/20 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
