import type { ServerLoader } from "@lolyjs/core";

/**
 * Page server hook - provides data for the home page.
 * 
 * File location: app/page.server.hook.ts (same directory as app/page.tsx)
 * 
 * NOTE: Page metadata OVERRIDES layout metadata.
 * Layout provides defaults (like siteName, og:type, etc.), page provides specific values.
 */
export const getServerSideProps: ServerLoader = async () => {
  return {
    props: {},
    metadata: {
      // Page-specific title and description (overrides layout defaults)
      title: "Loly Chat Example | Real-time Chat App Built with Loly Framework",
      description:
        "A production-ready example application showcasing Loly Framework's real-time WebSocket communication, authentication, and modern React patterns. Built with Loly Framework - a modern full-stack React framework.",
      
      // Canonical URL for this page
      canonical: "/",
      
      // Open Graph - inherits og:type, og:siteName from layout, but overrides title/description
      openGraph: {
        title: "Loly Chat Example | Real-time Chat App Built with Loly Framework",
        description: "A production-ready example application showcasing Loly Framework's real-time WebSocket communication, authentication, and modern React patterns.",
        url: "/",
      },
      
      // Twitter Card - inherits card type from layout, but overrides content
      twitter: {
        title: "Loly Chat Example | Built with Loly Framework",
        description: "A production-ready example showcasing Loly Framework's real-time WebSocket communication and authentication.",
      },
      
      // Additional page-specific meta tags
      metaTags: [
        {
          name: "keywords",
          content: "loly framework, react, full-stack, websocket, real-time chat, example app, typescript, ssr, authentication",
        },
      ],
    },
  };
};
