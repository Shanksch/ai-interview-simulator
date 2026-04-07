"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

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
        router.push("/");
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
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {(messages.length > 0 || isProcessing) && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call"
            onClick={() => handleCall()}
            disabled={isProcessing}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && !isProcessing && "hidden"
              )}
            />

            <span className="relative">
              {isProcessing
                ? "Processing..."
                : callStatus === "INACTIVE" || callStatus === "FINISHED"
                  ? "Call"
                  : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
