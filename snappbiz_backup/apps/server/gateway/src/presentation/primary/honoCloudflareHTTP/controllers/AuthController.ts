import type { Context } from "hono";
import type { ISuperAdminAPIAuthResult } from "@snappbiz/auth";

export class AuthController {
  async registerSuperAdminCloudflareRPC(c: Context) {
    try {
      const { username, email, password } = await c.req.json();
      if (!username || !email || !password) {
        return c.json({ success: false, error: 'Username, email, and password are required' }, 400);
      }

      // Call the worker through the JS RPC
      const result = await c.env.AUTH_WORKER.registerSuperAdmin({
        username,
        email,
        password,
        clientId: c.req.header('x-client-id')
      });

      // Convert the result to a JSON string from JSON bytes
      const jsonBytes = await result.arrayBuffer();
      const jsonString = new TextDecoder().decode(jsonBytes);
      const userParsedResult = JSON.parse(jsonString);

      if (userParsedResult.error) {
        return c.json({ success: false, error: userParsedResult.error }, 400);
      }

      const returnResult: ISuperAdminAPIAuthResult = {
        success: true,
        data: userParsedResult
      }

      return c.json(returnResult, 200);
    } catch (error) {
      console.error(error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  }

  async loginSuperAdminCloudflareRPC(c: Context) {
    try {
      // Call the worker through the JS RPC
      const { username, password } = await c.req.json();
      if (!username || !password) {
        return c.json({ success: false, error: 'Username and password are required' }, 400);
      }

      // Get the client ID from the header
      const result = await c.env.AUTH_WORKER.loginSuperAdmin({ username, password, clientId: c.req.header('x-client-id') });

      // Convert the result to a JSON string from JSON bytes
      const jsonBytes = await result.arrayBuffer();
      const jsonString = new TextDecoder().decode(jsonBytes);
      const userParsedResult = JSON.parse(jsonString);

      if (userParsedResult.error) {
        return c.json({ success: false, error: userParsedResult.error }, 400);
      }

      const returnResult: ISuperAdminAPIAuthResult = {
        success: true,
        data: userParsedResult
      }

      return c.json(returnResult, 200);
    } catch (error) {
      console.error(error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  }
}
