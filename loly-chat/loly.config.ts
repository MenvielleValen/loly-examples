import { ServerConfig } from "@lolyjs/core";

/**
 * Default server configuration.
 * Applied to both development and production environments.
 */
const DEFAULT_CONFIG: ServerConfig = {
  bodyLimit: "1mb",
  corsOrigin: "*",
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Maximum requests per window
    strictMax: 5, // Strict limit for specific patterns
    strictPatterns: [],
  },
};

/**
 * Production configuration for Render.com deployment.
 * 
 * Features:
 * - Restricted CORS to production domain
 * - WebSocket enabled with security settings
 * - Single instance mode (no Redis required)
 * - Rate limiting for WebSocket connections
 */
const PROD_CONFIG: ServerConfig = {
  corsOrigin: ["https://loly-chat.onrender.com"],
  realtime: {
    enabled: true,
    
    // Socket.IO settings
    path: "/wss",
    transports: ["websocket", "polling"],
    
    // Security - only allow connections from production domain
    allowedOrigins: ["https://loly-chat.onrender.com"],
    
    // Single instance mode (no Redis required for horizontal scaling)
    scale: {
      mode: "single",
    },
    
    // Rate limiting for WebSocket connections
    limits: {
      connectionsPerIp: 20,
      eventsPerSecond: 30,
      burst: 60,
    },
  },
};

/**
 * Development configuration.
 * More permissive settings for local development.
 */
const DEV_CONFIG: ServerConfig = {
  // In development, allow all origins (localhost, etc.)
  corsOrigin: "*",
  realtime: {
    enabled: true,
    allowedOrigins: "*", // Allow localhost in development
  },
};

/**
 * Server configuration factory.
 * 
 * Returns the appropriate configuration based on the environment.
 * 
 * @param env - Environment string ("development" or "production")
 * @returns ServerConfig - Merged configuration object
 */
export const config = (env: string): ServerConfig => {
  const isDev = env === "development";

  const lolyConfig = isDev ? DEV_CONFIG : PROD_CONFIG;

  return {
    ...DEFAULT_CONFIG,
    ...lolyConfig,
  };
};
