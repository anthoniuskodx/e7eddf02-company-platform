import { HonoServer } from "./presentation/primary/honoCloudflareHTTP/HonoServer";
// import config from "../../utils/config";

// Run Hono server on port 3000, cannot use async/await that's why we run it separately
const server = HonoServer.run();

export default {
  // port: config.BACKEND_API_PORT,
  fetch: server.fetch,
  scheduled: async (batch: any, env: any) => {},
};
