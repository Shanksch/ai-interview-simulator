"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/general.action";
import { buildInterviewerVariables } from "@/lib/ai/interviewer-config";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  role,
  level,
  techstack,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [conversation, setConversation] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true);

  // Always holds the latest messages without closure staleness
  const messagesRef = useRef<SavedMessage[]>([]);

  // Keep lastMessage display in sync with messages state
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  // Handle post-call actions (feedback)
  useEffect(() => {
    const handleGenerateFeedback = async (msgs: SavedMessage[]) => {
      console.log("handleGenerateFeedback");
      setIsProcessing(true);

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: msgs,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/dashboard");
      }
    };

    if (callStatus === CallStatus.FINISHED && !isProcessing) {
      console.log("Call finished. Transcript length:", messagesRef.current.length);
      console.log("Full transcript:", messagesRef.current);
      if (type === "interview") {
        handleGenerateFeedback(messagesRef.current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  // Push-to-Talk Logic
  useEffect(() => {
    if (callStatus !== CallStatus.ACTIVE) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field (though none exist here, good practice)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setIsMicMuted(false);
        conversation?.setMicMuted(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsMicMuted(true);
        conversation?.setMicMuted(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [callStatus, conversation]);

  // Stable message handler — keeps ref and state in sync
  const handleMessage = useCallback(
    (message: { source: string; message: string }) => {
      const newMsg: SavedMessage = {
        role: message.source === "user" ? "user" : "assistant",
        content: message.message,
      };
      messagesRef.current = [...messagesRef.current, newMsg];
      setMessages(messagesRef.current);
    },
    []
  );

  const handleCall = useCallback(async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      // Dynamically import the ElevenLabs client SDK (client-side only)
      const { Conversation } = await import("@elevenlabs/client");

      // Fetch a signed URL from our API route (keeps agent ID server-side)
      const res = await fetch("/api/elevenlabs/signed-url");
      if (!res.ok) {
        throw new Error("Failed to get signed URL");
      }
      const { signedUrl } = await res.json();

      const dynamicVariables = buildInterviewerVariables({
        questions: questions || [],
        userName,
        role: role || "General",
        level: level || "mid",
        techstack: techstack || [],
        type: type || "interview",
      });

      console.log("Connecting via signed URL");
      console.log("Dynamic variables being sent:", dynamicVariables);
      const conv = await Conversation.startSession({
        signedUrl,
        dynamicVariables,
        onConnect: () => {
          console.log("ElevenLabs: Connected");
          setCallStatus(CallStatus.ACTIVE);
        },
        onDisconnect: (reason?: any) => {
          console.log("ElevenLabs: Disconnected — reason:", reason);
          setCallStatus(CallStatus.FINISHED);
        },

        onMessage: (message: { source: string; message: string }) => {
          console.log("onMessage fired:", message.source, message.message);
          handleMessage(message);
        },

        onModeChange: (mode: { mode: string }) => {
          setIsSpeaking(mode.mode === "speaking");
        },
        onError: (message: string, context?: any) => {
          console.error("ElevenLabs error:", message, context);
        },
      });

      setConversation(conv);
      
      // Start with PTT behavior (muted) now that conv is initialized
      conv.setMicMuted(true);
      setIsMicMuted(true);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  }, [questions, userName, role, level, techstack, handleMessage]);

  const handleDisconnect = useCallback(async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
    }
    setCallStatus(CallStatus.FINISHED);
  }, [conversation]);

  return (
    <>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-stretch justify-center relative">
        {/* AI Interviewer Card */}
        <div 
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center min-h-[320px] rounded-2xl bg-lp-surface-2 border border-white/[0.06] overflow-hidden transition-all duration-300",
            isSpeaking ? "border-lp-accent/50 shadow-[0_0_30px_-5px_rgba(232,160,76,0.15)]" : "hover:border-white/[0.1]"
          )}
        >
          {/* Status Label */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
             <span className={cn(
                "size-2 rounded-full",
                callStatus === CallStatus.ACTIVE 
                  ? isSpeaking ? "bg-lp-accent animate-pulse" : "bg-emerald-500" 
                  : "bg-lp-text-muted"
             )} />
             <span className="font-mono text-[10px] tracking-widest text-lp-text-muted uppercase">
                {callStatus !== CallStatus.ACTIVE 
                  ? "SYSTEM INACTIVE" 
                  : isSpeaking ? "AI SPEAKING" : "AI LISTENING"}
             </span>
          </div>

          <div className="relative">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={100}
              height={100}
              className={cn(
                "rounded-full object-cover size-[100px] ring-2 ring-white/5 transition-all duration-500",
                isSpeaking && "ring-lp-accent/40 shadow-[0_0_20px_rgba(232,160,76,0.2)]"
              )}
            />
          </div>

          <h3 className="mt-6 text-lg font-bold text-lp-text tracking-wide">SYSTEM</h3>
          
          {/* Waveform */}
          <div className="h-6 flex items-center justify-center gap-1 mt-4">
             {isSpeaking ? (
                <>
                  <motion.div animate={{ height: ["4px", "20px", "4px"] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-1 bg-lp-accent rounded-full" />
                  <motion.div animate={{ height: ["4px", "24px", "4px"] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.1 }} className="w-1 bg-lp-accent rounded-full" />
                  <motion.div animate={{ height: ["4px", "16px", "4px"] }} transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-lp-accent rounded-full" />
                </>
             ) : (
                <div className="h-1 w-12 bg-white/[0.05] rounded-full" />
             )}
          </div>
        </div>

        {/* User Card */}
        <div 
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center min-h-[320px] rounded-2xl bg-lp-surface-2 border border-white/[0.06] overflow-hidden transition-all duration-300",
            callStatus === CallStatus.ACTIVE && !isMicMuted ? "border-lp-accent/50 shadow-[0_0_30px_-5px_rgba(232,160,76,0.15)]" : "hover:border-white/[0.1]"
          )}
        >
          {/* Status Label */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
             <span className={cn(
                "size-2 rounded-full transition-colors",
                callStatus === CallStatus.ACTIVE 
                  ? !isMicMuted ? "bg-lp-accent" : "bg-red-500/80"
                  : "bg-lp-text-muted"
             )} />
             <span className="font-mono text-[10px] tracking-widest text-lp-text-muted uppercase">
                {callStatus !== CallStatus.ACTIVE 
                  ? "USER OFFLINE" 
                  : !isMicMuted ? "MIC ACTIVE" : "MIC MUTED"}
             </span>
          </div>

          <div className="relative">
            <Image
              src="/user-avatar.png"
              alt="User"
              width={100}
              height={100}
              className={cn(
                "rounded-full object-cover size-[100px] ring-2 ring-white/5 transition-all duration-500",
                callStatus === CallStatus.ACTIVE && !isMicMuted && "ring-lp-accent/40 shadow-[0_0_20px_rgba(232,160,76,0.2)]"
              )}
            />
          </div>

          <h3 className="mt-6 text-lg font-bold text-lp-text tracking-wide">{userName}</h3>
          
          <div className="mt-4 h-6 flex items-center justify-center">
            {callStatus === CallStatus.ACTIVE ? (
               <span className={cn(
                 "font-mono text-[10px] uppercase tracking-widest transition-colors",
                 isMicMuted ? "text-lp-text-muted" : "text-lp-accent animate-pulse"
               )}>
                 {isMicMuted ? "Hold [SPACE] to speak" : "Transmitting..."}
               </span>
            ) : (
               <span className="font-mono text-[10px] uppercase tracking-widest text-white/10">Standby</span>
            )}
          </div>
        </div>
      </div>

      {(messages.length > 0 || isProcessing) && (
        <div className="w-full max-w-5xl mx-auto bg-black/40 border border-white/[0.04] rounded-xl p-6 min-h-[120px] flex flex-col justify-center shadow-inner mt-6">
          <div className="flex items-center gap-3 mb-3">
             <span className="font-mono text-[10px] tracking-widest text-lp-accent uppercase">
               // LIVE TRANSCRIPT
             </span>
             <div className="flex-1 h-px bg-gradient-to-r from-lp-accent/20 to-transparent" />
          </div>
          <div className="text-left space-y-4">
             {messages.slice(-2).map((msg, idx) => (
                <div key={idx} className="animate-fadeIn">
                   <span className={cn(
                     "font-mono text-[10px] tracking-widest uppercase mr-3",
                     msg.role === "user" ? "text-lp-text-muted" : "text-lp-accent"
                   )}>
                     [{msg.role === "user" ? "USER" : "SYSTEM"}]
                   </span>
                   <span className={cn(
                     "text-sm leading-relaxed",
                     msg.role === "user" ? "text-lp-text-muted" : "text-lp-text"
                   )}>
                     {msg.content}
                   </span>
                </div>
             ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-center mt-10">
        {callStatus !== "ACTIVE" ? (
          <button
            className="group relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm min-w-[160px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] bg-lp-accent text-lp-bg hover:scale-105 hover:bg-lp-accent-hover shadow-[0_0_20px_rgba(232,160,76,0.15)] disabled:opacity-50 disabled:hover:scale-100"
            onClick={() => handleCall()}
            disabled={isProcessing}
          >
            <span
              className={cn(
                "absolute inset-0 bg-lp-accent rounded-full animate-ping opacity-20",
                callStatus !== "CONNECTING" && !isProcessing && "hidden"
              )}
            />

            <span className="relative z-10 flex items-center gap-2">
              {isProcessing
                ? "Processing..."
                : callStatus === "INACTIVE" || callStatus === "FINISHED"
                  ? "Start Interview"
                  : "Connecting..."}
            </span>
          </button>
        ) : (
          <button 
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm min-w-[160px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30"
            onClick={() => handleDisconnect()}
          >
            End Interview
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
