import clientPromise from "./lib/mongodb";

/**
 * Server initialization hook
 * This runs once when the server starts.
 * Use this to initialize databases, services, or other setup tasks.
 */
export async function init() {
  try {
    // Initialize MongoDB connection
    const client = await clientPromise;
    // Test the connection
    await client.db().admin().ping();
    console.log("✅ MongoDB connected successfully");
    
    // Better Auth initializes automatically when imported
    console.log("✅ Better Auth initialized");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
  
  console.log("🚀 Application initialized");
}
