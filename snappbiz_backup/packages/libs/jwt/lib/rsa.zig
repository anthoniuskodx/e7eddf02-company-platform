const std = @import("std");
const crypto = std.crypto;
const Allocator = std.mem.Allocator;
const EcdsaP256Sha256 = crypto.sign.ecdsa.EcdsaP256Sha256;

pub const ECDSA = struct {
    /// The secret key (private key)
    secret_key: ?EcdsaP256Sha256.SecretKey,
    /// The public key
    public_key: EcdsaP256Sha256.PublicKey,

    const Self = @This();

    const KeyPair = struct {
        public_key: []const u8,
        private_key: []const u8,
    };

    /// Initialize with a public key only (for verification)
    pub fn initPublic(public_key_pem: []const u8) !Self {
        // Parse PEM header to determine key type
        const pem = try std.encoding.pem.Block.decode(public_key_pem);
        if (!std.mem.eql(u8, pem.type, "PUBLIC KEY")) {
            return error.InvalidPublicKey;
        }
        
        // Parse the DER-encoded public key
        const public_key = try EcdsaP256Sha256.PublicKey.fromDer(pem.data);
        return Self{
            .secret_key = null,
            .public_key = public_key,
        };
    }

    /// Initialize with both public and private keys (for signing)
    pub fn initPrivate(private_key_pem: []const u8) !Self {
        // Parse PEM header to determine key type
        const pem = try std.encoding.pem.Block.decode(private_key_pem);
        if (!std.mem.eql(u8, pem.type, "PRIVATE KEY")) {
            return error.InvalidPrivateKey;
        }
        
        // Parse the DER-encoded private key
        const secret_key = try EcdsaP256Sha256.SecretKey.fromDer(pem.data);
        const public_key = try secret_key.toPublicKey();
        
        return Self{
            .secret_key = secret_key,
            .public_key = public_key,
        };
    }

    /// Sign a message
    pub fn sign(self: Self, msg: []const u8) ![]const u8 {
        if (self.secret_key == null) return error.NoPrivateKey;
        
        // Create key pair from secret key
        const kp = try EcdsaP256Sha256.KeyPair.fromSecretKey(self.secret_key.?);
        
        // Sign the message
        const sig = try kp.sign(msg, null);
        
        // Return DER-encoded signature
        var der_buf: [EcdsaP256Sha256.Signature.der_encoded_length_max]u8 = undefined;
        return sig.toDer(&der_buf);
    }

    /// Verify a signature
    pub fn verify(self: Self, msg: []const u8, signature: []const u8) !void {
        // Parse DER signature
        const sig = try EcdsaP256Sha256.Signature.fromDer(signature);
        
        // Verify the signature
        try sig.verify(msg, self.public_key);
    }

    /// Generate new key pair and return PEM-encoded strings
    pub fn generatePem(allocator: Allocator) !KeyPair {        
        // Seed length is defined by `seed_length` in the KeyPair struct
        const seed_length = EcdsaP256Sha256.KeyPair.seed_length;
        var random_seed: [seed_length]u8 = undefined;

        // Generate random seed
        crypto.random.bytes(&random_seed);

        // Create key pair using the seed
        const key_pair = try EcdsaP256Sha256.KeyPair.create(random_seed);

        // Debug print the raw keys
        std.debug.print("Generated new ECDSA key pair:\n", .{});
        std.debug.print("Public key bytes: {any}\n", .{key_pair.public_key});

        // Export keys to DER format
        var public_der_buf: [EcdsaP256Sha256.PublicKey.der_length]u8 = undefined;
        const public_der = try key_pair.public_key.toDer(&public_der_buf);

        var private_der_buf: [EcdsaP256Sha256.SecretKey.der_length]u8 = undefined;
        const private_der = try key_pair.secret_key.toDer(&private_der_buf);

        std.debug.print("Public key DER: {any}\n", .{public_der});
        std.debug.print("Private key DER: {any}\n", .{private_der});

        // Create PEM blocks
        var public_list = std.ArrayList(u8).init(allocator);
        try std.encoding.pem.encode(public_list.writer(), "PUBLIC KEY", public_der);
        const public_pem = try public_list.toOwnedSlice();

        var private_list = std.ArrayList(u8).init(allocator);
        try std.encoding.pem.encode(private_list.writer(), "PRIVATE KEY", private_der);
        const private_pem = try private_list.toOwnedSlice();

        // Debug print the PEM strings
        std.debug.print("\nPublic Key PEM:\n{s}\n", .{public_pem});
        std.debug.print("\nPrivate Key PEM:\n{s}\n", .{private_pem});

        return KeyPair{
            .public_key = public_pem,
            .private_key = private_pem,
        };
    }

    /// Free memory allocated by generatePem
    pub fn freePem(allocator: std.mem.Allocator, key_pair: KeyPair) void {
        allocator.free(key_pair.public_key);
        allocator.free(key_pair.private_key);
    }

    /// Debug function to print a key pair
    pub fn debugPrint(key_pair: KeyPair) void {
        std.debug.print("\n=== ECDSA Key Pair ===\n", .{});
        std.debug.print("\nPublic Key:\n{s}\n", .{key_pair.public_key});
        std.debug.print("\nPrivate Key:\n{s}\n", .{key_pair.private_key});
        std.debug.print("\n===================\n", .{});
    }
};

// Test function
test "ECDSA key generation and debug" {
    const testing = std.testing;
    const key_pair = try ECDSA.generatePem(testing.allocator);
    defer {
        testing.allocator.free(key_pair.public_key);
        testing.allocator.free(key_pair.private_key);
    }

    // Verify the keys are not empty
    try testing.expect(key_pair.public_key.len > 0);
    try testing.expect(key_pair.private_key.len > 0);

    // Print the keys
    ECDSA.debugPrint(key_pair);
}
