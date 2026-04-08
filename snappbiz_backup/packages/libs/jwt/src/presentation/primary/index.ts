import type { JWTPayload } from "jose";
import { JWTUseCase } from "../../application/usecases/JWTUseCase";
import { JWTAdaptor } from "../../infrastructure/JWTAdaptor";
import { OIDCUseCase } from "../../application/usecases/OIDCUseCase";
import { OIDCHandler } from "./handler/oidcHandler";
import { JWTHandler } from "./handler/jwtHandler";
import { JWT } from "../../domain/JWT";

export const generateToken = async (privateKey: string, issuer: string, userId: string, clientId: string): Promise<JWT> => {
    const jwtAdaptor = await JWTAdaptor.initialize(privateKey, issuer);
    const jwtUseCase = new JWTUseCase(jwtAdaptor);
    const jwtHandler = new JWTHandler(jwtUseCase);

    return await jwtHandler.generateToken(userId, clientId);
}

export const generateAuthorizationKey = async (privateKey: string, issuer: string, userId: string, clientId: string): Promise<string> => {
    const jwtAdaptor = await JWTAdaptor.initialize(privateKey, issuer);
    const oidcUseCase = new OIDCUseCase(jwtAdaptor);
    const oidcHandler = new OIDCHandler(oidcUseCase);

    return await oidcHandler.generateAuthorizationKey(userId, clientId);
}

export const verifyAuthorizationCode = async (privateKey: string, publicKey: string, issuer: string, code: string): Promise<JWTPayload> => {
    const jwtAdaptor = await JWTAdaptor.initializeWithPublicKey(privateKey, publicKey, issuer);
    const oidcUseCase = new OIDCUseCase(jwtAdaptor);
    const oidcHandler = new OIDCHandler(oidcUseCase);

    return await oidcHandler.verifyAuthorizationCode(code);
}
