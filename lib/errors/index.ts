export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Authentication failed", context?: Record<string, unknown>) {
    super(message, 401, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource", context?: Record<string, unknown>) {
    super(`${resource} not found`, 404, true, context);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", context?: Record<string, unknown>) {
    super(message, 400, true, context);
  }
}

export class AIError extends AppError {
  constructor(message: string = "AI processing failed", context?: Record<string, unknown>) {
    super(message, 502, true, context);
  }
}

/** Format an error for API route responses */
export function formatErrorResponse(error: unknown): {
  success: false;
  error: string;
  statusCode: number;
} {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  console.error("Unexpected error:", error);
  return {
    success: false,
    error: "An unexpected error occurred",
    statusCode: 500,
  };
}

/** Format an error for server action responses */
export function formatActionError(error: unknown): {
  success: false;
  message: string;
} {
  if (error instanceof AppError) {
    return { success: false, message: error.message };
  }

  console.error("Unexpected error:", error);
  return { success: false, message: "An unexpected error occurred" };
}
