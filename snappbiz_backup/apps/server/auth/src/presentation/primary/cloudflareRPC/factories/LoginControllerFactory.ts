import { Scrypt } from "@snappbiz/crypto";

import type { EnvBindings } from "../../../../envBindings";
import { SuperAdminRepository } from "../../../secondary/CloudflareD1/SuperAdminRepository";
import { LoginSuperAdminUseCase } from "../../../../application/usecases/LoginSuperAdminUseCase";

import { LoginHandler } from "../handlers/LoginHandler";

import { CloudflareD1DB } from "../../../../infrastructure/CloudflareD1DB/DrizzleD1DB";

export const LoginControllerFactory = (bindings: EnvBindings): LoginHandler => {
    const authDB = bindings.AuthDB;

    if (!authDB) {
        throw new Error('AuthDB is not defined');
    }

    const cloudflareD1DB = new CloudflareD1DB(authDB);
    const superAdminRepository = new SuperAdminRepository(cloudflareD1DB.db);

    const loginSuperAdminUseCase = new LoginSuperAdminUseCase(superAdminRepository);
    const loginHandler = new LoginHandler(loginSuperAdminUseCase);

    return loginHandler;
};