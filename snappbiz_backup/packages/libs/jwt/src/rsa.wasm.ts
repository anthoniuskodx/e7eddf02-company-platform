import _wasm from '../dist/jwt.wasm';

type RSAKeyPair = {
    publicKey: string;
    privateKey: string;
};

export type RsaKeyPairPointer = {
    ptr: number;
    len: number;
    publicKeyLen: number;
};

export class RSA {
    private instance: WebAssembly.Instance | null = null;
    private memory: WebAssembly.Memory | null = null;

    private publicKey: string | null = null;
    private privateKey: string | null = null;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        const importsObject = {
            wasi_snapshot_preview1: {
                proc_exit: () => {console.log("proc_exit")},
                path_open: () => 0,
                fd_write: (
                    fd: number,
                    iovs: number,
                    iovsLen: number,
                    nwritten: number
                ): number => {
                    // For debugging purposes, you might want to log the writes
                    console.log(`fd_write called: fd=${fd}, iovs=${iovs}, iovsLen=${iovsLen}, nwritten=${nwritten}`);
                    return 0; // Success
                },
                // Add the missing fd_read function
                fd_read: (
                    fd: number,
                    iovs: number,
                    iovsLen: number,
                    nread: number
                ): number => {
                    console.log(`fd_read called: fd=${fd}, iovs=${iovs}, iovsLen=${iovsLen}, nread=${nread}`);
                    return 0;
                },
                // Add fd_close function
                fd_close: (fd: number): number => {
                    console.log(`fd_close called: fd=${fd}`);
                    return 0;
                },
                // Add random_get function
                random_get: (ptr: number, len: number): number => {
                    if (!this.memory) throw new Error('WASM memory not initialized');
                    const buffer = new Uint8Array(this.memory.buffer, ptr, len);
                    crypto.getRandomValues(buffer);
                    return 0;
                },
            },
            env: {
                console_log_ex: this.console_log_ex.bind(this),
            }
        }
        
        this.instance = new WebAssembly.Instance(_wasm, importsObject);
        this.memory = this.instance.exports['memory'] as WebAssembly.Memory;
    }
    
    setPublicKey(publicKey: string): void {
        this.publicKey = publicKey;
    }

    getPublicKey(): string | null {
        return this.publicKey;
    }

    setPrivateKey(privateKey: string): void {
        this.privateKey = privateKey;
    }

    getPrivateKey(): string | null {
        return this.privateKey;
    }

    console_log_ex(location: number, size: number) {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        const buffer = new Uint8Array(this.memory.buffer, location, size);
        const decoder = new TextDecoder();
        const string = decoder.decode(buffer);
        
        console.log("from console_log_ex:", string);
    }

    decodeRsaPointer(ptr: number, len: number, publicKeyLen: number): RSAKeyPair {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        // Validate pointer and length
        if (ptr === 0 || len === 0 || publicKeyLen === 0) {
            throw new Error(`Invalid pointer or length: ptr=${ptr}, len=${len}, publicKeyLen=${publicKeyLen}`);
        }

        // Create a view of the memory at the given pointer
        const bytes = new Uint8Array(this.memory.buffer, ptr, len);

        // Convert the bytes to a string
        const publicKey = new TextDecoder().decode(bytes.slice(0, publicKeyLen));
        const privateKey = new TextDecoder().decode(bytes.slice(publicKeyLen));

        return {
            publicKey,
            privateKey
        } as RSAKeyPair;
    }
    
    parseRsaMemoryPointer(memoryPointer: number): RsaKeyPairPointer {
        if (!this.memory) throw new Error('WASM memory not initialized');
        const memView = new Uint32Array(this.memory.buffer, memoryPointer, 3);

        const ptr = memView[0]; // little-endian pointer
        const len = memView[1]; // little-endian length
        const publicKeyLen = memView[2]; // little-endian length

        return {
            ptr,
            len,
            publicKeyLen
        } as RsaKeyPairPointer;
    }

    generateKeyPair(): void {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        const generateKeyPair = this.instance.exports['generate_key_pair'] as CallableFunction;
        const freeKeyPair = this.instance.exports['free_key_pair'] as CallableFunction;

        const metadata_ptr = generateKeyPair() as number;
        if (metadata_ptr === 0) {
            throw new Error('Failed to generate key pair');
        }

        try {
            // Retrieve and print the string
            const parsedToken = this.parseRsaMemoryPointer(metadata_ptr);
    
            const { ptr, len, publicKeyLen } = parsedToken;
        
            // Decode the pointer
            const result = this.decodeRsaPointer(ptr, len, publicKeyLen);

            this.setPublicKey(result.publicKey);
            this.setPrivateKey(result.privateKey);
        } finally {
            freeKeyPair(metadata_ptr);
        }
        

    }
}
