import type { ApiContext } from "@lolyjs/core";

export async function GET(ctx: ApiContext) {
  return ctx.Response(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    },
    200
  );
}


