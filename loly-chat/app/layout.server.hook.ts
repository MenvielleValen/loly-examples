import type { RouteMiddleware, ServerLoader } from "@lolyjs/core";

const GITHUB_URL = "https://github.com/MenvielleValen/loly-examples/tree/main/loly-chat";

export const beforeServerData: RouteMiddleware[] = [
  async (ctx, next) => {  
    // Authentication
    const user = ctx.req?.cookies?.["user"] || null;

    ctx.locals.user = user;

    await next();
  },
];

/**
 * Layout server hook - provides stable data that persists across page navigations.
 * This data is available to both the layout and all pages.
 *
 * File location: app/layout.server.hook.ts (same directory as app/layout.tsx)
 *
 * NOTE: Metadata defined here acts as BASE/fallback for all pages.
 * Pages can override specific fields, but layout metadata provides defaults.
 */
export const getServerSideProps: ServerLoader = async (ctx) => {
  return {
    props: {
      // App name - available in layout and all pages
      appName: "Loly Chat",

      user: {
        id: ctx.locals.user?.split("-")[1],
        name: ctx.locals.user?.split("-")[0],
      },

      // Navigation items - customize as needed
      navigation: [
        { href: "/", label: "Home" },
        { href: "/chat", label: "Chat Room" },
      ],

      githubUrl: GITHUB_URL,
    },

    // Layout-level metadata - provides BASE defaults for all pages
    metadata: {
      // Site-wide defaults
      description:
        "A modern full-stack React framework with native WebSocket support.",
      lang: "en",
      robots: "index, follow",
      themeColor: "#0a0a0a",

      // Open Graph defaults (site-wide)
      openGraph: {
        type: "website",
        siteName: "Loly App",
        locale: "en_US",
      },

      // Twitter Card defaults
      twitter: {
        card: "summary_large_image",
      },

      // Custom meta tags (site-wide)
      metaTags: [
        {
          name: "author",
          content: "Loly Framework",
        },
      ],
    },
  };
};
