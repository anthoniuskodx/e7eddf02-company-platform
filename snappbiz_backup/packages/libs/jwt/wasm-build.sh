#!/bin/bash
set -e

# Ensure zig is installed
if ! command -v zig &> /dev/null; then
    echo "Zig is not installed. Please install Zig first."
    exit 1
fi

# Create build directory if it doesn't exist
mkdir -p dist

# Build WASM
zig build --build-file packages/libs/jwt/build.zig -freference-trace

# Copy WASM to dist
cp zig-out/bin/jwt.wasm dist/jwt.wasm