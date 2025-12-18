import { ApiContext } from "@lolyjs/core";

export const POST = async (ctx: ApiContext) => {
  const { name } = await ctx.req.body;

  if (!name) {
    return ctx.Response({ error: "Name is required" }, 400);
  }

  const randomId = crypto.randomUUID();

  ctx.res.cookie("user", `${name}-${randomId}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  return ctx.Response({ message: "ok", id: randomId });
};
