import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );

export const fail = (status: number, message: string, code = "ERROR") =>
  NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );

export const handleRouteError = (error: unknown) => {
  if (error instanceof ApiError) {
    return fail(error.status, error.message, error.code);
  }

  if (error instanceof ZodError) {
    return fail(400, "Validation failed", "VALIDATION_ERROR");
  }

  return fail(500, "Internal server error", "INTERNAL_SERVER_ERROR");
};
