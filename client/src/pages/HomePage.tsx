import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Layers,
  Cpu,
  Lock,
  Play,
  ChevronRight,
  Database,
  Server,
  Cloud,
  Check,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLenisLanding } from '../lib/motion/useLenisLanding';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { resolvedTheme } = useTheme();
  useLenisLanding();

  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero headline entrance
      if (headlineRef.current) {
        gsap.from(headlineRef.current, {
          opacity: 0,
          y: 30,
          duration: 1.1,
          ease: 'power3.out',
        });
      }

      // Staggered reveal for feature cards
      if (featuresRef.current) {
        gsap.from('.feature-card', {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });
      }

      // AI section reveal
      if (aiSectionRef.current) {
        gsap.from('.ai-card', {
          scrollTrigger: {
            trigger: aiSectionRef.current,
            start: 'top 75%',
          },
          opacity: 0,
          x: -30,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative w-full bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-[var(--color-accent)] selection:text-[#FFFFFF] dark:selection:text-[#090907] overflow-hidden transition-colors duration-200">
      {/* Subtle background ambient architectural glow */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <div className="absolute top-[-15%] left-[20%] h-[600px] w-[600px] rounded-full bg-[var(--color-accent)]/8 blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] h-[500px] w-[500px] rounded-full bg-[var(--color-accent-deep)]/10 blur-[160px]" />
        <div className="absolute bottom-[10%] left-[15%] h-[600px] w-[600px] rounded-full bg-[var(--color-accent)]/6 blur-[180px]" />
      </div>

      {/* 1. HERO SECTION */}
      <section
        ref={heroRef}
        className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center"
      >
        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-4 py-1.5 text-[11px] font-mono tracking-widest text-[var(--color-accent)] uppercase backdrop-blur-md shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span>ARCHITECT • DESIGN • COLLABORATE • WITH AI</span>
        </div>

        {/* Editorial Headline */}
        <h1
          ref={headlineRef}
          className="mx-auto max-w-5xl font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-[var(--color-text)] leading-[1.08]"
        >
          Design the Systems Behind{' '}
          <span className="italic text-[var(--color-accent)] font-light">What Comes Next.</span>
        </h1>

        {/* Supporting text */}
        <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-[var(--color-text-muted)] font-light leading-relaxed">
          ArchSync AI is a collaborative architecture design platform that helps you visualize,
          validate, and evolve complex cloud systems with the power of AI.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="group flex items-center gap-3 rounded-full border border-[var(--color-accent)]/50 bg-[var(--color-accent)] px-7 py-3.5 text-sm font-semibold text-[#FFFFFF] dark:text-[#090907] transition-all hover:bg-[var(--color-accent-hover)] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--color-accent)]/20"
          >
            <span>{isAuthenticated ? 'Go to Workspace' : 'Start Building Free'}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/15 dark:bg-black/20 transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <a
            href="#features"
            className="group flex items-center gap-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3.5 text-sm font-medium text-[var(--color-text)] backdrop-blur-sm transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] shadow-sm"
          >
            <Play className="h-3.5 w-3.5 text-[var(--color-accent)] fill-[var(--color-accent)]" />
            <span>Watch Demo</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[var(--color-text-muted)] font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
            <span>AI-Powered Architecture Review</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--color-accent)]" />
            <span>Real-Time Collaboration</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
            <span>From Idea to Production</span>
          </div>
        </div>

        {/* Floating Studio Workspace 3D Preview */}
        <div className="mt-16 w-full max-w-6xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-2xl shadow-black/5 dark:shadow-black/80 ring-1 ring-[var(--color-accent)]/10">
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas-bg)]">
            {/* Top Mock Window Bar */}
            <div className="flex h-10 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-status-danger/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-status-warning/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-status-success/70" />
                <span className="ml-3 font-mono text-[11px] text-[var(--color-text-muted)]">archsync.workspace/e-commerce-platform</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                <span>Live Sync Active</span>
              </div>
            </div>

            {/* Inner Diagram Canvas Showcase */}
            <div className="relative h-[380px] sm:h-[460px] md:h-[520px] w-full bg-[var(--color-canvas-bg)] flex items-center justify-center p-6 overflow-hidden">
              {/* Subtle Canvas Dot Grid */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: 'radial-gradient(var(--color-canvas-dot) 1.5px, transparent 1.5px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Diagram Nodes Composition */}
              <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-3xl">
                {/* Client Layer */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3.5 text-center shadow-md">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)]">
                    <Cloud className="h-4 w-4 text-[var(--color-technical)]" />
                    <span>Client Layer (Web & Mobile App)</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">HTTPS / CDN Edge Distribution</p>
                </div>

                {/* Arrow */}
                <div className="h-6 w-0.5 bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent)]/30" />

                {/* API Gateway / Load Balancer */}
                <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] px-8 py-4 text-center shadow-lg ring-1 ring-[var(--color-accent)]/30">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-text)]">
                    <Zap className="h-4 w-4 text-[var(--color-accent)]" />
                    <span>API Gateway & Intelligent Router</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] font-mono mt-0.5">Rate Limiting • JWT Auth • Health Checks</p>
                </div>

                {/* Arrow split */}
                <div className="flex w-full justify-around px-12">
                  <div className="h-6 w-0.5 bg-[var(--color-accent)]/40" />
                  <div className="h-6 w-0.5 bg-[var(--color-accent)]/40" />
                  <div className="h-6 w-0.5 bg-[var(--color-accent)]/40" />
                </div>

                {/* Microservices Tier */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-[var(--color-text)]">
                      <Server className="h-3.5 w-3.5 text-[var(--color-technical)]" />
                      <span>Auth Service</span>
                    </div>
                    <span className="mt-1 inline-block text-[10px] font-mono text-status-success bg-status-success/10 px-2 py-0.5 rounded font-medium">Healthy</span>
                  </div>

                  <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] p-4 text-center shadow-md ring-1 ring-[var(--color-accent)]/30">
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[var(--color-text)]">
                      <Server className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                      <span>Product Catalog</span>
                    </div>
                    <span className="mt-1 inline-block text-[10px] font-mono text-status-success bg-status-success/10 px-2 py-0.5 rounded font-medium">Scaled 3x</span>
                  </div>

                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-[var(--color-text)]">
                      <Database className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                      <span>Database Cluster</span>
                    </div>
                    <span className="mt-1 inline-block text-[10px] font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded font-medium">Primary / Replica</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down prompt */}
        <div className="mt-12 flex flex-col items-center gap-2 text-[10px] font-mono tracking-widest text-[var(--color-text-muted)] opacity-70 uppercase">
          <span>Scroll to explore</span>
          <span className="animate-bounce">↓</span>
        </div>
      </section>

      {/* 2. VISUALIZE COMPLEXITY SECTION (With architectural lake monument image) */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--color-border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left copy */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono tracking-widest text-[var(--color-accent)] uppercase font-semibold">
              VISUALIZE COMPLEXITY
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[var(--color-text)] leading-[1.15]">
              From ideas to intelligent architectures.
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
              Design, document, and validate your system architecture with an intuitive visual editor,
              backed by rigorous distributed systems heuristics and real-time validation.
            </p>

            <div className="pt-2">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
              >
                <span>Explore Features</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right architectural monument artwork with technical badges */}
          <div className="lg:col-span-7 relative">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
              <img
                src={resolvedTheme === 'light' ? '/assets/images/arch_monument_lake_light.jpg' : '/assets/images/arch_monument_lake.jpg'}
                alt="Architectural pavilion by water representing structured architecture"
                className="w-full h-[400px] sm:h-[480px] object-cover filter contrast-[1.03] transition-all duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/80 via-transparent to-transparent opacity-70" />

              {/* Floating Architecture Node Badges */}
              <div className="absolute top-8 right-8 flex flex-col gap-3">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-2.5 backdrop-blur-md shadow-xl flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                    <Cloud className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[var(--color-text)]">Frontend Client</span>
                    <span className="block text-[10px] font-mono text-[var(--color-text-muted)]">React / Vite SPA</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-2.5 backdrop-blur-md shadow-xl flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[var(--color-text)]">Backend Core</span>
                    <span className="block text-[10px] font-mono text-[var(--color-text-muted)]">Express / Node.js API</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-2.5 backdrop-blur-md shadow-xl flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[var(--color-text)]">Data Store</span>
                    <span className="block text-[10px] font-mono text-[var(--color-text-muted)]">MongoDB Cluster</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY ARCHSYNC AI (Bento Cards with Double-Bezel Architecture) */}
      <section ref={featuresRef} className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--color-border)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-[var(--color-accent)] uppercase font-semibold">
            WHY ARCHSYNC AI
          </span>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-normal text-[var(--color-text)]">
            Built for modern builders.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--color-text-muted)]">
            Everything you need to design, collaborate, and ship resilient software architectures — in one unified workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Assistant */}
          <div className="feature-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 hover:border-[var(--color-accent)]/60 transition-all duration-300 shadow-sm">
            <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-6 h-full flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-accent)] mb-6 shadow-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[var(--color-text)] mb-2">
                  AI Architecture Assistant
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Get instant structured reviews, detect single points of failure, scalability bottlenecks, and cost tradeoffs grounded in your live diagram.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] font-medium">
                <span>Grounded AI Heuristics</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Card 2: Real-time Collaboration */}
          <div className="feature-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 hover:border-[var(--color-accent)]/60 transition-all duration-300 shadow-sm">
            <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-6 h-full flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-accent)] mb-6 shadow-sm">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[var(--color-text)] mb-2">
                  Real-Time Collaboration
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Co-create seamlessly with multi-user presence, remote cursors, permission controls, and automatic conflict-free synchronization.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] font-medium">
                <span>Socket.io Synchronized</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Card 3: Validation & Rules */}
          <div className="feature-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 hover:border-[var(--color-accent)]/60 transition-all duration-300 shadow-sm">
            <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-6 h-full flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-accent)] mb-6 shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[var(--color-text)] mb-2">
                  Validation & Rules Engine
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Automatic structural verification warns of disconnected components, circular dependencies, and security boundary violations before shipping.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] font-medium">
                <span>Automated Auditing</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COLLABORATE WITHOUT BOUNDARIES SECTION */}
      <section id="collaboration" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--color-border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Feature Points */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono tracking-widest text-[var(--color-accent)] uppercase font-semibold">
              BUILT TOGETHER
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[var(--color-text)] leading-[1.15]">
              Collaborate without boundaries.
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
              Work with your team, align ideas visually, and make faster, better architecture decisions together in real-time.
            </p>

            <ul className="space-y-3.5 pt-2 text-sm text-[var(--color-text)]">
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                  <Check className="h-3 w-3" />
                </div>
                <span>Live cursors, element selection, and user presence</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                  <Check className="h-3 w-3" />
                </div>
                <span>Granular role-based permissions (Owner, Editor, Viewer)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                  <Check className="h-3 w-3" />
                </div>
                <span>Version control, conflict detection, and history tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                  <Check className="h-3 w-3" />
                </div>
                <span>Professional SVG, PNG, and JSON export for docs</span>
              </li>
            </ul>
          </div>

          {/* Right Live Collaborator Canvas Visual */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-xl overflow-hidden min-h-[380px] flex items-center justify-center">
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: 'radial-gradient(var(--color-canvas-dot) 1.5px, transparent 1.5px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Central Architecture Node */}
              <div className="relative z-10 rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface-raised)] px-6 py-4 text-center shadow-lg">
                <span className="text-xs font-semibold text-[var(--color-text)] block">Payment Gateway Service</span>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] block">v2.4.0 • Active Autosave</span>
              </div>

              {/* Collaborator 1: Priya */}
              <div className="absolute top-12 left-12 z-20 flex items-center gap-2 animate-pulse">
                <div className="h-8 w-8 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)]/20 flex items-center justify-center font-bold text-xs text-[var(--color-accent)]">
                  PS
                </div>
                <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)] shadow-md">
                  <span>Priya Sharma (Editing)</span>
                </div>
              </div>

              {/* Collaborator 2: Aditya */}
              <div className="absolute bottom-12 right-12 z-20 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border border-status-success bg-status-success/20 flex items-center justify-center font-bold text-xs text-status-success">
                  AM
                </div>
                <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)] shadow-md">
                  <span>Aditya Mehta (Reviewing)</span>
                </div>
              </div>

              {/* Collaborator 3: You */}
              <div className="absolute top-1/2 right-20 z-20 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border border-status-info bg-status-info/20 flex items-center justify-center font-bold text-xs text-status-info">
                  You
                </div>
                <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)] shadow-md">
                  <span>Designing Cache Layer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. YOUR AI PARTNER (With golden AI core processor artwork) */}
      <section id="ai-assistant" ref={aiSectionRef} className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--color-border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left AI Processor Artwork */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-2xl max-w-md w-full">
              <img
                src="/assets/images/arch_ai_core.jpg"
                alt="AI architecture processor core with radiating circuitry"
                className="w-full h-auto rounded-xl object-cover shadow-xl filter contrast-[1.03]"
                loading="lazy"
              />
              <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-4 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[var(--color-accent)]">
                  <Cpu className="h-4 w-4" />
                  <span>Gemini AI Systems Engine</span>
                </div>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)] font-mono">
                  Deep analysis across topology, fault boundaries, and redundancy.
                </p>
              </div>
            </div>
          </div>

          {/* Right Insights Cards */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono tracking-widest text-[var(--color-accent)] uppercase font-semibold">
              YOUR AI PARTNER
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[var(--color-text)] leading-[1.15]">
              Smarter architectures with AI.
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
              Get intelligent insights, identify potential bottlenecks, and follow cloud-native industry best practices — grounded in your diagram.
            </p>

            <div className="space-y-4 pt-2">
              <div className="ai-card rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)]/50 transition-colors shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)] shrink-0 mt-0.5">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">Scalability & Bottleneck Review</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Identifies high-traffic routes that need caching tiers, message queues, or horizontal auto-scaling.
                    </p>
                  </div>
                </div>
              </div>

              <div className="ai-card rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)]/50 transition-colors shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)] shrink-0 mt-0.5">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">Security & Isolation Boundaries</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Verifies that sensitive data services remain behind API Gateways and isolated VPC networks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="ai-card rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)]/50 transition-colors shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)] shrink-0 mt-0.5">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">Decoupling & Async Opportunities</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Recommends message queues and event buses to decouple synchronous point-to-point calls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. READY TO BUILD HERO FOOTER CTA */}
      <section id="cta" className="relative z-10 py-28 px-4 sm:px-6 lg:px-8 text-center border-t border-[var(--color-border)] bg-gradient-to-b from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-xs font-mono tracking-widest text-[var(--color-accent)] uppercase font-semibold">
            READY TO BUILD
          </span>
          <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal text-[var(--color-text)] tracking-tight">
            Turn your ideas into scalable systems.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[var(--color-text-muted)] font-light max-w-2xl mx-auto">
            Join engineers, architects, and product leaders who trust ArchSync AI to design, validate, and collaborate with confidence.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="group flex items-center gap-3 rounded-full border border-[var(--color-accent)]/50 bg-[var(--color-accent)] px-8 py-4 text-sm font-semibold text-[#FFFFFF] dark:text-[#090907] transition-all hover:bg-[var(--color-accent-hover)] hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[var(--color-accent)]/20"
            >
              <span>{isAuthenticated ? 'Open Studio Workspace' : 'Start Building Free'}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/15 dark:bg-black/20 transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              to="/login"
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-7 py-4 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] transition-colors shadow-sm"
            >
              Sign In to Existing Project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
