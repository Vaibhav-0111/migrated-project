import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, Sparkles, Target, Zap, ArrowRight, Shield, BarChart3, Gamepad2, GraduationCap, Heart, ChevronDown } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { CalmWorld } from '@/components/3d/CalmWorld';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useRef } from 'react';

const stagger = {
  container: { show: { transition: { staggerChildren: 0.08 } } },
  item: {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { settings } = useAppStore();
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const headerBg = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  const handleGetStarted = () => {
    navigate(settings.isOnboarded ? '/dashboard' : '/onboarding');
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { icon: Brain, title: 'ADHD-Optimized', description: 'Bite-sized 3–10 min sessions designed for focused learning without overwhelm.' },
    { icon: Target, title: 'Adaptive Difficulty', description: 'AI adjusts to your pace — keeping you challenged but never frustrated.' },
    { icon: Sparkles, title: 'Calm Interface', description: 'Gentle animations and warm colors reduce anxiety and help you stay in flow.' },
    { icon: Zap, title: 'Instant Feedback', description: 'Step-by-step explanations after every question so you truly understand.' },
  ];

  const stats = [
    { value: '30+', label: 'Interactive Games' },
    { value: '600+', label: 'Curated Questions' },
    { value: '5', label: 'Math Chapters' },
    { value: '3', label: 'Difficulty Levels' },
  ];

  const subjects = [
    { icon: '📐', name: 'Trigonometry', desc: 'Angles, heights & distances' },
    { icon: '🔢', name: 'Algebra', desc: 'Equations, patterns & logic' },
    { icon: '📦', name: 'Volume & Surface', desc: '3D shapes & measurements' },
    { icon: '🎲', name: 'Probability', desc: 'Chance, data & predictions' },
    { icon: '🍕', name: 'Fractions & %', desc: 'Parts, decimals & interest' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <CalmWorld />

      {/* Sticky Header */}
      <motion.header
        style={{ backgroundColor: `hsla(var(--card), ${headerBg})` }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-transparent transition-colors"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-md">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Saesha</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <button onClick={scrollToFeatures} className="hover:text-foreground transition-colors">Features</button>
            <button onClick={scrollToFeatures} className="hover:text-foreground transition-colors">Subjects</button>
          </nav>

          <div className="flex gap-2">
            {settings.isOnboarded && (
              <EnhancedButton variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</EnhancedButton>
            )}
            <EnhancedButton variant="outline" size="sm" onClick={() => navigate('/auth')}>Sign In</EnhancedButton>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="max-w-3xl text-center"
        >
          <motion.div variants={stagger.item} className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
            <Heart className="h-3.5 w-3.5" />
            ADHD-Friendly Math Platform
          </motion.div>

          <motion.h1
            variants={stagger.item}
            className="mb-5 text-4xl font-extrabold leading-[1.1] text-foreground sm:text-5xl md:text-6xl lg:text-7xl tracking-tight"
          >
            Learn math in{' '}
            <span className="relative">
              <span className="bg-gradient-hero bg-clip-text text-transparent">moments</span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-hero"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                style={{ originX: 0 }}
              />
            </span>
            ,
            <br className="hidden sm:block" />
            {' '}not marathons.
          </motion.h1>

          <motion.p
            variants={stagger.item}
            className="mx-auto mb-8 max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed"
          >
            Designed for Class 11–12 students who learn differently. Short, game-based sessions that adapt to your pace in a calm, distraction-free environment.
          </motion.p>

          <motion.div variants={stagger.item} className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <EnhancedButton variant="hero" size="lg" onClick={handleGetStarted} className="min-w-[200px] group">
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </EnhancedButton>
            <EnhancedButton variant="outline" size="lg" onClick={() => navigate('/auth')} className="min-w-[200px]">
              I have an account
            </EnhancedButton>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={stagger.item}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-success" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Gamepad2 className="h-3.5 w-3.5 text-primary" /> 30+ games</span>
            <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-accent" /> CBSE aligned</span>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.button
          onClick={scrollToFeatures}
          className="absolute bottom-8 flex flex-col items-center gap-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[10px] uppercase tracking-widest">Explore</span>
          <ChevronDown className="h-4 w-4" />
        </motion.button>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-border/50 bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center py-8 border-r last:border-r-0 border-border/30"
            >
              <span className="text-3xl font-extrabold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="relative z-10 py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Why Saesha</span>
            <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
              Built for how your brain actually works
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Every feature is designed with neurodivergent learners in mind — no timers, no pressure, just calm learning.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="group relative rounded-2xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero shadow-sm transition-transform group-hover:scale-110">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-1.5 text-lg font-bold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="relative z-10 py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Curriculum</span>
            <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">5 chapters, 30 games</h2>
            <p className="mt-3 text-muted-foreground">Aligned with CBSE Class 11–12 mathematics syllabus.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {subjects.map((subj, i) => (
              <motion.div
                key={subj.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-5 text-center transition-all hover:border-primary/30 hover:shadow-sm cursor-default"
              >
                <span className="text-3xl">{subj.icon}</span>
                <span className="text-sm font-bold text-foreground">{subj.name}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{subj.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</span>
            <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">Three simple steps</h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Pick a chapter', desc: 'Choose from Trigonometry, Algebra, Volume, Probability, or Fractions.' },
              { step: '02', title: 'Play & learn', desc: 'Interactive game scenes teach concepts visually before the quiz.' },
              { step: '03', title: 'Earn stars & level up', desc: 'Get instant feedback, earn badges, and unlock harder levels.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center"
              >
                <span className="inline-block text-4xl font-extrabold bg-gradient-hero bg-clip-text text-transparent mb-3">{s.step}</span>
                <h3 className="text-lg font-bold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-10 md:p-14"
          >
            <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-4">
              Ready to make math calm?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join students who've found a better way to learn. No pressure, no timers — just you and the math.
            </p>
            <EnhancedButton variant="hero" size="lg" onClick={handleGetStarted} className="min-w-[220px] group">
              Start Learning
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </EnhancedButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/60 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-hero">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Saesha</span>
          </div>
          <p>Designed with care for focused learning</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/auth')} className="hover:text-foreground transition-colors">Sign In</button>
            <button onClick={handleGetStarted} className="hover:text-foreground transition-colors">Get Started</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
