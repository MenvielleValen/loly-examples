import { ApiContext } from "@lolyjs/core";

/**
 * User logout API route.
 * 
 * Clears the authenticated session by removing the user cookie.
 * 
 * @route POST /api/user/logout
 * @returns { message: string } - Success response
 */
export const POST = async (ctx: ApiContext) => {
  // Clear user cookie by setting it to empty with maxAge 0
  ctx.res.cookie("user", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, // Immediately expire the cookie
  });

  return ctx.Response({ message: "ok" });
};
