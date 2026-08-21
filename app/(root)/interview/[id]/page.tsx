import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";

const InterviewPage = async ({ params }: RouteParams) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const interview = await getInterviewById(id);

  if (!interview) redirect("/dashboard");

  return (
    <>
      <div className="flex flex-col items-center justify-center space-y-3 text-center mb-8">
        <span className="font-mono text-[10px] font-semibold tracking-widest text-lp-accent bg-lp-accent/10 px-3 py-1 rounded-full ring-1 ring-lp-accent/20 uppercase">
          // INTERVIEW ACTIVE
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-lp-text capitalize">
          {interview.role} Interview
        </h1>
      </div>

      <Agent
        userName={user.name}
        userId={user.id}
        interviewId={id}
        feedbackId={undefined}
        type="interview"
        questions={interview.questions}
        role={interview.role}
        level={interview.level}
        techstack={interview.techstack}
      />
    </>
  );
};

export default InterviewPage;
