import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { AIError } from "@/lib/errors";

interface GenerateTextConfig {
  prompt: string;
  system?: string;
  model?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

interface GenerateObjectConfig<T extends z.ZodType> {
  prompt: string;
  system?: string;
  schema: T;
  model?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

// Groq model — fast inference with Llama 3.3 70B
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Sleep for exponential backoff: 1s, 2s, 4s...
 */
function backoffDelay(attempt: number): Promise<void> {
  const ms = Math.min(1000 * Math.pow(2, attempt), 10_000);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract JSON from a text response that might contain markdown code fences.
 */
function extractJSON(text: string): string {
  // Try to extract JSON from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // Try to find raw JSON object or array
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) return jsonMatch[1].trim();

  return text.trim();
}

/**
 * Generate raw text from an LLM with retry logic.
 */
export async function generateTextWithRetry(
  config: GenerateTextConfig
): Promise<string> {
  const {
    prompt,
    system,
    model = DEFAULT_MODEL,
    maxRetries = DEFAULT_MAX_RETRIES,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = config;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const { text, usage } = await generateText({
        model: groq(model),
        prompt,
        system,
        abortSignal: controller.signal,
      });

      clearTimeout(timeout);

      if (usage) {
        console.log(
          `[LLM] Model: ${model} | Tokens: ${usage.totalTokens} | Attempt: ${attempt + 1}`
        );
      }

      return text;
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `[LLM] Attempt ${attempt + 1}/${maxRetries} failed:`,
        (error as Error).message
      );

      if (attempt < maxRetries - 1) {
        await backoffDelay(attempt);
      }
    }
  }

  throw new AIError(`LLM generation failed after ${maxRetries} attempts`, {
    model,
    lastError: lastError?.message,
  });
}

/**
 * Generate a structured object from an LLM with retry logic.
 * Uses generateText + JSON parsing + Zod validation.
 *
 * This approach is more reliable with Groq than generateObject,
 * which requires response_format support that some models lack.
 */
export async function generateObjectWithRetry<T extends z.ZodType>(
  config: GenerateObjectConfig<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const {
    prompt,
    system,
    schema,
    model = DEFAULT_MODEL,
    maxRetries = DEFAULT_MAX_RETRIES,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = config;

  // Build a system prompt that enforces JSON output
  const jsonSystem = system
    ? `${system}\n\nIMPORTANT: You must respond with ONLY valid JSON. No explanation, no markdown, no extra text.`
    : "You must respond with ONLY valid JSON. No explanation, no markdown, no extra text.";

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use generateText and parse JSON manually
      const text = await generateTextWithRetry({
        prompt: `${prompt}\n\nRespond with ONLY valid JSON.`,
        system: jsonSystem,
        model,
        maxRetries: 1, // Don't nest retries
        timeoutMs,
      });

      // Extract and parse JSON from the response
      const jsonStr = extractJSON(text);
      const parsed = JSON.parse(jsonStr);

      // Validate against the Zod schema
      const validated = schema.parse(parsed);

      console.log(
        `[LLM] Structured output validated | Attempt: ${attempt + 1}`
      );

      return validated as z.infer<T>;
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `[LLM] Structured generation attempt ${attempt + 1}/${maxRetries} failed:`,
        (error as Error).message
      );

      if (attempt < maxRetries - 1) {
        await backoffDelay(attempt);
      }
    }
  }

  throw new AIError(
    `Structured LLM generation failed after ${maxRetries} attempts`,
    { model, lastError: lastError?.message }
  );
}
