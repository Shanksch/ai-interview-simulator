import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { AIError } from "@/lib/errors";

interface GenerateTextConfig {
  prompt: string;
  model?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

interface GenerateObjectConfig<T extends z.ZodType> {
  prompt: string;
  schema: T;
  model?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

const DEFAULT_MODEL = "gemini-2.0-flash-001";
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
 * Generate raw text from an LLM with retry logic.
 */
export async function generateTextWithRetry(
  config: GenerateTextConfig
): Promise<string> {
  const {
    prompt,
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
        model: google(model),
        prompt,
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
 * Uses Zod schema for validation.
 */
export async function generateObjectWithRetry<T extends z.ZodType>(
  config: GenerateObjectConfig<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const {
    prompt,
    schema,
    model = DEFAULT_MODEL,
    maxRetries = DEFAULT_MAX_RETRIES,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = config;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const { object, usage } = await generateObject({
        model: google(model),
        prompt,
        schema,
        abortSignal: controller.signal,
      });

      clearTimeout(timeout);

      if (usage) {
        console.log(
          `[LLM] Model: ${model} | Tokens: ${usage.totalTokens} | Attempt: ${attempt + 1}`
        );
      }

      return object as z.infer<T>;
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
