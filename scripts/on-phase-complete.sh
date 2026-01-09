#!/bin/bash

# Phase Completion Hook
# Triggered when a phase is completed
# Automatically archives old documentation

set -e

PHASE=$1
PHASE_NAME=$2

if [ -z "$PHASE" ] || [ -z "$PHASE_NAME" ]; then
    echo "Usage: $0 <phase_number> <phase_name>"
    echo "Example: $0 1 'Contract Registry & Documentation'"
    exit 1
fi

echo "=========================================="
echo "Phase $PHASE Complete: $PHASE_NAME"
echo "=========================================="
echo ""

# Run cleanup
echo "Running documentation cleanup..."
bash scripts/archive-old-docs.sh

echo ""
echo "=========================================="
echo "Phase $PHASE Cleanup Complete"
echo "=========================================="
echo ""
echo "Summary files created:"
echo "  - PHASE${PHASE}_COMPLETION_SUMMARY.md"
echo ""
echo "Archived files moved to:"
echo "  - .archive/guides/"
echo ""
echo "Next steps:"
echo "  1. Review PHASE${PHASE}_COMPLETION_SUMMARY.md"
echo "  2. Commit changes: git add . && git commit -m 'Phase $PHASE complete'"
echo "  3. Continue with Phase $((PHASE + 1))"
echo ""
