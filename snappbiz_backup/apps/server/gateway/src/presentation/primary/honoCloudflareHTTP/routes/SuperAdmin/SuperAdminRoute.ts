import { OpenAPIHono } from "@hono/zod-openapi";

import type { EnvBindings } from "../../../../../envBindings";
import superAdminAuthRoute from "./SuperAdminAuthRoute";

// Create OpenAPIHono instance
const superAdminRoutes = new OpenAPIHono<{ Bindings: EnvBindings }>();

superAdminRoutes.use(async (c, next) => {
    const superAdminKey = c.req.header('x-super-key')
    if (superAdminKey !== c.env.SUPERADMIN_KEY) {
        return c.json({ message: 'Invalid superadmin key' }, 401)
    }

    const clientId = c.req.header('x-client-id');
    if (!clientId) {
      return c.json({ success: false, error: 'Client ID is required' }, 400);
    }

    return next()
})
superAdminRoutes.route('/auth', superAdminAuthRoute)

export default superAdminRoutes;
