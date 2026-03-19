import Image from "next/image";
import dayjs from "dayjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { redirect } from "next/navigation";

async function FeedbackPage({ params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const [interview, feedback] = await Promise.all([
    getInterviewById(id),
    getFeedbackByInterviewId({ interviewId: id, userId: user.id }),
  ]);

  if (!interview) redirect("/");

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on your{" "}
          <span className="capitalize text-primary-200">{interview.role}</span>{" "}
          Interview
        </h1>
      </div>

      {feedback ? (
        <>
          {/* Overall Score */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p className="text-4xl font-bold text-primary-200">
                {feedback.totalScore}
                <span className="text-xl text-light-400">/100</span>
              </p>
            </div>
            <p className="text-light-400">
              {dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")}
            </p>
          </div>

          {/* Final Assessment */}
          <div className="card-border">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-3">Final Assessment</h2>
              <p className="text-lg leading-7">{feedback.finalAssessment}</p>
            </div>
          </div>

          {/* Category Scores */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Category Breakdown</h2>
            <div className="flex flex-wrap gap-4">
              {feedback.categoryScores.map((category, index) => (
                <div key={index} className="card-border flex-1 min-w-[280px]">
                  <div className="card p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{category.name}</h3>
                      <span className="text-primary-200 font-bold">
                        {category.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-dark-300 rounded-full h-2">
                      <div
                        className="progress"
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                    <p className="text-sm text-light-400">{category.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="card-border flex-1">
              <div className="card p-5">
                <h2 className="text-xl font-semibold mb-3 text-success-100">
                  Strengths
                </h2>
                <ul className="flex flex-col gap-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card-border flex-1">
              <div className="card p-5">
                <h2 className="text-xl font-semibold mb-3 text-destructive-100">
                  Areas for Improvement
                </h2>
                <ul className="flex flex-col gap-2">
                  {feedback.areasForImprovement.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="buttons">
            <Button className="btn-primary" asChild>
              <Link href="/">Back to Dashboard</Link>
            </Button>
            <Button className="btn-secondary" asChild>
              <Link href={`/interview/${id}`}>Retake Interview</Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-xl text-light-400">
            No feedback available yet. Take the interview first!
          </p>
          <Button className="btn-primary" asChild>
            <Link href={`/interview/${id}`}>Start Interview</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

export default FeedbackPage;
