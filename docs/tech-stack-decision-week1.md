# Tech Stack Decision Document - Week 1 Engineering Setup

**Company ID:** e7eddf02-4366-48bd-b716-9fd009a4cd82  
**Issue:** d2d62777-42e3-4293-81c5-d40c24d1f058  
**Owner:** CTO  
**Date:** Wednesday, April 08, 2026  
**Status:** Final Decisions

---

## Executive Summary

This document outlines the technology stack decisions for Week 1 engineering setup. The selected technologies prioritize developer productivity, scalability, maintainability, and alignment with modern best practices while leveraging our existing infrastructure investments.

---

## 1. Backend Framework

### Options Considered

| Framework | Language | Pros | Cons |
|-----------|----------|------|------|
| **NestJS** | TypeScript | Strong typing, modular architecture, excellent Prisma integration, active ecosystem | Learning curve for newcomers |
| Express.js | TypeScript/JavaScript | Minimal, flexible, large ecosystem | Less opinionated, more boilerplate |
| FastAPI | Python | Fast, auto-docs, great for ML | Less enterprise adoption, Python ecosystem |
| Go (Gin/Fiber) | Go | Performance, concurrency | Smaller ecosystem, steeper learning curve |
| Rails | Ruby | Rapid development, convention over configuration | Performance concerns, declining popularity |

### Decision: **NestJS**

### Rationale

1. **TypeScript First**: Full-stack TypeScript enables code sharing, consistent typing, and better developer experience across the stack
2. **Prisma Integration**: First-class Prisma ORM support with excellent type safety and auto-completion
3. **Enterprise-Ready**: Built-in support for dependency injection, modular architecture, and testing
4. **GraphQL & REST**: Native support for both API styles, allowing flexibility as requirements evolve
5. **Active Ecosystem**: Strong community support, regular updates, and extensive documentation
6. **Team Familiarity**: Aligns with modern JavaScript/TypeScript skillsets common in the market

### Version
- NestJS v10.x (latest stable)
- Node.js v20.x LTS

---

## 2. Database Layer

### Decision: **PostgreSQL + Prisma ORM**

*(Pre-determined requirement, confirmed for documentation)*

### Configuration Details

| Component | Choice | Version |
|-----------|--------|---------|
| Database | PostgreSQL | 16.x |
| ORM | Prisma | 5.x |
| Connection Pooling | PgBouncer | 1.x (via Dokploy) |
| Migrations | Prisma Migrate | Built-in |

### Rationale

1. **PostgreSQL**
   - Robust, battle-tested relational database
   - Excellent JSON support for flexible data structures
   - Strong consistency guarantees
   - Extensive ecosystem and tooling
   - Well-supported on Proxmox/Dokploy infrastructure

2. **Prisma ORM**
   - Type-safe database access with auto-generated types
   - Intuitive schema definition language
   - Built-in migration management
   - Excellent NestJS integration
   - Reduces boilerplate and potential for SQL injection
   - Strong developer experience with auto-completion

### Database Hosting
- Primary: Self-hosted PostgreSQL on Proxmox VM (via Dokploy)
- Backups: Automated daily backups with 30-day retention
- Replication: Single instance for Week 1, plan for read replicas at scale

---

## 3. Frontend Framework

### Options Considered

| Framework | Language | Pros | Cons |
|-----------|----------|------|------|
| **Next.js** | TypeScript/React | SSR/SSG, full-stack capabilities, excellent DX, Vercel ecosystem | Can be overkill for simple apps |
| React (Vite) | TypeScript/JavaScript | Flexible, large ecosystem, fast dev server | Need to configure SSR separately |
| Vue 3 + Nuxt | TypeScript/JavaScript | Gentle learning curve, good performance | Smaller ecosystem than React |
| SvelteKit | TypeScript | Excellent performance, minimal boilerplate | Smaller ecosystem, hiring challenges |
| Angular | TypeScript | Full framework, enterprise adoption | Steep learning curve, verbose |

### Decision: **Next.js 14+ (App Router)**

### Rationale

1. **TypeScript Synergy**: Seamless integration with NestJS backend through shared types
2. **Full-Stack Capabilities**: API routes for simple backend needs, reducing initial infrastructure
3. **Performance**: Built-in optimizations (image optimization, font optimization, code splitting)
4. **SEO Ready**: Server-side rendering out of the box
5. **Developer Experience**: Fast refresh, excellent tooling, large community
6. **Deployment Flexibility**: Can deploy anywhere (not locked to Vercel)
7. **React Ecosystem**: Access to largest component library ecosystem
8. **Hiring Pool**: Largest talent pool among modern frameworks

### Version
- Next.js 14.x (App Router)
- React 18.x
- TypeScript 5.x

### Recommended Additions
- **UI Library**: shadcn/ui (copy-paste components, full customization)
- **State Management**: React Query (TanStack Query) for server state
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS

---

## 4. Deployment Strategy

### Decision: **Dokploy on Proxmox**

*(Pre-determined requirement, confirmed for documentation)*

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Proxmox VE Cluster                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Dokploy Instance (VM/Container)     │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │    │
│  │  │ Traefik │  │ Dokploy │  │   PostgreSQL    │  │    │
│  │  │ (Proxy) │  │  Panel  │  │   (Dokploy DB)  │  │    │
│  │  └─────────┘  └─────────┘  └─────────────────┘  │    │
│  │  ┌─────────────────┐  ┌─────────────────────┐   │    │
│  │  │   App Container │  │   App Container     │   │    │
│  │  │   (NestJS API)  │  │   (Next.js Frontend)│   │    │
│  │  └─────────────────┘  └─────────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Rationale

1. **Cost Efficiency**: Self-hosted solution eliminates cloud provider markup
2. **Proxmox Integration**: Leverages existing Proxmox infrastructure investment
3. **Dokploy Benefits**
   - Git-based deployments (push to deploy)
   - Built-in SSL/TLS management via Traefik
   - One-click database provisioning
   - Resource monitoring and management
   - Multi-environment support (dev, staging, production)
   - Docker Compose native support
4. **Full Control**: Complete control over infrastructure, networking, and security
5. **Scalability**: Can scale horizontally by adding Proxmox nodes
6. **No Vendor Lock-in**: Full ownership of deployment pipeline

### Environment Strategy

| Environment | Purpose | Hosting |
|-------------|---------|---------|
| Development | Local development | Docker Compose (local) |
| Staging | Pre-production testing | Dokploy (Proxmox) |
| Production | Live application | Dokploy (Proxmox) |

---

## 5. CI/CD Approach

### Decision: **GitHub Actions + Dokploy Git Integration**

### Pipeline Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Developer  │────▶│  GitHub/GitLab  │────▶│  Dokploy    │
│   (git push) │     │   Repository    │     │  (Deploy)   │
└──────────────┘     └─────────────────┘     └─────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  GitHub Actions │
                   │  (CI Pipeline)  │
                   └─────────────────┘
```

### CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
Triggers: pull_request, push to main

Stages:
1. Lint & Type Check
   - ESLint (code quality)
   - Prettier (formatting check)
   - TypeScript compilation

2. Test
   - Unit tests (Jest/Vitest)
   - Integration tests
   - E2E tests (Playwright) - on main branch only

3. Build
   - Build NestJS backend
   - Build Next.js frontend
   - Docker image build & tag

4. Security Scan
   - Dependency vulnerability check (npm audit, Snyk)
   - Container scan (Trivy)
```

### CD Strategy

| Branch | Environment | Deployment Trigger |
|--------|-------------|-------------------|
| feature/* | Ephemeral preview | Manual (on-demand) |
| develop | Staging | Auto on merge |
| main | Production | Auto on merge (with approval gate) |

### Dokploy Integration

1. **Git-Based Deploy**: Connect Dokploy to GitHub repository
2. **Auto-Deploy**: Configure webhook triggers for automatic deployments
3. **Rollback**: One-click rollback to previous deployments via Dokploy UI
4. **Environment Variables**: Managed through Dokploy panel per environment

### Rationale

1. **GitHub Actions**
   - Native GitHub integration (assuming GitHub for source control)
   - Generous free tier for small teams
   - Extensive marketplace of pre-built actions
   - YAML-based configuration (version controlled)
   - Strong community support

2. **Dokploy CD**
   - Simple, visual deployment management
   - No need for complex Kubernetes setups initially
   - Built-in rollback capabilities
   - Environment isolation
   - Cost-effective for self-hosted infrastructure

3. **Combined Approach**
   - CI handles quality gates and testing
   - CD handles deployment orchestration
   - Clear separation of concerns
   - Easy to understand and maintain

---

## 6. Summary of Final Decisions

| Category | Decision | Version | Notes |
|----------|----------|---------|-------|
| **Backend Framework** | NestJS | 10.x | TypeScript, modular architecture |
| **Database** | PostgreSQL | 16.x | Via Dokploy managed service |
| **ORM** | Prisma | 5.x | Type-safe database access |
| **Frontend Framework** | Next.js | 14.x | App Router, SSR/SSG |
| **UI Library** | shadcn/ui | Latest | Customizable components |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Deployment** | Dokploy | Latest | On Proxmox infrastructure |
| **CI/CD** | GitHub Actions | Latest | + Dokploy Git integration |
| **Container Runtime** | Docker | Latest | Via Dokploy |
| **Reverse Proxy** | Traefik | Latest | Via Dokploy (auto-configured) |

---

## 7. Implementation Checklist (Week 1)

- [ ] Set up NestJS project with Prisma integration
- [ ] Configure PostgreSQL via Dokploy
- [ ] Set up Next.js project with TypeScript
- [ ] Configure GitHub repository with branch protection
- [ ] Create GitHub Actions CI pipeline
- [ ] Set up Dokploy on Proxmox
- [ ] Configure staging environment on Dokploy
- [ ] Configure production environment on Dokploy
- [ ] Set up environment variable management
- [ ] Configure SSL certificates (auto via Traefik)
- [ ] Document local development setup
- [ ] Create initial database schema and migrations

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Self-hosted infrastructure downtime | High | Regular backups, monitoring alerts, Proxmox HA if budget allows |
| Team learning curve (NestJS/Next.js) | Medium | Documentation, pair programming, dedicated learning time |
| Dokploy maturity/limitations | Medium | Have manual Docker Compose fallback, monitor Dokploy releases |
| Single database instance | High | Implement automated backups, plan for replication in Week 2-3 |
| CI/CD complexity | Low | Start simple, iterate based on team feedback |

---

## 9. Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| CTO (Owner) | | Pending | |
| Lead Engineer | | Pending | |
| DevOps | | Pending | |

---

*Document Version: 1.0*  
*Last Updated: April 08, 2026*
