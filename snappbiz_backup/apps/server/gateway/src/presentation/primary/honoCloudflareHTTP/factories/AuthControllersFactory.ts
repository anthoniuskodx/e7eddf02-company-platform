import type { EnvBindings } from "../../../../envBindings";
import { AuthController } from "../controllers/AuthController";

export const createAuthController = (bindings: EnvBindings): AuthController => {
  const authController = new AuthController();

  return authController;
};