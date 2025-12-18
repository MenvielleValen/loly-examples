import { InitServerData } from "@lolyjs/core";
import * as cron from "node-cron";

export async function init({
  serverContext,
}: {
  serverContext: InitServerData;
}) {
  const baseUrl = process.env.PUBLIC_WS_BASE_URL || 
                  "http://localhost:3000";
  
  // Health check endpoint URL
  const healthUrl = `${baseUrl}/api/health?from=health`;
  
  // Schedule health check every 12 minutes
  // Cron expression: */12 * * * * means "every 12 minutes"
  cron.schedule("*/12 * * * *", async () => {
    try {
      const response = await fetch(healthUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Loly-Health-Check/1.0",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[Health Check] ${new Date().toISOString()} - Status: OK`, data);
      } else {
        console.error(`[Health Check] ${new Date().toISOString()} - Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`[Health Check] ${new Date().toISOString()} - Error:`, error instanceof Error ? error.message : "Unknown error");
    }
  });
  
  console.log("[Health Check] Cron job scheduled: every 12 minutes");
  console.log(`[Health Check] Endpoint: ${healthUrl}`);
}
