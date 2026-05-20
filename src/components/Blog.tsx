import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  Star, 
  Clock, 
  MessageCircle, 
  Share2, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Instagram, 
  Facebook, 
  Twitter, 
  MessageSquare,
  Bookmark,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  role: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  initialRating: number;
  userRating?: number;
  ratesCount: number;
  commentsCount: number;
  sharesCount: number;
}

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "neurochemistry-deep-work",
    title: "The Neurochemistry of Deep Work: Dopamine, Acetylcholine, and the Flow Triad",
    author: "Dr. Evelyn Vance",
    role: "Cognitive Neuroscientist",
    category: "Cognitive Neuroscience",
    readTime: "6 min read",
    summary: "Discover the precise chemical interactions in the prefrontal cortex that support sustained focus. Learn how to invoke acetylcholine and dopamine strategically.",
    content: `Deep work is not merely a philosophical approach to productivity—it is a distinct, measurable neurochemical state. When we fully engage with a single, high-cognitive-demand task, three primary neurotransmitters are released in sequence to lock our attention: acetylcholine, norepinephrine, and dopamine.

First, acetylcholine acts as a spotlight. It is secreted from the basal forebrain and acts on nicotinic receptors, physically sharpening the neural pathways responsible for the task at hand. It filters out sensory distractions by strengthening the 'signal' and dimming the 'noise'.

Second, norepinephrine is released to create alertness. In low doses, it keeps us active without triggering the amygdala's fight-or-flight stress responses.

Third, dopamine arrives to reward the brain. When we make progress, even in micro-steps, the nucleus accumbens triggers dopamine pulses, generating pleasure and reinforcing the behavior. 

To optimize this flow triad:
1. Limit cognitive switches: Every notification switch flushes out acetylcholine, taking up to 20 minutes to re-synthesize.
2. Leverage morning blue-light exposure: This raises early cortisol and norepinephrine to standard peak baselines.
3. Batch micro-rewards: Break tasks into 20-minute subsets to maintain dopamine feedback loops.`,
    initialRating: 4.8,
    ratesCount: 54,
    commentsCount: 18,
    sharesCount: 31
  },
  {
    id: "pacing-protocols-neuroplasticity",
    title: "Pacing Protocols for Neuroplastic Recovery: Avoiding Burnout",
    author: "Marcus Thorne",
    role: "Clinical Psychologist",
    category: "Bio-tuning",
    readTime: "5 min read",
    summary: "How structured physiological pacing prevents the onset of emotional fatigue and repairs chronic attention-deficit patterns.",
    content: `The modern workplace operates on constant connectivity, violating our brain's natural ultradian cycles. Ultradian rhythms are biological cycles of roughly 90 to 120 minutes, during which our brain transitions from peak alertness down to brief, active restoration phases.

When we ignore these down-cycles and power through with nervous system stimulants (such as caffeine or high-glycemic sugar), we over-stimulate the sympathetic branch of our autonomic nervous system. Over time, this chronic stress response pattern down-regulates cortisol receptors, giving rise to clinical burnout and brain fog.

To restore this balance, we introduce Pacing Recovery Protocols:
- The 50/10 Focus Loop: For every 50 minutes of deep creative focus, perform exactly 10 minutes of complete cognitive rest. Complete cognitive rest means avoiding phone scrolling, reading, or processing data. Instead, practice simple diaphragmatic breathing, walk, or look out a window to let the default mode network (DMN) reset.
- Grounding: Integrating somatic breaks stabilizes heart rate variability (HRV) and returns blood flow from the limbic center back to the cognitive prefrontal zones.
- Structured Non-Sleep Deep Rest (NSDR): A 10-minute relaxation pause decreases baseline anxiety by up to 30%, recharging the cellular ATP levels needed for the next work interval.`,
    initialRating: 4.9,
    ratesCount: 72,
    commentsCount: 22,
    sharesCount: 45
  },
  {
    id: "demystifying-flow-state",
    title: "Inside the Flow State: Transient Hypofrontality & Peak Cognition",
    author: "Dr. Sarah Sterling",
    role: "Neurobiology Lead",
    category: "Mental Wellness",
    readTime: "4 min read",
    summary: "Learn what transient hypofrontality is and why temporarily turning off parts of your brain is the key to deep mental flexibility.",
    content: `The term 'Flow State' is often described in poetic details, but its physical architecture is profoundly mechanical. In mainstream thinking, we assume peak performance requires our brain to work harder, activating more brain regions. In reality, flow requires the exact opposite: transient hypofrontality.

'Transient' means temporary. 'Hypo' means under-active. 'Frontality' refers to the prefrontal cortex (PFC). During deep flow, parts of the prefrontal cortex—specifically the dorsolateral prefrontal cortex, which houses our inner critic, self-monitoring systems, and explicit sense of self—actually close down.

This transient shutdown produces three key features of peak focus:
1. Distortion of Time: Because the prefrontal cortex represents our clock awareness, its down-regulation makes hours pass like minutes.
2. Absence of Self-Doubt: The neural voice that evaluates our mistakes falls silent. Action and awareness merge seamlessly.
3. Mass-Processing: Information flows directly and intuitively, bypassing conscious calculations.

To spark hyper-focused states, you must balance threat versus comfort. The optimal threshold is when a task is roughly 4% beyond your current cognitive capability—just difficult enough to demand attention, but not stressful enough to prompt anxiety.`,
    initialRating: 4.7,
    ratesCount: 41,
    commentsCount: 12,
    sharesCount: 20
  }
];

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeBlogId, setActiveBlogId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = ["All", "Cognitive Neuroscience", "Bio-tuning", "Mental Wellness"];

  // Handle rating modification
  const handleRate = (blogId: string, rating: number) => {
    setBlogs(prev => prev.map(blog => {
      if (blog.id === blogId) {
        // Recalculate average rating
        const hadRated = blog.userRating !== undefined;
        const newRatesCount = hadRated ? blog.ratesCount : blog.ratesCount + 1;
        const totalPoints = (blog.ratesCount * blog.initialRating) + rating - (hadRated ? (blog.userRating || 0) : 0);
        const newAvg = parseFloat((totalPoints / newRatesCount).toFixed(1));
        
        return {
          ...blog,
          userRating: rating,
          ratesCount: newRatesCount,
          initialRating: newAvg
        };
      }
      return blog;
    }));
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeBlog = blogs.find(b => b.id === activeBlogId);

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12">
      {/* Header section */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
          <BookOpen size={12} />
          Clinical Literature
        </div>
        <h1 className="font-['Syne'] text-4xl lg:text-5xl font-bold text-[#1a2b27] leading-tight">
          Modern <span className="italic text-primary">Blog & Research</span>
        </h1>
        <p className="text-[#4a5a57] max-w-xl text-sm leading-relaxed">
          Peer-reviewed advice, cognitive exercises, and research updates curated by behavioral clinicians to power your performance metrics.
        </p>
      </header>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-[#1a2b27]/5">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                selectedCategory === cat
                  ? "bg-[#1a2b27] text-white"
                  : "bg-gray-100 text-[#4a5a57] hover:bg-gray-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:border-primary/40 focus:bg-white transition-all font-medium"
          />
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5a57]/40" />
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => {
          const isFaved = favorites.includes(blog.id);
          return (
            <motion.div
              key={blog.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-[#e0dbd0] overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:shadow-[#1a2b27]/5 transition-all duration-300"
            >
              <div className="p-6 pb-4 space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[9px] font-extrabold uppercase tracking-wider">
                    {blog.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleFavorite(blog.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Bookmark Article"
                    >
                      <Bookmark size={14} fill={isFaved ? "currentColor" : "none"} className={isFaved ? "text-red-500" : ""} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-['Syne'] text-base font-bold text-[#1a2b27] group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-[#4a5a57] text-xs leading-relaxed line-clamp-3">
                    {blog.summary}
                  </p>
                </div>

                {/* Star rating preview & interactive rate system */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 bg-[#fcfaf7] border border-[#f5f2eb] px-3 py-2 rounded-xl">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(blog.id, star)}
                          className="transition-transform active:scale-90"
                        >
                          <Star 
                            size={12} 
                            className={cn(
                              "transition-all",
                              star <= (blog.userRating || Math.round(blog.initialRating))
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-200"
                            )} 
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-[#161615]">
                      {blog.initialRating}
                    </span>
                    <span className="text-[9px] text-[#4a5a57]/40 font-bold uppercase ml-auto">
                      {blog.ratesCount} reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer controls */}
              <div className="px-6 py-4 bg-[#fcfaf7] border-t border-[#f5f2eb] flex items-center justify-between">
                <div className="flex items-center gap-4 text-[#4a5a57]/60 text-[10px] font-bold">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {blog.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    {blog.commentsCount}
                  </span>
                </div>

                <button
                  onClick={() => setActiveBlogId(blog.id)}
                  className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[#1a2b27] hover:text-primary transition-colors"
                >
                  Read
                  <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBlogs.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[40px] border border-[#e0dbd0]/50 space-y-4">
          <BookOpen size={48} className="mx-auto text-gray-300" />
          <h4 className="font-['Syne'] text-base font-bold text-gray-900">No Articles Found</h4>
          <p className="text-xs text-[#888880]">Try searching with other terms or clearing the selection filters.</p>
        </div>
      )}

      {/* Dynamic Article Detail Modal */}
      <AnimatePresence>
        {activeBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1a2b27]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setActiveBlogId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-[48px] border border-[#1a2b27]/15 shadow-2xl p-8 md:p-12 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative space-y-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header inside modal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[9px] font-extrabold uppercase tracking-wider">
                    {activeBlog.category}
                  </span>
                  <span className="text-[10px] text-[#4a5a57]/40 font-bold uppercase ml-auto">
                    {activeBlog.readTime}
                  </span>
                </div>
                
                <h2 className="font-['Syne'] text-2xl md:text-3xl font-bold text-[#1a2b27] leading-tight">
                  {activeBlog.title}
                </h2>

                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                    {activeBlog.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-[#1a2b27]">{activeBlog.author}</h5>
                    <p className="text-[10px] text-[#4a5a57]/60 font-medium">{activeBlog.role}</p>
                  </div>
                </div>
              </div>

              {/* Main Content inside modal */}
              <div className="text-[#3c4a47] text-sm leading-relaxed whitespace-pre-wrap space-y-4 font-sans font-medium">
                {activeBlog.content}
              </div>

              {/* Inside detail modal interactive rate system */}
              <div className="p-6 bg-[#fcfaf7] rounded-[32px] border border-[#f5f2eb] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h6 className="text-[10px] font-black uppercase tracking-widest text-[#1a2b27]">Did this spark focus?</h6>
                  <p className="text-[10px] text-[#4a5a57]/60">Your rating refines the neuro-matching recommendations.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(activeBlog.id, star)}
                      className="transition-transform active:scale-95"
                    >
                      <Star 
                        size={18} 
                        className={cn(
                          "transition-colors",
                          star <= (activeBlog.userRating || Math.round(activeBlog.initialRating))
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-200"
                        )} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-gray-900 ml-1">
                    {activeBlog.initialRating}
                  </span>
                </div>
              </div>

              {/* Modal controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => alert("Deep Link copied directly to system clipboard.")}
                  className="flex items-center gap-2 text-[10px] font-bold text-[#4a5a57]/65 hover:text-[#1a2b27] uppercase tracking-widest transition-colors"
                >
                  <Share2 size={12} />
                  Share Insight
                </button>
                <button
                  onClick={() => setActiveBlogId(null)}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social presence & direct links under the blog section */}
      <section className="bg-[#111110] rounded-[48px] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BookOpen size={180} />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[9px] font-bold uppercase tracking-[0.2em] border border-white/5">
              <Award size={10} />
              Neurohx Core Collective
            </div>
            
            <h2 className="font-['Syne'] text-2xl md:text-3xl font-black uppercase tracking-tight">
              Clinical Communities & Social Handles
            </h2>
            
            <p className="text-white/60 text-xs md:text-sm font-medium leading-relaxed max-w-md">
              Follow our daily mental pacing exercises, cognitive journals, and community discussions directly on your favorite platforms.
            </p>
          </div>

          {/* Social icons row directly under the blog cards */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            <a 
              href="https://www.instagram.com/neurohx_?igsh=MXh4ZjdveWwwcGs2eg==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E4405F]/30 hover:scale-102 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-[#E4405F]/15 flex items-center justify-center text-white transition-colors">
                <Instagram size={18} className="group-hover:text-[#E4405F] transition-colors" />
              </div>
              <div>
                <h5 className="text-[11px] font-black uppercase tracking-wider block">Instagram</h5>
                <span className="text-[9px] text-white/40 block mt-0.5">@neurohx_</span>
              </div>
            </a>

            <a 
              href="https://www.facebook.com/share/1Cdf4hjnCW/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#1877F2]/30 hover:scale-102 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-[#1877F2]/15 flex items-center justify-center text-white transition-colors">
                <Facebook size={18} className="group-hover:text-[#1877F2] transition-colors" />
              </div>
              <div>
                <h5 className="text-[11px] font-black uppercase tracking-wider block">Facebook</h5>
                <span className="text-[9px] text-white/40 block mt-0.5">Neurohx Share</span>
              </div>
            </a>

            <a 
              href="https://www.threads.net/@neurohx_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:scale-102 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <MessageSquare size={18} className="group-hover:text-amber-300 transition-colors" />
              </div>
              <div>
                <h5 className="text-[11px] font-black uppercase tracking-wider block">Threads</h5>
                <span className="text-[9px] text-white/40 block mt-0.5">@neurohx_</span>
              </div>
            </a>

            <a 
              href="https://x.com/hineurohx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-300/30 hover:scale-102 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-cyan-400/15 flex items-center justify-center text-white transition-colors">
                <Twitter size={18} className="group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <h5 className="text-[11px] font-black uppercase tracking-wider block">Twitter</h5>
                <span className="text-[9px] text-white/40 block mt-0.5">@hineurohx</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
