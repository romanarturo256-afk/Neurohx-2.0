import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth';
import { 
  User, 
  Mail, 
  CreditCard, 
  Shield, 
  Trash2, 
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  LogOut,
  Lock,
  Upload,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  Palette,
  Check,
  Languages,
  Type,
  Moon,
  Sun,
  Bell,
  MessageCircle,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Edit2,
  X,
  LifeBuoy,
  Zap,
  Mic,
  Volume2,
  Share2,
  Copy,
  Gift
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';

const plans = [
  { id: 'free', name: 'Free', price: '₹0', amount: 0, features: ['Unlimited AI Chat', 'Basic Responses'] },
  { id: 'starter', name: 'Starter', price: '₹33', amount: 33, features: ['Save Journals', '1 Habit Tracker'] },
  { id: 'pro', name: 'Pro', price: '₹99', amount: 99, features: ['Unlimited Journals', 'Mood Charts', 'PDF Export'] },
  { id: 'premium', name: 'Premium', price: '₹222', amount: 222, features: ['AI Life Coach', 'Weekly Reports', 'Priority AI'] },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Settings() {
  const { showToast } = useToast();
  const { profile, loading: userLoading, updateTheme, updateProfile } = useUser();
  const [updating, setUpdating] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.displayName || '');
  const [pendingRewards, setPendingRewards] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'referrals'), 
      where('referrerId', '==', auth.currentUser.uid),
      where('status', '==', 'completed'),
      where('rewardClaimed', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        setPendingRewards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error in referrals snapshot:', err);
      }
    }, (err) => console.error('Referrals snapshot error:', err));
    return () => unsubscribe();
  }, []);

  const claimReward = async (referralId: string) => {
    if (!auth.currentUser) return;
    setUpdating(true);
    try {
      const currentExpiry = profile?.proExpiry ? new Date(profile.proExpiry) : new Date();
      const newExpiry = new Date(Math.max(currentExpiry.getTime(), new Date().getTime()));
      newExpiry.setMonth(newExpiry.getMonth() + 1);

      const userPath = `users/${auth.currentUser.uid}`;
      await updateDoc(doc(db, userPath), {
        plan: 'pro',
        basePlan: profile?.plan || 'free',
        proExpiry: newExpiry.toISOString(),
        updatedAt: new Date()
      }).catch(e => handleFirestoreError(e, 'update', userPath));

      const refPath = `referrals/${referralId}`;
      await updateDoc(doc(db, refPath), {
        rewardClaimed: true
      }).catch(e => handleFirestoreError(e, 'update', refPath));

      showToast('Reward claimed! You now have 1 month of Pro.', 'success');
    } catch (error) {
      showToast('Failed to claim reward.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (profile?.displayName) {
      setNewName(profile.displayName);
    }
  }, [profile?.displayName]);

  const avatars = [
    { id: 'avatar1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
    { id: 'avatar2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka' },
    { id: 'avatar3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 'avatar4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { id: 'avatar5', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
    { id: 'avatar6', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka' },
    { id: 'avatar7', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix' },
    { id: 'avatar8', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Aneka' },
  ];

  const handleAvatarSelect = async (url: string) => {
    if (!auth.currentUser) return;
    setUpdating(true);
    try {
      const path = `users/${auth.currentUser.uid}`;
      await updateDoc(doc(db, path), {
        photoURL: url,
        updatedAt: new Date()
      }).catch(e => handleFirestoreError(e, 'update', path));
      showToast('Avatar updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update avatar.', 'error');
    } finally {
      setUpdating(false);
    }
  };
  
  const [customTheme, setCustomTheme] = useState({
    primary: profile?.theme?.primary || '#8b7cf6',
    secondary: profile?.theme?.secondary || '#f0eeff',
    background: profile?.theme?.background || '#fcfaf7',
    accent: profile?.theme?.accent || '#e0dbd0'
  });

  const themes = [
    { name: 'Default', primary: '#8b7cf6', secondary: '#f0eeff', background: '#fcfaf7', accent: '#e0dbd0' },
    { name: 'Ocean', primary: '#0ea5e9', secondary: '#e0f2fe', background: '#f0f9ff', accent: '#bae6fd' },
    { name: 'Forest', primary: '#22c55e', secondary: '#f0fdf4', background: '#f0fdf4', accent: '#bbf7d0' },
    { name: 'Sunset', primary: '#f43f5e', secondary: '#fff1f2', background: '#fff1f2', accent: '#fecdd3' },
    { name: 'Midnight', primary: '#6366f1', secondary: '#eef2ff', background: '#f8fafc', accent: '#e2e8f0' },
  ];

  const handleThemeUpdate = async (theme: any) => {
    try {
      await updateTheme(theme);
      showToast('Theme updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update theme.', 'error');
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) return;
    setUpdating(true);
    try {
      await updateProfile({ displayName: newName });
      showToast('Name updated successfully!', 'success');
      setIsEditingName(false);
    } catch (error) {
      showToast('Failed to update name.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleSettingsUpdate = async (settingPath: string, value: any) => {
    try {
      const currentSettings = profile?.settings || {
        aiTone: 'professional',
        language: 'en',
        fontSize: 'medium',
        darkMode: false,
        notifications: { email: true, push: true, dailyReminders: true }
      };

      const pathParts = settingPath.split('.');
      let updatedSettings = { ...currentSettings };
      
      if (pathParts.length === 1) {
        (updatedSettings as any)[pathParts[0]] = value;
      } else {
        (updatedSettings as any)[pathParts[0]] = {
          ...(updatedSettings as any)[pathParts[0]],
          [pathParts[1]]: value
        };
      }

      await updateProfile({ settings: updatedSettings });
      showToast('Settings updated!', 'success');
    } catch (error) {
      showToast('Failed to update settings.', 'error');
    }
  };
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !auth.currentUser.email) return;
    
    if (passwordData.new !== passwordData.confirm) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    if (passwordData.new.length < 6) {
      showToast('Password should be at least 6 characters.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, passwordData.current);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordData.new);
      
      showToast('Password updated successfully!', 'success');
      setShowPasswordChange(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Password update error:', error);
      let message = 'Failed to update password.';
      if (error.code === 'auth/wrong-password') message = 'Current password is incorrect.';
      showToast(message, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
          try {
            // Resize image to max 400x400
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 400;

            if (width > height) {
              if (width > maxDim) {
                height *= maxDim / width;
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width *= maxDim / height;
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            
            const path = `users/${auth.currentUser!.uid}`;
            await updateDoc(doc(db, path), {
              photoURL: base64,
              updatedAt: new Date()
            }).catch(e => handleFirestoreError(e, 'update', path));
            
            showToast('Profile picture updated successfully!', 'success');
          } catch (err) {
            console.error('Photo resize/save error:', err);
            showToast('Failed to process or save image.', 'error');
          } finally {
            setUploadingPhoto(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload photo.', 'error');
      setUploadingPhoto(false);
    }
  };

  const handlePayment = async (plan: any) => {
    if (!auth.currentUser) return;
    
    if (plan.id === 'free') {
      await updatePlan(plan.id);
      return;
    }

    setUpdating(true);
    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }

      // Use subscription for recurring payments (Autopay)
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id })
      });
      
      if (!response.ok) throw new Error('Failed to create subscription');
      
      const subscription = await response.json();

      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Neurohx",
        description: `${plan.name} Subscription (Autopay Enabled)`,
        handler: async (response: any) => {
          console.log('Subscription successful:', response.razorpay_subscription_id);
          await updatePlan(plan.id, response.razorpay_subscription_id);
        },
        prefill: {
          name: profile?.displayName || "",
          email: profile?.email || "",
        },
        theme: {
          color: "#8b7cf6",
        },
        modal: {
          ondismiss: () => setUpdating(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      showToast(error.message || 'Failed to initiate payment.', 'error');
      setUpdating(false);
    }
  };

  const updatePlan = async (planId: string, paymentId?: string) => {
    if (!auth.currentUser) return;
    setUpdating(true);
    try {
      const oldPlan = profile?.plan;
      
      const path = `users/${auth.currentUser.uid}`;
      await updateDoc(doc(db, path), {
        plan: planId,
        basePlan: planId,
        lastPaymentId: paymentId || null,
        updatedAt: new Date()
      }).catch(e => handleFirestoreError(e, 'update', path));

      // Mark referral as completed if this is the first purchase
      if (oldPlan === 'free' && (planId === 'starter' || planId === 'pro' || planId === 'premium')) {
        if (profile?.referredBy) {
          const referralsRef = collection(db, 'referrals');
          const q = query(referralsRef, 
            where('referredId', '==', auth.currentUser.uid),
            where('referrerId', '==', profile.referredBy),
            where('status', '==', 'pending')
          );
          const querySnapshot = await getDocs(q).catch(e => handleFirestoreError(e, 'list', 'referrals'));
          
          if (!querySnapshot.empty) {
            const referralDoc = querySnapshot.docs[0];
            const refPath = `referrals/${referralDoc.id}`;
            await updateDoc(doc(db, refPath), {
              status: 'completed',
              completedAt: new Date().toISOString()
            }).catch(e => handleFirestoreError(e, 'update', refPath));
          }
        }
      }

      setIsChangingPlan(false);
      showToast(`Success! You are now on the ${planId} plan.`, 'success');
    } catch (error) {
      console.error('Update error:', error);
      showToast('Failed to update plan. Please contact support.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const deleteAccount = async () => {
    if (!auth.currentUser || !window.confirm('WARNING: This will permanently delete your account and all data. Proceed?')) return;
    try {
      const path = `users/${auth.currentUser.uid}`;
      await deleteDoc(doc(db, path)).catch(e => handleFirestoreError(e, 'delete', path));
      await auth.currentUser.delete();
      window.location.href = '/';
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Please re-authenticate to delete your account.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (error) {
      showToast('Failed to logout.', 'error');
    }
  };

  if (userLoading) return <div className="flex items-center justify-center h-64 text-[#888880]">Loading settings...</div>;

  return (
    <div className="space-y-12 pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-['Syne'] text-3xl font-bold text-[#111110]">Settings</h1>
        <p className="text-[#888880]">Manage your profile and subscription</p>
        <div className="mt-4 p-4 bg-[#8b7cf6]/10 border border-[#8b7cf6]/20 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8b7cf6] text-white rounded-xl flex items-center justify-center">
            <Zap size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#8b7cf6] uppercase tracking-wider">Test Mode Active</p>
            <p className="text-xs text-[#111110]">All premium features (Starter, Pro, Premium) have been temporarily unlocked for your review.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6]">
                <User size={24} />
              </div>
              <h3 className="font-bold text-[#111110]">Profile Information</h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-[#f5f2eb]">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-[#f0eeff] overflow-hidden bg-[#f5f2eb] flex items-center justify-center shadow-inner">
                  {profile?.photoURL ? (
                    <img 
                      src={profile.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={48} className="text-[#8b7cf6]" />
                  )}
                  {(uploadingPhoto || updating) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#8b7cf6] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#7c6df0] transition-all group-hover:scale-110">
                  <Upload size={18} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto || updating}
                  />
                </label>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-bold text-[#111110] mb-1">{profile?.displayName || 'Neurohx User'}</h4>
                <p className="text-sm text-[#888880] mb-6">{profile?.email}</p>
                
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-wider">Choose a Character</label>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    {avatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => handleAvatarSelect(avatar.url)}
                        className={cn(
                          "w-12 h-12 rounded-full border-2 transition-all overflow-hidden bg-white hover:scale-110",
                          profile?.photoURL === avatar.url ? "border-[#8b7cf6] ring-2 ring-[#8b7cf6]/20" : "border-transparent hover:border-[#8b7cf6]/30"
                        )}
                      >
                        <img src={avatar.url} alt="Avatar" className="w-full h-full" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <label className="px-4 py-2 bg-[#f0eeff] text-[#8b7cf6] rounded-xl text-xs font-bold cursor-pointer hover:bg-[#e6e2ff] transition-all flex items-center gap-2">
                      <Upload size={14} />
                      Custom Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto || updating}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#888880] uppercase tracking-wider mb-2">Display Name</label>
                <div className="flex gap-2">
                  {isEditingName ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl bg-[#f5f2eb] border border-[#8b7cf6] text-[#111110] font-medium outline-none"
                        placeholder="Your Name"
                      />
                      <button 
                        onClick={handleNameUpdate}
                        disabled={updating}
                        className="p-3 bg-[#8b7cf6] text-white rounded-xl hover:bg-[#7c6df0] transition-all"
                      >
                        <SaveIcon size={18} />
                      </button>
                      <button 
                        onClick={() => { setIsEditingName(false); setNewName(profile?.displayName || ''); }}
                        className="p-3 bg-[#f5f2eb] text-[#888880] rounded-xl hover:bg-[#ede9df] transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 px-4 py-3 rounded-xl bg-[#f5f2eb] border border-transparent text-[#111110] font-medium flex items-center justify-between group">
                      {profile?.displayName || 'Neurohx User'}
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="opacity-0 group-hover:opacity-100 text-[#8b7cf6] transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#888880] uppercase tracking-wider mb-2">Email Address</label>
                <div className="px-4 py-3 rounded-xl bg-[#f5f2eb] border border-transparent text-[#111110] font-medium flex items-center gap-2">
                  <Mail size={14} className="text-[#888880]" />
                  {profile?.email}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Personalization Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.02 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6]">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-[#111110]">Personalization</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-[#888880] uppercase tracking-wider mb-4">AI Tone Preference</label>
                <div className="flex flex-wrap gap-2">
                  {['professional', 'empathetic', 'formal', 'casual'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => handleSettingsUpdate('aiTone', tone)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                        (profile?.settings?.aiTone || 'professional') === tone 
                          ? "bg-[#8b7cf6] text-white" 
                          : "bg-[#f5f2eb] text-[#888880] hover:bg-[#ede9df]"
                      )}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#888880] uppercase tracking-wider mb-4">Language</label>
                <select 
                  value={profile?.settings?.language || 'en'}
                  onChange={(e) => handleSettingsUpdate('language', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f5f2eb] border border-transparent text-sm font-medium focus:border-[#8b7cf6] outline-none transition-all"
                >
                  <optgroup label="Global Languages">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </optgroup>
                  <optgroup label="Indian Languages">
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="bn">Bengali (বাংলা)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="gu">Gujarati (ગુજરાતી)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                    <option value="ml">Malayalam (മലയാളம்)</option>
                    <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="or">Odia (ଓଡ଼ିଆ)</option>
                    <option value="as">Assamese (অসমীয়া)</option>
                    <option value="ks">Kashmiri (کأشُر)</option>
                    <option value="kok">Konkani (कोंकणी)</option>
                    <option value="mni">Manipuri (মৈতৈলোন্)</option>
                    <option value="ne">Nepali (नेपाली)</option>
                    <option value="ur">Urdu (اردو)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </motion.section>

          {/* Display Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6]">
                <SettingsIcon size={24} />
              </div>
              <h3 className="font-bold text-[#111110]">Display & Accessibility</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-[#888880] uppercase tracking-wider mb-4">Font Size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSettingsUpdate('fontSize', size)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                        profile?.settings?.fontSize === size 
                          ? "bg-[#8b7cf6] text-white" 
                          : "bg-[#f5f2eb] text-[#888880] hover:bg-[#ede9df]"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#888880] uppercase tracking-wider mb-4">Appearance</label>
                <button
                  onClick={() => handleSettingsUpdate('darkMode', !profile?.settings?.darkMode)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                    profile?.settings?.darkMode ? "bg-[#1e1b4b] text-white" : "bg-[#f5f2eb] text-[#111110]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {profile?.settings?.darkMode ? <Moon size={16} /> : <Sun size={16} />}
                    {profile?.settings?.darkMode ? 'Dark Mode' : 'Light Mode'}
                  </div>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-all",
                    profile?.settings?.darkMode ? "bg-[#8b7cf6]" : "bg-[#e0dbd0]"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      profile?.settings?.darkMode ? "left-6" : "left-1"
                    )} />
                  </div>
                </button>
              </div>
            </div>
          </motion.section>

          {/* Notifications Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6]">
                <Bell size={24} />
              </div>
              <h3 className="font-bold text-[#111110]">Notifications</h3>
            </div>

            <div className="space-y-4">
              {[
                { id: 'email', label: 'Email Notifications', desc: 'Receive weekly reports and updates via email.' },
                { id: 'push', label: 'Push Notifications', desc: 'Get instant alerts on your device.' },
                { id: 'dailyReminders', label: 'Daily Reminders', desc: 'Gentle nudges to check in and journal.' }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#fcfaf7] border border-[#f5f2eb]">
                  <div>
                    <p className="text-sm font-bold text-[#111110]">{item.label}</p>
                    <p className="text-xs text-[#888880]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleSettingsUpdate(`notifications.${item.id}`, !(profile?.settings?.notifications as any)?.[item.id])}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all",
                      (profile?.settings?.notifications as any)?.[item.id] ? "bg-[#8b7cf6]" : "bg-[#e0dbd0]"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      (profile?.settings?.notifications as any)?.[item.id] ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Theme Customization Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6]">
                <Palette size={24} />
              </div>
              <h3 className="font-bold text-[#111110]">Theme Customization</h3>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-[#888880] uppercase tracking-wider mb-4">Preset Palettes</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {themes.map((t) => {
                    const isActive = profile?.theme?.primary === t.primary;
                    return (
                      <button
                        key={t.name}
                        onClick={() => handleThemeUpdate(t)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all text-left group",
                          isActive ? "border-[#8b7cf6] bg-[#f0eeff]/30" : "border-[#f5f2eb] hover:border-[#8b7cf6]/30"
                        )}
                      >
                        <div className="flex gap-1 mb-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.primary }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.secondary }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.background }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111110]">{t.name}</span>
                          {isActive && <Check size={12} className="text-[#8b7cf6]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-8 border-t border-[#f5f2eb]">
                <label className="block text-xs font-bold text-[#888880] uppercase tracking-wider mb-6">Custom Theme</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-wider mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={customTheme.primary}
                        onChange={(e) => setCustomTheme({...customTheme, primary: e.target.value})}
                        className="w-10 h-10 rounded-lg border-none cursor-pointer"
                      />
                      <span className="text-xs font-mono text-[#111110]">{customTheme.primary}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-wider mb-2">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={customTheme.secondary}
                        onChange={(e) => setCustomTheme({...customTheme, secondary: e.target.value})}
                        className="w-10 h-10 rounded-lg border-none cursor-pointer"
                      />
                      <span className="text-xs font-mono text-[#111110]">{customTheme.secondary}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-wider mb-2">Background</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={customTheme.background}
                        onChange={(e) => setCustomTheme({...customTheme, background: e.target.value})}
                        className="w-10 h-10 rounded-lg border-none cursor-pointer"
                      />
                      <span className="text-xs font-mono text-[#111110]">{customTheme.background}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-wider mb-2">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={customTheme.accent}
                        onChange={(e) => setCustomTheme({...customTheme, accent: e.target.value})}
                        className="w-10 h-10 rounded-lg border-none cursor-pointer"
                      />
                      <span className="text-xs font-mono text-[#111110]">{customTheme.accent}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleThemeUpdate(customTheme)}
                  className="mt-8 px-8 py-3 bg-[#111110] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#222220] transition-all"
                >
                  Apply Custom Theme
                </button>
              </div>
            </div>
          </motion.section>

          {/* Refer & Earn Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b7cf6]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 bg-[#fef3c7] rounded-2xl flex items-center justify-center text-[#d97706]">
                <Gift size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#111110]">Refer & Earn</h3>
                <p className="text-xs text-[#888880]">Get 1 month of Pro for free</p>
              </div>
            </div>

            <div className="bg-[#fcfaf7] p-6 rounded-2xl border border-[#f5f2eb] relative z-10">
              <p className="text-sm text-[#111110] mb-6 leading-relaxed">
                Invite your friends to Neurohx! When they sign up and upgrade to any paid plan, you'll instantly receive <span className="font-bold text-[#8b7cf6]">1 month of Pro version</span> for free.
              </p>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-wider">Your Referral Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#e0dbd0] text-xs font-mono text-[#111110] truncate">
                    {window.location.origin}/?ref={profile?.referralCode}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/?ref=${profile?.referralCode}`);
                      showToast('Referral link copied!', 'success');
                    }}
                    className="p-3 bg-[#111110] text-white rounded-xl hover:bg-[#222220] transition-all flex items-center gap-2"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join Neurohx',
                          text: 'Check out Neurohx - your personal AI wellness companion!',
                          url: `${window.location.origin}/?ref=${profile?.referralCode}`
                        });
                      }
                    }}
                    className="p-3 bg-[#8b7cf6] text-white rounded-xl hover:bg-[#7c6df0] transition-all"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {pendingRewards.length > 0 && (
                <div className="mt-8 space-y-3">
                  <label className="block text-[10px] font-bold text-[#8b7cf6] uppercase tracking-wider">Pending Rewards ({pendingRewards.length})</label>
                  {pendingRewards.map((reward) => (
                    <div key={reward.id} className="p-4 bg-[#f0eeff] rounded-2xl border border-[#8b7cf6]/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#8b7cf6]">
                          <Gift size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111110]">1 Month Pro Access</p>
                          <p className="text-[10px] text-[#888880]">Referral completed!</p>
                        </div>
                      </div>
                      <button
                        onClick={() => claimReward(reward.id)}
                        disabled={updating}
                        className="px-4 py-2 bg-[#8b7cf6] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#7c6df0] transition-all disabled:opacity-50"
                      >
                        Claim
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {profile?.proExpiry && (
                <div className="mt-6 p-4 bg-[#eaf4f0] rounded-xl border border-[#4ade80]/20 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#4ade80]">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider">Referral Reward Active</p>
                    <p className="text-xs text-[#111110]">Your free Pro access expires on {new Date(profile.proExpiry).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* Support Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6]">
                  <LifeBuoy size={24} />
                </div>
                <h3 className="font-bold text-[#111110]">Help & Support</h3>
              </div>
            </div>
            <div className="bg-[#fcfaf7] p-6 rounded-2xl border border-[#f5f2eb] flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#111110]">Need assistance?</p>
                <p className="text-xs text-[#888880]">Our support team is ready to help you with any issues.</p>
              </div>
              <Link 
                to="/dashboard/support"
                className="px-6 py-2.5 bg-white border border-[#e0dbd0] text-[#111110] rounded-xl text-xs font-bold hover:bg-[#f5f2eb] transition-all"
              >
                Contact Support
              </Link>
            </div>
          </motion.section>

          {/* Subscription Management Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#eaf4f0] rounded-2xl flex items-center justify-center text-[#4ade80]">
                  <CreditCard size={24} />
                </div>
                <h3 className="font-bold text-[#111110]">Subscription Management</h3>
              </div>
              {isChangingPlan && (
                <button 
                  onClick={() => setIsChangingPlan(false)}
                  className="text-xs font-bold text-[#8b7cf6] hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>

            {!isChangingPlan ? (
              <div className="bg-[#fcfaf7] p-8 rounded-[32px] border border-[#e0dbd0] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b7cf6]/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-[#8b7cf6]/10" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-[#8b7cf6] font-bold shadow-xl shadow-[#8b7cf6]/10 border border-[#f0eeff] text-2xl">
                    {profile?.plan?.charAt(0).toUpperCase() || 'F'}
                  </div>
                  <div>
                    <p className="text-[10px] text-[#888880] uppercase tracking-[0.2em] font-bold mb-1">Your Active Membership</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-['Syne'] font-bold text-[#111110] capitalize">Test Mode (All Features Unlocked)</p>
                      <div className="px-2 py-0.5 bg-[#8b7cf6] text-white text-[8px] font-bold rounded-full uppercase tracking-widest animate-pulse">Test Mode</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsChangingPlan(true)}
                  className="w-full md:w-auto px-10 py-4 bg-[#111110] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#222220] transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                >
                  Manage Subscription
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                {plans.map((plan) => {
                  const isActive = profile?.plan === plan.id;
                  const isPro = plan.id === 'pro';
                  
                  return (
                    <motion.div 
                      key={plan.id}
                      whileHover={{ y: -4 }}
                      className={cn(
                        "p-8 rounded-[32px] border transition-all duration-500 relative flex flex-col overflow-hidden",
                        isActive 
                          ? "border-[#8b7cf6] bg-white shadow-2xl shadow-[#8b7cf6]/15 scale-[1.02] ring-1 ring-[#8b7cf6]/30" 
                          : "border-[#e0dbd0] bg-white/40 hover:border-[#8b7cf6]/50 hover:bg-white hover:shadow-xl hover:shadow-black/5"
                      )}
                    >
                      {isActive && (
                        <>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b7cf6]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                          <div className="absolute top-6 right-6">
                            <div className="bg-[#8b7cf6] text-white px-3 py-1 rounded-full shadow-lg shadow-[#8b7cf6]/30 flex items-center gap-1.5">
                              <CheckCircle2 size={12} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {isPro && !isActive && (
                        <div className="absolute top-6 right-6">
                          <div className="bg-[#f0eeff] text-[#8b7cf6] text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em] border border-[#8b7cf6]/10 shadow-sm">
                            Best Value
                          </div>
                        </div>
                      )}

                      <div className="mb-10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                            isActive ? "bg-[#8b7cf6] text-white" : "bg-[#f5f2eb] text-[#888880]"
                          )}>
                            {plan.id === 'free' && <User size={20} />}
                            {plan.id === 'starter' && <Sparkles size={20} />}
                            {plan.id === 'pro' && <Crown size={20} />}
                            {plan.id === 'premium' && <Shield size={20} />}
                          </div>
                          <h4 className={cn(
                            "text-xs font-bold uppercase tracking-[0.25em]",
                            isActive ? "text-[#8b7cf6]" : "text-[#888880]"
                          )}>
                            {plan.name}
                          </h4>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-['Syne'] font-bold text-[#111110] tracking-tight">{plan.price}</span>
                          <span className="text-[11px] font-bold text-[#888880] uppercase tracking-widest">/ month</span>
                        </div>
                        {plan.id !== 'free' && (
                          <div className="mt-2 flex items-center gap-1.5 text-[#4ade80]">
                            <Zap size={10} fill="currentColor" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Autopay Enabled</span>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-5 mb-12 flex-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="text-[13px] text-[#111110] flex items-center gap-3.5 font-medium">
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                              isActive ? "bg-[#8b7cf6]/10 text-[#8b7cf6]" : "bg-[#f5f2eb] text-[#888880]"
                            )}>
                              <CheckCircle2 size={12} />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>

                      {isActive ? (
                        <div className="w-full py-4.5 bg-[#f0eeff] text-[#8b7cf6] rounded-2xl text-[11px] font-bold border border-[#8b7cf6]/20 flex items-center justify-center gap-2.5 cursor-default shadow-sm">
                          <CheckCircle2 size={16} />
                          CURRENTLY ACTIVE
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePayment(plan)}
                          disabled={updating}
                          className={cn(
                            "w-full py-4.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-2.5 uppercase tracking-widest group",
                            plan.id === 'free' 
                              ? "bg-[#f5f2eb] text-[#111110] hover:bg-[#ede9df]" 
                              : "bg-[#111110] text-white hover:bg-[#222220] shadow-xl shadow-black/10"
                          )}
                        >
                          {updating ? 'Processing...' : (plan.id === 'free' ? 'Switch to Free' : `Upgrade to ${plan.name}`)}
                          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Voice & Audio Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#f0eeff] rounded-2xl flex items-center justify-center text-[#8b7cf6]">
                <Mic size={24} />
              </div>
              <h3 className="font-bold text-[#111110]">Voice & Audio</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#fcfaf7] rounded-2xl border border-[#f5f2eb]">
                <div>
                  <h4 className="text-sm font-bold text-[#111110]">Auto-Speak Responses</h4>
                  <p className="text-xs text-[#888880]">Automatically read AI responses aloud</p>
                </div>
                <button 
                  onClick={() => handleSettingsUpdate('autoSpeak', !profile?.settings?.autoSpeak)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    profile?.settings?.autoSpeak ? "bg-[#8b7cf6]" : "bg-[#e0dbd0]"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    profile?.settings?.autoSpeak ? "right-1" : "left-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#fcfaf7] rounded-2xl border border-[#f5f2eb]">
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className="text-[#8b7cf6]" />
                  <div>
                    <h4 className="text-sm font-bold text-[#111110]">Voice Feedback</h4>
                    <p className="text-xs text-[#888880]">Enable sound effects for interactions</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSettingsUpdate('soundEffects', !profile?.settings?.soundEffects)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    profile?.settings?.soundEffects ? "bg-[#8b7cf6]" : "bg-[#e0dbd0]"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    profile?.settings?.soundEffects ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </motion.section>
        </div>

        <div className="space-y-8">
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[28px] border border-[#e0dbd0] shadow-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#fef2f2] rounded-2xl flex items-center justify-center text-red-500">
                <Shield size={24} />
              </div>
              <h3 className="font-bold text-[#111110]">Account Actions</h3>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  showPasswordChange ? "bg-[#8b7cf6] text-white" : "bg-[#f5f2eb] text-[#111110] hover:bg-[#ede9df]"
                )}
              >
                <div className="flex items-center gap-2">
                  <KeyRound size={14} />
                  Change Password
                </div>
                <ChevronRight size={14} className={cn("transition-transform", showPasswordChange && "rotate-90")} />
              </button>

              <AnimatePresence>
                {showPasswordChange && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handlePasswordChange}
                    className="overflow-hidden space-y-4 px-1"
                  >
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-wider mb-1.5">Current Password</label>
                        <div className="relative">
                          <input 
                            type={showPasswords.current ? "text" : "password"}
                            required
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#fcfaf7] border border-[#e0dbd0] text-sm focus:outline-none focus:border-[#8b7cf6] transition-all"
                            placeholder="••••••••"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888880] hover:text-[#111110]"
                          >
                            {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-wider mb-1.5">New Password</label>
                        <div className="relative">
                          <input 
                            type={showPasswords.new ? "text" : "password"}
                            required
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#fcfaf7] border border-[#e0dbd0] text-sm focus:outline-none focus:border-[#8b7cf6] transition-all"
                            placeholder="••••••••"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888880] hover:text-[#111110]"
                          >
                            {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-wider mb-1.5">Confirm New Password</label>
                        <div className="relative">
                          <input 
                            type={showPasswords.confirm ? "text" : "password"}
                            required
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#fcfaf7] border border-[#e0dbd0] text-sm focus:outline-none focus:border-[#8b7cf6] transition-all"
                            placeholder="••••••••"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888880] hover:text-[#111110]"
                          >
                            {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="w-full py-3 bg-[#111110] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#222220] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {changingPassword ? <Loader2 size={14} className="animate-spin" /> : 'Update Password'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#f5f2eb] text-sm font-bold hover:bg-[#ede9df] transition-all">
                Export Data (JSON)
                <ExternalLink size={14} />
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#f5f2eb] text-sm font-bold hover:bg-[#ede9df] transition-all"
              >
                Logout
                <LogOut size={14} />
              </button>
              <button 
                onClick={deleteAccount}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-all"
              >
                Delete Account
                <Trash2 size={14} />
              </button>
            </div>
          </motion.section>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#8b7cf6] p-8 rounded-[28px] text-white shadow-xl shadow-[#8b7cf6]/20"
          >
            <h3 className="font-['Syne'] text-xl font-bold mb-2">Need help?</h3>
            <p className="text-sm opacity-80 mb-6">Our support team is always here for you.</p>
            <a 
              href="mailto:hello@neurohx.com"
              className="inline-block px-6 py-3 bg-white text-[#8b7cf6] rounded-full text-sm font-bold hover:bg-[#f0eeff] transition-all"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


