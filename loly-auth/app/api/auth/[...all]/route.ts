import type { ApiContext } from "@lolyjs/core";
import { getAuth } from "@/lib/auth";

async function handleAuth(ctx: ApiContext) {
  const auth = await getAuth();
  const base = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const url = new URL(ctx.req.originalUrl || ctx.req.url || "/api/auth", base);

  const request = new Request(url.toString(), {
    method: ctx.req.method,
    headers: ctx.req.headers as any,
    body:
      ctx.req.method === "GET" || ctx.req.method === "HEAD"
        ? undefined
        : ctx.req.body
        ? JSON.stringify(ctx.req.body)
        : undefined,
  });

  const response = await auth.handler(request);

  ctx.res.status(response.status);
  response.headers.forEach((value, key) => {
    ctx.res.setHeader(key, value);
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  ctx.res.send(buffer);
}

export async function GET(ctx: ApiContext) {
  await handleAuth(ctx);
}

export async function POST(ctx: ApiContext) {
  await handleAuth(ctx);
}
