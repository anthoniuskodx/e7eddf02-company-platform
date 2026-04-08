# Company Platform

**Company ID:** e7eddf02-4366-48bd-b716-9fd009a4cd82

Monorepo containing the company platform - NestJS backend and Next.js frontend.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/anthoniuskodx/e7eddf02-company-platform.git
cd e7eddf02-company-platform

# Install dependencies
npm install

# Start development servers
npm run dev
```

---

## 📁 Project Structure

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml          # CI/CD pipeline
│   │   └── deploy.yml      # Manual deployment
│   └── CODEOWNERS          # Code ownership
├── apps/
│   ├── backend/            # NestJS API server
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/           # Next.js web app
│       ├── src/
│       ├── Dockerfile
│       └── package.json
├── docs/
│   ├── tech-stack-decision-week1.md
│   └── cicd-setup.md
└── package.json            # Root workspace config
```

---

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend | NestJS | 10.x |
| Frontend | Next.js | 14.x (App Router) |
| Database | PostgreSQL | 16.x |
| ORM | Prisma | 5.x |
| Deployment | Dokploy | Latest |
| CI/CD | GitHub Actions | Latest |

---

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start all apps in development mode

# Building
npm run build            # Build all apps
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check
npm run format           # Format code with Prettier
```

---

## 🌿 Branch Strategy

| Branch | Purpose | Deploy To |
|--------|---------|-----------|
| `main` | Production | Production |
| `develop` | Integration | Staging |
| `feature/*` | Features | Manual |

### Protected Branches
- `main` and `develop` require:
  - Pull request with 1 approval
  - Passing CI checks
  - No force pushes allowed

---

## 🚢 Deployment

### Automatic Deployment
- Push to `develop` → Auto-deploy to **Staging**
- Push to `main` → Auto-deploy to **Production**

### Manual Deployment
1. Go to **Actions** tab
2. Select **Deploy** workflow
3. Choose environment and branch
4. Click **Run workflow**

---

## 📖 Documentation

- [Tech Stack Decisions](./docs/tech-stack-decision-week1.md)
- [CI/CD Setup Guide](./docs/cicd-setup.md)

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
PORT=3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm run test`
4. Commit with conventional commits
5. Push and create a pull request

---

## 📞 Support

- Issues: https://github.com/anthoniuskodx/e7eddf02-company-platform/issues
- Documentation: https://github.com/anthoniuskodx/e7eddf02-company-platform/tree/main/docs

---

**License:** Proprietary  
**Last Updated:** April 08, 2026
