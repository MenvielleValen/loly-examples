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
        // Allow blob: for images (Phaser uses blob URLs for loaded assets)
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        // Allow blob: for fetch/XHR and WebSockets
        connectSrc: ["'self'", "ws:", "wss:", "https:", "blob:"],
        // Allow blob: for media (video/audio)
        mediaSrc: ["'self'", "https:", "blob:"],
        // Allow unsafe-inline and unsafe-eval for scripts (Phaser needs this)
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        // Allow unsafe-inline for styles
        styleSrc: ["'self'", "'unsafe-inline'"],
        // Allow fonts
        fontSrc: ["'self'", "data:"],
      },
    },
  },
};

// Configuración simple - el framework auto-detecta localhost
// Solo configura esto si despliegas a producción real
const PROD_CONFIG: ServerConfig = {
  corsOrigin: ["https://loly-office.onrender.com"],
  realtime: {
    enabled: true,
    
    // Socket.IO settings
    path: "/wss",
    transports: ["websocket", "polling"],
    
    // Security - only allow connections from production domain
    allowedOrigins: ["https://loly-office.onrender.com"],
    
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

const DEV_CONFIG: ServerConfig = {
  // In development, allow all origins (localhost, etc.)
  corsOrigin: "*",
  realtime: {
    enabled: true,
    allowedOrigins: "*",
  },
};

export const config = (env: string): ServerConfig => {
  const isDev = env === "development";

  const lolyConfig = isDev ? DEV_CONFIG : PROD_CONFIG;

  return {
    ...DEFAULT_CONFIG,
    ...lolyConfig,
  };
};
