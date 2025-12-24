import type { ApiContext } from "@lolyjs/core";
import { getSessionApiMiddleware } from "@/middleware/auth";

/**
 * API middleware to get session and attach it to ctx.locals
 * This is needed because global middleware doesn't share ctx with API routes
 */
export const beforeApi = [getSessionApiMiddleware];

/**
 * API route to save changes
 * 
 * Validates that the user is authenticated before allowing the save operation.
 * Returns 401 Unauthorized if the user is not authenticated.
 * 
 * @route POST /api/save
 * @body { [key: string]: any } - Data to save
 * @returns { success: boolean, message: string } - Success response
 */
export async function POST(ctx: ApiContext) {
  // Validate authentication - user is available from beforeApi middleware
  const user = ctx.locals?.user;
  
  if (!user) {
    return ctx.Response(
      { error: "Unauthorized", message: "You must be authenticated to save changes" },
      401
    );
  }

  // Get the data to save from the request body
  const data = await ctx.req.body;

  // Simulate saving changes (in a real app, you would save to database here)
  // For now, we just return a success response
  
  return ctx.Response(
    {
      success: true,
      message: "Changes saved successfully",
      userId: user.id,
      savedAt: new Date().toISOString(),
    },
    200
  );
}

