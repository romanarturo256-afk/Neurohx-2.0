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
  },
  {
    id: "genetic-predisposition-epigenetic-ptsd",
    title: "Genetic Predisposition and Epigenetic Shifts in PTSD",
    author: "Dr. Evelyn Vance",
    role: "Cognitive Neuroscientist",
    category: "Cognitive Neuroscience",
    readTime: "6 min read",
    summary: "An exploration of how genes interact with traumatizing experiences to induce lasting epigenetic modifications in hypothalamic-pituitary-adrenal functioning.",
    content: `Post-Traumatic Stress Disorder (PTSD) is not merely a psychological reaction to severe stress; it is a bio-behavioral condition shaped by complex gene-environment interactions. While exposure to trauma is a prerequisite for PTSD, only a subset of individuals exposed to trauma develop the clinical disorder. This divergence points directly to genetic predisposition and subsequent epigenetic modifications.

Pre-existing vulnerabilities are often linked to polymorphisms in genes regulating the hypothalamic-pituitary-adrenal (HPA) axis, such as FKBP5. The FKBP5 gene regulates glucocorticoid receptor sensitivity; individuals with specific variants of this gene are at a higher baseline threat response when exposed to childhood or adult adversity.

Epigenetic mechanisms—specifically DNA methylation and histone acetylation—act as the functional bridge between environmental trauma and gene expression. Traumatic stress triggers a rush of cortisol and inflammatory cytokines, which can chemically alter chromatin structure without altering the underlying DNA sequence. In PTSD patients, hypermethylation of the NR3C1 gene (which encodes the glucocorticoid receptor) has been frequently observed. This epigenetic shift leads to downstream downregulation of glucocorticoid receptors, manifesting as an impaired negative feedback loop in the HPA axis.

The result is a persistent state of hypersensitive response, where the adrenaline and cortisol systems are chronically deregulated. This understanding prompts novel therapeutic avenues targeting chromatin remodeling, chromatin modifications, and selective behavioral therapies designed to reverse these epigenetic markers.` ,
    initialRating: 4.9,
    ratesCount: 76,
    commentsCount: 22,
    sharesCount: 49
  },
  {
    id: "dopamine-system-adhd",
    title: "Dopamine System Differences in ADHD: Insights into Reward Processing and Executive Function",
    author: "Dr. Julian Mercer",
    role: "Neuroclinical Specialist",
    category: "Cognitive Neuroscience",
    readTime: "7 min read",
    summary: "Analyzing dopamine receptor density fluctuations and transport mechanism variations inside the prefrontal cortex and striatum of ADHD brains.",
    content: `Attention-Deficit/Hyperactivity Disorder (ADHD) is characterized by persistent patterns of inattention, hyperactivity, and impulsivity. At the core of these symptoms is a major difference in the brain's catecholaminergic signaling systems, specifically involving the neurotransmitter dopamine.

Dopamine is key to reward prediction, motivation, and signal-to-noise ratio regulation in the prefrontal cortex (PFC). In typical neurodevelopment, dopamine signals the reward value of tasks, allowing the PFC to sustain attention over long, delayed-gratification intervals. In the ADHD brain, however, there is a marked dysfunction in dopamine transport and receptor availability, particularly D2 and D4 receptor subtypes in the striatum and prefrontal regions.

One prominent mechanism is the hyper-efficiency or overabundance of dopamine transporter (DAT) proteins. These transporters act as cellular vacuum cleaners, removing dopamine from the synaptic cleft before it can bind to post-synaptic receptors. Consequently, the tonic (baseline) levels of dopamine are chronically low. To compensate, the brain relies on phasic (bouts of high-intensity) dopamine spikes. This explains the characteristic motivation style of ADHD: difficulty engaging with low-stimulation, long-term tasks alongside the capacity for deep hyperfocus on high-novelty, immediate-reward stimuli.

Furthermore, because the prefrontal cortex is starved of sufficient steady dopamine, executive functions—such as working memory, planning, and motor inhibition—are compromised. This reinforces the biological rationale for stimulant medications, which selectively block DAT activity, leaving more dopamine available in the synapse to stabilize executive networks and clear cognitive distractions.`,
    initialRating: 4.8,
    ratesCount: 82,
    commentsCount: 29,
    sharesCount: 63
  },
  {
    id: "working-memory-generalized-anxiety-disorder",
    title: "Working-Memory Impairment in Generalized Anxiety Disorder",
    author: "Dr. Marcus Thorne",
    role: "Clinical Psychologist",
    category: "Cognitive Neuroscience",
    readTime: "6 min read",
    summary: "Discover how continuous background threat calculations hijack working memory capacity, undermining cognitive efficiency in generalized anxiety.",
    content: `Generalized Anxiety Disorder (GAD) is characterized by excessive, uncontrollable worry about various aspects of daily life. Accumulating clinical evidence indicates that this constant worry is not just an affective symptom, but a state of chronic cognitive load that directly impairs working memory capacity.

Working memory is our mental workspace, structured to temporarily hold and manipulate information. It relies heavily on the dorsolateral prefrontal cortex (dlPFC) and the central executive network. In GAD, a massive portion of this workspace is occupied by a background process: hypervigilance and risk evaluation. Because the anxious brain is constantly running predictive hazard models, free cognitive resources are severely depleted.

Consequently, when an individual with GAD is asked to perform complex cognitive tasks, they show significant working memory deficits. They struggle to filter out irrelevant information (cognitive gating failure) and experience difficulty updating mental schemas. 

Neuroimaging reveals that during active threat-worry cycles, functional connectivity shifts away from task-positive networks and over-allocates resources to limbic-amygdala tracts. To rehabilitate working memory in GAD, therapeutic strategies must focus on reducing the active cognitive load. Techniques such as external writing, cognitive unloading, and structured mindfulness act directly by decoupling the prefrontal cortex from immediate threat evaluation and freeing up holding slots in working memory.`,
    initialRating: 4.8,
    ratesCount: 51,
    commentsCount: 16,
    sharesCount: 33
  },
  {
    id: "long-term-neural-effects-childhood-adversity",
    title: "Long-Term Neural Effects of Childhood Adversity on Hippocampal Volume",
    author: "Dr. Evelyn Vance",
    role: "Cognitive Neuroscientist",
    category: "Cognitive Neuroscience",
    readTime: "8 min read",
    summary: "How developmental trauma and persistent early cortisol spikes shape the morphology of the brain, affecting volume reduction in key limbic structures.",
    content: `Childhood adversity, ranging from chronic neglect to severe emotional or physical trauma, exerts a profound influence on the structural development of the brain. Because the childhood brain is highly plastic, chronic stress during critical developmental windows acts as a morphological architect, altering the trajectory of key neural systems.

One of the most heavily affected brain structures is the hippocampus, the critical center for learning, memory consolidation, and contextual regulation of emotion. The hippocampus contains a remarkably high density of glucocorticoid (cortisol) receptors, making it exceptionally sensitive to stress hormones. Under typical conditions, cortisol helps orchestrate survival. However, in the presence of childhood adversity, constant sympathetic arousal leads to excitotoxic levels of cortisol.

This neuro-chemical bombardment triggers several changes:
1. Downregulated expression of Brain-Derived Neurotrophic Factor (BDNF), a vital protein for neurogenesis and synaptic survival.
2. Atrophy of dendritic trees and shrinkage of existing hippocampal neurons.
3. Decreased neurogenesis in the dentate gyrus.

Over decades, this manifests as a statistically significant reduction in bilateral hippocampal volume. Individuals with compromised hippocampal volumes frequently display difficulty distinguishing safe cues from threat indicators, leading to generalized fear responses and increased vulnerability to adult depressive episodes. These findings highlight the critical importance of early pediatric intervention and neuro-developmental therapies aimed at restoring neurotrophic levels.`,
    initialRating: 4.9,
    ratesCount: 89,
    commentsCount: 34,
    sharesCount: 71
  },
  {
    id: "gut-brain-axis-depression-anxiety",
    title: "Gut-Brain Axis Influences on Depression and Anxiety: The Microbiome Connection",
    author: "Dr. Sarah Sterling",
    role: "Neurobiology Lead",
    category: "Bio-tuning",
    readTime: "7 min read",
    summary: "Investigating the bidirectional highway between the enteric nervous system and the brain, and how microbiome balance alters serotonin synthesis.",
    content: `The gut is increasingly recognized as our 'second brain,' containing over 100 million neurons in the enteric nervous system. The bidirectional communication between this complex digestive system and the central nervous system is known as the gut-brain axis. Emerging clinical research highlights that gut dysbiosis—an imbalance in the microbial community—plays a central role in the pathophysiology of depression and anxiety.

This communication occurs through three primary parallel channels:
1. Direct Neural Signaling: The vagus nerve serves as a direct highway, transmissioning signals of gut inflammation or metabolic microbial outputs straight to the brainstem.
2. Neurotransmitter Production: Over 90% of the body's serotonin is produced in the gut, facilitated by specific gut microbes that regulate the synthesis of its precursor, tryptophan.
3. Immunological Modulation: A healthy microbiome maintains intestinal barrier integrity. When the barrier is compromised ('leaky gut'), bacterial endotoxins pass into systemic circulation, triggering a widespread cytokine release that promotes neuroinflammation and microglial activation.

By targeting the gut microbiome through specific strains of probiotics, fiber-rich prebiotics, and low-sugar anti-inflammatory diets, we can influence neurotransmitter precursors and dampen systemic inflammation. This bio-hacking strategy, often termed 'psychobiotics,' offers a groundbreaking and accessible path to alleviate symptoms of chronic affective disorders.`,
    initialRating: 4.9,
    ratesCount: 112,
    commentsCount: 41,
    sharesCount: 86
  },
  {
    id: "neurobiological-mechanisms-emotional-blunting",
    title: "Neurobiological Mechanisms of Emotional Blunting and Anhedonia",
    author: "Dr. Julian Mercer",
    role: "Neuroclinical Specialist",
    category: "Cognitive Neuroscience",
    readTime: "6 min read",
    summary: "Understanding the reward pathway dampening and hypoactivation of the nucleus accumbens that leads to feelings of subjective emotional numbing.",
    content: `Emotional blunting—characterized by a restricted range of emotional expression and a subjective feeling of numbness—is a frequent symptom of mood disorders, chronic trauma, and occasionally a side-effect of selective serotonin reuptake inhibitors (SSRIs). To treat this blunted state, clinician teams must look deep inside the brain's reward processing circuitry.

Under typical functioning, the reward system relies on dopamine transmission from the ventral tegmental area (VTA) to the nucleus accumbens (NAc) and prefrontal networks. When we encounter positive or meaningful experiences, this pathway activates, creating a sense of joy and motivational salience.

In emotional blunting, functional MRI scans reveal a profound hypoactivation of the nucleus accumbens and the anterior insular cortex. This means the amygdala and striatum struggle to signal "affective weight" to the prefrontal cortex; events occur, but they are registered without emotional flavor.

When induced by SSRIs, the mechanism is believed to involve high synaptic serotonin levels stimulating inhibitory autoreceptors, which down-regulates dopamine output in the basal ganglia. Addressing this flattening requires careful pacing of serotonin-dopamine balances, behavioral activation protocols, and sensory grounding therapies to bypass intellectual cognition and wake up subcortical response networks.`,
    initialRating: 4.7,
    ratesCount: 65,
    commentsCount: 18,
    sharesCount: 39
  },
  {
    id: "predictive-coding-abnormalities-ocd",
    title: "Predictive Coding Abnormalities in OCD: Hyperactive Error Signals",
    author: "Dr. Sarah Sterling",
    role: "Neurobiology Lead",
    category: "Cognitive Neuroscience",
    readTime: "7 min read",
    summary: "Unpacking how predictive error signal mismatches inside the anterior cingulate cortex generate relentless distress in obsessive-compulsive loops.",
    content: `Obsessive-Compulsive Disorder (OCD) is often simplified as a clean or checking habit, but it is fundamentally a disorder of predictive processing in the brain. According to the predictive coding model, our brain is an active prediction machine that continually creates internal models of the world and compares them against incoming sensory data.

When there is a mismatch between what we predict and what we perceive, the brain generates a "prediction error" or "feeling of incompleteness" signal. In a typical brain, this error triggers adaptive behavioral correction, and once resolved, the signal stops.

In OCD, there is a hyperactive error-detection loop centered in the Cortico-Striato-Thalamo-Cortical (CSTC) circuit, particularly involving the anterior cingulate cortex (ACC). The ACC is the brain's alarm bell. In OCD, the ACC generates perpetual, false error signals—shouting that "something is wrong" or "contaminated"—even when sensory data confirms that a task is safe and completed.

Compulsions are repetitive physical or cognitive behaviors deployed to silence this persistent, intolerable error. However, because the neuro-circuit is structurally stuck in a hyper-predictive error loop, the compulsion provides only temporary relief before the false prediction error fires again. Cognitive behavioral therapy utilizing Exposure and Response Prevention (ERP) works by forcing the brain to tolerate the error signal without executing compulsions, eventually habituating and rewiring the predictive weighting of the CSTC circuit.`,
    initialRating: 4.9,
    ratesCount: 97,
    commentsCount: 38,
    sharesCount: 79
  },
  {
    id: "comorbidity-patterns-anxiety-depression",
    title: "Comorbidity Patterns between Anxiety and Depression: Common Neural Pathways",
    author: "Dr. Marcus Thorne",
    role: "Clinical Psychologist",
    category: "Mental Wellness",
    readTime: "7 min read",
    summary: "Analyzing why anxiety and depression co-occur so frequently, highlighting shared genetic determinants, cortisol pathways, and network dysconnectivities.",
    content: `Anxiety and depression are often diagnosed as discrete, self-contained disorders. However, clinical realities demonstrate that over 60% of individuals diagnosed with major depressive disorder (MDD) display significant, comorbid anxiety symptoms. Rather than being concurrent coincidences, this comorbidity highlights massive neurological and structural overlaps between these conditions.

At the genetic level, extensive family studies indicate a high degree of shared genetic susceptibility. The same genetic variations that dictate a hyper-sensitive autonomic reactivity can express as chronic tension (anxiety) or complete sympathetic exhaustion (depression) depending on environmental triggers.

On a circuit level, both disorders share a common hub of dysregulation within the Tripartite Network Model, which comprises:
1. The Salience Network (SN): Hyper-responsiveness in the insula causes neutral cues to be classified as dangerous, prompting generalized anxiety.
2. The Default Mode Network (DMN): Hyper-connectivity in self-referential centers triggers both chronic anxious worry and depressive rumination.
3. The Central Executive Network (CEN): Hypoactivity underpins both executive deficits, creating cognitive fatigue and planning paralysis.

Furthermore, both states are sustained by prolonged activation of the hypothalamic-pituitary-adrenal (HPA) axis, promoting systemic low-grade inflammation that degrades neuroplasticity in the hippocampus. Recognizing these shared pathways is shifting clinical practice from symptom-siloed checklists to transdiagnostic treatment frameworks that treat the underlying neural network imbalances holistically.`,
    initialRating: 4.8,
    ratesCount: 71,
    commentsCount: 23,
    sharesCount: 45
  },
  {
    id: "differential-diagnosis-bipolar-ii-depression",
    title: "Differential Diagnosis Challenges in Bipolar II vs. Unipolar Depression",
    author: "Dr. Julian Mercer",
    role: "Neuroclinical Specialist",
    category: "Mental Wellness",
    readTime: "8 min read",
    summary: "Exploring the clinically critical challenge of distinguishing bipolar II hypomania from unipolar major depressive disorder, avoiding medication pitfalls.",
    content: `Diagnosing Bipolar II disorder is one of the most persistent hurdles in modern clinical psychiatry. Because patients with Bipolar II spend the vast majority of their symptomatic lives in deep depressive phases, they typically seek help when depressed, rarely reporting their hypomanic periods, which they often perceive as welcome bursts of high energy and creativity.

As a result, Bipolar II is frequently misdiagnosed as unipolar Major Depressive Disorder (MDD). The clinical consequences of this misdiagnosis can be severe: treating Bipolar II with standard SSRI monotherapy without an accompanying mood stabilizer can trigger mixed states, increase rapid cycling, or precipitate full hypomanic flips.

To resolve this diagnostic challenge, clinicians must look at several behavioral patterns:
- Sleep Markers: Hypomania is characterized by a "decreased need for sleep" (feeling fully energetic after 3-4 hours) rather than the insomnia/hypersomnia of unipolar depression.
- Family History: Bipolar spectra carry a exceptionally high rate of heritability compared to unipolar disorders.
- Post-Antidepressant Adaptation: Hypomanic irritability or rapid energy shifts after commencing an SSRI is a valuable clinical indicator of Bipolar sub-structure.

Advanced clinical neuroimaging is beginning to offer diagnostic help, revealing distinct patterns of amygdala-frontal connectivity during resting states that distinguish Bipolar II from MDD. Elevating screening rigorousness and utilizing validated tools like the Mood Disorder Questionnaire (MDQ) is crucial for accurate diagnosis and proper therapeutic matching.`,
    initialRating: 4.8,
    ratesCount: 84,
    commentsCount: 31,
    sharesCount: 52
  },
  {
    id: "subthreshold-symptoms-predictors-disorders",
    title: "Subthreshold Symptoms as Key Predictors of Later Clinical Disorders",
    author: "Dr. Marcus Thorne",
    role: "Clinical Psychologist",
    category: "Mental Wellness",
    readTime: "6 min read",
    summary: "How minor, sub-clinical mood swings or sleep disturbances act as early warning signals for clinical psychiatric onset, enabling preventative care.",
    content: `In the diagnostic manuals, clinical psychiatric conditions are treated as binary states: an individual either meets all criteria or they do not. However, mental health exists along a continuous spectrum. Subthreshold symptoms—mild, infrequent, or isolated psychiatric features that do not meet full formal diagnostic criteria—are increasingly recognized as powerful predictors of future clinical onset.

Common subthreshold precursors include:
1. Intermittent sleep disturbances (especially micro-arousals and early morning awakening).
2. Mild, sub-clinical social withdrawal or increased rejection sensitivity.
3. Subthreshold mood elevations (fleeting episodes of hyper-alert productivity).

Rather than being benign anomalies, these minor fluctuations represent early structural instability within key networks, such as the frontoparietal control network or the HPA axis. They signal that the brain's compensatory mechanisms are beginning to buckle under sustained psychological load.

Tracking and treating these sub-clinical symptoms via early, non-pharmacological interventions—such as sleep pacing, cognitive flex exercises, and nervous system groundings—can stabilize the network before a full clinical threshold is crossed. This shift to preventative neuro-pacing is key to reducing the lifetime incidence of chronic psychiatric syndromes.`,
    initialRating: 4.7,
    ratesCount: 55,
    commentsCount: 19,
    sharesCount: 37
  },
  {
    id: "personality-disorder-traits-emotional-dysregulation",
    title: "Personality Disorder Traits and Neurobiological Models of Emotional Dysregulation",
    author: "Dr. Sarah Sterling",
    role: "Neurobiology Lead",
    category: "Mental Wellness",
    readTime: "8 min read",
    summary: "Comparing borderline and avoidant personality traits with hyper-reactive limbic structures and compromised cognitive control networks.",
    content: `Personality disorders, such as Borderline Personality Disorder (BPD) and Avoidant Personality Disorder (AvPD), are characterized by enduring, rigid patterns of behavior that cause significant functional distress. At the heart of these conditions is a profound vulnerability to emotional dysregulation, which corresponds directly to specific atypical structures in the brain.

In neuro-clinical studies of Borderline personality traits, we observe a significant imbalance:
1. Limbic Hyper-Reactivity: The amygdala and insula fire with exceptional intensity and duration when confronted with interpersonal cues, interpreting minor expressions as severe threats or rejection.
2. Compromised Frontal Control: Self-soothing prefrontal structures, specifically the vmPFC and orbitomedial prefrontal cortex (omPFC), fail to signal inhibitory control downstream.

This imbalance means that emotional spikes occur exceptionally fast, feel overwhelming, and take a long structural time to return to baseline. In Avoidant personality traits, a similar limbic hyper-reactivity exists, but it is coupled with hyper-active avoidant safety strategies that prompt early situational withdrawal to prevent anticipated pain.

Understanding these traits as physical adaptations of early trauma or sensitive temperaments helps reduce stigma. It highlights that long-term rehabilitation requires structured behavioral therapies, such as Dialectical Behavior Therapy (DBT), which directly work to strengthen PFC-limbic connections and expand emotional tolerance boundaries.`,
    initialRating: 4.9,
    ratesCount: 93,
    commentsCount: 35,
    sharesCount: 68
  },
  {
    id: "atypical-depression-treatment-response",
    title: "Atypical Depression and Treatment Response Pathways",
    author: "Dr. Evelyn Vance",
    role: "Cognitive Neuroscientist",
    category: "Mental Wellness",
    readTime: "7 min read",
    summary: "A detailed breakdown of atypical depressive symptoms, such as rejection sensitivity and mood reactivity, and their distinct response to MAOIs and dopamine agonists.",
    content: `While classic melancholic depression is characterized by complete anhedonia, insomnia, and early morning awakening, Atypical Depression presents with a uniquely different clinical contour. The core defining feature is mood reactivity—the ability to feel a temporary lift or pleasure in response to genuine positive happenings.

Alongside mood reactivity, atypical depression includes:
1. Hypersomnia (prolonged sleep times, up to 10-12 hours a day).
2. Lead Paralysis (a profound subjective feeling of heavy weight in the arms and legs).
3. Significant weight gain or hyperphagia (increased appetite).
4. Deep, persistent rejection sensitivity that impairs social relationships.

This specific symptom cluster points to a distinct underlying neurobiology. While melancholic depression is strongly linked to HPA axis hyperactivity and cortisol elevation, atypical depression is frequently associated with HPA axis hypoactivity, characterized by low baseline cortisol and high systemic inflammatory cytokines.

Consequently, patients with atypical depression display distinct treatment response pathways. They show poor response to standard tricyclic antidepressants and often exhibit limited efficacy with typical SSRIs. However, they demonstrate exceptional response rates to Monoamine Oxidase Inhibitors (MAOIs) and agents that support the dopaminergic and noradrenergic pathways. Targeted lifestyle changes, such as early morning bright light therapy and specific anti-inflammatory gut interventions, are also highly effective in stabilizing these unique neuro-endocrine patterns.`,
    initialRating: 4.9,
    ratesCount: 104,
    commentsCount: 42,
    sharesCount: 75
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
