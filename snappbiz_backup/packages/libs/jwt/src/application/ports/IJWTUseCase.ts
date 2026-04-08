import { JWT } from "../../domain/JWT";

export interface IJWTUseCase {
    generateToken(token: string, secret: string): Promise<JWT>;
}
