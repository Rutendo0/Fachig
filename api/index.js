import { createServer } from "../server/index.js";

// Create the server instance
const app = createServer();

// Export for Vercel serverless functions
export default app;
