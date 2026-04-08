import type { JWTPayload } from "jose";

export interface IJWTAdaptor {
    generateAuthorizationKey(userId: string, clientId: string): Promise<string>;
    generateIDToken(userId: string, clientId: string): Promise<string>;
    generateAccessToken(userId: string, clientId: string, scope: string): Promise<string>;
    // generateRefreshToken(clientId: string, userId: string, scope: string): string;
    verifyAuthorizationCode(code: string): Promise<JWTPayload>;
}
