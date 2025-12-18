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
};

// Configuración para producción en Render.com
const PROD_CONFIG: ServerConfig = {
  corsOrigin: ["https://loly-chat.onrender.com"],
  realtime: {
    enabled: true,
    
    // Socket.IO settings
    path: "/wss",
    transports: ["websocket", "polling"],
    
    // Security - solo permitir conexiones desde tu dominio
    allowedOrigins: ["https://loly-chat.onrender.com"],
    
    // Single instance mode (sin Redis)
    scale: {
      mode: "single",
    },
    
    // Rate limiting
    limits: {
      connectionsPerIp: 20,
      eventsPerSecond: 30,
      burst: 60,
    },
  },
};

const DEV_CONFIG: ServerConfig = {
  // En desarrollo, permite localhost
  corsOrigin: "*",
  realtime: {
    enabled: true,
    allowedOrigins: "*", // Permite localhost en desarrollo
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
