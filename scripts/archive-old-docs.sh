#!/bin/bash

# Archive Old Documentation Utility
# Moves old markdown files from root to .archive/guides/
# Keeps only critical files in root

set -e

echo "=========================================="
echo "Repository Documentation Cleanup"
echo "=========================================="
echo ""

# Define critical files to keep in root (whitelist)
CRITICAL_FILES=(
    "README.md"
    "CHANGELOG.md"
    "VERSIONING.md"
    "LICENSE"
    "CONTRIBUTING.md"
    "CODE_OF_CONDUCT.md"
    "SECURITY.md"
)

# Create archive directory if it doesn't exist
mkdir -p .archive/guides

echo "Step 1: Archiving old documentation files..."
echo ""

ARCHIVED_COUNT=0
ARCHIVED_FILES=()

# Get all .md files in root directory
for file in *.md; do
    # Skip if no .md files found
    [ -e "$file" ] || continue
    
    # Check if file is in whitelist
    IS_CRITICAL=false
    for critical in "${CRITICAL_FILES[@]}"; do
        if [ "$file" == "$critical" ]; then
            IS_CRITICAL=true
            break
        fi
    done
    
    # Archive if not critical
    if [ "$IS_CRITICAL" == "false" ]; then
        echo "  Archiving: $file"
        mv "$file" ".archive/guides/$file"
        ARCHIVED_FILES+=("$file")
        ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
    fi
done

# Also archive any .txt checklist files
for file in *.txt; do
    [ -e "$file" ] || continue
    if [[ "$file" == *"CHECKLIST"* ]] || [[ "$file" == *"VERIFICATION"* ]]; then
        echo "  Archiving: $file"
        mv "$file" ".archive/guides/$file"
        ARCHIVED_FILES+=("$file")
        ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
    fi
done

# Archive any deployment shell scripts (except deploy-pool.sh)
for file in *.sh; do
    [ -e "$file" ] || continue
    if [[ "$file" != "deploy-pool.sh" ]] && [[ "$file" == *"DEPLOYMENT"* || "$file" == *"COMMAND"* ]]; then
        echo "  Archiving: $file"
        mv "$file" ".archive/guides/$file"
        ARCHIVED_FILES+=("$file")
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
        if [ "$file" != "LICENSE" ] && [ "$file" != "CONTRIBUTING.md" ] && [ "$file" != "CODE_OF_CONDUCT.md" ] && [ "$file" != "SECURITY.md" ]; then
            echo "  ✗ $file (MISSING)"
            MISSING_CRITICAL=$((MISSING_CRITICAL + 1))
        fi
    fi
done

echo ""
echo "Step 3: Updating archive index..."
echo ""

# Create/update archive index
CURRENT_DATE=$(date +%Y-%m-%d)
cat > .archive/ARCHIVED_GUIDES_INDEX.md << EOF
# Archived Documentation Index

**Last Updated**: ${CURRENT_DATE}
**Purpose**: Archive of old documentation files moved from root

## Recently Archived Files

EOF

# Add archived files to index
if [ ${#ARCHIVED_FILES[@]} -gt 0 ]; then
    for file in "${ARCHIVED_FILES[@]}"; do
        echo "- ${file}" >> .archive/ARCHIVED_GUIDES_INDEX.md
    done
else
    echo "_No files archived in this run_" >> .archive/ARCHIVED_GUIDES_INDEX.md
fi

cat >> .archive/ARCHIVED_GUIDES_INDEX.md << 'EOF'

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
EOF

echo "  ✓ Updated ARCHIVED_GUIDES_INDEX.md"

echo ""
echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  Files archived: $ARCHIVED_COUNT"
if [ $ARCHIVED_COUNT -gt 0 ]; then
    echo "  Archived files:"
    for file in "${ARCHIVED_FILES[@]}"; do
        echo "    🗑️  $file"
    done
fi
echo ""
echo "Archive location: .archive/guides/"
echo ""

if [ $MISSING_CRITICAL -gt 0 ]; then
    echo "⚠️  WARNING: $MISSING_CRITICAL critical files are missing!"
    exit 1
else
    echo "✅ Cleanup successful!"
    exit 0
fi
