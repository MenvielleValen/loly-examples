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
  // Safely parse user from cookie format "name-id"
  let user = { id: "", name: "" };
  if (ctx.locals.user) {
    const parts = ctx.locals.user.split("-");
    if (parts.length >= 2) {
      user = {
        name: parts[0] || "",
        id: parts.slice(1).join("-") || "", // Handle IDs that might contain dashes
      };
    }
  }

  return {
    props: {
      // App name - available in layout and all pages
      appName: "Loly Chat",

      user,

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
        "A production-ready example application showcasing Loly Framework's real-time WebSocket communication, authentication, and modern React patterns.",
      lang: "en",
      robots: "index, follow",
      themeColor: "#0a0a0a",

      // Open Graph defaults (site-wide)
      openGraph: {
        type: "website",
        siteName: "Loly Chat Example",
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
