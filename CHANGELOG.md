# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [0.2.45] - 2026-01-09
### Added
- Network switcher for Protocol Contracts Dashboard (Ethereum Mainnet, Polygon Amoy, Sepolia Testnet)
- Complete contract registry with 15 contracts across 3 networks
- Architecture visualization showing all contract relationships

### Changed
- Updated contract data to show only verified deployments
- Improved badge sizing on contract cards (fixed overflow issues)
- Enhanced dark mode support with semantic CSS variables throughout

### Fixed
- Removed placeholder StabilizerVault address from Amoy deployments
- Corrected deployment data accuracy to 100% verified
- Fixed dark mode contrast issues in Architecture visualization component

## [0.2.42] - 2026-01-09
### Added
- Contracts view always visible in header (no wallet connection required)

### Changed
- Updated dashboard components to use CSS variables for proper dark/light mode support
- Improved text contrast in dark mode with white titles for better readability
- Theme switching now works across entire app (light/dark mode toggle functional)

### Fixed
- Dark mode not applying properly on contracts dashboard
- Light mode not working due to forced dark theme
- Poor text contrast on contract titles in dark mode
- Theme provider now respects user preference instead of forcing dark mode

## [0.2.42] - 2026-01-09
### Added

### Changed

### Fixed

## [0.2.42] - 2026-01-09

### Added
- Contracts view always visible in header (no wallet connection required)

### Changed
- Updated dashboard components to use CSS variables for proper dark/light mode support
- Improved text contrast in dark mode with white titles for better readability
- Theme switching now works across entire app (light/dark mode toggle functional)

### Fixed
- Dark mode not applying properly on contracts dashboard
- Light mode not working due to forced dark theme
- Poor text contrast on contract titles in dark mode
- Theme provider now respects user preference instead of forcing dark mode

## [0.2.41] - 2026-01-09
### Added
- D3.js 2D/3D architecture visualization for Protocol Contracts Dashboard
- Three.js 3D view with orbiting nodes, animated connections, and camera controls
- 2D/3D view switcher with 3D as default
- Directional arrows for connection types (dependency, bidirectional, data flow)

### Changed
- Version script now archives old documentation files on each release

### Fixed
- Missing d3 dependency in package.json causing CI build failure

## [0.2.41] - 2026-01-09

### Added



### Changed



### Fixed





## [0.2.40] - 2026-01-09

### Added

- Task 7: Create version comparison tool specification (3c1abd4)
- Task 6: Create version history documentation (e3edddd)
- Add automated documentation cleanup system (3e2465b)
- Task 5: Create interaction visualization guide (3dfc851)
- Task 4: Create contract interaction mapping (c447e5d)
- Add dashboard implementation status report (b7684b8)
- Task 3: Create technical overview documentation (9a4c9d3)
- Task 2: Create contract state documentation (e6fd5e9)
- Task 1: Create contract registry data structure (4738aac)
- Add Protocol Contracts Dashboard tasks (bd36fd5)
- Add deployment checklist - visual reference guide (fa3d6da)
- Add final deployment status - ready for Amoy (6d28027)
- Add FHENIX Amoy deployment script (9270ef2)
- Add deployment readiness summary (c89f7e5)
- Add FHENIX Amoy deployment execution plan (b89eb01)
- Add deployment verification document - confirms Amoy readiness (4d4498c)
- Add Amoy deployment summary - ready for immediate deployment (d3218f0)
- Add Amoy deployment readiness documentation (d6d9c93)
- Add final project completion report - FHENIX project 100% complete (876bc66)
- Add Phase 1 deployment configuration and guide - Tasks 15 & 16 complete (092be95)
- Add session completion report - Phase 3 fully delivered (e6a28a8)
- Add Phase 3 completion summary - all tasks complete (04f0496)
- Add FHENIX stability and operations roadmap - Task 13 complete (8111440)
- Add comprehensive FHENIX documentation - Task 12 complete (fde564c)
- Add comprehensive FHENIX implementation status document - Phase 2 complete (3fc44cb)
- Implement encrypted stabilization integration (Tasks 10 & 10.2) (8ccc1fd)
- Add orchestration layer integration tests (Task 9.1) (56d3eee)
- Complete property-based tests for FHENIX encrypted stabilization (57cdda7)
- Add property-based tests for FHENIX encryption (24 tests, 256 runs each) (5a41948)
- Complete FHENIX Encrypted Stabilization Infrastructure (Phase 2.1-2.4) (adc3e42)

### Changed

- Phase 3 Complete: Version History & Changelog (fa2daaf)
- Cleanup system ready for Phase 3 (39a34fb)
- Phase 2 Complete: Interactions & Dependencies (56a9168)
- Phase 1 Complete: Contract Registry & Documentation (ef0a0c3)
- Mark Phase 4 tasks complete - all 17 tasks finished (ae71653)
- Mark Task 13 complete - stability and operations roadmap documentation (5320aff)
- Mark completed tasks: 10.1, 14, 14.1, 14.2 - all property tests and checkpoint verified (3b58c0e)
- Update FHENIX deployment summary with proxy test completion - 255 total tests passing (833a6a4)
- Mark Tasks 10 and 10.2 as complete (775963f)
- Mark Task 9.1 (orchestration integration tests) as complete (06803f3)
- Update FHENIX deployment summary with property-based testing results (0054830)
- Add FHENIX property-based tests completion summary (f7ee38f)
- Add FHENIX deployment summary and status report (9905391)

### Fixed

- Fix DeployFhenixPhase1 script - correct constructor parameters (85b4a93)
- Fix EncryptedParameterProxy tests - all 27 tests passing (1b4c839)
- Fix DecryptionAuthorization property test SingleAuthorizer (085e1be)



## [0.3.0] - 2026-01-07

### Added

- **FHENIX Encrypted Stabilization Infrastructure** (Phase 2.1-2.4 Complete)
  - FhenixEncryptionManager: Key management and encryption lifecycle
  - EncryptedMintCeiling: Encrypted supply limit parameter
  - EncryptedPegDeviation: Encrypted sensitivity parameter
  - EncryptedCurveParameters: Encrypted stabilization curve coefficients
  - FhenixComputationEngine: Homomorphic operations (add, multiply, compare, polynomial eval)
  - FhenixDecryptionHandler: Multi-sig decryption with authorization
  - EncryptionOrchestrator: Coordinated encrypted parameter routing
  - EncryptedParameterProxy: Modular upgrade pattern
  - 106 comprehensive unit tests (100% passing)
  - Complete error handling system (20+ custom errors)
  - Full API documentation and integration guides

### Changed

- Updated roadmap with FHENIX implementation status
- Enhanced protocol architecture documentation

### Fixed

- Fixed IHooks import in CreateSepoliaPool.s.sol
- Fixed console.log overload issues in deployment scripts

## [0.2.39] - 2025-12-28

### Added



### Changed



### Fixed

- Improve wallet connect modal responsiveness on wide screens (e7f6ea5)



## [0.2.39] - 2025-12-28

### Added



### Changed



### Fixed





## [0.2.39] - 2025-12-28

### Added

### Changed

### Fixed
- Fixed wallet connect modal responsiveness on wide screens
- Improved modal width constraints and responsive design
- Enhanced wallet button scaling and spacing across all screen sizes
- Added better proportional padding and typography for wallet connection UI

## [0.2.38] - 2025-12-20
### Added

### Changed

### Fixed
- Fixed useSearchParams Suspense boundary error in pool page for static export

## [0.2.37] - 2025-12-20
### Added
- WalletConnect session restoration on page refresh for mobile persistence

### Changed
- Pool page now defaults to Metrics tab instead of Swap
- View Metrics link now navigates directly to Metrics tab

### Fixed
- Fixed WalletConnect mobile session not persisting after page refresh
- Fixed pool page tab parameter support (?tab=metrics)