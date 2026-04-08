# SnappBiz - Deep Dive Analysis

**Repository:** https://github.com/anthoniuskodx/snappbiz  
**Analyzed:** March 29, 2026  
**Total Files:** ~147  
**Lines of Code:** ~3,214 (TypeScript)

---

## Executive Summary

SnappBiz is a multi-tenant SaaS authentication and business management platform built on Cloudflare's edge infrastructure. It implements a microservices architecture using Cloudflare Workers with service-to-service RPC communication. The codebase follows Clean Architecture principles with clear separation of concerns across domain, application, infrastructure, and presentation layers.

---

## Project Architecture

### Monorepo Structure (Nx Workspace)

```
snappbiz/
├── apps/server/              # Deployable worker applications
│   ├── auth/                 # Authentication worker (RPC-based)
│   ├── gateway/              # API Gateway (HTTP-based, Hono)
│   ├── oidc/                 # OIDC/OAuth2 provider worker (WIP)
│   └── tenant/               # Tenant management worker (WIP)
├── packages/
│   ├── libs/                 # Shared business logic libraries
│   │   ├── auth/             # Auth domain models, schemas, DTOs
│   │   ├── crypto/           # Cryptographic utilities (Scrypt, ID gen)
│   │   ├── jwt/              # JWT/OIDC implementation with Zig WASM
│   │   ├── tenant/           # Tenant domain models and schemas
│   │   ├── zod/              # Zod schema utilities
│   │   └── zig-wasm-learn/   # Zig/WASM experiments
│   └── types/                # Shared TypeScript type definitions
└── templates/                # Backup/reference implementations
```

### Key Technologies

| Layer | Technology |
|-------|------------|
| **Runtime** | Cloudflare Workers (edge compute) |
| **Framework** | Hono (lightweight web framework) |
| **API Spec** | OpenAPI 3.0 + Zod validation |
| **Database** | Cloudflare D1 (SQLite at edge) |
| **ORM** | Drizzle ORM + Drizzle Kit |
| **Build Tool** | Bun (fast JavaScript runtime/bundler) |
| **Monorepo** | Nx (20.0.11) |
| **Crypto WASM** | Zig (compiled to WASM for JWT operations) |

---

## Service Architecture

### 1. Gateway Service (apps/server/gateway)
**Role:** Public-facing HTTP API
- **Framework:** Hono with OpenAPI/Zod integration
- **Port:** 3000 (local dev)
- **Features:**
  - Swagger UI at `/ui`
  - OpenAPI spec at `/doc`
  - CORS enabled
  - Request logging
  - Protected route middleware (placeholder)

**Routes:**
- `GET /v1/heartbeat` - Health check
- `POST /v1/super-admin/auth/register` - Super admin registration
- `POST /v1/super-admin/auth/login` - Super admin login

### 2. Auth Worker (apps/server/auth)
**Role:** Internal authentication microservice
- **Type:** Cloudflare WorkerEntrypoint (RPC)
- **Port:** 3001 (local dev)
- **Methods:**
  - `registerSuperAdmin(payload)` - Creates new super admin
  - `loginSuperAdmin(payload)` - Authenticates super admin
  - `registerTenantAdmin()` - (placeholder)
  - `registerUser()` - (placeholder)
  - `loginPhoneWithPassword()` - (placeholder)

### 3. OIDC Worker (apps/server/oidc)
**Role:** OAuth2/OIDC provider (WIP - skeleton only)

### 4. Tenant Worker (apps/server/tenant)
**Role:** Multi-tenant management (WIP - skeleton only)

---

## Domain Architecture (Clean Architecture)

### Layer Structure

```
src/
├── domain/                   # Enterprise business rules
│   ├── entities/             # Domain entities (User, SuperAdmin)
│   └── schemas/              # Drizzle ORM table definitions
├── application/
│   ├── ports/                # Interfaces (UseCases, Repositories)
│   └── usecases/             # Application business rules
├── infrastructure/           # External concerns
│   ├── database/             # D1/Drizzle implementations
│   └── adapters/             # External service adapters
└── presentation/
    ├── primary/              # Incoming adapters (HTTP, RPC)
    └── secondary/            # Outgoing adapters (DB, external APIs)
```

### Auth Domain (packages/libs/auth)

**Entities:**
- `SuperAdmin` - Platform administrator
- `User` - End user
- `UserLoginMethod` - Authentication methods per user
- `UserOTP` - One-time password records
- `UserReferral` - Referral tracking
- `UserSecurity` - Security events/audit
- `IdentityProvider` - External IdP configurations

**DTOs:**
- `SuperAdminRegisterDto` - Registration input
- `SuperAdminLoginDto` - Login input
- `LoggedInDto` - Authentication result
- `SuperAdminAPIAuthResult` - API auth response

### Tenant Domain (packages/libs/tenant)

**Multi-tenancy Model:**
```
Tenant (1) ---> (*) Company (1) ---> (*) Branch
   |
   +---> (*) TenantAPI (service bindings)
```

**Entities:**
- `Tenant` - Top-level organization
- `Company` - Business entity within tenant
- `Branch` - Physical/digital locations
- `TenantAPI` - API configuration per tenant
- `UserTenant` - User-tenant relationships
- `UserCompany` - User-company relationships

---

## Database Schema

### Auth Database (D1)

| Table | Purpose |
|-------|---------|
| `super_admin` | Platform administrators |
| `user` | End users |
| `user_login_method` | Auth methods (password, OAuth, etc.) |
| `user_otp` | OTP codes for 2FA |
| `user_referral` | Referral program tracking |
| `user_security` | Security audit log |
| `identity_provider` | SSO/OAuth provider configs |

### Tenant Database (D1)

| Table | Purpose |
|-------|---------|
| `tenant` | SaaS tenants |
| `company` | Companies within tenants |
| `branch` | Company branches/locations |
| `tenant_api` | Tenant-specific API bindings |
| `user_tenant` | User-tenant memberships |
| `user_company` | User-company memberships |

---

## Security Implementation

### Password Hashing
- **Algorithm:** Scrypt (via @snappbiz/crypto)
- **Parameters:** N=16384, r=16, p=1, dkLen=64
- **Salt:** 16 bytes random, hex encoded
- **Format:** `salt:hash`

### JWT Implementation (packages/libs/jwt)
- **WASM:** Zig-compiled for edge performance
- **Features:**
  - Token generation
  - Authorization key generation (OIDC)
  - Authorization code verification
- **Key Management:** RSA key pairs stored in environment

### Authentication Flow

```
Client -> Gateway (Hono)
    |
    v
Service Binding RPC -> Auth Worker
    |
    +-> Validate input (Zod)
    +-> Check existing user
    +-> Hash password (Scrypt)
    +-> Insert to D1 (Drizzle)
    +-> Return DTO
    |
    v
Response (JSON)
```

---

## Build & Deployment

### Build Commands (Nx scripts)

```bash
# Build all server apps
yarn build-backend

# Auth worker development
yarn auth:dev                    # wrangler dev on :3001
yarn auth:db:studio              # Drizzle Studio
yarn auth:db:generate            # Generate migrations
yarn auth:db:migrate:local       # Apply local migrations

# Gateway development  
yarn gateway:dev                 # wrangler dev on :3000

# Tenant database
yarn tenant:db:studio
yarn tenant:db:generate
yarn tenant:db:migrate:local

# JWT utilities
yarn jwt:build                   # Build WASM
yarn jwt:generate-key-pair       # Generate RSA keys
```

### Deployment Targets
- **Primary:** Cloudflare Workers (edge)
- **Database:** Cloudflare D1 (SQLite)
- **Local Dev:** Miniflare (via Wrangler)

---

## Project Configuration

### Wrangler Configuration (auth worker example)

```toml
name = "snappbiz-auth-worker"
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2024-10-22"

[[d1_databases]]
binding = "AuthDB"
database_name = "auth-dev"
database_id = "ca64f15c-a924-4bca-ad5f-62562f6eb02a"
migrations_dir = "../../../packages/libs/auth/migrations/auth"

[vars]
NODE_ENV = "development"
BACKEND_URL = "https://gw-dev.snappbiz.com"
JWT_ISSUER = "https://gw-dev.snappbiz.com/oidc"
```

### Nx Tags

| Tag | Purpose |
|-----|---------|
| `type:app` | Applications (deployable) |
| `type:lib` | Libraries (shared code) |
| `scope:auth` | Authentication domain |
| `scope:server` | HTTP servers |
| `scope:worker` | WorkerEntrypoint services |
| `provider:cloudflare` | Cloudflare-specific |

---

## Code Quality & Standards

### Patterns Used
- **Clean Architecture** - Domain/Application/Infrastructure separation
- **Dependency Inversion** - Ports/Adapters pattern
- **Repository Pattern** - Data access abstraction
- **Use Case Pattern** - Application business logic encapsulation
- **Factory Pattern** - Controller instantiation

### Validation
- **Runtime:** Zod schemas for all inputs
- **OpenAPI:** Auto-generated from Zod
- **TypeScript:** Strict mode with project references

### Testing Infrastructure
- **Framework:** Jest (configured, minimal tests)
- **Location:** Co-located with source files

---

## Development Status

### Implemented Features
- [x] Project scaffolding (Nx monorepo)
- [x] Gateway with Hono + OpenAPI
- [x] Auth worker with RPC communication
- [x] Super admin registration/login
- [x] Password hashing (Scrypt)
- [x] JWT/WASM foundation
- [x] D1 database schemas (Auth + Tenant)
- [x] Drizzle ORM integration

### In Progress / Placeholder
- [ ] OIDC/OAuth2 flows
- [ ] Tenant management API
- [ ] User registration (non-superadmin)
- [ ] Session management
- [ ] Protected route middleware
- [ ] Service binding factory pattern

### Notable Gaps
- No test coverage for business logic
- Incomplete OIDC implementation
- Gateway-auth integration uses direct RPC instead of service bindings
- Missing rate limiting
- Missing audit logging

---

## Key Dependencies

```json
{
  "hono": "^4.6.9",              // Web framework
  "@hono/zod-openapi": "^0.17.0", // OpenAPI + Zod
  "drizzle-orm": "^0.36.1",       // ORM
  "drizzle-zod": "^0.5.1",        // Zod integration
  "zod": "^3.23.8",               // Validation
  "@libsql/client": "^0.14.0",    // SQLite client
  "cloudflare": "^3.5.0",         // Workers SDK
  "wrangler": "^3.86.0",          // CLI tool
  "@oslojs/encoding": "^1.1.0",   // Crypto encoding
  "libphonenumber-js": "^1.11.14" // Phone validation
}
```

---

## Recommendations

### High Priority
1. **Add comprehensive tests** - Unit tests for use cases, integration tests for workers
2. **Complete OIDC implementation** - Authorization code flow, token endpoint
3. **Implement service bindings** - Proper inter-service communication
4. **Add rate limiting** - Prevent brute force attacks
5. **Audit logging** - Security event tracking

### Medium Priority
1. **Error handling** - Standardized error responses across services
2. **Observability** - Structured logging, tracing, metrics
3. **Configuration management** - Environment-specific configs
4. **CI/CD pipeline** - Automated testing and deployment

### Low Priority
1. **API versioning strategy** - URL vs header versioning
2. **Caching layer** - KV for frequently accessed data
3. **Documentation** - API usage guides, architecture decision records

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│                   (Web/Mobile/Third-party)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    GATEWAY WORKER                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Routes    │  │  OpenAPI    │  │   CORS      │  │   │
│  │  │  (Hono)     │  │   + Zod     │  │ Middleware  │  │   │
│  │  └──────┬──────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────┼────────────────────────────────────────────┘   │
│            │ Service Binding RPC                             │
└────────────┼────────────────────────────────────────────────┘
             │
    ┌────────┼────────┬────────┐
    ▼        ▼        ▼        ▼
┌───────┐ ┌───────┐ ┌──────┐ ┌────────┐
│ AUTH  │ │ OIDC  │ │TENANT│ │ OTHER  │
│WORKER │ │WORKER │ │WORKER│ │SERVICES│
└───┬───┘ └───────┘ └──────┘ └────────┘
    │
    ▼
┌──────────────────────────────────┐
│        CLOUDFLARE D1             │
│  ┌──────────┐  ┌──────────┐      │
│  │ AUTH DB  │  │TENANT DB │      │
│  │ (SQLite) │  │ (SQLite) │      │
│  └──────────┘  └──────────┘      │
└──────────────────────────────────┘
```

---

*Analysis completed by Hermes Agent*
*Generated for: anthoniuskodx/snappbiz*
