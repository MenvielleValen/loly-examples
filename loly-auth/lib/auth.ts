import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb";
import { fromNodeHeaders } from "better-auth/node";
import type { Request as ExpressRequest } from "express";

/**
 * Validates that all required environment variables are set.
 * @throws {Error} If any required environment variable is missing
 */
function assertEnv(): void {
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("Missing BETTER_AUTH_SECRET environment variable");
  }
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)");
  }
  if (!process.env.BETTER_AUTH_URL) {
    throw new Error("Missing BETTER_AUTH_URL environment variable");
  }
}

/**
 * Lazy-initialized Better Auth instance.
 * With native ESM support, we use lazy initialization that's cached automatically.
 * The module-scoped promise ensures it's only initialized once.
 */
let authPromise: Promise<ReturnType<typeof betterAuth>> | null = null;

/**
 * Gets or initializes the Better Auth instance.
 * This function uses lazy initialization to ensure Better Auth is only initialized once,
 * even if called multiple times. The initialization is cached at the module level.
 * 
 * @returns {Promise<ReturnType<typeof betterAuth>>} The Better Auth instance
 * @throws {Error} If required environment variables are missing or initialization fails
 */
function getAuth(): Promise<ReturnType<typeof betterAuth>> {
  if (!authPromise) {
    authPromise = (async () => {
      try {
        assertEnv();
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME || "loly-auth");

        return betterAuth({
          database: mongodbAdapter(db),
          secret: process.env.BETTER_AUTH_SECRET!,
          baseURL: process.env.BETTER_AUTH_URL!,
          basePath: "/api/auth",
          socialProviders: {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID!,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
          },
        });
      } catch (error) {
        // Reset promise on error so it can be retried
        authPromise = null;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Failed to initialize Better Auth: ${errorMessage}`);
      }
    })();
  }
  return authPromise;
}

export { getAuth };

/**
 * Gets the current session from the request headers.
 * 
 * @param {ExpressRequest} req - The Express request object
 * @returns {Promise<any | null>} The session object if found, null otherwise
 */
export async function getSession(req: ExpressRequest): Promise<any | null> {
  try {
    const auth = await getAuth();
    return await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  } catch (error) {
    // Log error in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting session:", error);
    }
    return null;
  }
}

/**
 * Gets both the session and user from the request headers.
 * 
 * @param {ExpressRequest} req - The Express request object
 * @returns {Promise<{ session: any | null; user: any | null }>} Object containing session and user, or null values if not found
 */
export async function getSessionAndUser(
  req: ExpressRequest
): Promise<{ session: any | null; user: any | null }> {
  try {
    const auth = await getAuth();
    const headers = fromNodeHeaders(req.headers);
    const sessionResponse = await auth.api.getSession({ headers });
    
    // Better Auth returns { session: {...}, user: {...} } structure
    // Extract the actual session and user objects
    const actualSession = (sessionResponse as any)?.session ?? null;
    const actualUser = (sessionResponse as any)?.user ?? null;
    
    return { 
      session: actualSession, 
      user: actualUser 
    };
  } catch (error) {
    // Log error in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting session and user:", error);
    }
    return { session: null, user: null };
  }
}
