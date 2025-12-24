import type { GlobalMiddleware } from "@lolyjs/core";
import { getSessionAndUser } from "@/middleware/auth";

/**
 * Global middleware to get the current session and attach it to ctx.locals
 * 
 * This middleware executes ALWAYS on every request (both SSR and SPA navigation),
 * ensuring that ctx.locals.session and ctx.locals.user are available consistently
 * throughout the application.
 * 
 * NOTE: This only applies to page routes (layout.server.hook.ts and page.server.hook.ts).
 * API routes need to use getSessionApiMiddleware from @/middleware/auth in their beforeApi.
 * 
 * File location: global.middleware.ts (in the root of the project)
 */
export const globalMiddlewares: GlobalMiddleware[] = [
  async (ctx, next) => {
    const { session, user } = await getSessionAndUser(ctx.req);
    ctx.locals.session = session;
    ctx.locals.user = user;
    await next();
  },
];

