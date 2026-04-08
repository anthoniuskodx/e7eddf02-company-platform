const std = @import("std");
const builtin = @import("builtin");

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

pub fn main() void {
    const memory_pointer = store_string("hello", 5);
    if (memory_pointer == 0) {
        std.debug.print("Error: Failed to store string\n", .{});
        return;
    }

    // Get the metadata pointer and create a slice
    const metadata_ptr = @as(*[2]usize, @ptrFromInt(memory_pointer));
    const metadata = metadata_ptr.*;

    // Debug print to check metadata values
    std.debug.print("Metadata: ptr={x}, len={}\n", .{metadata[0], metadata[1]});
    
    // Create a slice for the stored string using the metadata
    const stored_string_ptr = @as([*]u8, @ptrFromInt(metadata[0]));
    const stored_string = stored_string_ptr[0..metadata[1]];

    std.debug.print("Stored string: {s}\n", .{stored_string});
    
    // Free the string memory
    free(@as([*]u8, @ptrFromInt(metadata[0])), metadata[1]);
    
    // Free the metadata
    allocator.destroy(metadata_ptr);
}
