import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Leaf } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Unauthorized Domain: Please add this URL to your Firebase Console > Auth > Settings > Authorized domains.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        console.log('User closed the login popup.');
      } else {
        setError(err.message || 'An unexpected authentication error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-color-background flex items-center justify-center p-6 selection:bg-primary selection:text-white relative overflow-hidden">
      {/* Ambient Gradient Atmosphere matching Home.tsx and Dashboard */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[65%] h-[65%] bg-gradient-to-br from-primary/15 to-transparent rounded-[50%] blur-[120px] opacity-70" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[75%] h-[75%] bg-gradient-to-tl from-[#bdaef5]/15 to-transparent rounded-[50%] blur-[140px] opacity-60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white/[0.05] border border-white/10 backdrop-blur-xl rounded-[40px] shadow-[0_24px_60px_rgba(0,0,0,0.3)] p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-2xl text-white mb-4 shadow-lg shadow-primary/25">
            <Leaf size={22} className="fill-white/10 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2 uppercase tracking-tight">
            Secure Access
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Clinical Wellness. Powered by Google Cloud.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/50 text-red-400 p-4 rounded-2xl text-sm mb-6 border border-red-900/50 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group w-full bg-white/[0.05] border border-white/10 hover:border-white/20 text-text-primary py-4 rounded-2xl font-bold hover:bg-white/[0.08] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-xl hover:shadow-[#00D4C8]/10 disabled:opacity-50 transform active:scale-[0.98] cursor-pointer"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
          
          <p className="text-center text-[10px] uppercase font-bold tracking-[0.2em] text-primary/50">
            Secured Access via Google Cloud
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-primary/10 text-center">
          <p className="text-[10px] text-text-secondary/60 font-medium leading-relaxed">
            By continuing, you agree to our clinical terms and data privacy protocols.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
