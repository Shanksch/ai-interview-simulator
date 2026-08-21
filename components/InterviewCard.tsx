import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import DeleteInterviewButton from "./DeleteInterviewButton";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;



  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="w-[360px] max-sm:w-full min-h-96 group">
      <div className="bg-lp-surface rounded-xl min-h-full flex flex-col p-6 relative overflow-hidden gap-8 justify-between transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] border border-white/[0.04] group-hover:border-lp-accent/30 group-hover:-translate-y-1 group-hover:shadow-[0_10px_40px_-10px_rgba(232,160,76,0.1)]">
        
        {/* Subtle top frame border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent group-hover:via-lp-accent/40 transition-colors duration-500" />
        <div>
          {/* Top Right Actions */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            {userId && interviewId && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <DeleteInterviewButton interviewId={interviewId} userId={userId} />
              </div>
            )}
            <span className="badge-text flex items-center gap-1.5 bg-lp-surface-2 px-2 py-1 rounded-md border border-white/[0.06]">
              <span className={cn("w-1.5 h-1.5 rounded-full", normalizedType === 'Mixed' ? 'bg-lp-accent' : 'bg-lp-text-muted')} />
              {normalizedType}
            </span>
          </div>

          {/* Logo Badge (Initials) */}
          <div className="w-12 h-12 rounded-lg bg-lp-surface-2 border border-white/[0.08] flex items-center justify-center shadow-inner mt-2">
            <span className="font-mono text-lg text-lp-accent font-bold uppercase">
              {role.charAt(0) || "A"}
            </span>
          </div>

          {/* Interview Role */}
          <h3 className="mt-6 text-xl tracking-tight text-lp-text capitalize">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex flex-col gap-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lp-text-muted/40 font-mono text-[10px]">{"//"}</span>
                <p className="tabular-nums font-mono text-[11px] text-lp-text-muted uppercase tracking-wider">{formattedDate}</p>
              </div>

              {feedback && (
                <div className="flex items-center gap-2">
                  <span className="tabular-nums font-mono text-[11px] font-bold text-lp-text tracking-wider">{feedback.totalScore}</span>
                  <span className="tabular-nums font-mono text-[9px] text-lp-text-muted/50 tracking-wider">/ 100</span>
                </div>
              )}
            </div>

            {/* Score Meter */}
            <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  !feedback ? "w-0" : 
                  feedback.totalScore >= 80 ? "bg-green-500/80" : 
                  feedback.totalScore >= 60 ? "bg-lp-accent/80" : 
                  "bg-red-500/80"
                )}
                style={{ width: feedback ? `${feedback.totalScore}%` : '0%' }}
              />
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-4 text-sm text-lp-text-muted leading-relaxed">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-end mt-4 pt-4 border-t border-white/[0.06]">
          <DisplayTechIcons techStack={techstack} />

          <Button asChild className="btn-primary">
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? "Check Feedback" : "View Interview"}
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-black/10 ml-2">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;