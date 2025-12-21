import type { ApiContext } from "@lolyjs/core";
import { z } from "zod";

const setupSchema = z.object({
  name: z.string().min(1).max(50).trim(),
});

export async function POST(ctx: ApiContext) {
  try {
    const body = await ctx.req.body;
    const { name } = setupSchema.parse(body);

    // Clear any existing user cookie first
    ctx.res.cookie("user", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    // Generate unique ID
    const id = crypto.randomUUID();

    // Set cookie with user info (format: "name-id")
    ctx.res.cookie("user", `${name}-${id}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return ctx.Response({ id, name }, 200);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ctx.Response({ error: "Invalid name. Must be 1-50 characters." }, 400);
    }
    console.error(error);
    return ctx.Response({ error: "Failed to setup user" }, 500);
  }
}

