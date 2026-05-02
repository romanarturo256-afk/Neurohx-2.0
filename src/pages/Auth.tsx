import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Leaf } from 'lucide-react';

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
      navigate('/dashboard/chat');
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
    <div className="min-h-screen bg-[#9ba9a6] flex items-center justify-center p-6 selection:bg-[#2d7a36] selection:text-white">
      <div className="max-w-md w-full bg-[#f0f4f3] rounded-[48px] shadow-2xl p-10 border border-[#1a2b27]/10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1a2b27] rounded-2xl text-white mb-4 shadow-lg shadow-[#1a2b27]/20">
            <Leaf size={24} />
          </div>
          <h1 className="font-['Syne'] text-3xl font-bold text-[#1a2b27] mb-2 uppercase tracking-tight">
            Secure Access
          </h1>
          <p className="text-[#4a5a57] text-sm font-medium">
            Clinical Wellness. Powered by Google Cloud.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100 font-medium animate-shake">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group w-full bg-white border border-[#1a2b27]/10 text-[#1a2b27] py-4 rounded-2xl font-bold hover:bg-[#1a2b27] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-xl hover:shadow-[#1a2b27]/10 disabled:opacity-50 transform active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
          
          <p className="text-center text-[10px] uppercase font-bold tracking-[0.2em] text-[#1a2b27]/40">
            Secured Access via Google Cloud
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a2b27]/5 text-center">
          <p className="text-[10px] text-[#4a5a57]/50 font-medium leading-relaxed">
            By continuing, you agree to our clinical terms and data privacy protocols.
          </p>
        </div>
      </div>
    </div>
  );
}
