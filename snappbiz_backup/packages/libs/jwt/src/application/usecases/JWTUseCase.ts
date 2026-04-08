import { JWT } from "../../domain/JWT";
import { IJWTAdaptor } from "../ports/IJWTAdaptor";
import { IJWTUseCase } from "../ports/IJWTUseCase";

export class JWTUseCase implements IJWTUseCase {
    constructor(private readonly _jwtAdaptor: IJWTAdaptor) { }

    async generateToken(userId: string, clientId: string): Promise<JWT> {
        const idToken = await this._jwtAdaptor.generateIDToken(userId, clientId);
        const accessToken = await this._jwtAdaptor.generateAccessToken(userId, clientId, 'openid');

        const jwt = new JWT(accessToken, idToken);

        return jwt;
    }
}
