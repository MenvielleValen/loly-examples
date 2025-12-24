import type { ServerLoader } from "@lolyjs/core";

/**
 * Layout server hook - provides stable data that persists across page navigations.
 * This data is available to both the layout and all pages.
 *
 * File location: app/layout.server.hook.ts (same directory as app/layout.tsx)
 *
 * NOTE: Metadata defined here acts as BASE/fallback for all pages.
 * Pages can override specific fields, but layout metadata provides defaults.
 * 
 * NOTE: Session and user are now available via global middleware (global.middleware.ts)
 * They are automatically attached to ctx.locals.session and ctx.locals.user on every request.
 */

export const getServerSideProps: ServerLoader = async (ctx) => {
  // Get session from middleware (attached to ctx.locals)
  const session = ctx.locals?.session || null;
  const user = ctx.locals?.user || null;

  return {
    props: {
      appName: "Loly Auth",
      navigation: [],
      session,
      user,
    },

    // Layout-level metadata - provides BASE defaults for all pages
    metadata: {
      // Site-wide defaults
      description: "A modern web application built with Loly Framework and Better Auth.",
      lang: "en",
      robots: "index, follow",
      themeColor: "#0a0a0a",

      // Open Graph defaults (site-wide)
      openGraph: {
        type: "website",
        siteName: "Loly Auth",
        locale: "en_US",
      },

      // Twitter Card defaults
      twitter: {
        card: "summary_large_image",
      },
    },
  };
};
