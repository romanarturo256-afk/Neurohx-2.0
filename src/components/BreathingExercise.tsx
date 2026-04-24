import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, X, Play, Pause, RotateCcw, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';

type BreathingTechnique = {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  color: string;
};

const techniques: BreathingTechnique[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal parts inhale, hold, exhale, and hold. Used by Navy SEALs for focus.',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    color: '#8b7cf6'
  },
  {
    id: '478',
    name: '4-7-8 Technique',
    description: 'A natural tranquilizer for the nervous system. Great for sleep.',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    color: '#4ade80'
  },
  {
    id: 'calm',
    name: 'Calm Breathing',
    description: 'Simple rhythmic breathing to reduce anxiety quickly.',
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    color: '#0ea5e9'
  }
];

export default function BreathingExercise({ onClose }: { onClose: () => void }) {
  const [selectedTech, setSelectedTech] = useState<BreathingTechnique>(techniques[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold1' | 'Exhale' | 'Hold2' | 'Ready'>('Ready');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  const speak = (text: string) => {
    try {
      if (!voiceEnabled || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1; // Explicitly set to maximum volume
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
    }
  };

  const playTone = (freq: number, duration: number) => {
    try {
      if (isMuted) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(console.error);
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      console.error('Audio tone error:', err);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isActive) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      } else {
        // Switch phase
        if (phase === 'Ready') {
          setPhase('Inhale');
          setTimeLeft(selectedTech.inhale);
          playTone(440, 0.5);
          speak('Breathe in');
        } else if (phase === 'Inhale') {
          if (selectedTech.hold1 > 0) {
            setPhase('Hold1');
            setTimeLeft(selectedTech.hold1);
            playTone(330, 0.3);
            speak('Hold');
          } else {
            setPhase('Exhale');
            setTimeLeft(selectedTech.exhale);
            playTone(220, 0.5);
            speak('Breathe out');
          }
        } else if (phase === 'Hold1') {
          setPhase('Exhale');
          setTimeLeft(selectedTech.exhale);
          playTone(220, 0.5);
          speak('Breathe out');
        } else if (phase === 'Exhale') {
          if (selectedTech.hold2 > 0) {
            setPhase('Hold2');
            setTimeLeft(selectedTech.hold2);
            playTone(330, 0.3);
            speak('Hold');
          } else {
            setPhase('Inhale');
            setTimeLeft(selectedTech.inhale);
            playTone(440, 0.5);
            speak('Breathe in');
          }
        } else if (phase === 'Hold2') {
          setPhase('Inhale');
          setTimeLeft(selectedTech.inhale);
          playTone(440, 0.5);
          speak('Breathe in');
        }
      }
    }
    return () => {
      clearTimeout(timer);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [isActive, timeLeft, phase, selectedTech]);

  const toggleStart = () => {
    if (!isActive) {
      setPhase('Inhale');
      setTimeLeft(selectedTech.inhale);
      playTone(440, 0.5);
      speak('Breathe in');
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setPhase('Ready');
    setTimeLeft(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[48px] shadow-2xl border border-[#e0dbd0] flex flex-col"
      >
        <div className="p-8 flex justify-between items-center border-b border-[#f5f2eb] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6]">
              <Wind size={20} />
            </div>
            <h2 className="font-['Syne'] text-2xl font-bold text-[#111110]">Guided Breathing</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f2eb] rounded-xl transition-all">
            <X size={24} className="text-[#888880]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12 scrollbar-hide">
          {/* Visualizer */}
          <div className="relative h-64 md:h-80 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: phase === 'Inhale' ? 1.8 : phase === 'Exhale' ? 1.0 : 1.4,
                  opacity: 1
                }}
                transition={{ 
                  duration: timeLeft > 0 ? timeLeft : 1,
                  ease: "easeInOut"
                }}
                className="w-40 h-40 rounded-full shadow-2xl flex items-center justify-center relative gpu-accelerated"
                style={{ backgroundColor: selectedTech.color }}
              >
                <div className="absolute inset-0 rounded-full animate-pulse opacity-20" style={{ backgroundColor: selectedTech.color }} />
                <span className="text-white font-bold text-2xl relative z-10 transition-all">
                  {phase === 'Ready' ? 'Ready?' : timeLeft}
                </span>
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute bottom-0 text-center">
              <h3 className="text-3xl font-bold font-['Syne'] text-[#111110] mb-1">
                {phase === 'Ready' ? '' : (phase.startsWith('Hold') ? 'Hold' : phase)}
              </h3>
              <p className="text-[#888880] text-xs uppercase tracking-[0.3em] font-bold">
                {phase === 'Inhale' ? 'Breathe in slowly' : phase === 'Exhale' ? 'Release tension' : phase.startsWith('Hold') ? 'Hold gently' : 'SELECT A TECHNIQUE'}
              </p>
            </div>
          </div>

          {/* Techniques */}
          <div className="grid grid-cols-1 gap-3">
            {techniques.map((tech) => (
              <button
                key={tech.id}
                onClick={() => {
                  setSelectedTech(tech);
                  reset();
                }}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all group",
                  selectedTech.id === tech.id 
                    ? "border-[#8b7cf6] bg-[#f0eeff]/30" 
                    : "border-[#f5f2eb] hover:border-[#8b7cf6]/30"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[#111110]">{tech.name}</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.color }} />
                  </div>
                </div>
                <p className="text-xs text-[#888880]">{tech.description}</p>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-4 bg-[#f5f2eb] text-[#888880] rounded-2xl hover:bg-[#ede9df] transition-all"
                title={isMuted ? "Unmute Tones" : "Mute Tones"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={cn(
                  "p-4 rounded-2xl transition-all",
                  voiceEnabled ? "bg-[#f0eeff] text-[#8b7cf6]" : "bg-[#f5f2eb] text-[#888880]"
                )}
                title={voiceEnabled ? "Disable Voice Assistant" : "Enable Voice Assistant"}
              >
                {voiceEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={reset}
                className="p-4 bg-[#f5f2eb] text-[#888880] rounded-2xl hover:bg-[#ede9df] transition-all"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={toggleStart}
                className="px-12 py-4 bg-[#111110] text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-[#222220] transition-all shadow-xl shadow-black/10"
              >
                {isActive ? <Pause size={20} /> : <Play size={20} />}
                {isActive ? 'Pause' : 'Start Session'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
