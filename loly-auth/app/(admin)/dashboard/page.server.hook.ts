import { ServerLoader } from "@lolyjs/core";

export const getServerSideProps: ServerLoader = async (ctx) => {
  // Session validation and user are handled by layout.server.hook.ts
  // User is available through the layout tree
  return {
    props: {},
  };
};


