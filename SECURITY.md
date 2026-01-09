# Security Policy

## Overview

This document outlines the security practices and policies for the LUKAS Protocol repository. We take security seriously and have implemented multiple layers of protection to prevent vulnerabilities and data exposure.

## Pre-Commit Security Checks

### Husky Hooks

We use Husky to run automated security checks before every commit. The pre-commit hook performs:

1. **Security Vulnerability Scan** - Detects sensitive data and common vulnerabilities
2. **Linting** - Enforces code quality standards
3. **Formatting** - Ensures consistent code style

### What Gets Scanned

#### Critical Issues (Blocks Commit)
- Private keys (Ethereum, RSA, EC)
- API keys (Alchemy, Infura, Etherscan)
- AWS credentials
- Database passwords
- Mnemonic phrases
- JWT tokens
- OAuth tokens

#### High Severity Issues (Blocks Commit)
- Hardcoded secrets in code
- Unsafe eval() usage
- Potential SQL injection
- Insecure cryptography (MD5, SHA1)

#### Medium Severity Issues (Warning)
- Deprecated security functions
- Weak encryption algorithms

## Environment Variables

### Never Commit
- `.env` - Local environment file
- `.env.local` - Local overrides
- `.env.*.local` - Environment-specific local files
- Any file containing secrets

### Use Instead
- `.env.example` - Template with placeholder values
- Environment-specific `.env.example` files
- CI/CD secrets management (GitHub Secrets, etc.)

## Sensitive Files

The following file types are automatically excluded from commits:

```
*.pem          # Private key files
*.key          # Key files
*.p8           # PKCS8 private keys
*.p12          # PKCS12 certificates
*.pfx          # PFX certificates
*.jks          # Java keystores
*.keystore     # Keystore files
```

## Git Configuration

### Pre-Commit Hook

Located at `.husky/pre-commit`, this hook:

1. Runs security scan (`scripts/security-scan.js`)
2. Runs lint-staged for code quality
3. Blocks commit if critical issues found

### Bypassing Hooks (Not Recommended)

If you absolutely must bypass pre-commit hooks:

```bash
git commit --no-verify
```

⚠️ **WARNING**: Only use this if you're absolutely certain there are no security issues. This is not recommended and may be rejected in code review.

## Lint-Staged Configuration

File: `.lintstagedrc.json`

Automatically runs on staged files:

- **JavaScript/TypeScript**: ESLint + Prettier
- **JSON/Markdown/YAML**: Prettier
- **Solidity**: Solhint
- **package.json**: npm audit

## Security Scanning Script

Location: `scripts/security-scan.js`

### Patterns Detected

#### Private Keys
- Ethereum private keys (64 hex characters)
- RSA private keys
- EC private keys
- PEM formatted keys

#### API Keys
- Generic API keys
- Alchemy API keys
- Infura API keys
- Etherscan API keys

#### AWS Credentials
- AWS Access Key IDs (AKIA...)
- AWS Secret Access Keys

#### Database Credentials
- Password fields
- Database URLs with credentials
- MongoDB connection strings

#### Authentication Tokens
- JWT tokens
- OAuth tokens
- Access tokens
- Refresh tokens

#### Blockchain Secrets
- Mnemonic phrases
- Seed phrases

### Running Manually

```bash
node scripts/security-scan.js
```

## Best Practices

### 1. Environment Variables

✅ **DO**:
```bash
# Use environment variables
const apiKey = process.env.ALCHEMY_API_KEY;
```

❌ **DON'T**:
```javascript
// Never hardcode secrets
const apiKey = "alchemy_abc123xyz";
```

### 2. Private Keys

✅ **DO**:
```bash
# Store in secure key management
# Use environment variables or secure vaults
const privateKey = process.env.PRIVATE_KEY;
```

❌ **DON'T**:
```javascript
// Never commit private keys
const privateKey = "0x1234567890abcdef...";
```

### 3. Credentials

✅ **DO**:
```bash
# Use .env.example as template
# Copy to .env and fill in values
# Add .env to .gitignore
```

❌ **DON'T**:
```bash
# Never commit .env files
git add .env  # WRONG!
```

### 4. Code Review

- All PRs must pass security checks
- Code review should verify no secrets are exposed
- Use GitHub's secret scanning

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. **DO** email security@lukas.lat with details
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## CI/CD Security

### GitHub Actions

- Secrets are stored in GitHub Secrets
- Never log secrets in CI/CD output
- Use `::add-mask::` to mask sensitive output

### Deployment

- Only deploy from verified commits
- Use signed commits for releases
- Verify all security checks pass

## Dependencies

### Vulnerability Scanning

```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

### Regular Updates

- Keep dependencies up to date
- Review security advisories
- Test updates before deploying

## Compliance

This repository follows:

- OWASP Top 10 security practices
- CWE/SANS Top 25 guidelines
- Ethereum security best practices
- NIST cybersecurity framework

## Security Checklist

Before committing:

- [ ] No `.env` files committed
- [ ] No private keys in code
- [ ] No API keys hardcoded
- [ ] No database credentials exposed
- [ ] No mnemonic phrases in code
- [ ] No JWT tokens in code
- [ ] All dependencies up to date
- [ ] No `eval()` usage
- [ ] No SQL injection vulnerabilities
- [ ] Code passes linting
- [ ] Code passes security scan

## Questions?

For security questions or concerns:
- Email: security@lukas.lat
- GitHub Issues: Use security label
- Discord: #security channel

---

**Last Updated**: 2026-01-09  
**Version**: 1.0.0
