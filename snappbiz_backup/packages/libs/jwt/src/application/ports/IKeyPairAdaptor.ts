import { KeyPair } from "../../domain/KeyPair";

export interface IKeyPairAdaptor {
    generateKey(): Promise<KeyPair>;
    generateJWKS(publicKeyPem: string): Promise<object>;
}
