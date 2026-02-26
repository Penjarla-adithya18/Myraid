import { handleRouteError, ok } from "@/lib/api";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearAuthCookie();
    return ok({ message: "Logged out" });
  } catch (error) {
    return handleRouteError(error);
  }
}
