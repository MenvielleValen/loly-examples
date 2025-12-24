import { ServerLoader } from "@lolyjs/core";

export const getServerSideProps: ServerLoader = async (ctx) => {
  const session = ctx.locals?.session || null;
  const user = ctx.locals?.user || null;

  if (!user || !session) {
    return ctx.Redirect("/", true);
  }

  return {
    props: {
      user,
    },
  };
};

