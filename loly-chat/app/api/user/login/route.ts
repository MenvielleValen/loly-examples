import { ApiContext } from "@lolyjs/core";

/**
 * User login API route.
 * 
 * Creates an authenticated session by:
 * 1. Validating the user's name
 * 2. Generating a unique user ID
 * 3. Setting a secure HTTP-only cookie with format "name-id"
 * 
 * @route POST /api/user/login
 * @body { name: string } - User's display name
 * @returns { message: string, id: string } - Success response with user ID
 */
export const POST = async (ctx: ApiContext) => {
  const { name } = await ctx.req.body;

  if (!name) {
    return ctx.Response({ error: "Name is required" }, 400);
  }

  const randomId = crypto.randomUUID();

  // Set secure cookie with user information
  // Format: "name-id" (e.g., "John-abc123")
  ctx.res.cookie("user", `${name}-${randomId}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  return ctx.Response({ message: "ok", id: randomId });
};
