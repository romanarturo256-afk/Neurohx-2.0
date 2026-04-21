import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { Leaf } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Important: Update the auth profile with the name so UserContext captures it
        await updateProfile(userCredential.user, { displayName: name });
        
        // Note: UserContext.tsx has an onAuthStateChanged listener that will 
        // automatically detect this new user and create the Firestore profile document.
        // We no longer need to call setDoc here manually.
      }
      navigate('/dashboard/chat');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // UserContext listener will handle profile creation/loading
      navigate('/dashboard/chat');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      // Handle the case where user cancels or domain is unauthorized
      if (err.code === 'auth/unauthorized-domain') {
        setError('Unauthorized Domain: Please add this URL to your Firebase Console > Auth > Settings > Authorized domains.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // Just ignore or show a gentle message
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
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1a2b27] rounded-2xl text-white mb-4">
            <Leaf size={24} />
          </div>
          <h1 className="font-['Syne'] text-3xl font-bold text-[#1a2b27] mb-2 uppercase tracking-tight">
            {isLogin ? 'Cognitive Login' : 'Start Journey'}
          </h1>
          <p className="text-[#4a5a57] text-sm font-medium">
            {isLogin ? 'Welcome back to your clinical companion' : 'Accredited. Trusted. Compassionate.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-[#1a2b27]/60 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white border border-[#1a2b27]/10 focus:border-[#2d7a36] outline-none transition-all text-sm font-medium"
                placeholder="John Doe"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-[#1a2b27]/60 uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-[#1a2b27]/10 focus:border-[#2d7a36] outline-none transition-all text-sm font-medium"
              placeholder="hello@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#1a2b27]/60 uppercase tracking-[0.2em] mb-2 px-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-[#1a2b27]/10 focus:border-[#2d7a36] outline-none transition-all text-sm font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a2b27] text-white py-4 rounded-2xl font-bold hover:bg-[#2d7a36] transition-all duration-300 disabled:opacity-50 mt-4 shadow-xl shadow-[#1a2b27]/20"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1a2b27]/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
            <span className="bg-[#f0f4f3] px-4 text-[#1a2b27]/40">Secured Access</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-[#1a2b27]/10 text-[#1a2b27] py-4 rounded-2xl font-bold hover:bg-[#1a2b27] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0" alt="Google" />
          Continue with Google
        </button>

        <p className="text-center mt-10 text-xs font-bold uppercase tracking-widest text-[#1a2b27]/40">
          {isLogin ? "New to Neurohx? " : "Already clinical? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#2d7a36] hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
