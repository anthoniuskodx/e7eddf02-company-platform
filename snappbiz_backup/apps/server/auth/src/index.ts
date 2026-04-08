import { WorkerEntrypoint } from "cloudflare:workers";

import type { ExecutionContext } from "@cloudflare/workers-types";
import type { EnvBindings } from "./envBindings";

import type { ISuperadminRegisterDto } from "@snappbiz/auth";
import type { ISuperadminLoginDto } from "@snappbiz/auth";

import { RegisterControllerFactory } from "./presentation/primary/cloudflareRPC/factories/RegisterControllerFactory";
import { LoginControllerFactory } from "./presentation/primary/cloudflareRPC/factories/LoginControllerFactory";

export class AuthWorker extends WorkerEntrypoint {
  env: EnvBindings;

  constructor(ctx: ExecutionContext, env: unknown) {
    super(ctx, env);
    this.env = env as EnvBindings;
  }

  async registerSuperAdmin(payload: ISuperadminRegisterDto) {
    // @ts-ignore
    const registerHandler = RegisterControllerFactory(this.env);

    const handler = await registerHandler.registerSuperAdmin(payload);

    const jsonBytes = new TextEncoder().encode(JSON.stringify(handler)); // Convert LoggedInDTO to bytes
    return new Response(jsonBytes, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async registerTenantAdmin(method: string, identifier: string, password?: string) {
    return true;
  }

  async registerUser(method: string, identifier: string, password?: string) {
    return true;
  }

  async loginPhoneWithPassword() {
    return true;
  }

  async loginSuperAdmin(payload: ISuperadminLoginDto) {
    // @ts-ignore
    const loginHandler = LoginControllerFactory(this.env);

    const handler = await loginHandler.loginSuperAdmin(payload, this.env);

    const jsonBytes = new TextEncoder().encode(JSON.stringify(handler)); // Convert LoggedInDTO to bytes
    return new Response(jsonBytes, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export default {
  async fetch() {
    return new Response("ok");
  }
}