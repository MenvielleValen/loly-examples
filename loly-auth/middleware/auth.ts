import type { RouteMiddleware, ApiMiddleware } from "@lolyjs/core";
import { getSessionAndUser as getSessionAndUserFromAuth } from "@/lib/auth";
import type { Request as ExpressRequest } from "express";

/**
 * Helper function to get session and user from an Express request
 * Returns { session, user } or { session: null, user: null } on error
 */
export async function getSessionAndUser(
  req: ExpressRequest
): Promise<{ session: any | null; user: any }> {
  return await getSessionAndUserFromAuth(req);
}

/**
 * Route middleware to get the current session and attach it to ctx.locals
 * Use this in layout.server.hook.ts or page.server.hook.ts via beforeServerData
 * 
 * @example
 * ```ts
 * import { getSessionMiddleware } from "@/middleware/auth";
 * export const beforeServerData = [getSessionMiddleware];
 * ```
 */
export const getSessionMiddleware: RouteMiddleware = async (ctx, next) => {
  const { session, user } = await getSessionAndUser(ctx.req);
  ctx.locals.session = session;
  ctx.locals.user = user;
  await next();
};

/**
 * API middleware to get the current session and attach it to ctx.locals
 * Use this in API routes via beforeApi
 * 
 * @example
 * ```ts
 * import { getSessionApiMiddleware } from "@/middleware/auth";
 * export const beforeApi = [getSessionApiMiddleware];
 * ```
 */
export const getSessionApiMiddleware: ApiMiddleware = async (ctx, next) => {
  const { session, user } = await getSessionAndUser(ctx.req);
  ctx.locals.session = session;
  ctx.locals.user = user;
  await next();
};

