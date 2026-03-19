"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/general.action";
import {
  getGeneratorAgentId,
  getInterviewerAgentId,
  buildGeneratorVariables,
  buildInterviewerVariables,
} from "@/lib/ai/interviewer-config";

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
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [conversation, setConversation] = useState<any>(null);

  // Handle feedback generation when call ends
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = useCallback(async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      // Dynamically import the ElevenLabs React SDK (client-side only)
      const { Conversation } = await import("@elevenlabs/client");

      const agentId =
        type === "generate"
          ? getGeneratorAgentId()
          : getInterviewerAgentId();

      const dynamicVariables =
        type === "generate"
          ? buildGeneratorVariables(userName, userId || "")
          : buildInterviewerVariables(questions || []);

      const conv = await Conversation.startSession({
        agentId,
        dynamicVariables,
        onConnect: () => {
          console.log("ElevenLabs: Connected");
          setCallStatus(CallStatus.ACTIVE);
        },
        onDisconnect: () => {
          console.log("ElevenLabs: Disconnected");
          setCallStatus(CallStatus.FINISHED);
        },
        onMessage: (message: { source: string; message: string }) => {
          const role =
            message.source === "user" ? "user" : "assistant";
          setMessages((prev) => [
            ...prev,
            { role, content: message.message },
          ]);
        },
        onModeChange: (mode: { mode: string }) => {
          setIsSpeaking(mode.mode === "speaking");
        },
        onError: (error: Error) => {
          console.error("ElevenLabs error:", error);
        },
      });

      setConversation(conv);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  }, [type, userName, userId, questions]);

  const handleDisconnect = useCallback(async () => {
    setCallStatus(CallStatus.FINISHED);
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
    }
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

      {messages.length > 0 && (
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
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
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