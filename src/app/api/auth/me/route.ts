import { handleRouteError, ok } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    return ok({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
