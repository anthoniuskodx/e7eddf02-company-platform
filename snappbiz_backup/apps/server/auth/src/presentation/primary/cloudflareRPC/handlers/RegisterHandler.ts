import { RpcTarget } from "cloudflare:workers";

import type { IRegisterSuperAdminUseCase } from "../../../../application/ports/IRegisterSAUseCase";

import type { ISuperadminRegisterDto } from "@snappbiz/auth";
import type { ISuperAdminRegisterResultDto } from "@snappbiz/auth";

export class RegisterHandler extends RpcTarget {
    constructor(
        private readonly _registerSuperAdminUseCase: IRegisterSuperAdminUseCase<ISuperadminRegisterDto, ISuperAdminRegisterResultDto>
    ) {
        super();

        this._registerSuperAdminUseCase = _registerSuperAdminUseCase;
    }

    async registerSuperAdmin(payload: ISuperadminRegisterDto) {
        try {
            const result = await this._registerSuperAdminUseCase.registerSuperAdmin(payload);

            return result;
        } catch (error) {
            console.error(error);
            return { error: (error as Error).message };
        }
    }

    async registerTenantAdmin(method: string, identifier: string, password?: string) {
        return true;
    }

    async registerUser(method: string, identifier: string, password?: string) {
        return true;
    }
}
