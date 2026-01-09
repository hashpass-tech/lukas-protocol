# Security Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will automatically install Husky and lint-staged.

### 2. Initialize Husky

```bash
npx husky install
```

This sets up the Git hooks for pre-commit security checks.

### 3. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your actual values (NEVER commit this!)
nano .env
```

### 4. Verify Setup

```bash
# Test the security scan
node scripts/security-scan.js

# Test linting
npx lint-staged
```

## What Happens on Commit

When you run `git commit`, the following checks run automatically:

```
1. Security Scan
   ├─ Detects private keys
   ├─ Detects API keys
   ├─ Detects database credentials
   ├─ Detects mnemonic phrases
   └─ Detects code vulnerabilities

2. Linting
   ├─ ESLint (JavaScript/TypeScript)
   ├─ Prettier (Formatting)
   ├─ Solhint (Solidity)
   └─ npm audit (Dependencies)

3. If all pass → Commit succeeds ✅
   If any fail → Commit blocked ❌
```

## Common Issues

### Issue: "Security scan failed"

**Cause**: Sensitive data detected in staged files

**Solution**:
1. Remove the sensitive data from your code
2. Use environment variables instead
3. Stage the corrected files
4. Try committing again

Example:
```javascript
// ❌ WRONG - Will be blocked
const apiKey = "alchemy_abc123xyz";

// ✅ CORRECT - Will pass
const apiKey = process.env.ALCHEMY_API_KEY;
```

### Issue: "Linting failed"

**Cause**: Code doesn't meet style standards

**Solution**:
```bash
# Auto-fix linting issues
npx eslint --fix <file>
npx prettier --write <file>

# Stage the fixed files
git add <file>

# Try committing again
git commit -m "message"
```

### Issue: "npm audit failed"

**Cause**: Vulnerable dependencies detected

**Solution**:
```bash
# View vulnerabilities
npm audit

# Fix automatically
npm audit fix

# If manual fix needed
npm update <package-name>

# Stage and commit
git add package.json package-lock.json
git commit -m "chore: update dependencies"
```

### Issue: "Bypass hooks with --no-verify"

**Not Recommended**, but if absolutely necessary:

```bash
git commit --no-verify
```

⚠️ **WARNING**: This bypasses all security checks. Only use if you're 100% certain there are no security issues.

## Environment Variables

### Required for Development

Create `.env` file (never commit):

```bash
# Copy template
cp .env.example .env

# Edit with your values
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
ALCHEMY_API_KEY=your_key_here
```

### Never Commit

- `.env` - Local environment
- `.env.local` - Local overrides
- `.env.*.local` - Environment-specific
- Private keys
- API keys
- Database passwords

### Always Commit

- `.env.example` - Template only
- `.env.*.example` - Environment templates

## Pre-Commit Hook Details

### Location
`.husky/pre-commit`

### What It Does
1. Runs security scan
2. Runs lint-staged
3. Blocks commit if issues found

### Manual Run
```bash
# Run pre-commit checks manually
.husky/pre-commit

# Or run individual checks
node scripts/security-scan.js
npx lint-staged
```

## Security Scan Details

### Location
`scripts/security-scan.js`

### Detects

**Critical (Blocks Commit)**:
- Private keys (Ethereum, RSA, EC)
- API keys (Alchemy, Infura, Etherscan)
- AWS credentials
- Database passwords
- Mnemonic phrases
- JWT tokens

**High (Blocks Commit)**:
- Hardcoded secrets
- Unsafe eval()
- SQL injection patterns
- Insecure crypto

**Medium (Warning)**:
- Deprecated functions
- Weak algorithms

### Manual Run
```bash
node scripts/security-scan.js
```

### Exclude Files
The scan automatically skips:
- `node_modules/`
- `.git/`
- `.next/`
- `dist/`, `build/`
- `*.lock` files
- `*.md` files
- `*.log` files

## Lint-Staged Configuration

### Location
`.lintstagedrc.json`

### What It Checks

| File Type | Tools |
|-----------|-------|
| `.js`, `.jsx`, `.ts`, `.tsx` | ESLint, Prettier |
| `.json`, `.md`, `.yml`, `.yaml` | Prettier |
| `.sol` | Solhint |
| `package.json` | npm audit |

### Manual Run
```bash
npx lint-staged
```

## Best Practices

### 1. Use Environment Variables

```javascript
// ✅ GOOD
const apiKey = process.env.ALCHEMY_API_KEY;

// ❌ BAD
const apiKey = "alchemy_abc123xyz";
```

### 2. Never Commit Secrets

```bash
# ✅ GOOD - Add to .gitignore
.env
.env.local
*.key
*.pem

# ❌ BAD - Never do this
git add .env
git add private_key.pem
```

### 3. Use .env.example

```bash
# ✅ GOOD - Commit template
.env.example

# ❌ BAD - Commit actual values
.env
```

### 4. Review Before Committing

```bash
# Check what you're committing
git diff --cached

# Check for secrets
node scripts/security-scan.js

# Then commit
git commit -m "message"
```

## Troubleshooting

### Husky not running

```bash
# Reinstall Husky
npx husky install

# Verify hooks are installed
ls -la .husky/
```

### Permission denied on pre-commit

```bash
# Make script executable
chmod +x .husky/pre-commit
chmod +x scripts/security-scan.js
```

### ESLint not found

```bash
# Install ESLint
npm install eslint --save-dev

# Or reinstall all dependencies
npm install
```

### Prettier not found

```bash
# Install Prettier
npm install prettier --save-dev

# Or reinstall all dependencies
npm install
```

## CI/CD Integration

### GitHub Actions

The security checks also run in CI/CD:

```yaml
- name: Security Scan
  run: node scripts/security-scan.js

- name: Lint
  run: npx lint-staged

- name: Audit Dependencies
  run: npm audit --audit-level=moderate
```

## Support

For issues or questions:

1. Check this guide first
2. Review `SECURITY.md`
3. Check GitHub Issues
4. Email: security@lukas.lat

## Checklist

Before your first commit:

- [ ] Installed dependencies (`npm install`)
- [ ] Initialized Husky (`npx husky install`)
- [ ] Created `.env` file from `.env.example`
- [ ] Verified security scan works
- [ ] Verified linting works
- [ ] Read `SECURITY.md`
- [ ] Understand pre-commit checks

---

**Last Updated**: 2026-01-09  
**Version**: 1.0.0
