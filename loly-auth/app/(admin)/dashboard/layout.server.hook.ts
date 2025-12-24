import { ServerLoader } from "@lolyjs/core";

export const getServerSideProps: ServerLoader = async (ctx) => {
    // Get session from middleware (attached to ctx.locals)
    const session = ctx.locals?.session || null;
    const user = ctx.locals?.user || null;

    if (!user || !session) {
        return ctx.Redirect("/");
    }
  
    return {
      props: {
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
  