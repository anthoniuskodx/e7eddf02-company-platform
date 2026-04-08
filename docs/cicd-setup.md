# CI/CD Pipeline Setup Documentation

**Company ID:** e7eddf02-4366-48bd-b716-9fd009a4cd82  
**Repository:** https://github.com/anthoniuskodx/e7eddf02-company-platform  
**Date:** April 08, 2026  
**Status:** ✅ Complete

---

## Overview

This document describes the CI/CD pipeline setup for the company platform monorepo. The pipeline uses GitHub Actions for continuous integration and Dokploy for continuous deployment.

---

## Repository Structure

```
e7eddf02-company-platform/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml          # Main CI pipeline
│   │   └── deploy.yml      # Manual deployment workflow
│   └── CODEOWNERS          # Automatic review assignments
├── apps/
│   ├── backend/            # NestJS backend
│   └── frontend/           # Next.js frontend
├── docs/                   # Documentation
└── package.json            # Root package.json (monorepo)
```

---

## Branch Strategy

| Branch | Purpose | Protection | Auto-Deploy |
|--------|---------|------------|-------------|
| `main` | Production code | ✅ Required PR, 1 approval, CI checks | ✅ Production |
| `develop` | Integration/Staging | ✅ Required PR, 1 approval, CI checks | ✅ Staging |
| `feature/*` | Feature development | ❌ No protection | ❌ Manual |

### Branch Protection Rules

Both `main` and `develop` branches have the following protections:
- **Required Pull Request Reviews:** 1 approving review required
- **Dismiss Stale Reviews:** Enabled (approvals reset on new commits)
- **Required Status Checks:** CI Pipeline must pass
- **Enforce Admins:** Rules apply to administrators
- **Force Pushes:** Disabled
- **Branch Deletion:** Disabled

---

## CI Pipeline (ci.yml)

### Triggers
- Push to `main` or `develop`
- Pull requests targeting `main` or `develop`

### Jobs

#### 1. Lint & Type Check
- **Purpose:** Code quality and type safety
- **Steps:**
  - Checkout code
  - Setup Node.js 20
  - Install dependencies
  - Run ESLint
  - Run TypeScript type check

#### 2. Test
- **Purpose:** Automated testing
- **Dependencies:** Requires lint job to pass
- **Steps:**
  - Run unit tests
  - Run E2E tests (main branch only)

#### 3. Build
- **Purpose:** Compile applications
- **Dependencies:** Requires lint and test jobs to pass
- **Steps:**
  - Build NestJS backend
  - Build Next.js frontend
  - Upload build artifacts

#### 4. Security Scan
- **Purpose:** Vulnerability detection
- **Dependencies:** Requires build job to pass
- **Steps:**
  - Run npm audit
  - Run Trivy filesystem scanner
  - Upload results to GitHub Security tab

#### 5. Build Docker Images
- **Purpose:** Container image creation
- **Dependencies:** Requires build and security jobs to pass
- **Trigger:** Push events only
- **Steps:**
  - Build backend Docker image
  - Build frontend Docker image

#### 6. Deploy to Staging
- **Purpose:** Deploy to staging environment
- **Trigger:** Push to `develop` branch
- **Steps:**
  - Deploy via Dokploy webhook

#### 7. Deploy to Production
- **Purpose:** Deploy to production environment
- **Trigger:** Push to `main` branch
- **Environment:** Requires production environment approval
- **Steps:**
  - Deploy via Dokploy webhook

---

## CD Pipeline (deploy.yml)

### Manual Deployment Workflow

Triggered manually via GitHub Actions UI with the following options:

**Inputs:**
- **Environment:** staging or production
- **Ref:** Branch or commit SHA to deploy

**Use Cases:**
- Hotfixes that need immediate deployment
- Re-deploying a previous version
- Deploying feature branches for testing

---

## Dokploy Integration

### Setup Steps

1. **Connect Repository**
   - Go to Dokploy dashboard
   - Add new project
   - Connect GitHub repository: `anthoniuskodx/e7eddf02-company-platform`

2. **Configure Environments**

   **Staging:**
   - Branch: `develop`
   - Auto-deploy: Enabled
   - Environment variables: Set per staging requirements

   **Production:**
   - Branch: `main`
   - Auto-deploy: Enabled (with approval gate)
   - Environment variables: Set per production requirements

3. **Webhook Configuration**
   - Dokploy automatically creates webhooks when connecting repos
   - Verify webhooks in GitHub repo Settings > Webhooks

### Deployment Flow

```
Developer → git push → GitHub → CI Pipeline → Dokploy → Deploy
                │                              │
                └───── Branch Protection ──────┘
```

---

## Environment Variables

Configure the following secrets in GitHub (Settings > Secrets and variables > Actions):

| Secret | Description | Required For |
|--------|-------------|--------------|
| `DOKPLOY_WEBHOOK_STAGING` | Staging deployment webhook | Auto-deploy staging |
| `DOKPLOY_WEBHOOK_PRODUCTION` | Production deployment webhook | Auto-deploy production |
| `DATABASE_URL` | PostgreSQL connection string | Build/Deploy |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Frontend build |

Configure environments in GitHub (Settings > Environments):
- `staging` - for staging deployments
- `production` - for production deployments (with required reviewers)

---

## Local Development

### Prerequisites
- Node.js 20+
- npm or pnpm
- Docker (for containerized testing)

### Setup

```bash
# Clone repository
git clone https://github.com/anthoniuskodx/e7eddf02-company-platform.git
cd e7eddf02-company-platform

# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm run test

# Build all apps
npm run build

# Start development servers
npm run dev
```

### Pre-commit Checklist
- [ ] Code passes linting
- [ ] Tests pass locally
- [ ] TypeScript compiles without errors
- [ ] Changes tested in development environment

---

## Troubleshooting

### CI Pipeline Failures

**Lint failures:**
```bash
npm run lint -- --fix
```

**Type errors:**
```bash
npm run type-check
```

**Test failures:**
```bash
npm run test -- --verbose
```

**Build failures:**
```bash
# Check disk space
df -h

# Clear node_modules and rebuild
rm -rf node_modules apps/*/node_modules
npm install
npm run build
```

### Deployment Issues

1. **Check Dokploy logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Check webhook delivery** in GitHub Settings > Webhooks
4. **Review deployment history** in Dokploy

---

## Security Best Practices

1. **Secrets Management**
   - Never commit secrets to the repository
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly

2. **Dependency Scanning**
   - Trivy scans run on every build
   - Review security advisories in GitHub Security tab
   - Update dependencies regularly

3. **Access Control**
   - Branch protection prevents direct pushes
   - Required reviews ensure code quality
   - Environment protection rules control deployments

---

## Monitoring & Alerts

### GitHub Actions
- View pipeline status: https://github.com/anthoniuskodx/e7eddf02-company-platform/actions
- Enable email notifications for failures

### Dokploy
- Monitor deployment status in Dokploy dashboard
- Set up alerts for deployment failures
- Review resource usage and logs

---

## Maintenance

### Regular Tasks
- [ ] Review and update dependencies monthly
- [ ] Audit GitHub Actions runners quarterly
- [ ] Review branch protection rules quarterly
- [ ] Test disaster recovery procedures quarterly

### Pipeline Updates
When modifying CI/CD workflows:
1. Test changes on a feature branch
2. Verify all jobs complete successfully
3. Document changes in this file
4. Notify team of breaking changes

---

## Support

For CI/CD issues:
1. Check this documentation
2. Review GitHub Actions logs
3. Check Dokploy deployment logs
4. Contact DevOps team

---

*Last Updated: April 08, 2026*  
*Document Version: 1.0*
