import { defineWssRoute } from "@lolyjs/core";

export default defineWssRoute({
  auth: async (ctx) => {
    const user = ctx.req.cookies?.["user"] || null;
    if (!user) return null;
    const [name, id] = user.split("-");
    return {
      id: id,
      name: name,
    };
  },

  events: {
    message: {
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        ctx.actions.emit("message", {
            ...ctx.data,
            userId: ctx.user?.id,
            userName: ctx.user?.name,
        });
      },
    },
  },
});
