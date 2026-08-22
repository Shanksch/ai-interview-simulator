import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import DashboardHero from "@/components/DashboardHero";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

import { redirect } from "next/navigation";

async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=true&redirect=" + encodeURIComponent("/dashboard"));
  }

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      <DashboardHero stats={{ total: userInterviews?.length || 0, averageScore: 85 }} />

      <section className="flex flex-col gap-6 mt-8">
        <h2 className="font-mono text-[11px] text-lp-text-muted tracking-[0.1em] uppercase flex items-center gap-3">
          <span className="text-lp-accent">{">"}</span> Your Interviews
        </h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2 className="font-mono text-[11px] text-lp-text-muted tracking-[0.1em] uppercase flex items-center gap-3">
          <span className="text-lp-accent">{">"}</span> Take Interviews
        </h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;