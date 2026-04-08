import _wasm from '../dist/jwt.wasm';

type VariablePointer = {
    ptr: number;
    len: number;
};

export class JWT {
    private instance: WebAssembly.Instance | null = null;
    private exports: WebAssembly.Exports | null = null;
    private memory: WebAssembly.Memory | null = null;

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
        this.exports = this.instance.exports;
        this.memory = this.instance.exports['memory'] as WebAssembly.Memory;
    }

    // Add a method to get exports
    getExports(): WebAssembly.Exports {
        if (!this.exports) {
            throw new Error('Exports not initialized');
        }
        return this.exports;
    }
    
    console_log_ex(location: number, size: number) {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        const buffer = new Uint8Array(this.memory.buffer, location, size);
        const decoder = new TextDecoder();
        const string = decoder.decode(buffer);
        
        console.log("from console_log_ex:", string);
    }
    
    allocate(size: number): number {
        if (!this.instance) throw new Error('WASM not initialized');

        const alloc = this.instance.exports['alloc'] as CallableFunction;
        return alloc(size);
    }

    free(pointer: number, size: number): void {
        if (!this.instance) throw new Error('WASM not initialized');

        const free = this.instance.exports['free'] as CallableFunction;
        free(pointer, size);
    }

    // pass string to wasm
    getVariablePointer(variable: string): VariablePointer {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        // Allocate and copy payload
        const varBytes = new TextEncoder().encode(variable);
        const varPtr = this.allocate(varBytes.length);

        if (!varPtr) throw new Error("Failed to allocate variable memory");

        // Copy payload to WASM memory
        new Uint8Array(this.memory.buffer).set(varBytes, varPtr);

        return {
            ptr: varPtr,
            len: varBytes.length
        };

    }

    decodePointer(ptr: number, len: number): string {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        // Validate pointer and length
        if (ptr === 0 || len === 0) {
            throw new Error(`Invalid pointer or length: ptr=${ptr}, len=${len}`);
        }

        // Create a view of the memory at the given pointer
        const view = new Uint8Array(this.memory.buffer, ptr, len);

        // Convert the bytes to a string
        const decoder = new TextDecoder();
        const result = decoder.decode(view);

        return result;
    }
    
    parseMemoryPointer(memoryPointer: number): VariablePointer {
        if (!this.memory) throw new Error('WASM memory not initialized');
        const memView = new Uint32Array(this.memory.buffer, memoryPointer, 2);

        const ptr = memView[0]; // little-endian pointer
        const len = memView[1]; // little-endian length

        return {
            ptr,
            len
        } as VariablePointer;
    }
    
    encode(payload: string, secret: string): string {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        const encode = this.instance.exports['encode'] as CallableFunction;
    
        const payloadVar = this.getVariablePointer(payload);
        const secretVar = this.getVariablePointer(secret);

        const payloadPtr = payloadVar.ptr;
        const secretPtr = secretVar.ptr;

        const payloadLength = payloadVar.len;
        const secretLength = secretVar.len;

        try {
            // Call encode function
            const encoded = encode(
                payloadPtr,
                payloadLength,
                secretPtr,
                secretLength
            ) as number;

            // Retrieve and print the string
            const parsedToken = this.parseMemoryPointer(encoded);
            const { ptr, len } = parsedToken;

            // Decode the pointer
            const result = this.decodePointer(ptr, len);

            // Clean up the stored encoded token
            this.free(ptr, len);

            // Clean up result buffer            
            return result;
        } finally {
            // Clean up input buffers
            this.free(payloadPtr, payloadLength);
            this.free(secretPtr, secretLength);
        }
    }
    
    decode(token: string, secret: string): object {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        const decode = this.instance.exports['decode'] as CallableFunction;
    
        const tokenVar = this.getVariablePointer(token);
        const secretVar = this.getVariablePointer(secret);

        const tokenPtr = tokenVar.ptr;
        const secretPtr = secretVar.ptr;

        const tokenLength = tokenVar.len;
        const secretLength = secretVar.len;

        try {
            // Call encode function
            const decoded = decode(
                tokenPtr,
                tokenLength,
                secretPtr,
                secretLength
            ) as number;

            // Retrieve and print the string
            const parsedToken = this.parseMemoryPointer(decoded);

            const { ptr, len } = parsedToken;

            const result = this.decodePointer(ptr, len);
            const parsedResult = JSON.parse(result);

            // Clean up the stored encoded token
            this.free(ptr, len);

            // Clean up result buffer
            return parsedResult;
        } finally {
            // Clean up input buffers
            this.free(tokenPtr, tokenLength);
            this.free(secretPtr, secretLength);
        }
    }
}

export * from './rsa.wasm';
