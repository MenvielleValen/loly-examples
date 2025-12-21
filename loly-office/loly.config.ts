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

// Configuración simple - el framework auto-detecta localhost
// Solo configura esto si despliegas a producción real
const PROD_CONFIG: ServerConfig = {
  // En producción real, descomenta y configura tu dominio:
  // corsOrigin: ["https://tu-dominio.com"],
  realtime: {
    enabled: true,
    // En producción, configurar allowedOrigins específicos:
    // allowedOrigins: ["https://tu-dominio.com"],
    allowedOrigins: "*", // Temporal para desarrollo
    // Rate limiting para WebSocket connections
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
