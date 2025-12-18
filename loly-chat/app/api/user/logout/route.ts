import { ApiContext } from "@lolyjs/core";

export const POST = async (ctx: ApiContext) => {
  ctx.res.cookie("user", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  return ctx.Response({ message: "ok" });
};
