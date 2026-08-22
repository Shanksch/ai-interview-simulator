"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthModal } from "@/components/AuthModalProvider";

/* ═══════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function useCounter(target: number, active: boolean, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    let start: number | null = null;
    let frame: number;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setCount(target);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return count;
}

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [threshold]);

  return scrolled;
}

/* ═══════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════ */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`lp-reveal ${visible ? "lp-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/* ── Arrow icon (reusable) ── */
function ArrowIcon({ size = 10 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 9L9 1M9 1H3M9 1V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Stat counter ── */
function StatItem({
  value,
  suffix,
  label,
  format,
}: {
  value: number;
  suffix: string;
  label: string;
  format?: (v: number) => string;
}) {
  const { ref, visible } = useInView();
  const count = useCounter(value, visible);
  const display = format ? format(count) : count.toLocaleString();

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1.5 px-6 py-6 flex-1 min-w-[140px]"
    >
      <span className="font-mono text-2xl md:text-3xl font-semibold text-lp-text tabular-nums tracking-tight">
        {display}
        {suffix}
      </span>
      <span className="text-[11px] text-lp-text-muted uppercase tracking-[0.08em] text-center">
        {label}
      </span>
    </div>
  );
}

/* ── Step card ── */
function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-6 md:p-8">
      <span className="font-mono text-xs text-lp-accent tracking-[0.1em] uppercase">
        [ {number} ]
      </span>
      <h3 className="text-xl font-semibold text-lp-text tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-lp-text-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative rounded-xl border border-white/[0.06] bg-lp-surface p-6 md:p-8 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20 ${className}`}
    >
      <span className="font-mono text-[11px] text-lp-accent tracking-[0.08em] uppercase block mb-3">
        {eyebrow}
      </span>
      <h3 className="text-lg font-semibold text-lp-text mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-lp-text-muted leading-relaxed mb-4">
        {description}
      </p>
      {children && <div className="mt-auto">{children}</div>}
    </div>
  );
}

/* ── Voice waveform bars ── */
function VoiceWaveform() {
  const heights = [5, 8, 13, 6, 15, 10, 11, 6, 14, 8, 10, 7, 12, 9, 7];
  return (
    <div className="flex items-end gap-[3px] h-5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="lp-waveform-bar rounded-full bg-lp-accent/50"
          style={{
            width: "2px",
            height: `${h}px`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Mock interview card (hero visual) ── */
function MockInterviewCard() {
  return (
    <div className="lp-float relative w-full max-w-md">
      {/* Outer bezel */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-[2px]">
        {/* Inner card */}
        <div className="rounded-[10px] bg-lp-surface overflow-hidden shadow-2xl shadow-black/40">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <span className="font-mono text-[11px] text-lp-text-muted tracking-wider uppercase ml-2">
              aimhyr interview
            </span>
          </div>

          {/* Chat content */}
          <div className="p-5 space-y-4">
            {/* AI message */}
            <div className="flex gap-3">
              <div className="shrink-0 w-7 h-7 rounded bg-lp-accent/20 flex items-center justify-center">
                <span className="font-mono text-[10px] text-lp-accent font-bold">
                  AI
                </span>
              </div>
              <div className="bg-white/[0.04] rounded-lg rounded-tl-none px-3.5 py-2.5 max-w-[85%]">
                <p className="text-sm text-lp-text/90 leading-relaxed">
                  Tell me about a time you led a team through a challenging
                  project. What was your approach?
                </p>
              </div>
            </div>

            {/* User message with blinking cursor */}
            <div className="flex gap-3 justify-end">
              <div className="bg-lp-accent/10 border border-lp-accent/20 rounded-lg rounded-tr-none px-3.5 py-2.5 max-w-[85%]">
                <p className="text-sm text-lp-text/80 leading-relaxed">
                  In my last role, I managed a cross-functional team of 6 to
                  ship a
                  <span className="lp-cursor" />
                </p>
              </div>
            </div>

            {/* Waveform / analysis indicator */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-end gap-[3px] h-4">
                {[7, 11, 5, 14, 8, 13, 6, 10, 7, 12, 8, 11].map((h, i) => (
                  <div
                    key={i}
                    className="lp-waveform-bar rounded-full bg-lp-accent/60"
                    style={{
                      width: "3px",
                      height: `${h}px`,
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-lp-text-muted tracking-wider uppercase">
                analyzing response...
              </span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="font-mono text-[10px] text-lp-text-muted tracking-wider">
              // real-time feedback
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/70 animate-pulse" />
              <span className="font-mono text-[10px] text-green-500/70">
                LIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════ */

export default function LandingPage() {
  const scrolled = useScrolled();
  const { openAuthModal } = useAuthModal();

  return (
    <div className="bg-lp-bg min-h-[100dvh] text-lp-text overflow-x-hidden">
      {/* ────────── NAV ────────── */}
      <nav
        id="nav"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          scrolled
            ? "bg-lp-bg/80 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Aimhyr" width={28} height={24} />
            <span className="text-lg font-semibold tracking-tight text-lp-text">
              Aimhyr
            </span>
          </Link>
          <button
            onClick={() => openAuthModal("sign-up")}
            id="nav-cta"
            className="inline-flex items-center gap-2 bg-lp-accent text-lp-bg font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-lp-accent-hover active:scale-[0.97] cursor-pointer"
          >
            Start Practicing
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-black/10">
              <ArrowIcon />
            </span>
          </button>
        </div>
      </nav>

      {/* ────────── HERO ────────── */}
      <section id="hero" className="min-h-[100dvh] flex items-center relative pt-20">
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-lp-accent/[0.04] blur-[120px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <Reveal>
              <span className="font-mono text-[11px] text-lp-accent tracking-[0.1em] uppercase">
                [ ai-powered interview practice ]
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-[clamp(2.75rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-lp-text">
                Practice interviews.
                <br />
                <span className="text-lp-text-muted">Land the job.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-lg text-lp-text-muted leading-relaxed max-w-[50ch]">
                Realistic AI mock interviews with instant, specific feedback on
                your answers. Practice for any role, track your progress, get
                hired.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => openAuthModal("sign-up")}
                  id="hero-cta"
                  className="inline-flex items-center gap-2.5 bg-lp-accent text-lp-bg font-semibold px-7 py-3.5 rounded-lg text-base transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-lp-accent-hover active:scale-[0.97] cursor-pointer"
                >
                  Start Practicing
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-black/10">
                    <ArrowIcon size={12} />
                  </span>
                </button>
                <span className="text-sm text-lp-text-muted">
                  Free to start. No credit card.
                </span>
              </div>
            </Reveal>
          </div>

          {/* Mock Interview Card */}
          <Reveal delay={200} className="flex justify-center lg:justify-end">
            <MockInterviewCard />
          </Reveal>
        </div>
      </section>

      {/* ────────── STATS BAR ────────── */}
      <section
        id="stats"
        className="border-y border-white/[0.06] bg-lp-surface/50"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          <StatItem value={12400} suffix="+" label="Interviews Practiced" />
          <StatItem value={95000} suffix="+" label="Questions Answered" />
          <StatItem
            value={48}
            suffix="/5"
            label="Avg Rating"
            format={(v) => (v / 10).toFixed(1)}
          />
          <StatItem value={87} suffix="%" label="Felt More Prepared" />
        </div>
      </section>

      {/* ────────── HOW IT WORKS ────────── */}
      <section id="how-it-works" className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="mb-16">
              <span className="font-mono text-[11px] text-lp-accent tracking-[0.1em] uppercase block mb-4">
                // how it works
              </span>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold tracking-[-0.02em] text-lp-text">
                Three steps to interview confidence
              </h2>
            </div>
          </Reveal>

          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
              <Reveal delay={0}>
                <StepCard
                  number="01"
                  title="Choose your role"
                  description="Select your target position and industry. Aimhyr generates questions tailored to the exact role you are preparing for."
                />
              </Reveal>
              <Reveal delay={100}>
                <StepCard
                  number="02"
                  title="Mock interview"
                  description="Answer questions via voice or text in a realistic interview environment. Take as long as you need, pause anytime."
                />
              </Reveal>
              <Reveal delay={200}>
                <StepCard
                  number="03"
                  title="Get scored feedback"
                  description="Receive detailed scoring on clarity, relevance, and structure. See exactly where to improve with actionable suggestions."
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── FEATURE GRID ────────── */}
      <section id="features" className="py-28 md:py-36 bg-lp-surface/30">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="mb-16">
              <span className="font-mono text-[11px] text-lp-accent tracking-[0.1em] uppercase block mb-4">
                {">"} features
              </span>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold tracking-[-0.02em] text-lp-text">
                Built for real preparation
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 — tall */}
            <Reveal delay={0} className="md:row-span-2">
              <FeatureCard
                className="h-full"
                eyebrow="// feedback"
                title="Real-time AI Feedback"
                description="Get instant analysis on filler words, answer structure, confidence level, and relevance to the question asked."
              >
                <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-lp-accent" />
                    <span className="font-mono text-[10px] text-lp-text-muted tracking-wider uppercase">
                      feedback preview
                    </span>
                  </div>
                  <p className="text-xs text-lp-text-muted font-mono leading-relaxed">
                    <span className="text-lp-accent">clarity:</span> 8.4/10 —
                    strong structure
                    <br />
                    <span className="text-lp-accent">relevance:</span> 9.1/10 —
                    on topic
                    <br />
                    <span className="text-lp-accent">filler:</span> 2 instances
                    detected
                    <span className="lp-cursor" />
                  </p>
                </div>
              </FeatureCard>
            </Reveal>

            {/* Card 2 */}
            <Reveal delay={100}>
              <FeatureCard
                eyebrow="[ roles ]"
                title="Industry-Specific Questions"
                description="Practice with questions curated for software engineering, product management, data science, marketing, finance, and 50+ other roles."
              >
                <div className="flex flex-wrap gap-2 mt-2">
                  {["SWE", "PM", "Data", "Design", "Finance"].map((role) => (
                    <span
                      key={role}
                      className="font-mono text-[10px] px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-lp-text-muted tracking-wider uppercase"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </FeatureCard>
            </Reveal>

            {/* Card 3 */}
            <Reveal delay={200}>
              <FeatureCard
                eyebrow="// progress"
                title="Progress Tracking"
                description="Monitor improvement over time with detailed performance analytics across multiple interview sessions."
              >
                <div className="mt-2 space-y-2">
                  {[
                    { label: "Clarity", width: "84%" },
                    { label: "Structure", width: "72%" },
                    { label: "Confidence", width: "91%" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-lp-text-muted w-16 tracking-wider uppercase">
                        {item.label}
                      </span>
                      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-lp-accent/60 rounded-full"
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </FeatureCard>
            </Reveal>

            {/* Card 4 — wide */}
            <Reveal delay={300} className="md:col-span-2">
              <FeatureCard
                eyebrow="< voice >"
                title="Voice + Text Mode"
                description="Practice speaking your answers out loud with voice mode, or type them out. Switch between modes at any time during your session."
              >
                <VoiceWaveform />
              </FeatureCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ────────── TESTIMONIAL / BEFORE-AFTER ────────── */}
      <section id="testimonials" className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="mb-16">
              <span className="font-mono text-[11px] text-lp-accent tracking-[0.1em] uppercase block mb-4">
                // results
              </span>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold tracking-[-0.02em] text-lp-text">
                The difference practice makes
              </h2>
            </div>
          </Reveal>

          {/* Before / After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            <Reveal delay={0}>
              <div className="rounded-xl border border-white/[0.06] bg-lp-surface p-6 md:p-8 h-full">
                <span className="font-mono text-[11px] text-lp-text-muted tracking-[0.08em] uppercase block mb-6">
                  Before Aimhyr
                </span>
                <ul className="space-y-4 list-none">
                  {[
                    "Rambled through behavioral questions without structure",
                    "No idea which skills to highlight for specific roles",
                    "Froze when asked unexpected follow-up questions",
                    "Went into interviews hoping for the best",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-lp-text-muted leading-relaxed"
                    >
                      <span className="shrink-0 text-lp-text-muted/50 font-mono text-xs mt-0.5">
                        &mdash;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-xl border border-lp-accent/20 bg-lp-accent/[0.04] p-6 md:p-8 h-full">
                <span className="font-mono text-[11px] text-lp-accent tracking-[0.08em] uppercase block mb-6">
                  After Aimhyr
                </span>
                <ul className="space-y-4 list-none">
                  {[
                    "Structured, confident responses using proven frameworks",
                    "Role-specific practice across 50+ industries",
                    "Handled curveball questions with practiced composure",
                    "Walked into interviews knowing exactly what to expect",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-lp-text leading-relaxed"
                    >
                      <span className="shrink-0 text-lp-accent font-mono text-xs mt-0.5">
                        +
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Testimonial quote */}
          <Reveal>
            <div className="max-w-3xl mx-auto text-center">
              <blockquote className="text-xl md:text-2xl text-lp-text font-light leading-relaxed tracking-tight mb-6">
                &ldquo;I practiced 3 mock interviews on Aimhyr the week before
                my on-site. The real-time feedback on my STAR responses was
                specific enough that I could actually fix my weak spots. Got the
                offer.&rdquo;
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lp-accent/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-lp-accent">
                    AK
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-lp-text">
                    Arjun Krishnamurthy
                  </p>
                  <p className="text-xs text-lp-text-muted">
                    Software Engineer, hired at a Series B startup
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ────────── CLOSING CTA ────────── */}
      <section id="cta" className="py-28 md:py-36 bg-lp-surface/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-lp-text mb-6">
              Your next interview doesn&apos;t
              <br />
              have to be your worst.
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <p className="font-mono text-sm text-lp-text-muted tracking-wider mb-10">
              {">"} ready to practice?
            </p>
          </Reveal>

          <Reveal delay={160}>
            <div className="relative inline-block">
              {/* Ambient glow behind CTA */}
              <div
                className="absolute -inset-4 rounded-2xl bg-lp-accent/10 blur-xl pointer-events-none"
                aria-hidden="true"
              />
              <button
                onClick={() => openAuthModal("sign-up")}
                id="closing-cta"
                className="relative inline-flex items-center gap-2.5 bg-lp-accent text-lp-bg font-semibold px-8 py-4 rounded-lg text-base transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-lp-accent-hover active:scale-[0.97] cursor-pointer"
              >
                Start Practicing — Free
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-black/10">
                  <ArrowIcon size={12} />
                </span>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer
        id="footer"
        className="border-t border-white/[0.06] py-8"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Aimhyr" width={20} height={17} />
            <span className="text-sm font-medium text-lp-text">Aimhyr</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => openAuthModal("sign-in")}
              className="text-xs text-lp-text-muted hover:text-lp-text transition-colors duration-200 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal("sign-up")}
              className="text-xs text-lp-text-muted hover:text-lp-text transition-colors duration-200 cursor-pointer"
            >
              Get Started
            </button>
          </div>

          <span className="font-mono text-[10px] text-lp-text-muted tracking-wider">
            &copy; {new Date().getFullYear()} Aimhyr
          </span>
        </div>
      </footer>
    </div>
  );
}
