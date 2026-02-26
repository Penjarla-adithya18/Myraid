import { Prisma } from "@prisma/client";
import { ApiError, handleRouteError, ok } from "@/lib/api";
import { hashPassword, setAuthCookie, signAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    const token = signAccessToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return ok({ user }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return handleRouteError(new ApiError(409, "Email already in use", "EMAIL_CONFLICT"));
    }

    return handleRouteError(error);
  }
}
