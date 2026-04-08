export class KeyPair {
    private publicKey: string | null = null;
    private privateKey: string | null = null;

    constructor(publicKey: string, privateKey: string) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    getPublicKey(): string | null {
        return this.publicKey;
    }

    getPrivateKey(): string | null {
        return this.privateKey;
    }
}
