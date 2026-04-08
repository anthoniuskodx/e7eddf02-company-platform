import { IJWTUseCase } from "../../../application/ports/IJWTUseCase";
import { JWT } from "../../../domain/JWT";

export class JWTHandler {
    constructor(private readonly _jwtUseCase: IJWTUseCase) {}

    async generateToken(userId: string, clientId: string): Promise<JWT> {
        if (!this._jwtUseCase) {
            throw new Error("Method not implemented.");
        }

        const jwt = await this._jwtUseCase.generateToken(userId, clientId);
        
        return jwt;
    }
}
