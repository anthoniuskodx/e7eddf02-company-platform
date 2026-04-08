import type { JWTPayload } from "jose";

import { OIDCUseCase } from "../../../application/usecases/OIDCUseCase";

export class OIDCHandler {
    constructor(private readonly _oidcUseCase: OIDCUseCase) { }

    async generateAuthorizationKey(userId: string, clientId: string): Promise<string> {
        return await this._oidcUseCase.generateAuthorizationKey(userId, clientId);
    }

    async verifyAuthorizationCode(code: string): Promise<JWTPayload> {
        return await this._oidcUseCase.verifyAuthorizationCode(code);
    }
}
