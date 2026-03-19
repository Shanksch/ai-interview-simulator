import { z } from "zod";
import { generateQuestions } from "@/lib/services/interview.service";
import { formatErrorResponse } from "@/lib/errors";

const generateSchema = z.object({
  type: z.string(),
  role: z.string(),
  level: z.string(),
  techstack: z.string(),
  amount: z.number().int().positive().default(5),
  userid: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await generateQuestions(parsed.data);
    return Response.json(result, { status: 200 });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return Response.json(errorResponse, { status: errorResponse.statusCode });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "PrepWise API" }, { status: 200 });
}