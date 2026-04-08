import type { JWTPayload, KeyLike } from "jose";
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import { IJWTAdaptor } from "../application/ports/IJWTAdaptor";

export class JWTAdaptor implements IJWTAdaptor {
    constructor(
        private readonly _issuer: string,
        private readonly _privateKey: KeyLike,
        private readonly _publicKey?: KeyLike
    ) { }

    static async initialize(privateKey: string, issuer: string) {
        if (!issuer || !privateKey) {
            throw new Error('Issuer or private key is null');
        }

        const privatepkcs8Key = await importPKCS8(privateKey, 'ES256', {
            extractable: true,
        });

        return new JWTAdaptor(issuer, privatepkcs8Key);
    }

    static async initializeWithPublicKey(privateKey: string, publicKey: string, issuer: string) {
        if (!issuer && !privateKey && !publicKey) {
            throw new Error('Issuer and private key and public key is null');
        }

        const privatepkcs8Key = await importPKCS8(privateKey, 'ES256', {
            extractable: true,
        });


        const publicpkcs8Key = await importSPKI(publicKey, 'ES256', {
            extractable: true,
        });

        return new JWTAdaptor(issuer, privatepkcs8Key, publicpkcs8Key);
    }

    async generateAuthorizationKey(userId: string, clientId: string): Promise<string> {
        const authorizationKey = await new SignJWT({ clientId, userId })
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuedAt()
            .setExpirationTime('10m') // Code valid for 10 minutes
            .sign(this._privateKey);

        return authorizationKey;
    }

    async generateIDToken(userId: string, clientId: string): Promise<string> {
        const idToken = await new SignJWT({ sub: userId, aud: clientId })
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuedAt()
            .setIssuer(this._issuer)
            .setExpirationTime('1h') // 1-hour expiry
            .sign(this._privateKey);

        return idToken;
    }

    async generateAccessToken(userId: string, scope: string = "openid"): Promise<string> {
        const accessToken = await new SignJWT({ sub: userId, scope })
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(this._privateKey);

        return accessToken;
    }

    // Verify the authorization code
    async verifyAuthorizationCode(code: string): Promise<JWTPayload> {
        const { payload } = await jwtVerify(code, this._publicKey);
        return payload; // Contains clientId and userId
    }
}