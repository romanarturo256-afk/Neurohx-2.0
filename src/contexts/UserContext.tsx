import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  plan: 'free' | 'starter' | 'pro' | 'premium';
  basePlan?: 'free' | 'starter' | 'pro' | 'premium';
  proExpiry?: string | null;
  referralCode?: string;
  referredBy?: string | null;
  theme?: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  settings?: {
    aiTone: 'professional' | 'formal' | 'casual' | 'empathetic';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
    darkMode: boolean;
    notifications: {
      email: boolean;
      push: boolean;
      dailyReminders: boolean;
    };
    autoSpeak?: boolean;
    soundEffects?: boolean;
  };
  createdAt: any;
}

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  isPlanAtLeast: (plan: 'free' | 'starter' | 'pro' | 'premium') => boolean;
  updateTheme: (theme: UserProfile['theme']) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const PLAN_HIERARCHY = {
  free: 0,
  starter: 1,
  pro: 2,
  premium: 3,
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileUnsubscribeRef = React.useRef<(() => void) | null>(null);

  // Store referral code from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      sessionStorage.setItem('referralCode', ref);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 UserProvider: Setting up listeners...');
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clean up previous profile listener if it exists
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }

      try {
        console.log('👤 Auth state changed:', user?.uid || 'Guest');
        if (user) {
          setLoading(true);
          const userDocRef = doc(db, 'users', user.uid);
          
          // Check for profile existence first
          const initialSnap = await getDoc(userDocRef);
          
          if (!initialSnap.exists()) {
            console.log('🆕 Creating new user profile...');
            const storedRefCode = sessionStorage.getItem('referralCode');
            let referredByUid = null;

            if (storedRefCode) {
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('referralCode', '==', storedRefCode));
              try {
                const querySnapshot = await getDocs(q).catch(e => handleFirestoreError(e, 'list', 'users'));
                if (!querySnapshot.empty) {
                  referredByUid = querySnapshot.docs[0].id;
                }
              } catch (e) {
                console.error('Referral lookup failed:', e);
              }
            }

            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              plan: 'free',
              basePlan: 'free',
              referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
              referredBy: referredByUid,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile).catch(e => handleFirestoreError(e, 'create', `users/${user.uid}`));
            
            // If referred, create a pending referral record
            if (referredByUid) {
              const refId = Math.random().toString(36).substring(7);
              await setDoc(doc(db, 'referrals', refId), {
                referrerId: referredByUid,
                referredId: user.uid,
                status: 'pending',
                rewardClaimed: false,
                createdAt: new Date().toISOString()
              }).catch(e => handleFirestoreError(e, 'create', `referrals/${refId}`));
            }
          }

          // Listen to user profile changes
          profileUnsubscribeRef.current = onSnapshot(userDocRef, async (snapshot) => {
            try {
              console.log('📄 Profile snapshot received');
              if (snapshot.exists()) {
                const data = snapshot.data() as UserProfile;
                
                // Check for pro expiry
                if (data.proExpiry && new Date(data.proExpiry) < new Date()) {
                  const path = `users/${user.uid}`;
                  await setDoc(doc(db, path), { 
                    plan: data.basePlan || 'free', 
                    proExpiry: null 
                  }, { merge: true }).catch(e => handleFirestoreError(e, 'update', path));
                }

                setProfile({ uid: user.uid, ...data });
              } else {
                setProfile(null);
              }
              setLoading(false);
            } catch (err) {
              console.error('Error in profile listener:', err);
              setLoading(false);
            }
          }, (error) => {
            console.error('❌ Profile snapshot error:', error);
            setLoading(false);
          });
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setLoading(false);
      }
    }, (error) => {
      console.error('❌ Auth error:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }
    };
  }, []);

  const isPlanAtLeast = (plan: 'free' | 'starter' | 'pro' | 'premium') => {
    // TEMPORARY: Always return true for testing all features
    return true;
    // if (!profile) return false;
    // return PLAN_HIERARCHY[profile.plan] >= PLAN_HIERARCHY[plan];
  };

  const updateTheme = async (theme: UserProfile['theme']) => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    const userDocRef = doc(db, path);
    await setDoc(userDocRef, { theme }, { merge: true }).catch(e => handleFirestoreError(e, 'update', path));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    const userDocRef = doc(db, path);
    await setDoc(userDocRef, updates, { merge: true }).catch(e => handleFirestoreError(e, 'update', path));
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply Theme
    if (profile?.theme) {
      root.style.setProperty('--color-primary', profile.theme.primary);
      root.style.setProperty('--color-secondary', profile.theme.secondary);
      root.style.setProperty('--color-background', profile.theme.background);
      root.style.setProperty('--color-accent', profile.theme.accent);
    } else {
      root.style.setProperty('--color-primary', '#8b7cf6');
      root.style.setProperty('--color-secondary', '#f0eeff');
      root.style.setProperty('--color-background', '#fcfaf7');
      root.style.setProperty('--color-accent', '#e0dbd0');
    }

    // Apply Dark Mode
    if (profile?.settings?.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply Font Size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.fontSize = fontSizes[profile?.settings?.fontSize || 'medium'];

  }, [profile?.theme, profile?.settings?.darkMode, profile?.settings?.fontSize]);

  return (
    <UserContext.Provider value={{ profile, loading, isPlanAtLeast, updateTheme, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
