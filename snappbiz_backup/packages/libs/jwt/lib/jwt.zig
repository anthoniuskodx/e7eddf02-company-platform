const std = @import("std");
const base64 = std.base64;
const crypto = std.crypto;
const json = std.json;  // Add this line
const hmac = crypto.auth.hmac;
const sha256 = crypto.hash.sha2.Sha256;
const rsa = @import("rsa.zig");

const Allocator = std.mem.Allocator;

// pub const JWT = struct {
//     allocator: Allocator,
//     private_key: []const u8,
//     public_key: []const u8,

//     const Self = @This();

//     pub fn init(allocator: Allocator, private_key: []const u8, public_key: []const u8) Self {
//         return Self{
//             .allocator = allocator,
//             .private_key = private_key,
//             .public_key = public_key,
//         };
//     }

//     // pub fn deinit(self: *Self) void {
//     //     // If you need to free the keys, do it here
//     // }

//     pub fn sign(self: *const Self, payload: []const u8, expires_in_seconds: u64) ![]u8 {
//         // Create header
//         const header = "{\"alg\":\"RS256\",\"typ\":\"JWT\"}";
        
//         // Add iat and exp to payload
//         const current_time = @as(u64, @intCast(std.time.timestamp()));
//         const exp_time = current_time + expires_in_seconds;

//         var payload_with_claims = std.ArrayList(u8).init(self.allocator);
//         defer payload_with_claims.deinit();

//         // Remove trailing '}'
//         if (payload[payload.len - 1] == '}') {
//             try payload_with_claims.appendSlice(payload[0 .. payload.len - 1]);
//         } else {
//             try payload_with_claims.appendSlice(payload);
//             try payload_with_claims.appendSlice("{");
//         }

//         // Add iat and exp claims
//         try std.fmt.format(payload_with_claims.writer(), 
//             ",\"iat\":{d},\"exp\":{d}}}", 
//             .{ current_time, exp_time }
//         );

//         // Base64 URL encode header
//         const encoded_header = try base64UrlEncode(self.allocator, header);
//         defer self.allocator.free(encoded_header);

//         // Base64 URL encode payload
//         const encoded_payload = try base64UrlEncode(self.allocator, payload_with_claims.items);
//         defer self.allocator.free(encoded_payload);

//         // Create signature input
//         const signature_input = try std.fmt.allocPrint(self.allocator, "{s}.{s}", 
//             .{ encoded_header, encoded_payload }
//         );
//         defer self.allocator.free(signature_input);

//         // Create RSA signature
//         var key_pair = try rsa.RSA.PEM.decodePrivateKey(self.allocator, self.private_key);
//         defer key_pair.deinit();

//         // Sign the input using RSA
//         const signature = try key_pair.sign(signature_input);
//         defer self.allocator.free(signature);

//         // Base64 URL encode signature
//         const encoded_signature = try base64UrlEncode(self.allocator, signature);
//         defer self.allocator.free(encoded_signature);

//         // Combine all parts
//         return try std.fmt.allocPrint(self.allocator, "{s}.{s}.{s}", 
//             .{ encoded_header, encoded_payload, encoded_signature }
//         );
//     }

//     pub fn verify(self: *const Self, token: []const u8) !bool {
//         var parts = std.mem.splitSequence(u8, token, ".");
//         const encoded_header = parts.next() orelse return error.MalformedToken;
//         const encoded_payload = parts.next() orelse return error.MalformedToken;
//         const encoded_signature = parts.next() orelse return error.MalformedToken;
//         if (parts.next() != null) return error.MalformedToken;

//         // Verify signature
//         const signature_input = try std.fmt.allocPrint(self.allocator, "{s}.{s}", 
//             .{ encoded_header, encoded_payload }
//         );
//         defer self.allocator.free(signature_input);

//         // Decode the received signature
//         const received_signature = try base64UrlDecode(self.allocator, encoded_signature);
//         defer self.allocator.free(received_signature);

//         // Verify RSA signature
//         var key_pair = try rsa.RSA.PEM.decodePublicKey(self.allocator, self.public_key);
//         defer key_pair.deinit();

//         return key_pair.verify(signature_input, received_signature);
//     }

//     pub fn decode(self: *const Self, token: []const u8) ![]u8 {
//         var parts = std.mem.splitSequence(u8, token, ".");
//         _ = parts.next() orelse return error.MalformedToken; // header
//         const encoded_payload = parts.next() orelse return error.MalformedToken;
//         _ = parts.next() orelse return error.MalformedToken; // signature
//         if (parts.next() != null) return error.MalformedToken;

//         // Verify token is not expired
//         const payload = try base64UrlDecode(self.allocator, encoded_payload);
//         defer self.allocator.free(payload);

//         var parsed = try json.parseFromSlice(json.Value, self.allocator, payload, .{});
//         defer parsed.deinit();

//         const exp = parsed.value.object.get("exp") orelse return error.NoExpiration;
//         const exp_time = exp.integer;
//         const current_time = @as(i64, @intCast(std.time.timestamp()));

//         if (current_time > exp_time) {
//             return error.TokenExpired;
//         }

//         return try self.allocator.dupe(u8, payload);
//     }
// };

pub const JWTError = error{
    InvalidToken,
    SignatureMismatch,
    MalformedToken,
};

pub fn encode(
    allocator: Allocator,
    payload: []const u8,
    secret: []const u8,
) ![]u8 {
    // Base64 URL encode header
    const header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    const encodedHeader = try base64UrlEncode(allocator, header);
    defer allocator.free(encodedHeader);

    // Base64 URL encode payload
    const encodedPayload = try base64UrlEncode(allocator, payload);
    defer allocator.free(encodedPayload);

    // Create signature input
    const signatureInput = try std.fmt.allocPrint(allocator, "{s}.{s}", .{ encodedHeader, encodedPayload });
    defer allocator.free(signatureInput);

    // Create HMAC signature
    var hmacSha256 = hmac.sha2.HmacSha256.init(secret);
    var signature: [sha256.digest_length]u8 = undefined;
    hmacSha256.update(signatureInput);
    hmacSha256.final(&signature);

    // Base64 URL encode signature
    const encodedSignature = try base64UrlEncode(allocator, &signature);
    defer allocator.free(encodedSignature);

    // Combine all parts
    const encodedToken = try std.fmt.allocPrint(allocator, "{s}.{s}.{s}", .{ encodedHeader, encodedPayload, encodedSignature });
    defer allocator.free(encodedToken);

    return try allocator.dupe(u8, encodedToken);
}

fn base64UrlEncode(allocator: Allocator, input: []const u8) ![]const u8 {
    const encoder = base64.url_safe.Encoder;
    const encodedLen = encoder.calcSize(input.len);
    const encoded = try allocator.alloc(u8, encodedLen);
    _ = encoder.encode(encoded, input);

    // Count padding characters
    var paddingCount: usize = 0;
    while (paddingCount < encoded.len and encoded[encoded.len - 1 - paddingCount] == '=') : (paddingCount += 1) {}

    // Reallocate to remove padding
    const trimmedLen = encoded.len - paddingCount;
    const trimmed = try allocator.realloc(encoded, trimmedLen);
    return trimmed;
}

pub fn decode(
    allocator: Allocator,
    token: []const u8,
    secret: []const u8,
) ![]u8 {
    var parts = std.mem.splitSequence(u8, token, ".");
    const encodedHeader = parts.next() orelse return JWTError.MalformedToken;
    const encodedPayload = parts.next() orelse return JWTError.MalformedToken;
    const encodedSignature = parts.next() orelse return JWTError.MalformedToken;
    if (parts.next() != null) return JWTError.MalformedToken;

    // Verify signature
    const signatureInput = try std.fmt.allocPrint(allocator, "{s}.{s}", .{ encodedHeader, encodedPayload });
    defer allocator.free(signatureInput);

    var hmacSha256 = hmac.sha2.HmacSha256.init(secret);
    var expectedSignature: [sha256.digest_length]u8 = undefined;
    hmacSha256.update(signatureInput);
    hmacSha256.final(&expectedSignature);

    // Decode the received signature
    const decodedSignature = try base64UrlDecode(allocator, encodedSignature);
    defer allocator.free(decodedSignature);

    // Compare signatures
    if (!std.mem.eql(u8, decodedSignature, &expectedSignature)) {
        return JWTError.SignatureMismatch;
    }

    // Decode payload
    const payload = try base64UrlDecode(allocator, encodedPayload);
    return payload;
}

fn base64UrlDecode(allocator: std.mem.Allocator, input: []const u8) ![]u8 {
    // Add padding if necessary
    const paddedInput = try addPadding(allocator, input);
    defer allocator.free(paddedInput);

    const decoder = base64.url_safe.Decoder;
    const decodedLen = decoder.calcSizeForSlice(paddedInput) catch return JWTError.MalformedToken;
    const decoded = try allocator.alloc(u8, decodedLen);
    errdefer allocator.free(decoded);

    _ = decoder.decode(decoded, paddedInput) catch return JWTError.MalformedToken;
    return decoded;
}

fn addPadding(allocator: std.mem.Allocator, input: []const u8) ![]u8 {
    const remainder = input.len % 4;
    if (remainder == 0) return allocator.dupe(u8, input);

    const paddingNeeded = 4 - remainder;
    const padded = try allocator.alloc(u8, input.len + paddingNeeded);
    @memcpy(padded[0..input.len], input);
    @memset(padded[input.len..], '=');
    return padded;
}