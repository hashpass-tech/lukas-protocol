#!/bin/bash

# Archive Old Documentation Utility
# Moves old markdown files from root to .archive/guides/
# Keeps only critical files in root

set -e

echo "=========================================="
echo "Repository Documentation Cleanup"
echo "=========================================="
echo ""

# Define critical files to keep in root
CRITICAL_FILES=(
    "README.md"
    "CHANGELOG.md"
    "VERSIONING.md"
    "LICENSE"
)

# Define files to archive
FILES_TO_ARCHIVE=(
    "AMOY_DEPLOYMENT_READINESS_CHECKLIST.md"
    "AMOY_DEPLOYMENT_SUMMARY.md"
    "AMOY_QUICK_START_DEPLOYMENT.md"
    "DEPLOYMENT_READINESS_SUMMARY.md"
    "EXECUTE_AMOY_DEPLOYMENT.md"
    "FHENIX_AMOY_DEPLOYMENT_EXECUTION.md"
    "FHENIX_DEPLOYMENT_SUMMARY.md"
    "FHENIX_IMPLEMENTATION_STATUS.md"
    "FHENIX_PHASE3_COMPLETION_SUMMARY.md"
    "FHENIX_PROJECT_COMPLETION_REPORT.md"
    "FHENIX_PROPERTY_TESTS_SUMMARY.md"
    "FHENIX_SESSION_COMPLETION_REPORT.md"
    "FINAL_DEPLOYMENT_STATUS.md"
    "PHASE1_COMPLETION_SUMMARY.md"
    "DEPLOYMENT_VERIFICATION.txt"
    "AMOY_DEPLOYMENT_COMMAND.sh"
    "DEPLOYMENT_CHECKLIST.txt"
    "PROTOCOL_CONTRACTS_DASHBOARD_SPEC.md"
)

# Create archive directory if it doesn't exist
mkdir -p .archive/guides

echo "Step 1: Archiving old documentation files..."
echo ""

ARCHIVED_COUNT=0
for file in "${FILES_TO_ARCHIVE[@]}"; do
    if [ -f "$file" ]; then
        echo "  Archiving: $file"
        mv "$file" ".archive/guides/$file"
        ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
    fi
done

echo ""
echo "Step 2: Verifying critical files remain in root..."
echo ""

MISSING_CRITICAL=0
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file (present)"
    else
        if [ "$file" != "LICENSE" ]; then
            echo "  ✗ $file (MISSING)"
            MISSING_CRITICAL=$((MISSING_CRITICAL + 1))
        fi
    fi
done

echo ""
echo "Step 3: Creating archive index..."
echo ""

# Create archive index
cat > .archive/guides/ARCHIVED_DOCS_INDEX.md << 'EOF'
# Archived Documentation Index

**Date**: January 8, 2026  
**Purpose**: Archive of old documentation files moved from root

## Archived Files

### Deployment Documentation
- AMOY_DEPLOYMENT_READINESS_CHECKLIST.md
- AMOY_DEPLOYMENT_SUMMARY.md
- AMOY_QUICK_START_DEPLOYMENT.md
- DEPLOYMENT_READINESS_SUMMARY.md
- EXECUTE_AMOY_DEPLOYMENT.md
- FHENIX_AMOY_DEPLOYMENT_EXECUTION.md
- AMOY_DEPLOYMENT_COMMAND.sh

### FHENIX Documentation
- FHENIX_DEPLOYMENT_SUMMARY.md
- FHENIX_IMPLEMENTATION_STATUS.md
- FHENIX_PHASE3_COMPLETION_SUMMARY.md
- FHENIX_PROJECT_COMPLETION_REPORT.md
- FHENIX_PROPERTY_TESTS_SUMMARY.md
- FHENIX_SESSION_COMPLETION_REPORT.md

### Dashboard Documentation
- PROTOCOL_CONTRACTS_DASHBOARD_SPEC.md
- PHASE1_COMPLETION_SUMMARY.md
- FINAL_DEPLOYMENT_STATUS.md

### Checklists & Status
- DEPLOYMENT_VERIFICATION.txt
- DEPLOYMENT_CHECKLIST.txt

## Critical Files Remaining in Root

- README.md - Main project documentation
- CHANGELOG.md - Version history
- VERSIONING.md - Versioning guidelines
- LICENSE - Project license

## Archive Location

All archived files are stored in: `.archive/guides/`

## Retrieval

To retrieve an archived file:
```bash
cp .archive/guides/FILENAME.md ./FILENAME.md
```

## Notes

- Archive was created on January 8, 2026
- Total files archived: 18
- Purpose: Keep root directory clean and organized
- Critical files remain in root for easy access
EOF

echo "  ✓ Created ARCHIVED_DOCS_INDEX.md"

echo ""
echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  Files archived: $ARCHIVED_COUNT"
echo "  Critical files remaining: ${#CRITICAL_FILES[@]}"
echo "  Missing critical files: $MISSING_CRITICAL"
echo ""
echo "Archive location: .archive/guides/"
echo "Archive index: .archive/guides/ARCHIVED_DOCS_INDEX.md"
echo ""

if [ $MISSING_CRITICAL -gt 0 ]; then
    echo "⚠️  WARNING: $MISSING_CRITICAL critical files are missing!"
    exit 1
else
    echo "✅ Cleanup successful!"
    exit 0
fi
