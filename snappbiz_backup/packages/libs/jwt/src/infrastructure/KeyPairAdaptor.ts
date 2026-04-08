import { generateKeyPair, exportPKCS8, exportSPKI, importSPKI, exportJWK } from 'jose';

import { IKeyPairAdaptor } from '../application/ports/IKeyPairAdaptor';
import { KeyPair } from '../domain/KeyPair';

export class KeyPairAdaptor implements IKeyPairAdaptor {
  // Step 1: Generate an RSA key pair and export the public and private keys as JWKs
  async generateKey() {
    const { publicKey, privateKey } = await generateKeyPair('ES256', {
      extractable: true, // Make the keys extractable
    });
    
    // Export the private key in PEM format (PKCS#8)
    const privatePem = await exportPKCS8(privateKey);
  
    // Export the public key in PEM format (SPKI)
    const publicPem = await exportSPKI(publicKey);
  
    const keyPair = new KeyPair(publicPem, privatePem);
  
    return keyPair;
  }

  async generateJWKS(publicKeyPem: string): Promise<object> {    
    const publicKey = await importSPKI(publicKeyPem, 'ES256', {
      extractable: true,
    });
    const jwk = await exportJWK(publicKey);

    const jwks = [{
      ...jwk,
      kid: '1',
      use: 'sig',
      alg: 'ES256',
    }]

    return jwks;
  }
}
