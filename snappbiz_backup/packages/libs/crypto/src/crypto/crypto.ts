import { encodeHexLowerCase, decodeHex } from "@oslojs/encoding";
import { constantTimeEqual } from "./buffer";
import { alphabet, generateRandomString } from "./random";
import { scrypt } from "../scrypt";

async function generateScryptKey(s: string, salt: string, blockSize = 16) {
    const keyUint8Array = await scrypt(new TextEncoder().encode(s), new TextEncoder().encode(salt), {
        N: 16384,
        r: blockSize,
        p: 1,
        dkLen: 64
    });
    return keyUint8Array;
}

export function generateId(length: number): string {
    return generateRandomString(length, alphabet("0-9", "a-z"));
}

export interface IScrypt {
    hash(password: string): Promise<string>;
    verify(hash: string, password: string): Promise<boolean>;
}

export class Scrypt implements IScrypt {
    async hash(password: string): Promise<string> {
        const salt = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(16)));
        const key = await generateScryptKey(password.normalize("NFKC"), salt);
        return `${salt}:${encodeHexLowerCase(key)}`;
    }

    async verify(hash: string, password: string): Promise<boolean> {
        const parts = hash.split(":");
        if (parts.length !== 2)
            return false;
        const [salt, key] = parts;
        const targetKey = await generateScryptKey(password.normalize("NFKC"), salt);
        return constantTimeEqual(targetKey, decodeHex(key));
    }
}
