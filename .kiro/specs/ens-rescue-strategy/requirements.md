# Requirements Document

## Introduction

The lukas-lat.eth ENS domain is under attack. The main deployer private key was accidentally exposed in a GitHub deployment script, and an attacker has gained control of the wallet. The attacker has implemented delegation mechanisms to maintain control over the ENS domain even if we attempt to transfer it. This document outlines the requirements for an emergency ENS rescue operation using Flashbots atomic bundles to recover the domain before the attacker can complete their takeover.

## Glossary

- **ENS_Registry**: The Ethereum Name Service registry contract that manages domain ownership
- **Compromised_Wallet**: The wallet with exposed private key (0x4f36dc378d1c78181b3f544a81e8951fb4838ad9)
- **Attacker**: The malicious actor who has gained control of the compromised wallet
- **Delegation_Contract**: Smart contract deployed by attacker to maintain control via delegation
- **Flashbots_Bundle**: Atomic transaction bundle that executes multiple transactions in a single block
- **Rescue_Wallet**: Secure wallet to receive the rescued ENS domain
- **MEV_Protection**: Maximal Extractable Value protection to prevent front-running

## Requirements

### Requirement 1: Emergency ENS Domain Analysis

**User Story:** As a security responder, I want to analyze the current state of the lukas-lat.eth domain, so that I can understand the attacker's control mechanisms and plan the rescue operation.

#### Acceptance Criteria

1. WHEN analyzing the ENS domain, THE System SHALL identify the current owner address of lukas-lat.eth
2. WHEN checking delegation status, THE System SHALL detect any delegation contracts or proxy mechanisms
3. WHEN examining transaction history, THE System SHALL identify all recent transactions from the compromised wallet
4. WHEN analyzing smart contracts, THE System SHALL identify any malicious contracts deployed by the attacker
5. WHEN checking resolver settings, THE System SHALL verify current resolver configuration and any unauthorized changes

### Requirement 2: Flashbots Atomic Bundle Construction

**User Story:** As a security responder, I want to construct atomic Flashbots bundles, so that I can rescue the ENS domain without being front-run by the attacker.

#### Acceptance Criteria

1. WHEN constructing a rescue bundle, THE System SHALL create funding transactions to provide gas for the compromised wallet
2. WHEN building transfer transactions, THE System SHALL create ENS transfer calls signed by the compromised private key
3. WHEN assembling the bundle, THE System SHALL ensure all transactions execute atomically in a single block
4. WHEN targeting block inclusion, THE System SHALL submit bundles for multiple future blocks to maximize success probability
5. WHEN handling delegation, THE System SHALL bypass or disable any delegation mechanisms before transfer

### Requirement 3: Multi-Strategy Rescue Execution

**User Story:** As a security responder, I want to execute multiple rescue strategies simultaneously, so that I can maximize the chances of successful ENS recovery.

#### Acceptance Criteria

1. WHEN executing direct transfer, THE System SHALL attempt direct ENS registry transferFrom calls
2. WHEN handling delegation bypass, THE System SHALL call delegation contract methods to revoke or bypass control
3. WHEN using resolver manipulation, THE System SHALL attempt to change resolver to a controlled address before transfer
4. WHEN employing gas price competition, THE System SHALL use competitive gas pricing to outbid attacker transactions
5. WHEN coordinating timing, THE System SHALL execute all strategies within the same block window

### Requirement 4: Real-time Monitoring and Response

**User Story:** As a security responder, I want real-time monitoring of the rescue operation, so that I can adapt the strategy based on attacker actions and network conditions.

#### Acceptance Criteria

1. WHEN monitoring mempool, THE System SHALL detect any pending transactions from the compromised wallet
2. WHEN tracking attacker activity, THE System SHALL identify new malicious transactions or contract deployments
3. WHEN observing bundle status, THE System SHALL monitor Flashbots bundle inclusion rates and adjust strategy
4. WHEN detecting failures, THE System SHALL automatically retry with modified parameters
5. WHEN confirming success, THE System SHALL verify ENS domain transfer to the rescue wallet

### Requirement 5: Emergency Fallback Mechanisms

**User Story:** As a security responder, I want fallback mechanisms for rescue failure scenarios, so that I can continue recovery efforts if initial attempts fail.

#### Acceptance Criteria

1. WHEN primary rescue fails, THE System SHALL execute alternative rescue strategies using different transaction patterns
2. WHEN delegation cannot be bypassed, THE System SHALL attempt to exploit delegation contract vulnerabilities
3. WHEN gas wars occur, THE System SHALL escalate gas prices beyond economically rational levels for the attacker
4. WHEN timing attacks fail, THE System SHALL coordinate with multiple Flashbots relayers for broader coverage
5. WHEN all automated attempts fail, THE System SHALL provide manual intervention options with pre-signed transactions

### Requirement 6: Security and Operational Safety

**User Story:** As a security responder, I want operational safety measures, so that I can execute the rescue without exposing additional assets or creating new vulnerabilities.

#### Acceptance Criteria

1. WHEN handling private keys, THE System SHALL use secure key management and never log sensitive data
2. WHEN funding rescue operations, THE System SHALL use isolated funding wallets with minimal balances
3. WHEN executing transactions, THE System SHALL validate all transaction data before signing
4. WHEN communicating with relayers, THE System SHALL use authenticated and encrypted connections
5. WHEN storing rescue artifacts, THE System SHALL securely store all transaction receipts and evidence

### Requirement 7: Post-Rescue Security Hardening

**User Story:** As a security responder, I want immediate security hardening after successful rescue, so that I can prevent future attacks on the recovered ENS domain.

#### Acceptance Criteria

1. WHEN ENS transfer completes, THE System SHALL immediately transfer domain to a secure multi-signature wallet
2. WHEN updating resolver, THE System SHALL set resolver to a controlled and audited resolver contract
3. WHEN configuring records, THE System SHALL update all ENS records to point to secure infrastructure
4. WHEN revoking access, THE System SHALL revoke any remaining permissions or approvals from the compromised wallet
5. WHEN documenting incident, THE System SHALL create a complete incident report with timeline and lessons learned