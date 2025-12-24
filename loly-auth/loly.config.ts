import { ServerConfig } from "@lolyjs/core";

const DEFAULT_CONFIG: ServerConfig = {
  bodyLimit: "1mb",
  corsOrigin: "*",
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 1000,
    strictMax: 5,
    strictPatterns: [],
  },
  security: {
    contentSecurityPolicy: {
      directives: {
        // Note: formAction is not specified, allowing form submissions to same origin
        // This is necessary for Better Auth OAuth flows
        // Allow images from self, data URIs, and HTTPS
        imgSrc: ["'self'", "data:", "https:"],
        // Allow connections to self, WebSockets, and HTTPS
        connectSrc: ["'self'", "ws:", "wss:", "https:"],
        // Allow scripts from self
        scriptSrc: ["'self'"],
        // Allow inline styles
        styleSrc: ["'self'", "'unsafe-inline'"],
        // Allow fonts from self and data URIs
        fontSrc: ["'self'", "data:"],

        formAction: ["'self'", "https://accounts.google.com"], 
      },
    },
  },
};

// Simple configuration - the framework auto-detects localhost
// Only configure this if you're deploying to production
const PROD_CONFIG: ServerConfig = {
  // In real production, uncomment and configure your domain:
  // corsOrigin: ["https://your-domain.com"],
  // realtime: {
  //   allowedOrigins: ["https://your-domain.com"],
  // },
};

const DEV_CONFIG: ServerConfig = {};

export const config = (env: string): ServerConfig => {
  const isDev = env === "development";

  const lolyConfig = isDev ? DEV_CONFIG : PROD_CONFIG;

  return {
    ...DEFAULT_CONFIG,
    ...lolyConfig,
  };
};
