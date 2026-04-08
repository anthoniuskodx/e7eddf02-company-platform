const std = @import("std");
const testing = std.testing;
const expect = testing.expect;
const expectEqual = testing.expectEqual;

const main = @import("main.zig");

test "alloc returns correct pointer and converts back to slice" {
    const size: usize = 128;
    
    // Get pointer from allocation
    const ptr = main.alloc(size) orelse {
        try testing.expect(false); // Fail if allocation returns null
        return;
    };
    
    // Convert back to slice
    const slice = ptr[0..size];
    
    // Test the length
    try expectEqual(slice.len, size);
    
    // Write some data to verify memory is accessible
    for (slice, 0..) |*byte, i| {
        byte.* = @as(u8, @intCast(i % 256));
    }
    
    // Read back the data to verify it's correct
    for (slice, 0..) |byte, i| {
        try expectEqual(byte, @as(u8, @intCast(i % 256)));
    }
}

test "free deallocates memory correctly" {
    const size: usize = 128;
    
    // First allocate
    const ptr = main.alloc(size) orelse {
        try testing.expect(false);
        return;
    };
    
    // Then free - if this doesn't crash, memory was accessible
    main.free(ptr, size);
    
    // Note: We can't test if memory is actually freed without using 
    // unsafe operations, but we can verify the function executes
}
