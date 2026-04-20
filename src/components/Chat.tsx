import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Save, 
  Trash2, 
  Sparkles, 
  Lock, 
  Crown,
  Mic,
  BookOpen,
  Menu,
  MessageSquare,
  LogOut,
  Reply,
  X,
  Volume2,
  AudioLines,
  Wind,
  Plus,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from './Toast';
import { useUser } from '../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const TypingIndicator = () => (
  <div className="flex gap-1.5 items-center px-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 1, 0.2],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
        className="w-1.5 h-1.5 bg-[#2d7a36] rounded-full shadow-[0_0_8px_rgba(45,122,54,0.3)]"
      />
    ))}
  </div>
);

export default function Chat() {
  const { showToast } = useToast();
  const { isPlanAtLeast, profile } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [typingMessage, setTypingMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const stopTypingRef = useRef<boolean>(false);
  const fullResponseRef = useRef<string>('');
  const currentTypingIndexRef = useRef<number>(0);
  const idleTimerRef = useRef<any>(null);

  const isPremium = isPlanAtLeast('premium');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'chats'),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          if (!chatId) {
            setChatId(doc.id);
            setMessages(doc.data().messages || []);
          }
        } else {
          createNewChat().catch(e => console.error('Error creating chat from snapshot:', e));
        }
      } catch (err) {
        console.error('Error in chat snapshot listener:', err);
      }
    }, (err) => console.error('❌ Chat list snapshot error:', err));

    // Also fetch history
    const historyQ = query(
      collection(db, 'users', auth.currentUser.uid, 'chats'),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );

    const historyUnsubscribe = onSnapshot(historyQ, (snapshot) => {
      try {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHistory(chats);
      } catch (err) {
        console.error('Error in chat history snapshot:', err);
      }
    }, (err) => console.error('Chat history snapshot error:', err));

    const handleNewChat = () => {
      createNewChat().catch(e => console.error('Error in new chat handler:', e));
    };
    window.addEventListener('new-chat', handleNewChat);

    return () => {
      unsubscribe();
      historyUnsubscribe();
      window.removeEventListener('new-chat', handleNewChat);
    };
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !auth.currentUser) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid, 'chats', chatId), (doc) => {
      try {
        if (doc.exists()) {
          setMessages(doc.data().messages || []);
        }
      } catch (err) {
        console.error('Error in chat messages snapshot:', err);
      }
    }, (err) => console.error('Chat messages snapshot error:', err));

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    const checkPermission = async () => {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'microphone' as any });
          setMicPermission(status.state as any);
          status.onchange = () => setMicPermission(status.state as any);
        } catch (e) {
          console.error('Permission check failed:', e);
        }
      }
    };
    checkPermission();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (loading || isTyping || !chatId) return;

    idleTimerRef.current = setTimeout(() => {
      triggerIdleGreeting();
    }, 120000); // 2 minutes
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [input, messages, loading, isTyping, chatId]);

  const triggerIdleGreeting = async () => {
    if (loading || isTyping || !auth.currentUser || !chatId) return;
    
    // Only introduce if there are no messages yet, or if the last message was a while ago
    // we already know it's been 2 mins since any state change monitored by useEffect
    
    setLoading(true);
    try {
      const tone = profile?.settings?.aiTone || 'professional';
      const language = profile?.settings?.language || 'en';
      
      const prompt = messages.length === 0 
        ? "The user has just opened the chat but hasn't said anything for 2 minutes. Please introduce yourself as Neurohx and start a conversation in a warm, empathetic way."
        : "The user has been quiet for 2 minutes. Please check in on them gently and see if there's anything else they'd like to discuss or reflect on.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: isPremium 
            ? `You are Neurohx Premium AI, a professional mental health counselor. Be warm, insightful, and proactive.`
            : `You are Neurohx, a professional mental health counselor. Be human-like and supportive.`
        }
      });

      const aiText = response.text || "I'm still here if you'd like to talk.";
      startTypingEffect(aiText);
    } catch (error) {
      console.error('Idle greeting error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTypingEffect = (text: string, baseMessages?: any[]) => {
    fullResponseRef.current = text;
    currentTypingIndexRef.current = 0;
    setTypingMessage('');
    setIsTyping(true);
    setIsPaused(false);
    stopTypingRef.current = false;
    
    const typeNextChar = () => {
      if (stopTypingRef.current) {
        setIsTyping(false);
        return;
      }

      if (isPaused) return;

      if (currentTypingIndexRef.current < fullResponseRef.current.length) {
        const nextChar = fullResponseRef.current[currentTypingIndexRef.current];
        setTypingMessage(prev => prev + nextChar);
        currentTypingIndexRef.current++;
        const delay = nextChar === '.' || nextChar === '?' || nextChar === '!' 
          ? 600 
          : nextChar === ',' || nextChar === ';' || nextChar === ':'
          ? 300
          : Math.floor(Math.random() * 35) + 15;
        setTimeout(typeNextChar, delay);
      } else {
        const aiMessage = {
          role: 'model',
          content: fullResponseRef.current,
          timestamp: new Date().toISOString()
        };
        const messagesToUse = baseMessages || messages;
        const updatedMessages = [...messagesToUse, aiMessage];
        const path = `users/${auth.currentUser.uid}/chats/${chatId!}`;
        updateDoc(doc(db, path), {
          messages: updatedMessages,
          updatedAt: serverTimestamp()
        }).catch(e => {
          console.error('Error updating chat after typing:', e);
          // Don't re-throw here to avoid unhandled rejection in non-awaited background task
        });
        if (profile?.settings?.autoSpeak) speak(fullResponseRef.current);
        setIsTyping(false);
        setTypingMessage('');
      }
    };
    typeNextChar();
  };

  useEffect(() => {
    if (chatId && location.state?.context) {
      const context = location.state.context;
      // Clear the state so it doesn't trigger again on refresh
      navigate(location.pathname, { replace: true, state: {} });
      
      // Auto-populate and trigger send
      setInput(context);
      // We need a small delay to ensure states are ready
      setTimeout(() => {
        handleSend(undefined, undefined, context).catch(err => console.error('Auto-context send error:', err));
      }, 500);
    }
  }, [chatId, location.state]);

  const createNewChat = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const path = `users/${auth.currentUser.uid}/chats`;
      const docRef = await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        messages: [],
        updatedAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, 'create', path));
      setChatId(docRef.id);
      setMessages([]);
    } catch (error) {
      console.error('Create initial chat error:', error);
      showToast('Failed to initialize chat session.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (id: string) => {
    if (!auth.currentUser) return;
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const { deleteDoc } = await import('firebase/firestore');
      const path = `users/${auth.currentUser.uid}/chats/${id}`;
      await deleteDoc(doc(db, path)).catch(e => handleFirestoreError(e, 'delete', path));
      showToast('Conversation deleted.', 'success');
      if (chatId === id) {
        setChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete conversation.', 'error');
    }
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      showToast('Microphone access granted!', 'success');
    } catch (err) {
      setMicPermission('denied');
      showToast('Microphone access denied. Please enable it in your browser settings.', 'error');
    }
  };

  const handleSend = async (e?: React.FormEvent, audioBlob?: Blob, transcriptOverride?: string) => {
    if (e) e.preventDefault();
    const finalInput = transcriptOverride || input;
    if ((!finalInput.trim() && !audioBlob) || !auth.currentUser || !chatId) return;
    
    setLoading(true);

    let base64Audio = '';
    if (audioBlob) {
      const reader = new FileReader();
      base64Audio = await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });
    }

    const userMessage = {
      role: 'user',
      content: finalInput || (audioBlob ? '🎤 Voice Message' : ''),
      hasAudio: !!audioBlob,
      timestamp: new Date().toISOString(),
      replyTo: replyTo ? {
        content: replyTo.content,
        role: replyTo.role
      } : null
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setReplyTo(null);

    try {
      const tone = profile?.settings?.aiTone || 'professional';
      const language = profile?.settings?.language || 'en';
      
      const toneInstructions = {
        professional: "Maintain a balanced, professional, and ethical counseling approach. Be supportive yet objective, focusing on evidence-based guidance and active listening.",
        formal: "Maintain a clinical and structured tone. Use precise language and focus on objective psychological analysis.",
        casual: "Be friendly, relatable, and use conversational language. Think of yourself as a wise friend who happens to be a therapist.",
        empathetic: "Prioritize emotional validation, warmth, and deep understanding. Use gentle language and focus on the user's feelings."
      };

      const tonePromptInstruction = !profile?.settings?.aiTone 
        ? "Since the user has not explicitly set a tone preference, at the end of your first response in this session, kindly ask if they would prefer a professional, formal, casual, or empathetic approach for your future interactions." 
        : "";

      const languageNames: Record<string, string> = {
        en: 'English', hi: 'Hindi', es: 'Spanish', fr: 'French', de: 'German',
        bn: 'Bengali', te: 'Telugu', mr: 'Marathi', ta: 'Tamil', gu: 'Gujarati',
        kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi', or: 'Odia', as: 'Assamese',
        ks: 'Kashmiri', kok: 'Konkani', mni: 'Manipuri', ne: 'Nepali', ur: 'Urdu'
      };

      const languageInstruction = `Respond in ${languageNames[language] || 'English'}.`;
      const nameInstruction = profile?.displayName ? `The user's name is ${profile.displayName}. Address them by name occasionally to build rapport.` : "";
      const counselingDuties = "Your core duties include: assessment, rapport building, case formulation, goal setting, therapeutic intervention, monitoring progress, maintaining ethics/confidentiality, crisis management, collaboration/referral, skill training, psychoeducation, and preventive mental health work.";

      const systemInstruction = isPremium 
        ? `You are Neurohx Premium AI, a professional mental health counselor and life coach. ${nameInstruction} ${counselingDuties} ${toneInstructions[tone as keyof typeof toneInstructions]} ${languageInstruction} ${tonePromptInstruction} Your goal is to provide deep emotional support, actionable mental wellness advice, and long-term growth strategies. You are an expert in psychology and can provide fascinating psychological facts, daily self-help hacks, and practical tips for personal growth. You can also summarize key insights from popular self-help books to help the user. Be warm, insightful, and proactive. Use proper punctuation, capitalization, and professional formatting. Use Markdown for structure. If the user sends a voice message, acknowledge it and respond with the same level of care.
        
        IMPORTANT: If the user explicitly asks you to call them by a specific name or expresses a new name preference, include the tag [UPDATE_NAME: PreferredName] at the very end of your response.`
        : `You are Neurohx, a professional mental health counselor and empathetic companion. ${nameInstruction} ${counselingDuties} ${toneInstructions[tone as keyof typeof toneInstructions]} ${languageInstruction} ${tonePromptInstruction} Your goal is to listen, provide support, and help the user reflect on their thoughts and feelings. You are knowledgeable in psychology and can share psychological facts, daily self-help tips, and summaries of self-help books to support the user's journey. Keep your responses concise, human-like, and supportive. Use proper punctuation, capitalization, and professional formatting. Use Markdown for structure. If the user sends a voice message, acknowledge it and respond with the same level of care.
        
        IMPORTANT: If the user explicitly asks you to call them by a specific name or expresses a new name preference, include the tag [UPDATE_NAME: PreferredName] at the very end of your response.`;

      let promptParts: any[] = [];
      
      if (replyTo) {
        promptParts.push({ text: `Context: The user is replying to a previous message (${replyTo.role}: "${replyTo.content}").` });
      }

      if (audioBlob && base64Audio) {
        promptParts.push({
          inlineData: {
            mimeType: audioBlob.type,
            data: base64Audio
          }
        });
        if (input) promptParts.push({ text: input });
      } else {
        promptParts.push({ text: input });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: promptParts },
        config: {
          systemInstruction: systemInstruction
        }
      });

      let aiText = response.text || "I'm here for you. Could you tell me more about that?";
      
      const nameMatch = aiText.match(/\[UPDATE_NAME:\s*(.*?)\]/);
      if (nameMatch && nameMatch[1]) {
        const newName = nameMatch[1].trim();
        const path = `users/${auth.currentUser.uid}`;
        await updateDoc(doc(db, path), {
          displayName: newName,
          updatedAt: serverTimestamp()
        }).catch(e => handleFirestoreError(e, 'update', path));
        aiText = aiText.replace(/\[UPDATE_NAME:\s*.*?\]/, '').trim();
      }

      startTypingEffect(aiText, newMessages);

    } catch (error) {
      console.error('Chat error:', error);
      showToast('AI is temporarily unavailable. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveToJournal = async () => {
    if (!auth.currentUser || messages.length === 0) return;
    
    if (!isPlanAtLeast('starter')) {
      showToast('Upgrade to Starter to save AI insights to your journal.', 'info');
      navigate('/dashboard/settings');
      return;
    }

    const lastMessages = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n\n');
    
    try {
      const path = `users/${auth.currentUser.uid}/journals`;
      await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        title: `Reflection from ${new Date().toLocaleDateString()}`,
        content: lastMessages,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, 'create', path));
      showToast('Conversation saved to your journal!', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save to journal.', 'error');
    }
  };

  const togglePause = () => {
    if (!isTyping) return;
    setIsPaused(prev => !prev);
  };

  useEffect(() => {
    if (isTyping && !isPaused) {
      const typeNextChar = () => {
        if (stopTypingRef.current || isPaused || !isTyping) return;

        if (currentTypingIndexRef.current < fullResponseRef.current.length) {
          const nextChar = fullResponseRef.current[currentTypingIndexRef.current];
          setTypingMessage(prev => prev + nextChar);
          currentTypingIndexRef.current++;
          const delay = nextChar === '.' || nextChar === '?' || nextChar === '!' ? 400 : 30;
          setTimeout(typeNextChar, delay);
        } else {
          const aiMessage = {
            role: 'model',
            content: fullResponseRef.current,
            timestamp: new Date().toISOString()
          };
          const finalMessages = [...messages, aiMessage];
          const path = `users/${auth.currentUser.uid}/chats/${chatId!}`;
          updateDoc(doc(db, path), {
            messages: finalMessages,
            updatedAt: serverTimestamp()
          }).catch(e => {
            console.error('Error saving chat messages after typing:', e);
            // Optionally handle contextually, but don't re-throw to avoid unhandled rejection
          });
          if (profile?.settings?.autoSpeak) speak(fullResponseRef.current);
          setIsTyping(false);
          setTypingMessage('');
        }
      };
      typeNextChar();
    }
  }, [isPaused, isTyping]);

  const toggleListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in your browser.', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    
    const langMap: Record<string, string> = {
      en: 'en-US', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
      bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN', ta: 'ta-IN', gu: 'gu-IN',
      kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN',
      ks: 'ks-IN', kok: 'kok-IN', mni: 'mni-IN', ne: 'ne-NP', ur: 'ur-PK'
    };
    recognition.lang = langMap[profile?.settings?.language || 'en'] || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      
      // Voice Commands
      if (transcript === 'send message' || transcript === 'send') {
        handleSend().catch(err => console.error('Voice send error:', err));
        setIsListening(false);
        return;
      }
      if (transcript === 'stop listening' || transcript === 'cancel') {
        recognition.stop();
        setIsListening(false);
        return;
      }
      if (transcript === 'save to journal' || transcript === 'save reflection') {
        saveToJournal().catch(err => console.error('Voice save error:', err));
        setIsListening(false);
        return;
      }
      if (transcript === 'scroll down' || transcript === 'go to bottom') {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        setIsListening(false);
        return;
      }
      if (transcript === 'clear input' || transcript === 'clear') {
        setInput('');
        setIsListening(false);
        showToast('Input cleared.', 'info');
        return;
      }

      // Default behavior: send as message if it's not a command
      if (transcript) {
        handleSend(undefined, undefined, transcript).catch(err => console.error('Voice message send error:', err));
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        showToast('Microphone access denied. Please check your browser permissions and allow microphone access for this site.', 'error');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        showToast(`Speech recognition error: ${event.error}`, 'error');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      // Check permission status if API is available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'microphone' as any });
          if (status.state === 'denied') {
            showToast('Microphone access is blocked. Please click the lock icon in your browser address bar and set Microphone to "Allow".', 'error');
            setIsListening(false);
            return;
          }
        } catch (pErr) {
          // Permissions API might not support 'microphone' in all browsers, continue to getUserMedia
        }
      }

      // Pre-check microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start recognition or permission denied:', err);
      setIsListening(false);
      
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        showToast('Microphone access denied. Please click the lock/settings icon in your browser address bar to allow access.', 'error');
      } else {
        showToast('Could not access microphone. Please ensure it is plugged in and not in use by another app.', 'error');
      }
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      return;
    }

    try {
      // Check permission status if API is available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'microphone' as any });
          if (status.state === 'denied') {
            showToast('Microphone access is blocked. Please click the lock icon in your browser address bar and set Microphone to "Allow".', 'error');
            return;
          }
        } catch (pErr) {
          // Permissions API might not support 'microphone' in all browsers
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleSend(undefined, audioBlob).catch(err => console.error('Audio send error:', err));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Recording error:', err);
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        showToast('Microphone access denied. Please click the lock/settings icon in your browser address bar to allow access.', 'error');
      } else {
        showToast('Could not access microphone. Please ensure it is plugged in and not in use by another app.', 'error');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      showToast('Text-to-speech is not supported in your browser.', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: 'en-US', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
      bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN', ta: 'ta-IN', gu: 'gu-IN',
      kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN',
      ks: 'ks-IN', kok: 'kok-IN', mni: 'mni-IN', ne: 'ne-NP', ur: 'ur-PK'
    };
    utterance.lang = langMap[profile?.settings?.language || 'en'] || 'en-US';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white rounded-[48px] border border-[#1a2b27]/10 overflow-hidden flex flex-col shadow-sm gpu-accelerated"
          >
            <div className="p-8 border-b border-[#1a2b27]/5 flex items-center justify-between">
              <h3 className="font-['Syne'] font-bold text-[#1a2b27] uppercase tracking-widest text-sm italic">Session Archive</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-[#f0f4f3] rounded-xl transition-all">
                <X size={16} className="text-[#4a5a57]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <button
                onClick={() => createNewChat().catch(err => console.error('UI create chat error:', err))}
                className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#1a2b27] text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#1a2b27]/20 hover:bg-[#2d7a36] transition-all mb-6"
              >
                <Plus size={16} />
                New Intake
              </button>
              {history.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setChatId(chat.id)}
                  className={cn(
                    "w-full text-left px-5 py-5 rounded-2xl text-[13px] transition-all border group relative cursor-pointer",
                    chatId === chat.id 
                      ? "bg-white border-[#1a2b27]/10 text-[#1a2b27] font-bold shadow-sm" 
                      : "border-transparent hover:bg-white/50 text-[#4a5a57]"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setChatId(chat.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="opacity-50" />
                    <span className="truncate pr-8 font-medium italic opacity-80">
                      {chat.messages?.[0]?.content?.slice(0, 30) || 'New Conversation'}
                    </span>
                  </div>
                  <p className="text-[9px] mt-2 opacity-40 font-bold uppercase tracking-wider">
                    {chat.updatedAt?.toDate ? chat.updatedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id).catch(err => console.error('Delete chat error:', err));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    aria-label="Delete Conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col bg-[#f0f4f3] rounded-[48px] border border-[#1a2b27]/10 overflow-hidden shadow-sm gpu-accelerated">
        {/* Header */}
        <div className="p-8 flex justify-between items-center bg-transparent z-10 border-b border-[#1a2b27]/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 bg-white border border-[#1a2b27]/10 rounded-2xl text-[#1a2b27] hover:text-[#2d7a36] transition-all shadow-sm"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-['Syne'] text-2xl font-bold text-[#1a2b27] tracking-tighter uppercase italic">neurohx intake</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => createNewChat().catch(err => console.error('UI create chat error:', err))}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-white border border-[#1a2b27]/10 rounded-xl text-[10px] font-bold text-[#1a2b27] uppercase tracking-widest hover:border-[#2d7a36] hover:text-[#2d7a36] transition-all shadow-sm"
            >
              <Plus size={12} />
              Session
            </button>
            {micPermission !== 'granted' && (
              <button
                onClick={() => requestMicPermission().catch(err => console.error('UI mic permission error:', err))}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest",
                  micPermission === 'denied' 
                    ? "bg-red-50 text-red-600 hover:bg-red-100" 
                    : "bg-[#1a2b27] text-white hover:bg-[#2d7a36] shadow-xl shadow-[#1a2b27]/20"
                )}
              >
                <Mic size={12} />
                Audio
              </button>
            )}
            <div className="w-10 h-10 bg-[#1a2b27] rounded-[14px] overflow-hidden border border-[#1a2b27]/10 shadow-sm p-0.5">
              <div className="w-full h-full rounded-[12px] bg-white overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.email}`} 
                  alt="Avatar"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            </div>
          </div>
        </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-8 lg:px-20 py-6 space-y-12">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-20 px-4">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-2xl border border-[#1a2b27]/10 p-4 transform rotate-6 scale-110">
              <img 
                src="/logo.png" 
                alt="Neurohx AI" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-[#1a2b27]');
                  const fallback = e.currentTarget.parentElement?.querySelector('.fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <Sparkles className="fallback hidden text-white" size={40} />
            </div>
            <div className="max-w-xl">
              <h3 className="font-['Syne'] text-5xl font-bold text-[#1a2b27] mb-6 tracking-tight italic uppercase">
                Welcome back, {profile?.displayName?.split(' ')[0] || 'User'}.
              </h3>
              <p className="text-[#4a5a57] text-xl font-medium opacity-80 italic leading-relaxed">
                Your clinical reflection space is open and ready. How may we assist your cognitive health today?
              </p>
              {micPermission !== 'granted' && (
                <button
                  onClick={() => requestMicPermission().catch(err => console.error('UI mic permission error:', err))}
                  className="mt-12 px-12 py-5 bg-[#1a2b27] text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#2d7a36] transition-all shadow-2xl shadow-[#1a2b27]/30 flex items-center gap-4 mx-auto"
                >
                  <Mic size={18} />
                  Enable Voice Dialogue
                </button>
              )}
            </div>
          </div>
        )}
        
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={cn(
              "flex flex-col gap-3 max-w-[90%] lg:max-w-[75%]",
              m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <span className="text-[9px] font-bold text-[#1a2b27]/40 uppercase tracking-[0.3em] px-4">
              {m.role === 'user' ? 'Client' : 'Clinical AI'}
            </span>
            <div className={cn(
              "p-8 rounded-[40px] text-base leading-relaxed relative group transition-all duration-300",
              m.role === 'user' 
                ? "bg-white text-[#1a2b27] rounded-tr-none border border-[#1a2b27]/10 shadow-sm" 
                : "bg-[#2d7a36]/5 text-[#1a2b27] rounded-tl-none border border-[#2d7a36]/10"
            )}>
              {m.replyTo && (
                <div className="mb-4 p-4 bg-[#1a2b27]/5 rounded-2xl border-l-2 border-[#1a2b27] text-xs opacity-70">
                  <p className="font-bold text-[9px] uppercase tracking-widest mb-1.5 opacity-60">
                    Refined from {m.role === 'user' ? 'client intake' : 'previous insight'}
                  </p>
                  <p className="line-clamp-2 italic font-medium">"{m.replyTo.content}"</p>
                </div>
              )}
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-2 prose-headings:font-['Syne'] prose-headings:font-bold prose-headings:text-[#1a2b27] prose-strong:text-[#2d7a36] prose-strong:italic">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              <div className={cn(
                "absolute top-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all",
                m.role === 'user' ? "-left-20" : "-right-20"
              )}>
                <button 
                  onClick={() => setReplyTo(m)}
                  className="p-3 bg-white rounded-full shadow-lg border border-[#1a2b27]/10 text-[#1a2b27] hover:scale-110 transition-transform"
                  title="Reply"
                >
                  <Reply size={14} />
                </button>
                {m.role === 'model' && (
                  <button 
                    onClick={() => speak(m.content)}
                    className={cn(
                      "p-3 bg-white rounded-full shadow-lg border border-[#1a2b27]/10 hover:scale-110 transition-transform",
                      isSpeaking ? "text-red-500" : "text-[#2d7a36]"
                    )}
                    title={isSpeaking ? "Stop Speaking" : "Audio Playback"}
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex flex-col gap-3 mr-auto max-w-[90%] lg:max-w-[75%] items-start">
            <span className="text-[9px] font-bold text-[#1a2b27]/40 uppercase tracking-[0.3em] px-4">Clinical AI</span>
            <div className="p-8 rounded-[40px] bg-[#2d7a36]/5 text-[#1a2b27] rounded-tl-none border border-[#2d7a36]/10 shadow-sm relative group">
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-2 prose-headings:font-['Syne'] prose-headings:font-bold prose-headings:text-[#1a2b27] prose-strong:text-[#2d7a36] prose-strong:italic">
                <ReactMarkdown>{typingMessage + ' ▌'}</ReactMarkdown>
              </div>
              <div className="absolute -right-16 top-6 flex flex-col gap-3">
                <button 
                  onClick={togglePause}
                  className="p-3 bg-white rounded-full shadow-lg border border-[#1a2b27]/10 text-[#2d7a36] hover:scale-110 transition-all"
                  title={isPaused ? "Resume" : "Pause Session"}
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button 
                  onClick={() => {
                    stopTypingRef.current = true;
                    setIsTyping(false);
                  }}
                  className="p-3 bg-white rounded-full shadow-lg border border-[#1a2b27]/10 text-red-500 hover:scale-110 transition-all"
                  title="Abstain from Generation"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex flex-col gap-3 mr-auto max-w-[75%] items-start">
            <span className="text-[9px] font-bold text-[#1a2b27]/40 uppercase tracking-[0.3em] px-4">Clinical AI</span>
            <div className="p-8 rounded-[40px] bg-[#2d7a36]/5 text-[#1a2b27] rounded-tl-none border border-[#2d7a36]/10 shadow-sm flex items-center gap-6">
              <span className="text-[10px] font-bold text-[#2d7a36] uppercase tracking-[0.2em] italic opacity-40">Reflecting</span>
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-transparent">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          {replyTo && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-5 bg-white border border-[#1a2b27]/10 rounded-[32px] flex items-center justify-between shadow-2xl"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="p-3 bg-[#f0f4f3] rounded-2xl text-[#2d7a36]">
                  <Reply size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-bold text-[#2d7a36] uppercase tracking-[0.2em] mb-0.5">
                    Context from {replyTo.role === 'user' ? 'Inquiry' : 'Neurohx Insight'}
                  </p>
                  <p className="text-[13px] text-[#4a5a57] truncate font-medium italic">"{replyTo.content}"</p>
                </div>
              </div>
              <button 
                onClick={() => setReplyTo(null)}
                className="p-3 text-[#4a5a57] hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
          <div className="flex items-center gap-4 bg-white border border-[#1a2b27]/10 rounded-[40px] p-2.5 shadow-2xl shadow-[#1a2b27]/5 focus-within:border-[#2d7a36]/40 transition-all duration-500">
            <button 
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-breathing'))}
              className="p-4 text-[#4a5a57] hover:text-[#2d7a36] transition-all"
              title="Breathwork Session"
            >
              <Wind size={22} />
            </button>
            <button 
              type="button"
              onClick={() => saveToJournal().catch(err => console.error('UI save journal error:', err))}
              className="p-4 text-[#4a5a57] hover:text-[#2d7a36] transition-all relative"
            >
              {!isPlanAtLeast('starter') && <Lock size={10} className="absolute top-3 right-3 text-[#2d7a36]" />}
              <BookOpen size={22} />
            </button>
            <div className="flex-1 flex items-center relative">
              {isRecording ? (
                <div className="w-full py-4 flex items-center gap-4 text-[#2d7a36] font-bold uppercase tracking-widest text-xs animate-pulse italic">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Capturing Intake... {formatTime(recordingTime)}
                </div>
              ) : (
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 1000))}
                  placeholder="Articulate your current state..."
                  className="w-full py-5 bg-transparent border-none text-[15px] font-medium text-[#1a2b27] focus:ring-0 outline-none placeholder:text-[#1a2b27]/30 italic"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => toggleListening().catch(err => console.error('UI listen error:', err))}
                className={cn(
                  "p-4 transition-all relative rounded-full hover:bg-[#f0f4f3]",
                  isListening ? "text-[#2d7a36] animate-pulse bg-[#f0f4f3]" : "text-[#4a5a57] hover:text-[#2d7a36]"
                )}
                title="Voice Transcription"
              >
                <Mic size={20} />
              </button>
              <button 
                type="button"
                onClick={() => toggleRecording().catch(err => console.error('UI record error:', err))}
                className={cn(
                  "p-4 transition-all relative rounded-full hover:bg-[#f0f4f3]",
                  isRecording ? "text-red-500 animate-bounce bg-red-50" : "text-[#4a5a57] hover:text-[#2d7a36]"
                )}
                title="Multimodal Insight"
              >
                <AudioLines size={20} />
              </button>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl disabled:opacity-20 disabled:shadow-none",
                input.trim() && !loading 
                  ? "bg-[#1a2b27] text-white hover:bg-[#2d7a36] shadow-[#1a2b27]/20 scale-105" 
                  : "bg-[#f0f4f3] text-[#4a5a57]"
              )}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <p className="text-center text-[10px] text-[#1a2b27]/30 mt-6 font-bold uppercase tracking-[0.2em] italic">
            Confidential Session • Secured by Neurohx Infrastructure
          </p>
        </form>
      </div>

      {/* Footer Status */}
      <div className="bg-[#1a2b27] py-2.5 flex justify-center">
        <div className="flex items-center gap-3 text-[9px] font-bold text-white uppercase tracking-[0.5em] italic">
          <div className="w-1.5 h-1.5 bg-[#2d7a36] rounded-full animate-pulse shadow-[0_0_8px_#2d7a36]" />
          Clinical AI Active
        </div>
      </div>
    </div>
  </div>
);
}
