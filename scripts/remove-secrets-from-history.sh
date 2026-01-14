#!/bin/bash

# Script to remove sensitive files from git history using git-filter-repo
# This will completely rewrite git history to remove all traces of exposed secrets

set -e

echo "=========================================="
echo "Git History Cleanup - Remove Secrets"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  All collaborators will need to re-clone the repository!"
echo ""

# Confirm before proceeding
read -p "Do you want to proceed? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# Create a backup
echo ""
echo "Step 1: Creating backup..."
BACKUP_DIR="$HOME/git-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r .git "$BACKUP_DIR/"
echo "✓ Backup created at: $BACKUP_DIR"

# Files to remove from history
echo ""
echo "Step 2: Preparing list of files to remove..."
cat > /tmp/paths-to-remove.txt << 'EOF'
scripts/deploy_fhenix.sh
scripts/test-specific-rpcs.js
.env
packages/contracts/.env
EOF

echo "Files to remove from history:"
cat /tmp/paths-to-remove.txt
echo ""

# Run git-filter-repo
echo "Step 3: Running git-filter-repo..."
echo "This may take a few minutes..."
echo ""

/tmp/git-filter-repo --invert-paths --paths-from-file /tmp/paths-to-remove.txt --force

echo ""
echo "✓ History rewrite complete!"
echo ""

# Show the result
echo "Step 4: Verifying cleanup..."
echo ""
for file in scripts/deploy_fhenix.sh scripts/test-specific-rpcs.js .env packages/contracts/.env; do
    count=$(git log --all --oneline -- "$file" 2>/dev/null | wc -l)
    echo "  $file: $count commits (should be 0)"
done

echo ""
echo "=========================================="
echo "✓ Cleanup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review the changes: git log --oneline"
echo "2. Force push to GitHub: git push origin --force --all"
echo "3. Force push tags: git push origin --force --tags"
echo "4. Notify collaborators to re-clone the repository"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
