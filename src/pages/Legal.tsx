import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, FileText, ChevronRight, ArrowLeft, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const PerspectiveHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="relative pt-32 pb-20 px-6 overflow-hidden border-b border-black/5">
    <div className="absolute top-0 left-0 w-full h-full bg-[#1e3a34]/5 -z-10" />
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all mb-8 font-bold text-sm uppercase tracking-widest">
        <ArrowLeft size={16} />
        Back to Home
      </Link>
      <h1 className="font-serif text-5xl md:text-7xl text-primary mb-6">{title}</h1>
      <p className="text-xl text-text-secondary max-w-2xl font-medium leading-relaxed italic">
        {subtitle}
      </p>
    </motion.div>
  </div>
);

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <motion.section 
    initial={{ opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="py-16 border-b border-black/5 last:border-0"
  >
    <div className="flex flex-col md:flex-row gap-12">
      <div className="md:w-1/3">
        <div className="sticky top-32 flex items-center gap-4 text-primary">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon size={24} />
          </div>
          <h2 className="text-2xl font-serif">{title}</h2>
        </div>
      </div>
      <div className="md:w-2/3 prose prose-emerald max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:text-text-secondary prose-p:leading-relaxed prose-strong:text-primary">
        {children}
      </div>
    </div>
  </motion.section>
);

export default function Legal() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.getElementById(location.hash.slice(1));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-color-background selection:bg-primary/20 selection:text-primary">
      <PerspectiveHeader 
        title="Transparency & Trust" 
        subtitle="How we protect your data, your privacy, and your peace of mind."
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div id="privacy">
          <Section title="Privacy Policy" icon={FileText}>
            <h3>Your data belongs to you.</h3>
            <p>
              At Neurohx, privacy isn't just a feature; it's our foundation. We collect only the information necessary to provide you with a personalized experience—such as your journal entries and progress data.
            </p>
            <strong>Key Commitments:</strong>
            <ul>
              <li><strong>No Data Selling:</strong> We never sell your personal data to third parties.</li>
              <li><strong>AI Neutrality:</strong> Your conversations with our AI buddy are processed locally or on secure, isolated servers. They are not used to train global AI models without your explicit, separate consent.</li>
              <li><strong>Right to Erasure:</strong> You can delete your account and all associated data at any time through the support settings.</li>
            </ul>
          </Section>
        </div>

        <div id="terms">
          <Section title="Terms of Service" icon={Lock}>
            <h3>Our commitment to you.</h3>
            <p>
              By using Neurohx, you agree to a respectful and healing community. Our AI tool is a companion for wellness and growth, not a replacement for clinical psychiatric emergency services.
            </p>
            <strong>Service Usage:</strong>
            <ul>
              <li><strong>Mental Health Support:</strong> The app is designed for mindfulness, reflection, and habit tracking. In case of a crisis, please contact your local emergency services immediately.</li>
              <li><strong>Subscription:</strong> We offer premium tiers for advanced features. You can manage your billing easily through your dashboard.</li>
              <li><strong>Appropriate Conduct:</strong> Users are expected to maintain an environment of kindness and self-respect.</li>
            </ul>
          </Section>
        </div>

        <div id="security">
          <Section title="Security Infrastructure" icon={Shield}>
            <h3>Clinical-grade protection.</h3>
            <p>
              We utilize advanced encryption and secure Firestore integration to ensure your data stays where it belongs: with you.
            </p>
            <strong>Technical Safeguards:</strong>
            <ul>
              <li><strong>AES-256 Encryption:</strong> Your data is encrypted at rest and in transit.</li>
              <li><strong>Secure Identity:</strong> We use Firebase Authentication for robust user verification.</li>
              <li><strong>Regular Audits:</strong> Our clinical AI engine is regularly audited for bias and safety to ensure the highest standards of care.</li>
            </ul>
          </Section>
        </div>

        <div id="journal">
          <Section title="Journal Privacy" icon={FileText}>
            <h3>Your digital sanctuary.</h3>
            <p>
              Journal entries are strictly private. We use industry-standard encryption to ensure that even our staff cannot read your personal reflections. 
            </p>
          </Section>
        </div>

        <div id="mood">
          <Section title="Mood Tracking" icon={ChevronRight}>
            <h3>Insightful, not intrusive.</h3>
            <p>
              Mood data is used solely to provide you with insights into your own patterns. This data is visualized for you and remains in your personal encrypted silo.
            </p>
          </Section>
        </div>

        <div id="buddy">
          <Section title="AI Buddy Ethics" icon={Heart}>
            <h3>Empathetic & Safe.</h3>
            <p>
              Our AI buddy follows strict ethical guidelines. It is designed to support, not diagnose. All interactions are monitored by our safety engine to prevent harmful advice.
            </p>
          </Section>
        </div>
      </main>

      <footer className="py-20 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h4 className="font-serif text-3xl mb-4 italic">Still have questions?</h4>
          <p className="opacity-80 mb-8">
            Our team is here to help you understand how we protect your journey.
          </p>
          <a href="mailto:supportneurohx@gmail.com" className="px-8 py-4 rounded-full bg-white text-primary font-bold hover:scale-105 transition-transform inline-block">
            Contact Support
          </a>
        </div>
      </footer>
    </div>
  );
}
