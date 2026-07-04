export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "RATE_LIMITED" | "VALIDATION_ERROR" | "INTERNAL_ERROR",
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return Response.json(
      { error: err.message, code: err.code, details: err.details },
      { status: err.statusCode }
    );
  }

  console.error("Unhandled API Error:", err);
  return Response.json(
    { error: "Sunucu içi bir hata oluştu.", code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}
