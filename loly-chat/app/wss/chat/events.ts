import { defineWssRoute } from "@lolyjs/core";
import { z } from "zod";

/**
 * WebSocket route for real-time chat communication.
 * 
 * Features:
 * - Cookie-based authentication
 * - Message validation with Zod schema
 * - Broadcast messages to all connected clients
 */
export default defineWssRoute({
  /**
   * Authentication handler - extracts user from cookie.
   * Cookie format: "name-id"
   */
  auth: async (ctx) => {
    const user = ctx.req.cookies?.["user"] || null;
    if (!user) return null;
    
    // Safely parse user from cookie format "name-id"
    const parts = user.split("-");
    if (parts.length < 2) return null;
    
    return {
      name: parts[0] || "",
      id: parts.slice(1).join("-") || "", // Handle IDs that might contain dashes
    };
  },

  events: {
    message: {
      /**
       * Validation schema for message events.
       * Ensures content is a non-empty string and validates timestamp/id format.
       */
      schema: z.object({
        content: z.string().min(1).max(1000),
        timestamp: z.union([z.string(), z.date()]).optional(),
        id: z.string().uuid().optional(),
      }),
      
      /**
       * Guard - only authenticated users can send messages.
       */
      guard: ({ user }) => !!user,
      
      /**
       * Handler - broadcasts message to all connected clients.
       * Adds user information (userId, userName) to the message.
       */
      handler: (ctx) => {
        ctx.actions.emit("message", {
          ...ctx.data,
          userId: ctx.user?.id,
          userName: ctx.user?.name,
        });
      },
    },
  },
});
