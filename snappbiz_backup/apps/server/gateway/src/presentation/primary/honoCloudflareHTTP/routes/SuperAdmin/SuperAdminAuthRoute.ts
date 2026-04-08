import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { AuthController } from "../../controllers/AuthController";

import type { EnvBindings } from "../../../../../envBindings";
import type { ToZodSchema } from "@snappbiz/zod-ext";
import type { ISuperadminLoginDto } from "@snappbiz/auth";

const loginSuperAdminRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            username: z.string(),
            password: z.string(),
          } satisfies ToZodSchema<ISuperadminLoginDto>),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
    },
    401: {
      description: "Unauthorized",
    },
    500: { // Added 500 response
      description: "Internal Server Error",
    },
  },
});

const registerSuperAdminRoute = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            username: z.string(),
            email: z.string(),
            password: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
    },
    401: {
      description: "Unauthorized",
    },
    500: { // Added 500 response
      description: "Internal Server Error",
    },
  },
});

const SuperAdminRoutes = new OpenAPIHono<{ Bindings: EnvBindings }>();

// LOGIN AREA ADD MORE LOGIN ROUTES BELOW
SuperAdminRoutes.openapi(loginSuperAdminRoute, async (c) => {
  const authController = new AuthController();

  return authController.loginSuperAdminCloudflareRPC(c);
});
// ------------------------------------------------------------

// REGISTER AREA ADD MORE REGISTER ROUTES BELOW
SuperAdminRoutes.openapi(registerSuperAdminRoute, async (c) => {
  const authController = new AuthController();

  return authController.registerSuperAdminCloudflareRPC(c);
});
// ------------------------------------------------------------

export default SuperAdminRoutes;