import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from '@hono/swagger-ui'

import { cors } from 'hono/cors';

// Logger section
import { logger as honoLogger } from "hono/logger";

import mainRoutes from "./routes/MainRoute";

export class HonoServer {
    public static run(): OpenAPIHono {
        const app = new OpenAPIHono({
            defaultHook: (result, c) => {
                if (!result.success) {
                    return c.json(
                        {
                            code: 400,
                            message: "Validation Error",
                        },
                        400
                    )
                }
            },
        }); // Use OpenAPIHono instead of Hono

        app.use(cors());

        // Middleware
        app.use(honoLogger()); // Use the middleware correctly

        app.route('/v1', mainRoutes)

        // OpenAPI documentation endpoint
        app.doc("/doc", {
            openapi: "3.0.0",
            info: {
                version: "1.0.0",
                title: "Fides Loyalty API",
            }
        });

        app.get('/ui', swaggerUI({ url: '/doc' }))

        return app;
    }
}