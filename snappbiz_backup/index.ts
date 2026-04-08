import { init, WASI } from '@wasmer/wasi';
import { readFileSync } from 'fs';
import { join } from 'path';

type VariablePointer = {
    ptr: number;
    len: number;
};

class JWT {
    public wasi: WASI | null = null;
    public memory: WebAssembly.Memory | null = null;
    private instance: WebAssembly.Instance | null = null;

    async init() {
        await init();

        this.wasi = new WASI({
        args: [],
        env: {},
        });
        const wasmBuffer = readFileSync(join(__dirname, './dist/jwt.wasm'));
        const module = await WebAssembly.compile(wasmBuffer);

        // Get the imports from WASI
        const imports = {
            ...(this.wasi.getImports(module) as WebAssembly.Imports),
            env: {
                console_log_ex: this.console_log_ex.bind(this),
            },
        };


        try {
            this.instance = await WebAssembly.instantiate(module, imports);
            this.memory = this.instance.exports.memory as WebAssembly.Memory;

            console.log('WASM instantiated successfully');
            console.log('Instance exports:', Object.keys(this.instance.exports));
        } catch (error) {
            console.error('Error during WASM initialization:', error);
            throw error;
        }
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

        const alloc = this.instance.exports.alloc as CallableFunction;
        return alloc(size);
    }

    free(pointer: number, size: number): void {
        if (!this.instance) throw new Error('WASM not initialized');

        const free = this.instance.exports.free as CallableFunction;
        free(pointer, size);
    }

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

    parseMemoryPointer(memoryPointer: number) {
        if (!this.memory) throw new Error('WASM memory not initialized');

        // Extract pointer and length from the first 8 bytes
        const dataView = new DataView(this.memory.buffer, memoryPointer, 8);
        console.log('Data view:', dataView);

        const ptr = dataView.getUint32(0, true); // little-endian pointer
        const len = dataView.getUint32(4, true); // little-endian length

        return {
            ptr,
            len
        } as VariablePointer;
    }
    
    encode(payload: string, secret: string) {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        const encode = this.instance.exports.encode as CallableFunction;
    
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

            const result = this.decodePointer(ptr, len);

            // Clean up the stored encoded token
            this.free(encoded, 2);
            this.free(ptr, len);

            // Clean up result buffer            
            return result;
        } finally {
            // Clean up input buffers
            this.free(payloadPtr, payloadLength);
            this.free(secretPtr, secretLength);
        }
    }

    decodeString = (pointer: number, length: number) => {
        if (!this.memory) throw new Error('WASM memory not initialized');

        const dataView = new DataView(this.memory.buffer, pointer, length);
        console.log('Data view:', dataView);

        const slice = new Uint8Array(this.memory.buffer, pointer, length);
        return new TextDecoder().decode(slice);
    };

    storeString(data: string) {
        if (!this.instance) throw new Error('WASM not initialized');
        if (!this.memory) throw new Error('WASM memory not initialized');

        const storeString = this.instance.exports.store_string as CallableFunction;
        const dataBytes = new TextEncoder().encode(data);

        const dataVar = this.getVariablePointer(data);

        const dataPtr = dataVar.ptr;
        const dataLength = dataVar.len;

        const metadataPtr = storeString(dataPtr, dataLength);
        console.log('Stored string at:', metadataPtr);

        // Retrieve and print the string
        const parsedToken = this.parseMemoryPointer(metadataPtr);
        const { ptr, len } = parsedToken;
        console.log('Retrieved string:', parsedToken);
        console.log('Extracted pointer:', ptr);
        console.log('Extracted length:', len);
    
        // Create a slice using the extracted pointer and length
        const resultString = this.decodeString(ptr, len);
        console.log('Decoded string:', resultString);

        // Clean up the data pointer in memory
        this.free(dataPtr, dataLength);

        // // Convert to string
        // const stringValue = new TextDecoder().decode(memoryView);
        // console.log('Parsed string:', stringValue);

        // this.free(payloadPtr, dataBytes.length);
        // const resultView = new Uint8Array(this.memory.buffer, metadataPtr, 4);
        // const resultString = new TextDecoder().decode(resultView);
    }
}

const main = async () => {
  const jwt = new JWT();
  await jwt.init();

  const payload = '{"hello": "world", "foo": "bar"}';
  jwt.storeString(payload);

//   const encoded = jwt.encode('{"hello": "world", "foo": "bar"}', 'secret');
//   console.log('Encoded:', encoded);

//   const decodeResult = jwt.decodePointer(encoded.ptr, encoded.len);
//   console.log('Decoded result:', decodeResult);
};

main();
