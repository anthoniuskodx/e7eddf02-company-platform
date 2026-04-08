import { Scrypt } from "@snappbiz/crypto";

import type { EnvBindings } from "../../../../envBindings";
import { SuperAdminRepository } from "../../../secondary/CloudflareD1/SuperAdminRepository";
import { RegisterSuperAdminUseCase } from "../../../../application/usecases/RegisterSuperAdminUseCase";

import { RegisterHandler } from "../handlers/RegisterHandler";

import { CloudflareD1DB } from "../../../../infrastructure/CloudflareD1DB/DrizzleD1DB";

export const RegisterControllerFactory = (bindings: EnvBindings): RegisterHandler => {
    const authDB = bindings.AuthDB;

    if (!authDB) {
        throw new Error('AuthDB is not defined');
    }

    const cloudflareD1DB = new CloudflareD1DB(authDB);
    const superAdminRepository = new SuperAdminRepository(cloudflareD1DB.db);

    const registerSuperAdminUseCase = new RegisterSuperAdminUseCase(superAdminRepository);
    const registerHandler = new RegisterHandler(registerSuperAdminUseCase);

    return registerHandler;
};