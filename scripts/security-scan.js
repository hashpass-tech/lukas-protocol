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
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Patterns to detect sensitive data
const SENSITIVE_PATTERNS = [
  {
    name: 'Ethereum Private Keys (64 hex)',
    patterns: [
      /(?:^|[^a-fA-F0-9])0x[a-fA-F0-9]{64}(?:[^a-fA-F0-9]|$)/,  // Ethereum private keys with 0x prefix
      /(?:^|[^a-fA-F0-9])[a-fA-F0-9]{64}(?:[^a-fA-F0-9]|$)/,     // Ethereum private keys without 0x prefix
    ],
    severity: 'critical',
    exclude: [
      /0x0+/,  // Exclude all zeros
      /FHENIX_PUBLIC_KEY/,  // Exclude FHENIX public keys (not private)
      /publicKey/i,  // Exclude anything labeled as public key
      /hash:/i,  // Exclude transaction hashes
      /txHash/i,  // Exclude transaction hashes
      /transactionHash/i,  // Exclude transaction hashes
      /blockHash/i,  // Exclude block hashes
      /bytecode/i,  // Exclude bytecode
      /deployedBytecode/i,  // Exclude deployed bytecode
      /\.json:/,  // Exclude JSON build artifacts
    ],
  },
  {
    name: 'RSA/EC Private Keys',
    patterns: [
      /-----BEGIN PRIVATE KEY-----/,
      /-----BEGIN RSA PRIVATE KEY-----/,
      /-----BEGIN EC PRIVATE KEY-----/,
      /-----BEGIN OPENSSH PRIVATE KEY-----/,
    ],
    severity: 'critical',
  },
  {
    name: 'Alchemy API Keys in URLs',
    patterns: [
      /alchemy\.com\/v2\/[a-zA-Z0-9_-]{10,}/,
    ],
    severity: 'critical',
    exclude: [
      /YOUR_KEY/i,
      /your_alchemy_api_key/i,
      /\$\{.*\}/,  // Exclude template variables
      /process\.env/,  // Exclude env var references
    ],
  },
  {
    name: 'Infura API Keys in URLs',
    patterns: [
      /infura\.io\/v3\/[a-zA-Z0-9]{32}/,
    ],
    severity: 'critical',
    exclude: [
      /YOUR_KEY/i,
      /your_infura_key/i,
      /\$\{.*\}/,
      /process\.env/,
    ],
  },
  {
    name: 'API Keys (Generic)',
    patterns: [
      /(?:api[_-]?key|apikey)\s*[:=]\s*["'](?!your_|placeholder|xxx|test)[a-zA-Z0-9_-]{20,}["']/gi,
      /ETHERSCAN_API_KEY\s*[:=]\s*["'](?!your_|placeholder|xxx|<)[a-zA-Z0-9]{20,}["']/i,
      /POLYGONSCAN_API_KEY\s*[:=]\s*["'](?!your_|placeholder|xxx|<)[a-zA-Z0-9]{20,}["']/i,
    ],
    severity: 'critical',
    exclude: [
      /<REDACTED/,
      /placeholder/i,
      /your_/i,
      /example/i,
    ],
  },
  {
    name: 'AWS Credentials',
    patterns: [
      /AKIA[0-9A-Z]{16}/,  // AWS Access Key ID
      /aws_secret_access_key\s*[:=]\s*["'][^"']{20,}["']/i,
      /aws_access_key_id\s*[:=]\s*["']AKIA[0-9A-Z]{16}["']/i,
    ],
    severity: 'critical',
  },
  {
    name: 'Database Credentials',
    patterns: [
      /(?:password|passwd|pwd)\s*[:=]\s*["'](?!your_|placeholder|xxx|test|\*+)[^"']{8,}["']/gi,
      /DATABASE_URL\s*[:=]\s*["'](?:postgres|mysql|mongodb):\/\/[^"']+["']/gi,
      /mongodb\+srv:\/\/[^:]+:[^@]+@/,
    ],
    severity: 'critical',
    exclude: [
      /user:password@localhost/i,
      /example\.com/i,
    ],
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
      /(?:oauth|bearer|access|refresh)[_-]?token\s*[:=]\s*["'](?!your_|placeholder)[a-zA-Z0-9_-]{20,}["']/gi,
    ],
    severity: 'high',
  },
  {
    name: 'Mnemonic/Seed Phrases',
    patterns: [
      /(?:mnemonic|seed)\s*[:=]\s*["'](?!your_|placeholder)(?:\w+\s+){11,23}\w+["']/gi,
    ],
    severity: 'critical',
  },
  {
    name: 'Generic Secrets',
    patterns: [
      /(?:secret|token|key)\s*[:=]\s*["'](?!your_|placeholder|xxx|test|<)[a-zA-Z0-9_-]{32,}["']/gi,
    ],
    severity: 'high',
    exclude: [
      /JWT_SECRET/i,  // Common placeholder
      /CLIENT_SECRET/i,  // Common placeholder
    ],
  },
];

// Files to exclude from scanning
const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.git\//,
  /\.next/,
  /dist\//,
  /build\//,
  /coverage\//,
  /out\//,  // Exclude Foundry build artifacts
  /broadcast\//,  // Exclude Foundry broadcast logs
  /packages\/contracts\/out\//,  // Exclude contract build artifacts
  /packages\/contracts\/broadcast\//,  // Exclude broadcast logs
  /packages\/contracts\/lib\//,  // Exclude contract libraries (forge-std, openzeppelin, etc.)
  /packages\/contracts\/deployments\//,  // Exclude deployment artifacts
  /\.env\.example$/,
  /\.env\.sample$/,
  /\.env\.template$/,
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /\.log$/,
  /\.map$/,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.pdf$/,  // Exclude PDFs
  /\.adoc$/,  // Exclude AsciiDoc files
  /SECURITY_AUDIT_REPORT\.md$/,  // Exclude the audit report itself
  /security-scan\.js$/,  // Exclude this script
  /packages\/flashbots-ens-rescue-master\//,  // Exclude ENS rescue folder (in .gitignore)
  /scripts\/test-specific-rpcs\.js$/,  // Exclude RPC test script (in .gitignore)
  /scripts\/.*flashbots.*\.js$/,  // Exclude flashbots scripts (in .gitignore)
  /scripts\/.*rescue.*\.js$/,  // Exclude rescue scripts (in .gitignore)
  /scripts\/.*delegation.*\.js$/,  // Exclude delegation scripts (in .gitignore)
  /scripts\/.*exploit.*\.js$/,  // Exclude exploit scripts (in .gitignore)
  /\.archive\//,  // Exclude archived documentation
  /\.test\./,  // Exclude test files
  /\.spec\./,  // Exclude spec files
  /\/test\//,  // Exclude test directories
  /\/tests\//,  // Exclude tests directories
  /\/fixtures\//,  // Exclude fixture files
  /\/mocks\//,  // Exclude mock files
];

// Get staged files
function getStagedFiles() {
  try {
    // Get staged files with their status
    const output = execSync('git diff --cached --name-status', {
      encoding: 'utf8',
    }).trim();
    
    if (!output) {
      return [];
    }
    
    // Parse output: "M\tfile.txt" or "D\tfile.txt"
    const files = output.split('\n')
      .filter(line => line.length > 0)
      .map(line => {
        const [status, file] = line.split('\t');
        return { status, file };
      })
      .filter(({ status }) => status !== 'D') // Exclude deleted files
      .map(({ file }) => file);
    
    return files;
  } catch (error) {
    log('Warning: Could not get staged files', colors.yellow);
    return [];
  }
}

// Check if .env files exist and are not in git
function checkEnvFiles() {
  const envFiles = [
    '.env',
    'apps/web/.env',
    'packages/contracts/.env',
  ];
  
  const findings = [];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      try {
        // Check if file is tracked by git
        execSync(`git ls-files --error-unmatch ${envFile}`, {
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        // If we get here, file IS tracked (bad!)
        findings.push({
          file: envFile,
          type: '.env file is tracked by git',
          severity: 'critical',
          line: 1,
          preview: 'This file should be in .gitignore'
        });
      } catch (error) {
        // File is not tracked (good!)
        // But let's warn if it contains secrets
        const content = fs.readFileSync(envFile, 'utf8');
        if (content.includes('PRIVATE') || content.includes('SECRET') || content.includes('API_KEY')) {
          log(`  ℹ️  ${envFile} exists locally (not tracked - OK)`, colors.cyan);
        }
      }
    }
  });
  
  return findings;
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
    const lines = content.split('\n');

    SENSITIVE_PATTERNS.forEach(({ name, patterns, severity, exclude }) => {
      patterns.forEach(pattern => {
        // Check each line for matches
        lines.forEach((line, lineNum) => {
          const matches = line.match(pattern);
          if (matches) {
            // Check if this match should be excluded
            let shouldExclude = false;
            if (exclude) {
              shouldExclude = exclude.some(excludePattern => 
                excludePattern.test(line)
              );
            }

            if (!shouldExclude) {
              // Extract the matched content (truncate if too long)
              const matchedContent = matches[0].length > 50 
                ? matches[0].substring(0, 50) + '...' 
                : matches[0];

              findings.push({
                file: filePath,
                line: lineNum + 1,
                type: name,
                severity,
                preview: matchedContent,
              });
            }
          }
        });
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

// Recursively get all files in directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      
      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(filePath);
      }
    });

    return arrayOfFiles;
  } catch (error) {
    return arrayOfFiles;
  }
}

// Main scan function
function main() {
  const args = process.argv.slice(2);
  const fullScan = args.includes('--full') || args.includes('-f');
  const helpFlag = args.includes('--help') || args.includes('-h');

  if (helpFlag) {
    log('\n🔐 Security Scanner\n', colors.cyan);
    log('Usage:', colors.bright);
    log('  node scripts/security-scan.js           # Scan staged files (pre-commit)', colors.reset);
    log('  node scripts/security-scan.js --full    # Scan entire repository', colors.reset);
    log('  node scripts/security-scan.js --help    # Show this help\n', colors.reset);
    process.exit(0);
  }

  log('\n🔐 Security Scan Starting...\n', colors.cyan);

  let filesToScan = [];
  
  if (fullScan) {
    log('Mode: Full repository scan\n', colors.magenta);
    filesToScan = getAllFiles('.');
  } else {
    log('Mode: Staged files scan (pre-commit)\n', colors.magenta);
    
    // Check if .env files are accidentally tracked
    log('Checking .env files...\n', colors.cyan);
    const envFindings = checkEnvFiles();
    if (envFindings.length > 0) {
      log('\n❌ CRITICAL: .env FILES ARE TRACKED BY GIT!\n', colors.red);
      envFindings.forEach(finding => {
        log(`  🔴 ${finding.file}`, colors.red);
        log(`     ${finding.preview}`, colors.red);
      });
      log('\n⚠️  Run: git rm --cached .env', colors.red);
      log('⚠️  Then commit the removal\n', colors.red);
      process.exit(1);
    }
    
    filesToScan = getStagedFiles();
    
    if (filesToScan.length === 0) {
      log('No files staged for commit.\n', colors.yellow);
      log('✅ Security scan passed (no files to scan)!\n', colors.green);
      process.exit(0);
    }
  }

  // Filter files
  filesToScan = filesToScan.filter(shouldScanFile);

  log(`Scanning ${filesToScan.length} files...\n`, colors.cyan);

  let criticalFindings = [];
  let highFindings = [];
  let mediumFindings = [];
  let scannedCount = 0;

  filesToScan.forEach(file => {
    scannedCount++;
    
    // Show progress for full scans
    if (fullScan && scannedCount % 50 === 0) {
      process.stdout.write(`\rProgress: ${scannedCount}/${filesToScan.length} files...`);
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

  if (fullScan) {
    process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear progress line
  }

  // Report findings
  if (criticalFindings.length > 0) {
    log('\n❌ CRITICAL SECURITY ISSUES FOUND:\n', colors.red);
    criticalFindings.forEach(finding => {
      log(`  🔴 ${finding.file}:${finding.line || '?'}`, colors.red);
      log(`     Type: ${finding.type}`, colors.red);
      log(`     Severity: ${finding.severity}`, colors.red);
      if (finding.preview) {
        log(`     Preview: ${finding.preview}`, colors.red);
      }
      log('', colors.reset);
    });
    log(`\n⚠️  Found ${criticalFindings.length} critical issue(s)!`, colors.red);
    log('⚠️  Commit blocked due to critical security issues!\n', colors.red);
    process.exit(1);
  }

  if (highFindings.length > 0) {
    log('\n⚠️  HIGH SEVERITY ISSUES FOUND:\n', colors.yellow);
    highFindings.forEach(finding => {
      log(`  🟠 ${finding.file}:${finding.line || '?'}`, colors.yellow);
      log(`     Type: ${finding.type}`, colors.yellow);
      log(`     Severity: ${finding.severity}`, colors.yellow);
      if (finding.preview) {
        log(`     Preview: ${finding.preview}`, colors.yellow);
      }
      log('', colors.reset);
    });
    log(`\n⚠️  Found ${highFindings.length} high severity issue(s)!`, colors.yellow);
    log('⚠️  Please review and fix these issues before committing.\n', colors.yellow);
    process.exit(1);
  }

  if (mediumFindings.length > 0) {
    log('\n⚠️  MEDIUM SEVERITY ISSUES FOUND:\n', colors.yellow);
    mediumFindings.forEach(finding => {
      log(`  🟡 ${finding.file}:${finding.line || '?'}`, colors.yellow);
      log(`     Type: ${finding.type}`, colors.yellow);
      if (finding.preview) {
        log(`     Preview: ${finding.preview}`, colors.yellow);
      }
      log('', colors.reset);
    });
    log(`\nFound ${mediumFindings.length} medium severity issue(s).`, colors.yellow);
    log('Consider fixing these issues.\n', colors.yellow);
  }

  log('✅ Security scan passed!\n', colors.green);
  log(`📊 Summary:`, colors.cyan);
  log(`   Files scanned: ${scannedCount}`, colors.cyan);
  log(`   Critical issues: ${criticalFindings.length}`, colors.cyan);
  log(`   High issues: ${highFindings.length}`, colors.cyan);
  log(`   Medium issues: ${mediumFindings.length}\n`, colors.cyan);
  
  process.exit(0);
}

main();
