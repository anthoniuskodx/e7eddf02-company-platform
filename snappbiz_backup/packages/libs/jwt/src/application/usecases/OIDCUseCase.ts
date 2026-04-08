import type { JWTPayload } from "jose";

import { IJWTAdaptor } from "../ports/IJWTAdaptor";
import { IOIDCUseCase } from "../ports/IOIDCUseCase";

export class OIDCUseCase implements IOIDCUseCase {
    constructor(private readonly _jwtAdaptor: IJWTAdaptor) { }

    async generateAuthorizationKey(userId: string, clientId: string): Promise<string> {
        return await this._jwtAdaptor.generateAuthorizationKey(userId, clientId);
    }

    async verifyAuthorizationCode(code: string): Promise<JWTPayload> {
        return await this._jwtAdaptor.verifyAuthorizationCode(code);
    }
}
