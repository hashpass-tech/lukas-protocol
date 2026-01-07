# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

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