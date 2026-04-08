import { promises as fs } from 'fs';
import { join } from 'path';

import { IKeyPairUseCase } from "../ports/IKeyPairUseCase"
import { IKeyPairAdaptor } from "../ports/IKeyPairAdaptor";

export class KeyPairUseCase implements IKeyPairUseCase {
    constructor(private readonly _keyPairAdaptor: IKeyPairAdaptor) { }

    async generateKeyAndSave() {
        const keyPair = await this._keyPairAdaptor.generateKey();

        // Define the path to save the keys
        const keysPath = join(__dirname, '../../../asset/keys');
        const jwksPath = join(__dirname, '../../../asset/jwks');
      
        const publicKey = keyPair.getPublicKey();
        const privateKey = keyPair.getPrivateKey();

        if (!publicKey || !privateKey) {
            throw new Error('Public or private key is null');
        }

        const jwks = await this._keyPairAdaptor.generateJWKS(publicKey);

        // Write the private key to a file
        await fs.writeFile(join(keysPath, 'private_key.pem'), privateKey);
        // Write the public key to a file
        await fs.writeFile(join(keysPath, 'public_key.pem'), publicKey);

        await fs.writeFile(join(jwksPath, 'jwks.json'), JSON.stringify(jwks));
    };
}
