import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb";
import { fromNodeHeaders } from "better-auth/node";
import type { Request as ExpressRequest } from "express";

function assertEnv() {
  if (!process.env.BETTER_AUTH_SECRET) throw new Error("Missing BETTER_AUTH_SECRET");
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth credentials");
  }
  if (!process.env.BETTER_AUTH_URL) throw new Error("Missing BETTER_AUTH_URL");
}

// With native ESM support, we use lazy initialization that's cached automatically
// The module-scoped promise ensures it's only initialized once
let authPromise: Promise<ReturnType<typeof betterAuth>> | null = null;

function getAuth() {
  if (!authPromise) {
    authPromise = (async () => {
      assertEnv();
      const client = await clientPromise; // MongoClient
      const db = client.db(process.env.MONGODB_DB_NAME || "loly-auth"); // Db

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
    })();
  }
  return authPromise;
}

// Export the getter function
// With ESM, module-level caching ensures this only initializes once
export { getAuth };

// Helpers
export async function getSession(req: ExpressRequest) {
  try {
    const auth = await getAuth();
    return await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  } catch {
    return null;
  }
}

export async function getSessionAndUser(req: ExpressRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    return { session: session ?? null, user: session?.user ?? null };
  } catch {
    return { session: null, user: null };
  }
}
