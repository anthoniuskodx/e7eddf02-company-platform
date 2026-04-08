const std = @import("std");

pub fn build(b: *std.Build) void {
    const optimize = b.standardOptimizeOption(.{});

    const target = b.standardTargetOptions(.{
        .default_target = .{
            .cpu_arch = .wasm32,
            .os_tag = .wasi,
            .abi = .musl,
        },
    });

    // Define the main executable or library for your project
    const exe = b.addExecutable(.{
        .name = "jwt",
        .target = target,
        .root_source_file = b.path("src/main.zig"),
        .optimize = optimize,
    });

    exe.rdynamic = true;

    // Install step (optional): copy the build to the installation directory
    b.installArtifact(exe);

    // Add a default build step for `zig build`
    b.default_step.dependOn(&exe.step);
}
