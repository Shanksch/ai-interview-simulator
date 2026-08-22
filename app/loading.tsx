import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] w-full">
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Outer slow spinning ring with a gradient-like fade using borders */}
        <div className="absolute w-full h-full border-t-[3px] border-r-[3px] border-lp-accent/80 rounded-full animate-spin [animation-duration:3s]" />
        
        {/* Middle reverse-spinning ring */}
        <div className="absolute w-20 h-20 border-b-2 border-l-2 border-white/20 rounded-full animate-spin [animation-duration:2s] [animation-direction:reverse]" />
        
        {/* Inner static glowing orbit */}
        <div className="absolute w-12 h-12 border border-lp-accent/40 rounded-full bg-lp-accent/5 animate-pulse" />
        
        {/* Center AI Sparkle */}
        <Sparkles className="w-5 h-5 text-lp-accent z-10 animate-pulse drop-shadow-[0_0_8px_rgba(232,160,76,0.8)]" />
      </div>
      
      {/* Loading Text */}
      <div className="mt-8 flex flex-col items-center gap-1.5 text-center">
        <h3 className="text-lp-text text-base font-semibold tracking-wide">
          Preparing Environment
        </h3>
        <p className="text-xs text-lp-text-muted font-medium uppercase tracking-[0.2em] max-w-[240px]">
          Loading Resources
        </p>
      </div>
    </div>
  );
}
