import { ApiError, handleRouteError, ok } from "@/lib/api";
import { comparePassword, setAuthCookie, signAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: input.email.toLowerCase(),
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const validPassword = await comparePassword(input.password, user.passwordHash);

    if (!validPassword) {
      throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const token = signAccessToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return ok({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
