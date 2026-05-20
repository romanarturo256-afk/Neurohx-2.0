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
import { useToast } from './Toast';

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
    id: "neural-correlates-emotional-regulation",
    title: "Neural Correlates of Emotional Regulation Difficulties: Prefrontal-Amygdala Dysconnectivity",
    author: "Dr. Evelyn Vance",
    role: "Cognitive Neuroscientist",
    category: "Cognitive Neuroscience",
    readTime: "7 min read",
    summary: "An in-depth look at how top-down executive communication between the prefrontal cortex and the amygdala breaks down, leading to emotional difficulties.",
    content: `Emotional regulation is governed by a complex neural circuit characterized by a top-down control mechanism from the prefrontal cortex (PFC) to subcortical emotional centers, primarily the amygdala. In individuals experiencing difficulties with emotional regulation, neuroimaging studies consistently reveal a significant disruption or dysconnectivity in these prefrontal-amygdala pathway interactions.

Normally, when a distressing stimulus is perceived, the amygdala fires rapidly, initiating a somatic threat response. In a well-regulated brain, the ventromedial prefrontal cortex (vmPFC) and the anterior cingulate cortex (ACC) assess the context, process the stimulus, and send inhibitory signals via GABAergic pathways to the amygdala, reducing its hyper-intensity and stabilizing emotion.

However, during times of prolonged stress or affective instability, the functional connectivity between the dLPFC, vmPFC, and the amygdala is starkly diminished. This results in "insufficient top-down inhibition," meaning the prefrontal cortex cannot effectively dampen amygdala hyperactivity. Consequently, minor triggers result in exaggerated emotional responses, prolonged panic or anger waves, and difficulty returning to autonomic baseline homeostasis.

Understanding this dysconnectivity shifts the paradigm of mental wellness from emotional weakness to physical pathway optimization. Techniques like neurofeedback, cognitive appraisal, and targeted mindfulness work to specifically re-establish and strengthen these structural connections over time.`,
    initialRating: 4.9,
    ratesCount: 88,
    commentsCount: 24,
    sharesCount: 56
  },
  {
    id: "executive-function-deficits-mood-disorders",
    title: "Executive-Function Deficits in Mood Disorders: Cognitive Flexibility and the Frontoparietal Network",
    author: "Dr. Julian Mercer",
    role: "Neuroclinical Specialist",
    category: "Cognitive Neuroscience",
    readTime: "8 min read",
    summary: "Understanding how depression and bipolar conditions physically disrupt the brain's central executive network, impairing decision-making, focus, and cognitive control.",
    content: `Executive functions—including working memory, cognitive flexibility, and inhibitory control—are often severely compromised during clinical mood episodes. Rather than being mere side effects of low or hyperactive mood, these cognitive deficits correspond to structural and functional alterations in the frontoparietal control network (FPN) and the dorsolateral prefrontal cortex (dlPFC).

In mood disorders, particularly major depressive disorder (MDD), neuroimaging demonstrates reduced grey matter volume and hypoactivity in the dlPFC. This neural region is responsible for goal-directed behavior, planning, and holding information in working memory. When its activity drops, individuals experience profound difficulty prioritizing tasks, making decisions (often leading to deciding paralysis), and ignoring irrelevant negative feedback.

Furthermore, cognitive flexibility—the ability to adapt thoughts and behaviors to changing environments—is impeded. An individual may find themselves trapped in rigid cognitive structures, unable to shift perspective or create positive problem-solving alternatives.

These deficits highlight that treating mood disorders requires therapeutic interventions that target both emotion and cognition. Exercises that challenge working memory, structured cognitive-behavioral pacing protocols, and somatic stabilizing techniques assist in restoring the frontoparietal network to normal efficiency.`,
    initialRating: 4.8,
    ratesCount: 65,
    commentsCount: 19,
    sharesCount: 42
  },
  {
    id: "neuroinflammation-biomarker-depression",
    title: "Neuroinflammation as a Biomarker for Depression: The Cytokine Hypothesis of Affective Disorders",
    author: "Dr. Sarah Sterling",
    role: "Neurobiology Lead",
    category: "Cognitive Neuroscience",
    readTime: "7 min read",
    summary: "Examining the physical connection between systemic physical inflammation, microglial activation in the brain, and the depletion of core mood precursors.",
    content: `Historically, depression was viewed purely through the lens of monoamine neurotransmitter depletion—namely serotonin, norepinephrine, and dopamine. However, modern neurobiology is uncovering a far more systemic culprit: neuroinflammation.

Under conditions of chronic psychological stress, systemic physical inflammation, or gut dysbiosis, the body releases elevated levels of pro-inflammatory cytokines such as interleukin-6 (IL-6), tumor necrosis factor-alpha (TNF-α), and C-reactive protein (CRP). These cytokines can cross the blood-brain barrier, triggering the activation of microglia—the brain's resident immune cells.

Once activated, microglia transition from an optimistic, neuroprotective state to a destructive, inflammatory state. They release toxic reactive oxygen species and inflammatory mediators that disrupt synaptic plasticity. Crucially, neuroinflammation activates the kynurenine pathway, which diverts the amino acid tryptophan away from producing serotonin, converting it instead into neurotoxic quinolinic acid. This "tryptophan steal" directly starves the brain of serotonin and damages NMDA receptors, manifesting as the classic symptoms of depression: fatigue, anhedonia, and cognitive slowing.

Identifying neuroinflammation as a critical biomarker transforms how we treat depression. Incorporating anti-inflammatory dietary adjustments, high-quality omega-3 fatty acids, targeted sleep strategies, and somatic vagus nerve stimulation can directly calm microglia, addressing depression from its biological roots.`,
    initialRating: 4.9,
    ratesCount: 94,
    commentsCount: 31,
    sharesCount: 68
  },
  {
    id: "cognitive-load-anxiety-maintenance",
    title: "Cognitive Load Theory and its Crucial Role in Anxiety Maintenance",
    author: "Dr. Marcus Thorne",
    role: "Clinical Psychologist",
    category: "Mental Wellness",
    readTime: "6 min read",
    summary: "How chronic worry and hypervigilance exhaust working memory, leaving the brain in a state of perpetual cognitive overload.",
    content: `Anxiety is not just an emotional state; it is a high-cost cognitive activity. According to Cognitive Load Theory, our working memory has a strictly finite capacity. When an individual struggles with chronic generalized anxiety, a substantial portion of this limited memory capacity is hijacked by hypervigilance, threat screening, and uncontrollable worry.

Worry is a verbal-cognitive process that acts as a continuous background task on the brain's internal CPU. Because the anxious brain treats potential, far-off future threats as immediate realities, it allocates working memory resources to constantly calculate escape strategies and simulate worst-case scenarios. This constant loading reduces the processing power available for everyday functions: focused work, emotional regulation, and spatial memory.

This process forms a self-sustaining loop:
1. Threat appraisal prompts high cognitive loading via worry.
2. The working memory becomes overloaded, leading to forgetfulness, irritability, and diminished concentration.
3. This diminished performance increases self-doubt and feelings of incompetence, which generates more anxiety.

To break this cycle, individuals must offload their cognitive burden. Simple tactics like expressive journaling, external tracking tools, task chunking, and tactile groundings physically empty working memory, immediately reducing cognitive load and leaving room for healthy, adaptive processing.`,
    initialRating: 4.7,
    ratesCount: 58,
    commentsCount: 14,
    sharesCount: 29
  },
  {
    id: "default-mode-network-rumination",
    title: "The Role of the Default Mode Network in Rumination and Negative Self-Referential Thought",
    author: "Dr. Sarah Sterling",
    role: "Neurobiology Lead",
    category: "Cognitive Neuroscience",
    readTime: "6 min read",
    summary: "Unpacking the 'default' neural highway that takes over during idle states, and how hyperfunctional connectivity leads to repetitive negative cycles.",
    content: `When we are not engaged in an active, goal-directed task, our brain does not fall completely silent. Instead, a specific web of interconnected regions known as the Default Mode Network (DMN) becomes highly active. The DMN, encompassing the medial prefrontal cortex and the posterior cingulate cortex, is responsible for self-referential thought, autobiographical memory, and imagining the future.

In healthy individuals, the DMN allows for creative daydreaming, empathy, and processing past events. However, in individuals suffering from depression or anxiety, the DMN often becomes hyperactive and hyper-connected. This state is associated with severe, repetitive rumination—the uncontrollable cycling of negative thoughts about one's self, past choices, and personal failures.

When the DMN is locked in hyper-connectivity, the mind is driven into a loop of internal self-scrutiny. Crucially, the brain's Salience Network fails to toggle attention back to the Central Executive Network, making it incredibly difficult for the individual to "will" themselves out of a negative thought loop.

To quiet a hyperactive Default Mode Network, clinical neuroscientists recommend activities that force attention outward, into the present somatic moment. Focused-attention meditation, intentional breathwork, high-intensity exercise, or any tactile activity (such as cold exposure or hand-crafts) physically suppresses DMN activity, giving the brain an immediate vacation from the ego and breaking the loop of clinical rumination.`,
    initialRating: 4.9,
    ratesCount: 112,
    commentsCount: 45,
    sharesCount: 82
  },
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
  const { showToast } = useToast();
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

  const sortedAndFilteredBlogs = [...filteredBlogs].sort((a, b) => a.title.localeCompare(b.title));

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

      {/* Prominent Latest Blog Post Spotlight Panel */}
      {blogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] border border-[#e0dbd0] overflow-hidden p-8 lg:p-12 shadow-sm relative group hover:shadow-xl hover:shadow-[#1a2b27]/5 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-8 text-[#1a2b27]/5 select-none pointer-events-none hidden md:block">
            <Sparkles size={120} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest">
                  Latest Research
                </span>
                <span className="text-[10px] text-[#4a5a57]/60 font-bold uppercase tracking-widest">
                  • {blogs[0].category}
                </span>
              </div>
              
              <h2 className="font-['Syne'] text-2xl lg:text-4xl font-bold text-[#1a2b27] tracking-tight group-hover:text-primary transition-colors leading-tight">
                {blogs[0].title}
              </h2>
              
              <p className="text-[#4a5a57] text-sm leading-relaxed max-w-3xl font-medium">
                {blogs[0].summary}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 max-w-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                  {blogs[0].author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-[#1a2b27]">{blogs[0].author}</h5>
                  <p className="text-[10px] text-[#4a5a57]/60 font-medium">{blogs[0].role}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">
                  <Clock size={12} />
                  {blogs[0].readTime}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-center lg:items-end">
              <button
                onClick={() => setActiveBlogId(blogs[0].id)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4.5 bg-[#1a2b27] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 active:scale-95"
              >
                Read More
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
        {sortedAndFilteredBlogs.map((blog) => {
          const isFaved = favorites.includes(blog.id);
          return (
            <motion.div
              key={blog.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-[#e0dbd0] overflow-hidden flex flex-col justify-between group hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-2xl hover:shadow-[#1a2b27]/8 transition-all duration-300"
            >
              <div className="p-6 pb-4 space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[9px] font-extrabold uppercase tracking-wider">
                    {blog.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleFavorite(blog.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all duration-300 relative group/btn border",
                        isFaved 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-100/60 shadow-sm" 
                          : "text-gray-400 border-transparent hover:text-primary hover:bg-primary/5"
                      )}
                      title={isFaved ? "Saved to Bookmarks" : "Save Article"}
                    >
                      <Bookmark 
                        size={14} 
                        fill={isFaved ? "currentColor" : "none"} 
                        className={cn("transition-transform duration-300", isFaved ? "scale-110" : "group-hover/btn:scale-105")} 
                      />
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

                {/* Author Avatar & info block */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] shrink-0 border border-primary/5">
                    {blog.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left leading-tight min-w-0">
                    <h5 className="text-[11px] font-bold text-[#1a2b27] truncate">{blog.author}</h5>
                    <p className="text-[9px] text-[#4a5a57]/60 font-medium truncate">{blog.role}</p>
                  </div>
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
      {sortedAndFilteredBlogs.length === 0 && (
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
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href + "#" + activeBlog.id)
                        .then(() => showToast("Deep Link copied directly to system clipboard.", "success"))
                        .catch(() => showToast("Failed to copy link.", "error"));
                    } else {
                      showToast("Deep Link copied directly to system clipboard.", "success");
                    }
                  }}
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
