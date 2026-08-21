"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function DashboardHero({ stats }: { stats: { total: number, averageScore: number } }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const backgroundGlow = useMotionTemplate`
    radial-gradient(
      450px circle at ${mouseX}px ${mouseY}px,
      rgba(232, 160, 76, 0.08),
      transparent 80%
    )
  `;

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col md:flex-row items-center justify-between gap-10 p-8 md:p-12 bg-lp-surface border border-white/[0.04] rounded-2xl overflow-hidden group/hero"
    >
      {/* Dynamic Mouse Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-0 group-hover/hero:opacity-100"
        style={{ backgroundImage: backgroundGlow } as any}
      />

      {/* Ambient static glow behind the terminal */}
      <div className="absolute top-1/2 right-[5%] -translate-y-1/2 w-[24rem] h-[24rem] rounded-full bg-lp-accent/[0.12] blur-[100px] pointer-events-none z-0" aria-hidden="true" />
      
      {/* Dot Pattern overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      <div className="flex flex-col gap-6 max-w-lg relative z-10 w-full">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-[11px] text-lp-accent tracking-[0.1em] uppercase block"
        >
          // practice
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-tight text-lp-text leading-tight"
        >
          Get Interview-Ready with AI Feedback
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm text-lp-text-muted leading-relaxed"
        >
          Practice real interview questions tailored to your target role & get instant feedback on your answers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button asChild className="btn-primary mt-2 group/btn relative overflow-hidden">
            <Link href="/interview">
              <span className="relative z-10 flex items-center">
                Start an Interview
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-black/10 ml-2 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-1 group-hover/btn:bg-black/20">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>

      <TerminalBlock stats={stats} />
    </section>
  );
}

function TerminalBlock({ stats }: { stats: { total: number, averageScore: number } }) {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const sequence = [
      "> Initializing session...",
      "> Verifying credentials... OK",
      `> Interviews logged: ${stats.total}`,
      `> Average score: ${stats.averageScore}/100`,
      "> Awaiting input_"
    ];
    
    let isMounted = true;
    let currentIndex = 0;
    
    const animateLines = async () => {
      while (currentIndex < sequence.length && isMounted) {
        await new Promise(r => setTimeout(r, Math.random() * 450 + 150));
        if (!isMounted) break;
        const nextLine = sequence[currentIndex];
        setLines(prev => [...prev, nextLine]);
        currentIndex++;
      }
    };
    
    animateLines();
    
    return () => {
      isMounted = false;
    };
  }, [stats]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="max-sm:hidden relative z-10 w-full max-w-[320px] rounded-xl border border-white/[0.08] bg-lp-surface-2 p-5 shadow-2xl shadow-black/40 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
        </div>
        <span className="font-mono text-[10px] text-lp-text-muted tracking-wider uppercase ml-2">
          system active
        </span>
      </div>
      
      <div className="space-y-2 min-h-[120px] font-mono text-[11px] text-lp-text-muted">
        {lines.filter(Boolean).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={line.includes("Awaiting") ? "text-lp-accent flex items-center" : ""}
          >
            {line.replace("_", "")}
            {line.includes("Awaiting") && (
              <span className="inline-block w-[6px] h-3 bg-lp-accent ml-1 animate-pulse" />
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/70 animate-pulse" />
          <span className="font-mono text-[9px] text-green-500/70 tracking-wider">ONLINE</span>
        </div>
      </div>
    </motion.div>
  );
}
