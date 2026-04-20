import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  Edit3, 
  FileDown, 
  ChevronRight,
  Clock,
  Tag,
  Lock,
  MoreHorizontal,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

export default function Journal() {
  const { showToast } = useToast();
  const { isPlanAtLeast, profile } = useUser();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const canSave = isPlanAtLeast('starter');
  const canExport = isPlanAtLeast('pro');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'journals'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEntries(docs);
        if (docs.length > 0 && !selectedEntry) {
          setSelectedEntry(docs[0]);
        }
      } catch (err) {
        console.error('Error in journal snapshot:', err);
      }
    }, (err) => console.error('Journal snapshot error:', err));

    return () => unsubscribe();
  }, []);

  const handleNewEntry = () => {
    if (!canSave) {
      showToast('Upgrade to Starter to save journal entries.', 'info');
      navigate('/dashboard/settings');
      return;
    }
    setSelectedEntry(null);
    setIsEditing(true);
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !auth.currentUser) return;
    setLoading(true);

    try {
      if (selectedEntry?.id) {
        const path = `users/${auth.currentUser.uid}/journals/${selectedEntry.id}`;
        await updateDoc(doc(db, path), {
          title,
          content,
          updatedAt: serverTimestamp()
        }).catch(e => handleFirestoreError(e, 'update', path));
        showToast('Entry updated!', 'success');
      } else {
        const path = `users/${auth.currentUser.uid}/journals`;
        const newDoc = await addDoc(collection(db, path), {
          userId: auth.currentUser.uid,
          title,
          content,
          date: new Date().toISOString().split('T')[0],
          createdAt: serverTimestamp()
        }).catch(e => handleFirestoreError(e, 'create', path));
        setSelectedEntry({ id: newDoc.id, title, content, date: new Date().toISOString().split('T')[0] });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save entry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    if (!window.confirm('Are you sure you want to delete this reflection? This action cannot be undone.')) return;
    
    try {
      const path = `users/${auth.currentUser.uid}/journals/${id}`;
      await deleteDoc(doc(db, path)).catch(e => handleFirestoreError(e, 'delete', path));
      if (selectedEntry?.id === id) {
        const remainingEntries = entries.filter(e => e.id !== id);
        setSelectedEntry(remainingEntries.length > 0 ? remainingEntries[0] : null);
      }
      showToast('Reflection deleted successfully.', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete reflection.', 'error');
    }
  };

  const handleExportPDF = () => {
    if (!selectedEntry) return;
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(17, 17, 16); // #111110
      doc.text(selectedEntry.title, margin, 30);

      // Date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(136, 136, 128); // #888880
      const dateStr = new Date(selectedEntry.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
      doc.text(dateStr, margin, 40);

      // Divider
      doc.setDrawColor(224, 219, 208); // #e0dbd0
      doc.line(margin, 45, pageWidth - margin, 45);

      // Content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(17, 17, 16);
      
      const splitContent = doc.splitTextToSize(selectedEntry.content, contentWidth);
      doc.text(splitContent, margin, 60);

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(136, 136, 128);
        doc.text(`Generated by Neurohx AI - Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save(`${selectedEntry.title.replace(/\s+/g, '_')}_${selectedEntry.date}.pdf`);
      showToast('PDF exported successfully!', 'success');
    } catch (error) {
      console.error('PDF Export error:', error);
      showToast('Failed to export PDF.', 'error');
    }
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-12rem)] gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-[#8b7cf6] uppercase tracking-[0.2em]">Private Reflections</p>
          <h1 className="font-['Syne'] text-4xl font-bold text-[#111110]">Your Journal.</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888880]" size={18} />
          <input 
            type="text"
            placeholder="Search reflections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#e0dbd0] rounded-2xl text-sm focus:ring-2 focus:ring-[#8b7cf6] outline-none transition-all shadow-sm"
          />
        </div>

        <button 
          onClick={handleNewEntry}
          className="w-full bg-[#111110] text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#222220] transition-all shadow-lg"
        >
          {!canSave && <Lock size={16} />}
          <Plus size={18} />
          New Entry
        </button>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-bold text-[#111110] uppercase tracking-widest">Past Entries</h3>
            <span className="text-[10px] font-bold text-[#888880] uppercase">{entries.length} Total</span>
          </div>
          
          {filteredEntries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => {
                setSelectedEntry(entry);
                setIsEditing(false);
              }}
              className={cn(
                "w-full text-left p-6 rounded-[32px] border transition-all duration-300 relative group",
                selectedEntry?.id === entry.id 
                  ? "bg-white border-[#8b7cf6] shadow-xl shadow-[#8b7cf6]/10 scale-[1.02]" 
                  : "bg-white/50 border-[#e0dbd0] hover:border-[#8b7cf6] hover:bg-white"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="w-6 h-6 bg-[#f0eeff] rounded-lg flex items-center justify-center text-[#8b7cf6] opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={14} />
                </div>
              </div>
              <h4 className="font-bold text-[#111110] mb-2 line-clamp-1">{entry.title}</h4>
              <p className="text-xs text-[#888880] line-clamp-2 leading-relaxed">{entry.content}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-[48px] border border-[#e0dbd0] shadow-sm overflow-hidden flex flex-col">
        {isEditing || (!selectedEntry && entries.length === 0) ? (
          <div className="flex-1 flex flex-col p-8 lg:p-12 space-y-8">
            <input 
              type="text"
              placeholder="Title of your reflection..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-['Syne'] text-3xl lg:text-4xl font-bold text-[#111110] border-none outline-none placeholder:text-[#e0dbd0]"
            />
            <textarea 
              placeholder="Start writing your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 text-base lg:text-lg text-[#111110] leading-relaxed border-none outline-none resize-none placeholder:text-[#e0dbd0]"
            />
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-8 py-3 rounded-full text-sm font-bold text-[#888880] hover:bg-[#f5f2eb] transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading || !title.trim() || !content.trim()}
                className="px-10 py-3 bg-[#8b7cf6] text-white rounded-full text-sm font-bold hover:bg-[#7c6df0] transition-all shadow-lg shadow-[#8b7cf6]/20 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Reflection'}
              </button>
            </div>
          </div>
        ) : selectedEntry ? (
          <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-12">
              <div className="space-y-4">
                <h2 className="font-['Syne'] text-4xl lg:text-5xl font-bold text-[#111110] leading-tight max-w-2xl">
                  {selectedEntry.title}
                </h2>
                <div className="flex items-center gap-4 text-[#888880]">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar size={14} />
                    {new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="w-1 h-1 bg-[#e0dbd0] rounded-full" />
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={14} />
                    09:42 AM
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setTitle(selectedEntry.title);
                    setContent(selectedEntry.content);
                    setIsEditing(true);
                  }}
                  className="p-3 bg-[#f5f2eb] text-[#111110] rounded-2xl hover:bg-[#ede9df] transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(selectedEntry.id)}
                  className="p-3 bg-[#fef2f2] text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-[#f5f2eb] text-[#111110] rounded-2xl text-xs font-bold hover:bg-[#ede9df] transition-all relative"
                >
                  {!canExport && <Lock size={10} className="absolute -top-1 -right-1 text-[#8b7cf6]" />}
                  <FileDown size={16} />
                  Export as PDF
                </button>
              </div>
            </div>

            <div className="flex-1 text-base lg:text-lg text-[#111110] leading-[1.8] whitespace-pre-wrap mb-12">
              {selectedEntry.content}
            </div>

            <div className="pt-8 border-t border-[#f5f2eb] flex flex-wrap gap-3">
              {['#CLARITY', '#MEDITATION', '#GRATITUDE'].map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-[#f5f2eb] text-[#888880] text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="w-24 h-24 bg-[#f5f2eb] rounded-[40px] flex items-center justify-center text-[#888880]">
              <BookOpen size={48} />
            </div>
            <div className="max-w-xs">
              <h3 className="font-['Syne'] text-2xl font-bold text-[#111110] mb-2">No entry selected</h3>
              <p className="text-[#888880] text-sm leading-relaxed">
                Select an entry from the list or create a new one to start reflecting.
              </p>
            </div>
            <button 
              onClick={handleNewEntry}
              className="px-8 py-3 bg-[#8b7cf6] text-white rounded-full text-sm font-bold hover:bg-[#7c6df0] transition-all shadow-lg shadow-[#8b7cf6]/20"
            >
              Create New Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
