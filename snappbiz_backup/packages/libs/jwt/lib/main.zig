const std = @import("std");
const builtin = @import("builtin");
const jwt = @import("jwt.zig");

const rsa = @import("rsa.zig");

// we'll import this from JS-land
extern fn console_log_ex(message: [*]const u8, length: u8) void;

// Use WASM global allocator
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const allocator = gpa.allocator();

pub export fn alloc(size: usize) ?[*]u8 {
    const slice = allocator.alloc(u8, size) catch return null;
    return slice.ptr;
}

pub export fn free(ptr: [*]u8, size: usize) void {
    if (size > 0) {
        const slice = ptr[0..size];
        allocator.free(slice);
    }
}

// Helper function to free the key pair memory
pub export fn free_key_pair(metadata_ptr: usize) void {
    if (metadata_ptr == 0) return;

    const metadata = @as(*[3]usize, @ptrFromInt(metadata_ptr));
    const ptr = @as([*]u8, @ptrFromInt(metadata[0]));
    const total_len = metadata[1];

    // Free the combined keys buffer
    if (total_len > 0) {
        const combined = ptr[0..total_len];
        allocator.free(combined);
    }

    // Free the metadata
    allocator.free(metadata);
}

// Function to store a single string and return a pointer to its metadata block
export fn store_string(data: [*]const u8, data_len: usize) usize {
    const offset = 0;
    const allocation = offset + data_len;
    // const start_page = offset;

    // Allocate memory for the string itself
    const str_memory = allocator.alloc(u8, allocation) catch return 0;

    // Create slices for source and destination
    // const data_slice = str_memory[start_page..allocation];
    @memcpy(str_memory, data[0..data_len]);

    if (builtin.target.cpu.arch == .wasm32) {
        console_log_ex(str_memory.ptr, @intCast(str_memory.len));
    }

    // Allocate memory for metadata [pointer, length]
    const metadata = allocator.alloc(usize, 2) catch {
        allocator.free(str_memory);
        return 0;
    };

    metadata[0] = @intFromPtr(str_memory.ptr);
    metadata[1] = data_len;

    // Return the pointer to the metadata as usize
    return @intFromPtr(metadata.ptr);
}

// Export a function that writes the result into a pre-allocated buffer
pub export fn encode(
    payload_str: [*]const u8,
    payload_len: usize,
    secret_str: [*]const u8,
    secret_len: usize
) usize {
    const payload_slice = payload_str[0..payload_len];
    const secret_slice = secret_str[0..secret_len];

    // Get the token
    const token = jwt.encode(allocator, payload_slice, secret_slice) catch return 0;

    // Create a buffer for the result
    const mem = allocator.alloc(u8, token.len) catch return 0;

    // Create slices for source and destination
    const token_slice = mem[0..token.len];
    @memcpy(token_slice, token);

    // if (builtin.target.cpu.arch == .wasm32) {
    //     console_log_ex(string_allocate.ptr, @intCast(string_allocate.len));
    // }

    // Free the original token
    allocator.free(token);

    // Allocate memory for metadata [pointer, length]
    const metadata = allocator.alloc(usize, 2) catch {
        allocator.free(mem);
        return 0;
    };

    metadata[0] = @intFromPtr(mem.ptr);
    metadata[1] = token.len;

    // Return the pointer to the metadata as usize
    return @intFromPtr(metadata.ptr);
}

// Export a function that writes the result into a pre-allocated buffer
pub export fn decode(
    token_str: [*]const u8,
    token_len: usize,
    secret_str: [*]const u8,
    secret_len: usize
) usize {
    const token_slice = token_str[0..token_len];
    const secret_slice = secret_str[0..secret_len];

    // Get the payload
    const payload = jwt.decode(allocator, token_slice, secret_slice) catch return 0;

    // Create a buffer for the result
    const mem = allocator.alloc(u8, payload.len) catch return 0;

    // Create slices for source and destination
    const payload_slice = mem[0..payload.len];
    @memcpy(payload_slice, payload);

    // Free the original payload
    allocator.free(payload);

    // Allocate memory for metadata [pointer, length]
    const metadata = allocator.alloc(usize, 2) catch {
        allocator.free(mem);
        return 0;
    };

    metadata[0] = @intFromPtr(mem.ptr);
    metadata[1] = payload.len;

    // if (builtin.target.cpu.arch == .wasm32) {
    //     console_log_ex(mem.ptr, @intCast(mem.len));
    // }

    // Return the pointer to the metadata as usize
    return @intFromPtr(metadata.ptr);
}

// Export a function that returns PEM-formatted key pair
// pub export fn generate_key_pair() usize {
//     // Create an allocator
//     // var key_pair = try rsa.generate2048(allocator) catch return 0;
//     // defer key_pair.deinit();

//     // // Convert to PEM format
//     // const public_pem = key_pair.toPublicPem(allocator) catch return 0;
//     // defer allocator.free(public_pem);
    
//     // const private_pem = key_pair.toPrivatePem(allocator) catch {
//     //     allocator.free(public_pem);
//     //     return 0;
//     // };
//     // defer allocator.free(private_pem);

//     // // Calculate total size needed for both keys
//     // const total_size = public_pem.len + private_pem.len;

//     // // Allocate memory for combined keys
//     // const combined = allocator.alloc(u8, total_size) catch {
//     //     return 0;
//     // };

//     // // Copy both keys into the combined buffer
//     // @memcpy(combined[0..public_pem.len], public_pem);
//     // @memcpy(combined[public_pem.len..], private_pem);

//     // // Allocate memory for metadata [pointer, total_length, public_key_length]
//     // const metadata = allocator.alloc(usize, 3) catch {
//     //     allocator.free(combined);
//     //     return 0;
//     // };

//     // metadata[0] = @intFromPtr(combined.ptr);  // pointer to combined keys
//     // metadata[1] = total_size;                 // total length
//     // metadata[2] = public_pem.len;            // length of public key

//     // // Return pointer to metadata
//     // return @intFromPtr(metadata.ptr);
// }

pub fn main() !void {
    std.debug.print("Generating ECDSA key pair...\n", .{});
    
    const key_pair = try rsa.ECDSA.generatePem(allocator);
    defer {
        allocator.free(key_pair.public_key);
        allocator.free(key_pair.private_key);
    }

    rsa.ECDSA.debugPrint(key_pair);
    // Call generate_key_pair and get metadata pointer
    // const metadata_ptr = generate_key_pair();
    // if (metadata_ptr == 0) {
    //     std.debug.print("Failed to generate key pair\n", .{});
    //     return;
    // }
    // defer free_key_pair(metadata_ptr);

    // // Get metadata array
    // const metadata = @as(*[3]usize, @ptrFromInt(metadata_ptr));
    // const ptr = @as([*]u8, @ptrFromInt(metadata[0]));
    // const total_len = metadata[1];
    // const public_key_len = metadata[2];

    // // Create slices for public and private keys
    // const public_key = ptr[0..public_key_len];
    // const private_key = ptr[public_key_len..total_len];

    // // Print the keys
    // std.debug.print("\nPublic Key:\n{s}\n", .{public_key});
    // std.debug.print("\nPrivate Key:\n{s}\n", .{private_key});

    // // Generate RSA Key Pair
    // defer rsa.freeKeyPair(key_pair); // Clean up the keys when done

    // // Debug print the keys
    // rsa.debugPrintRSAKeys(key_pair);


    // const memory_pointer = store_string("hello", 5);
    // if (memory_pointer == 0) {
    //     std.debug.print("Error: Failed to store string\n", .{});
    //     return;
    // }

    // // Get the metadata pointer and create a slice
    // const metadata_ptr = @as(*[2]usize, @ptrFromInt(memory_pointer));
    // const metadata = metadata_ptr.*;

    // // Debug print to check metadata values
    // std.debug.print("Metadata: ptr={x}, len={}\n", .{metadata[0], metadata[1]});
    
    // // Create a slice for the stored string using the metadata
    // const stored_string_ptr = @as([*]u8, @ptrFromInt(metadata[0]));
    // const stored_string = stored_string_ptr[0..metadata[1]];

    // std.debug.print("Stored string: {s}\n", .{stored_string});
    
    // // Free the string memory
    // free(@as([*]u8, @ptrFromInt(metadata[0])), metadata[1]);
    
    // // Free the metadata
    // allocator.destroy(metadata_ptr);



    // const payload = "{'hello': 'world', 'sub': '1234567890'}";
    // const secret = "secret";

    // const result = encode(payload.ptr, payload.len, secret.ptr, secret.len);
    // if (result) |ptr| {
    //     const result_array = ptr[0..2];
    //     const token_ptr = @as([*]u8, @ptrFromInt(result_array[0]));  // renamed from 'ptr' to 'token_ptr'
    //     const len = result_array[1];
    //     const token_slice = token_ptr[0..len];  // using token_ptr instead of ptr
        
    //     std.debug.print("{s}\n", .{token_slice});
    // }
    // const token_pointer = @as([*]u8, @ptrFromInt(result));
    // std.debug.print("{s}\n", .{token_pointer[0..128]});
}
