#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Patterns to detect sensitive data
const SENSITIVE_PATTERNS = [
  {
    name: 'Private Keys',
    patterns: [
      /0x[a-fA-F0-9]{64}(?!.*0x0+)/,  // Ethereum private keys (64 hex chars)
      /-----BEGIN PRIVATE KEY-----/,
      /-----BEGIN RSA PRIVATE KEY-----/,
      /-----BEGIN EC PRIVATE KEY-----/,
    ],
    severity: 'critical',
  },
  {
    name: 'API Keys',
    patterns: [
      /api[_-]?key\s*[:=]\s*['"](.*?)['"]/gi,
      /apikey\s*[:=]\s*['"](.*?)['"]/gi,
      /ALCHEMY_API_KEY\s*[:=]/,
      /INFURA_API_KEY\s*[:=]/,
      /ETHERSCAN_API_KEY\s*[:=]/,
    ],
    severity: 'critical',
  },
  {
    name: 'AWS Credentials',
    patterns: [
      /AKIA[0-9A-Z]{16}/,  // AWS Access Key ID
      /aws_secret_access_key\s*[:=]/i,
      /aws_access_key_id\s*[:=]/i,
    ],
    severity: 'critical',
  },
  {
    name: 'Database Credentials',
    patterns: [
      /password\s*[:=]\s*['"](.*?)['"]/gi,
      /db_password\s*[:=]/i,
      /DATABASE_URL\s*[:=]\s*['"](.*?)['"]/gi,
      /mongodb\+srv:\/\/.*:.*@/,
    ],
    severity: 'critical',
  },
  {
    name: 'JWT Tokens',
    patterns: [
      /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    ],
    severity: 'high',
  },
  {
    name: 'OAuth Tokens',
    patterns: [
      /oauth[_-]?token\s*[:=]\s*['"](.*?)['"]/gi,
      /access[_-]?token\s*[:=]\s*['"](.*?)['"]/gi,
      /refresh[_-]?token\s*[:=]\s*['"](.*?)['"]/gi,
    ],
    severity: 'high',
  },
  {
    name: 'Mnemonic Phrases',
    patterns: [
      /mnemonic\s*[:=]\s*['"](.*?)['"]/gi,
      /seed\s*[:=]\s*['"](.*?)['"]/gi,
    ],
    severity: 'critical',
  },
];

// Files to exclude from scanning
const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /\.env\.example/,
  /\.env\.sample/,
  /package-lock\.json/,
  /pnpm-lock\.yaml/,
  /yarn\.lock/,
  /\.md$/,
  /\.log$/,
];

// Get staged files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', {
      encoding: 'utf8',
    }).trim();
    return output.split('\n').filter(file => file.length > 0);
  } catch (error) {
    log('Warning: Could not get staged files', colors.yellow);
    return [];
  }
}

// Check if file should be scanned
function shouldScanFile(filePath) {
  return !EXCLUDED_PATTERNS.some(pattern => pattern.test(filePath));
}

// Scan file for sensitive data
function scanFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];

    SENSITIVE_PATTERNS.forEach(({ name, patterns, severity }) => {
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          findings.push({
            file: filePath,
            type: name,
            severity,
            matches: matches.length,
          });
        }
      });
    });

    return findings;
  } catch (error) {
    log(`Warning: Could not scan ${filePath}: ${error.message}`, colors.yellow);
    return [];
  }
}

// Check for common vulnerability patterns
function checkVulnerabilities(filePath) {
  try {
    if (!fs.existsSync(filePath) || !filePath.endsWith('.js') && !filePath.endsWith('.ts')) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const vulnerabilities = [];

    // Check for eval usage
    if (/\beval\s*\(/.test(content)) {
      vulnerabilities.push({
        file: filePath,
        type: 'Unsafe eval() usage',
        severity: 'high',
      });
    }

    // Check for hardcoded secrets in code
    if (/const\s+\w*secret\w*\s*=\s*['"]/i.test(content)) {
      vulnerabilities.push({
        file: filePath,
        type: 'Hardcoded secret in code',
        severity: 'high',
      });
    }

    // Check for SQL injection patterns
    if (/query\s*\(\s*['"]\s*SELECT.*\$\{/.test(content)) {
      vulnerabilities.push({
        file: filePath,
        type: 'Potential SQL injection',
        severity: 'high',
      });
    }

    // Check for insecure crypto
    if (/crypto\.createCipher|md5|sha1/.test(content)) {
      vulnerabilities.push({
        file: filePath,
        type: 'Insecure cryptography',
        severity: 'medium',
      });
    }

    return vulnerabilities;
  } catch (error) {
    return [];
  }
}

// Main scan function
function main() {
  log('\n🔐 Security Scan Starting...\n', colors.cyan);

  const stagedFiles = getStagedFiles();
  let criticalFindings = [];
  let highFindings = [];
  let mediumFindings = [];

  log(`Scanning ${stagedFiles.length} staged files...\n`, colors.cyan);

  stagedFiles.forEach(file => {
    if (!shouldScanFile(file)) {
      return;
    }

    // Scan for sensitive data
    const sensitiveFindings = scanFile(file);
    sensitiveFindings.forEach(finding => {
      if (finding.severity === 'critical') {
        criticalFindings.push(finding);
      } else if (finding.severity === 'high') {
        highFindings.push(finding);
      }
    });

    // Check for vulnerabilities
    const vulnerabilities = checkVulnerabilities(file);
    vulnerabilities.forEach(vuln => {
      if (vuln.severity === 'high') {
        highFindings.push(vuln);
      } else if (vuln.severity === 'medium') {
        mediumFindings.push(vuln);
      }
    });
  });

  // Report findings
  if (criticalFindings.length > 0) {
    log('\n❌ CRITICAL SECURITY ISSUES FOUND:\n', colors.red);
    criticalFindings.forEach(finding => {
      log(`  🔴 ${finding.file}`, colors.red);
      log(`     Type: ${finding.type}`, colors.red);
      log(`     Severity: ${finding.severity}`, colors.red);
    });
    log('\n⚠️  Commit blocked due to critical security issues!', colors.red);
    process.exit(1);
  }

  if (highFindings.length > 0) {
    log('\n⚠️  HIGH SEVERITY ISSUES FOUND:\n', colors.yellow);
    highFindings.forEach(finding => {
      log(`  🟠 ${finding.file}`, colors.yellow);
      log(`     Type: ${finding.type}`, colors.yellow);
      log(`     Severity: ${finding.severity}`, colors.yellow);
    });
    log('\n⚠️  Please review and fix these issues before committing.', colors.yellow);
    process.exit(1);
  }

  if (mediumFindings.length > 0) {
    log('\n⚠️  MEDIUM SEVERITY ISSUES FOUND:\n', colors.yellow);
    mediumFindings.forEach(finding => {
      log(`  🟡 ${finding.file}`, colors.yellow);
      log(`     Type: ${finding.type}`, colors.yellow);
    });
    log('\nConsider fixing these issues.\n', colors.yellow);
  }

  log('✅ Security scan passed!\n', colors.green);
  process.exit(0);
}

main();
