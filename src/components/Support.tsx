import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Mail,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';
import { useToast } from './Toast';
import { cn } from '../lib/utils';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: any;
}

export default function Support() {
  const { profile } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [formData, setFormData] = useState({
    category: 'General Inquiry',
    subject: '',
    message: '',
    priority: 'Medium'
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'support_tickets'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const ticketsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ticket[];
        setTickets(ticketsData);
      } catch (err) {
        console.error('Error in support tickets snapshot:', err);
      }
    }, (err) => console.error('Support snapshot error:', err));

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!formData.subject.trim() || !formData.message.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const path = 'support_tickets';
      await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        userName: profile?.displayName || 'User',
        userEmail: profile?.email || auth.currentUser.email,
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        status: 'Open',
        createdAt: Timestamp.now()
      }).catch(e => handleFirestoreError(e, 'create', path));

      showToast('Support ticket submitted successfully!', 'success');
      setFormData({
        category: 'General Inquiry',
        subject: '',
        message: '',
        priority: 'Medium'
      });
    } catch (error) {
      console.error('Support submission error:', error);
      showToast('Failed to submit ticket. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-600';
      case 'In Progress': return 'bg-amber-100 text-amber-600';
      case 'Resolved': return 'bg-green-100 text-green-600';
      case 'Closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-600';
      case 'Medium': return 'bg-orange-100 text-orange-600';
      case 'Low': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-['Syne'] text-3xl font-bold text-text-primary">Support Center</h1>
        <p className="text-text-secondary">We're here to help you on your journey</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2 space-y-8">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[28px] border border-accent shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary">
                <LifeBuoy size={24} />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">Submit a Ticket</h3>
                <p className="text-xs text-text-secondary">Our team typically responds within 24 hours</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent text-text-primary font-medium focus:border-primary outline-none transition-all"
                  >
                    <option>Technical Issue</option>
                    <option>Billing</option>
                    <option>Feedback</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent text-text-primary font-medium focus:border-primary outline-none transition-all"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Subject</label>
                <input 
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Briefly describe the issue"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent text-text-primary font-medium focus:border-primary outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more about how we can help..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent text-text-primary font-medium focus:border-primary outline-none transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
                <Send size={18} />
              </button>
            </form>
          </motion.section>

          {/* Previous Tickets */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-text-primary px-2">Your Tickets</h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tickets.length === 0 ? (
                  <div className="bg-white p-8 rounded-[28px] border border-accent text-center">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-text-secondary mx-auto mb-4">
                      <Clock size={24} />
                    </div>
                    <p className="text-text-secondary font-medium">No support tickets found.</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-6 rounded-[24px] border border-accent shadow-sm hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                              getStatusColor(ticket.status)
                            )}>
                              {ticket.status}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                              getPriorityColor(ticket.priority)
                            )}>
                              <div className="w-1 h-1 rounded-full bg-current" />
                              {ticket.priority}
                            </span>
                            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                              {ticket.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                            {ticket.subject}
                          </h4>
                          <p className="text-sm text-text-secondary line-clamp-1 mt-1">
                            {ticket.message}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                            {ticket.createdAt?.toDate().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary text-white p-8 rounded-[28px] shadow-xl shadow-primary/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <Mail className="mb-4 opacity-80" size={32} />
            <h3 className="text-xl font-bold mb-2">Direct Email</h3>
            <p className="text-sm text-white/80 mb-6">
              Prefer traditional email? Reach out to our support team directly.
            </p>
            <a 
              href="mailto:supportneurohx@gmail.com"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary transition-all"
            >
              Email Us
              <ExternalLink size={14} />
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[28px] border border-accent shadow-sm"
          >
            <h3 className="font-bold text-text-primary mb-4">Common Questions</h3>
            <div className="space-y-4">
              {[
                "How do I upgrade my plan?",
                "Is my data private?",
                "Can I cancel anytime?",
                "How does AI coaching work?"
              ].map((q, i) => (
                <button 
                  key={i}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 text-left group transition-all"
                >
                  <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">{q}</span>
                  <ChevronRight size={16} className="text-text-secondary group-hover:text-primary" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
