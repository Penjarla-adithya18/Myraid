import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { ApiError } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

type TokenPayload = {
  userId: string;
  email: string;
};

export const hashPassword = (value: string) => bcrypt.hash(value, 12);

export const comparePassword = (value: string, hash: string) => bcrypt.compare(value, hash);

export const signAccessToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired session", "UNAUTHORIZED");
  }
};

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });
};

export const getAuthenticatedUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  return verifyAccessToken(token);
};

export const authCookieName = AUTH_COOKIE_NAME;
