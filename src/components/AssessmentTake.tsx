import React, { useState } from 'react';
import { AssessmentDefinition } from '../constants/assessments';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Brain, ArrowRight, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from './Toast';
import { GoogleGenAI } from '@google/genai';
import { useNavigate } from 'react-router-dom';

const getAiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key === 'undefined') {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your project secrets.');
  }
  return new GoogleGenAI({ apiKey: key });
};

interface Props {
  assessment: AssessmentDefinition;
  onBack: () => void;
}

export default function AssessmentTake({ assessment, onBack }: Props) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedResult, setCompletedResult] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalQuestions = assessment.questions.length;
  const currentQuestion = assessment.questions[currentStep];
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  const handleSelect = (value: number) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    // Auto-advance with a slight delay
    if (currentStep < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 300);
    }
  };

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const getAiConclusion = async (score: number, label: string) => {
    setIsAnalyzing(true);
    try {
      const ai = getAiClient();
      const prompt = `As a professional psychological counselor, assess this assessment result:
      Assessment: ${assessment.title}
      User Score: ${score}
      Clinical Label: ${label}
      
      The user just completed this assessment. 
      First, provide a deep, empathetic analysis (2-3 paragraphs) of what this result means for their mental well-being.
      Second, provide exactly 3 concrete, 10-minute daily habits they can start TODAY to improve in this specific area.
      
      Format your response EXACTLY as follows:
      [ANALYSIS]
      (Your analysis here)
      
      [SUGGESTIONS]
      - Suggestion 1: Brief description
      - Suggestion 2: Brief description
      - Suggestion 3: Brief description`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = response.text || "";
      
      const analysisPart = text.split('[SUGGESTIONS]')[0].replace('[ANALYSIS]', '').trim();
      const suggestionsPart = text.split('[SUGGESTIONS]')[1] || "";
      const parsedSuggestions = suggestionsPart
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace('-', '').trim());

      setAiAnalysis(analysisPart || "I was unable to generate a deep analysis at this moment.");
      setAiSuggestions(parsedSuggestions);
    } catch (error) {
      console.error('AI Analysis error:', error);
      setAiAnalysis("Your result indicates we should talk more about this in our next session.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddSuggestionAsHabit = async (suggestion: string) => {
    if (!auth.currentUser) return;
    
    // Extract title from "Title: Description" format if possible
    const name = suggestion.split(':')[0].trim();
    
    try {
      const path = `users/${auth.currentUser.uid}/habits`;
      await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        name: name,
        streak: 0,
        completedToday: false,
        completedDates: [],
        category: assessment.category,
        source: `Assessment: ${assessment.title}`,
        createdAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, 'create', path));
      
      showToast(`"${name}" added to your daily habits!`, 'success');
    } catch (error) {
      showToast('Failed to add suggested habit.', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      showToast('You must be signed in to submit assessments.', 'error');
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (Object.keys(responses).length < totalQuestions) {
        throw new Error('Not all questions have been answered.');
      }

      const totalScore = assessment.questions.reduce((sum, q) => {
        const val = responses[q.id] || 0;
        if (q.reverse) {
          const maxValue = Math.max(...q.options.map(o => o.value));
          return sum + (maxValue - val);
        }
        return sum + val;
      }, 0);

      const resultData = assessment.scoring(totalScore);

      const result = {
        userId: auth.currentUser.uid,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        score: Math.round(totalScore),
        label: resultData.label,
        interpretation: resultData.interpretation,
        responses: responses,
        createdAt: serverTimestamp()
      };

      const path = `users/${auth.currentUser.uid}/assessments`;
      await addDoc(collection(db, path), result).catch(e => handleFirestoreError(e, 'create', path));
      setCompletedResult({ ...resultData, score: totalScore });
      setAiSuggestions(resultData.suggestions || []); // Set static suggestions immediately
      showToast('Assessment submitted successfully!', 'success');
      
      // Get AI Analysis if key exists
      try {
        getAiConclusion(totalScore, resultData.label).catch(err => {
          console.error('Final AI Conclusion catch-all:', err);
        });
      } catch (e) {
        console.log('Skipping AI analysis, key missing');
      }
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      if (error?.code === 'resource-exhausted') {
        showToast('Firestore daily write quota exceeded. Please try again tomorrow or upgrade your Firebase plan.', 'error');
      } else if (error?.code === 'permission-denied') {
         showToast('Permission denied while saving results. Please ensure you are logged in.', 'error');
      } else {
        showToast(`Failed to save assessment results: ${error.message || 'Unknown error'}`, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedResult) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 lg:p-12 rounded-[48px] border border-[#e0dbd0] shadow-xl space-y-8"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-[#f0eeff] rounded-full flex items-center justify-center mx-auto mb-6 text-[#8b7cf6]">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="font-['Syne'] text-4xl font-bold text-[#111110] mb-2">Assessment Complete</h2>
            <p className="text-[#888880]">Reflection is the first step toward growth.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#fcfaf7] rounded-[32px] p-8 border border-[#f5f2eb] flex flex-col justify-center text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#888880] mb-2">Clinical Score</p>
              <h3 className="text-3xl font-bold font-['Syne'] mb-2" style={{ color: completedResult.color }}>
                {completedResult.label}
              </h3>
              <p className="text-5xl font-bold text-[#111110] mb-4">{completedResult.score}</p>
              <div className="w-16 h-1 bg-[#e0dbd0] mx-auto mb-6 rounded-full" />
              <p className="text-[#555550] leading-relaxed italic text-sm">
                "{completedResult.interpretation}"
              </p>
            </div>

            <div className="bg-[#8b7cf6] rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1 bg-white/20 rounded-lg">
                    <img 
                      src="/logo.png" 
                      alt="Neurohx" 
                      className="w-5 h-5 object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Sparkles size={16} className="hidden text-white/80" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">Neurohx AI Analysis</span>
                </div>
                
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm font-bold animate-pulse">Deeply analyzing your results...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {aiAnalysis && (
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-white/90">
                          {aiAnalysis}
                        </p>
                      </div>
                    )}

                    {aiSuggestions.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Suggested Daily Rituals</p>
                        {aiSuggestions.map((suggestion, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white/10 rounded-2xl p-4 flex items-center justify-between group/suggest"
                          >
                            <p className="text-xs font-medium text-white/90 pr-4">{suggestion}</p>
                            <button
                              onClick={() => handleAddSuggestionAsHabit(suggestion)}
                              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-[#8b7cf6] transition-all shrink-0"
                              title="Add to habit tracker"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {aiAnalysis ? (
                      <button
                        onClick={() => navigate('/dashboard/chat', { 
                          state: { 
                            context: `I just completed the ${assessment.title} assessment. My score was ${completedResult.score} (${completedResult.label}). Analysis: "${aiAnalysis.slice(0, 500)}..."` 
                          } 
                        })}
                        className="w-full py-4 bg-white text-[#8b7cf6] rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                      >
                        Deepen via AI Chat
                        <Brain size={18} />
                      </button>
                    ) : (
                      <div className="pt-4 text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">AI Connection Offline</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-xl" />
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full py-4 bg-white border border-[#e0dbd0] text-[#888880] rounded-2xl font-bold hover:bg-[#fcfaf7] transition-all flex items-center justify-center gap-2"
          >
            Back to All Assessments
          </button>
        </motion.div>
        
        <p className="mt-8 text-sm text-[#888880] flex items-center justify-center gap-2 text-center">
          <AlertCircle size={14} /> This AI-generated analysis is for informational purposes. For clinical concerns, please consult a healthcare professional.
        </p>
      </div>
    );
  }

  const isLastQuestion = currentStep === totalQuestions - 1;
  const isQuestionAnswered = responses[currentQuestion.id] !== undefined;
  const allAnswered = Object.keys(responses).length === totalQuestions;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#888880] hover:text-[#111110] transition-all mb-8 font-bold"
      >
        <ChevronLeft size={20} /> Back
      </button>

      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#8b7cf6]">{assessment.category}</span>
            <h2 className="font-['Syne'] text-3xl font-bold text-[#111110] mt-1">{assessment.title}</h2>
          </div>
          <span className="text-sm font-bold text-[#888880]">Question {currentStep + 1} of {totalQuestions}</span>
        </div>
        <div className="w-full h-2 bg-[#f0eeff] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#8b7cf6]" 
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="bg-white p-10 lg:p-16 rounded-[48px] border border-[#e0dbd0] shadow-sm mb-8"
        >
          <h3 className="text-2xl lg:text-3xl font-medium text-[#111110] mb-12 leading-tight">
            {currentQuestion.text}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.text}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "p-6 rounded-2xl text-left border-2 transition-all flex justify-between items-center group",
                  responses[currentQuestion.id] === option.value
                    ? "bg-[#f0eeff] border-[#8b7cf6] text-[#8b7cf6]"
                    : "bg-[#fcfaf7] border-transparent hover:border-[#8b7cf6]/30 text-[#111110]"
                )}
              >
                <span className="font-bold">{option.text}</span>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  responses[currentQuestion.id] === option.value
                    ? "border-[#8b7cf6] bg-[#8b7cf6]"
                    : "border-[#e0dbd0] group-hover:border-[#8b7cf6]/50"
                )}>
                  {responses[currentQuestion.id] === option.value && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center px-4">
        <button
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(prev => prev - 1)}
          className={cn(
            "flex items-center gap-2 p-4 rounded-2xl font-bold transition-all",
            currentStep === 0 ? "opacity-30 cursor-not-allowed" : "text-[#888880] hover:bg-white"
          )}
        >
          <ChevronLeft size={20} /> Previous
        </button>

        {isLastQuestion ? (
          <button
            disabled={!allAnswered || isSubmitting}
            onClick={handleSubmit}
            className={cn(
              "px-8 py-4 bg-[#8b7cf6] text-white rounded-2xl font-bold shadow-lg shadow-[#8b7cf6]/20 transition-all flex items-center gap-2",
              (!allAnswered || isSubmitting) ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-1 hover:bg-[#7a6be5]"
            )}
          >
            {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
          </button>
        ) : (
          <button
            disabled={!isQuestionAnswered}
            onClick={() => setCurrentStep(prev => prev + 1)}
            className={cn(
              "flex items-center gap-2 p-4 rounded-2xl font-bold transition-all bg-white shadow-sm border border-[#e0dbd0]",
              !isQuestionAnswered ? "opacity-30 cursor-not-allowed" : "text-[#8b7cf6] hover:bg-[#f0eeff] hover:border-[#8b7cf6]"
            )}
          >
            Next <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
