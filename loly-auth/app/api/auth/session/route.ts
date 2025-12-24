import type { ApiContext } from "@lolyjs/core";
import { getAuth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export async function GET(ctx: ApiContext) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(ctx.req.headers),
    });

    return ctx.Response({ session }, 200);
  } catch (error) {
    console.error("Get session error:", error);
    return ctx.Response(
      { session: null, error: "Failed to get session" },
      500
    );
  }
}
