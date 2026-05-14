import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Send, User, Quote, CheckCircle2, MessageSquare } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';

interface Review {
  id: string;
  userId: string;
  displayName: string;
  rating: number;
  content: string;
  createdAt: any;
}

export default function DashboardReviews() {
  const { profile } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: auth.currentUser.uid,
        displayName: profile?.displayName || 'Anonymous User',
        rating: newRating,
        content: newContent.trim(),
        createdAt: serverTimestamp()
      });
      setNewContent('');
      setNewRating(5);
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] border border-[#e0dbd0] shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-[#f5f2eb] flex items-center justify-between bg-[#fcfaf7]">
        <div>
          <h3 className="font-bold text-[#111110] flex items-center gap-2">
            <Star size={18} className="text-yellow-500 fill-yellow-500" />
            Community Voice
          </h3>
          <p className="text-[10px] text-[#888880] uppercase tracking-widest font-bold mt-1">Shared Experiences</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
            showForm ? "bg-[#111110] text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          {showForm ? 'Cancel' : 'Leave Review'}
        </button>
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[500px] scrollbar-hide">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em]">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={24} 
                        className={cn(
                          "transition-colors",
                          star <= newRating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"
                        )} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em]">Your Feedback</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="How has Neurohx helped your clinical journey?"
                  className="w-full h-32 p-4 rounded-2xl bg-[#fcfaf7] border border-[#e0dbd0] focus:border-primary outline-none text-sm resize-none transition-all"
                  maxLength={500}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newContent.trim()}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </motion.form>
          ) : reviews.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold mb-4"
                >
                  <CheckCircle2 size={16} />
                  Review submitted successfully!
                </motion.div>
              )}
              
              {reviews.map((review) => (
                <div key={review.id} className="p-6 rounded-3xl bg-[#fcfaf7] border border-[#f0eeff] space-y-4 relative group hover:border-primary/20 transition-all">
                  <div className="absolute top-6 right-6 opacity-5">
                    <Quote size={40} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#f0eeff] flex items-center justify-center text-[#888880]">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111110]">{review.displayName}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              className={cn(i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200")} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-medium text-[#888880] uppercase tracking-tighter">
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-[#555550] leading-relaxed italic pr-4">
                    "{review.content}"
                  </p>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-50">
              <MessageSquare size={48} className="text-[#888880]" />
              <p className="text-sm font-medium italic">Be the first to share your journey.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-[#fcfaf7] border-t border-[#f5f2eb] text-center">
        <p className="text-[9px] font-bold text-[#888880] uppercase tracking-[0.2em]">
          Restoring clinical trust, one frequency at a time.
        </p>
      </div>
    </div>
  );
}
