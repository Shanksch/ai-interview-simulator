import { formatErrorResponse } from "@/lib/errors";
import { getInterviewById } from "@/lib/services/interview.service";

export async function GET(
  request: Request,
  { params }: { params: { sessionId?: string } }
) {
  try {
    const sessionId = params?.sessionId;
    if (!sessionId) {
      return Response.json(
        { success: false, error: "sessionId is required" },
        { status: 400 }
      );
    }

    const session = await getInterviewById(sessionId);
    if (!session) {
      return Response.json(
        { success: false, error: "Interview session not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        session: {
          sessionId: session.id,
          role: session.role,
          level: session.level,
          techstack: session.techstack,
          type: session.type,
          questions: session.questions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return Response.json(errorResponse, { status: errorResponse.statusCode });
  }
}
