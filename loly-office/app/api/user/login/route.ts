import type { ApiContext } from "@lolyjs/core";
import { v4 as uuidv4 } from "uuid";

// Counter for anonymous users
let anonymousCounter = 1;

export async function POST(ctx: ApiContext) {
  try {
    const body = ctx.req.body as { name?: string } | undefined;
    const name = body?.name?.trim();

    let userId: string;
    let userName: string;

    if (name && name.length > 0) {
      // User provided a name
      userId = uuidv4();
      userName = name.substring(0, 50); // Limit name length
    } else {
      // Anonymous user
      userId = uuidv4();
      userName = `Anonymous${String(anonymousCounter).padStart(4, "0")}`;
      anonymousCounter++;
    }

    // Set cookie with user info (format: "name-id")
    const cookieValue = `${userName}-${userId}`;
    ctx.res.cookie("user", cookieValue, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      path: "/",
    });

    return ctx.Response({
      success: true,
      user: {
        id: userId,
        name: userName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return ctx.Response(
      {
        success: false,
        error: "Failed to create user session",
      },
      { status: 500 }
    );
  }
}

