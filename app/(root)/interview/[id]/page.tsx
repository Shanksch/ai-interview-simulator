import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";

const InterviewPage = async ({ params }: RouteParams) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const interview = await getInterviewById(id);

  if (!interview) redirect("/");

  return (
    <>
      <h3 className="capitalize">{interview.role} Interview</h3>

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
