const std = @import("std");
const crypto = @import("std").crypto;
const KeyPair = std.crypto.ecdsa.Ecdsa.KeyPair;

const Ecdsa = crypto.sign.ecdsa.Ecdsa;
const EcdsaP256Sha256 = Ecdsa(crypto.ecc.P256, crypto.hash.sha2.Sha256);

fn publicKeyToDer(allocator: std.mem.Allocator, key_pair: EcdsaP256Sha256.KeyPair) ![]u8 {
    // Get public key in raw DER format
    var encoded = key_pair.public_key.toUncompressedSec1();
    
    // Create a copy of the encoded data
    const der = try allocator.alloc(u8, encoded.len);
    @memcpy(der, &encoded);
    return der;
}

fn privateKeyToDer(allocator: std.mem.Allocator, key_pair: EcdsaP256Sha256.KeyPair) ![]u8 {
    // Get private key in raw DER format
    const priv_key_bytes = key_pair.secret_key.toBytes();
    
    // Create a copy of the key bytes
    const der = try allocator.alloc(u8, priv_key_bytes.len);
    @memcpy(der, &priv_key_bytes);
    return der;
}

pub fn main() !void {
    const seed_length = EcdsaP256Sha256.KeyPair.seed_length;
    var random_seed: [seed_length]u8 = undefined;
    crypto.random.bytes(&random_seed);

    const key_pair = try EcdsaP256Sha256.KeyPair.create(random_seed);

    const pub_der = try publicKeyToDer(std.heap.page_allocator, key_pair);
    defer std.heap.page_allocator.free(pub_der);
    
    const priv_der = try privateKeyToDer(std.heap.page_allocator, key_pair);
    defer std.heap.page_allocator.free(priv_der);

    // Print raw bytes if needed
    std.debug.print("Public Key (DER): ", .{});
    for (pub_der) |byte| {
        std.debug.print("{x:0>2}", .{byte});
    }
    std.debug.print("\n", .{});

    std.debug.print("Private Key (DER): ", .{});
    for (priv_der) |byte| {
        std.debug.print("{x:0>2}", .{byte});
    }
    std.debug.print("\n", .{});
}

