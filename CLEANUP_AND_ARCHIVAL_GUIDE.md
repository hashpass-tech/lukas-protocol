# Documentation Cleanup & Archival Guide

**Version**: 1.0  
**Date**: January 8, 2026  
**Purpose**: Automated cleanup and archival of old documentation

---

## Overview

This guide explains the automated documentation cleanup and archival system that runs after each phase completion.

---

## Cleanup System

### Scripts

#### 1. `scripts/archive-old-docs.sh`
**Purpose**: Archive old markdown files from root to `.archive/guides/`

**Features**:
- Identifies old documentation files
- Moves them to `.archive/guides/`
- Keeps critical files in root
- Creates archive index
- Verifies cleanup success

**Critical Files (Kept in Root)**:
- `README.md` - Main project documentation
- `CHANGELOG.md` - Version history
- `VERSIONING.md` - Versioning guidelines
- `LICENSE` - Project license

**Files to Archive**:
- Deployment documentation
- FHENIX documentation
- Dashboard documentation
- Checklists and status files
- Temporary scripts

#### 2. `scripts/on-phase-complete.sh`
**Purpose**: Hook triggered after each phase completion

**Usage**:
```bash
bash scripts/on-phase-complete.sh <phase_number> <phase_name>
```

**Example**:
```bash
bash scripts/on-phase-complete.sh 1 "Contract Registry & Documentation"
```

**Actions**:
1. Displays phase completion message
2. Runs `archive-old-docs.sh`
3. Shows cleanup summary
4. Provides next steps

---

## NPM Scripts

### Available Commands

#### Archive Documentation
```bash
npm run archive:docs
```
Manually archive old documentation files.

#### Cleanup (Alias)
```bash
npm run cleanup
```
Alias for `npm run archive:docs`.

---

## Automated Cleanup Workflow

### Phase Completion Process

1. **Phase Tasks Complete**
   - All tasks in phase marked as complete
   - Phase summary document created

2. **Trigger Cleanup Hook**
   ```bash
   bash scripts/on-phase-complete.sh <phase> "<phase_name>"
   ```

3. **Cleanup Execution**
   - Old documentation identified
   - Files moved to `.archive/guides/`
   - Archive index updated
   - Cleanup verified

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Phase <N> complete and cleanup"
   ```

5. **Continue to Next Phase**
   - Start next phase tasks
   - Repeat process

---

## Archive Structure

### Root Directory (After Cleanup)

```
/
├── README.md (critical)
├── CHANGELOG.md (critical)
├── VERSIONING.md (critical)
├── LICENSE (critical)
├── PHASE1_COMPLETION_SUMMARY.md (current phase)
├── PHASE2_COMPLETION_SUMMARY.md (current phase)
├── package.json
├── .kiro/
├── apps/
├── packages/
├── scripts/
└── .archive/
    └── guides/
        ├── ARCHIVED_DOCS_INDEX.md
        ├── AMOY_DEPLOYMENT_*.md
        ├── FHENIX_*.md
        ├── DEPLOYMENT_*.md
        └── ... (other archived files)
```

### Archive Index

**File**: `.archive/guides/ARCHIVED_DOCS_INDEX.md`

**Contents**:
- List of all archived files
- Categorization by type
- Critical files remaining in root
- Archive location
- Retrieval instructions

---

## Cleanup Schedule

### After Each Phase

| Phase | Trigger | Files Archived |
|-------|---------|-----------------|
| 1 | Task 3 complete | Initial deployment docs |
| 2 | Task 5 complete | Phase 1 summary |
| 3 | Task 7 complete | Phase 2 summary |
| 4 | Task 10 complete | Phase 3 summary |
| 5 | Task 12 complete | Phase 4 summary |

---

## Manual Cleanup

### Run Cleanup Manually

```bash
npm run archive:docs
```

### Verify Cleanup

```bash
# Check root directory
ls -la *.md

# Check archive
ls -la .archive/guides/

# View archive index
cat .archive/guides/ARCHIVED_DOCS_INDEX.md
```

### Retrieve Archived File

```bash
# Copy file from archive to root
cp .archive/guides/FILENAME.md ./FILENAME.md
```

---

## Cleanup Rules

### Files to Keep in Root
- `README.md` - Always keep
- `CHANGELOG.md` - Always keep
- `VERSIONING.md` - Always keep
- `LICENSE` - Always keep
- Current phase summary - Keep until next phase

### Files to Archive
- Previous phase summaries
- Deployment documentation
- FHENIX documentation
- Status files
- Temporary scripts
- Old checklists

### Files to Never Archive
- Source code files
- Configuration files
- Package files
- Git files
- Critical documentation

---

## Cleanup Verification

### Checklist

After running cleanup, verify:

- [ ] Root directory has only critical files
- [ ] Phase summary in root
- [ ] `.archive/guides/` contains archived files
- [ ] `ARCHIVED_DOCS_INDEX.md` created
- [ ] All files accounted for
- [ ] No critical files archived
- [ ] Archive index is accurate

### Verification Script

```bash
#!/bin/bash
echo "=== Root Directory ==="
ls -1 *.md 2>/dev/null | wc -l
echo "files in root"

echo ""
echo "=== Archive Directory ==="
ls -1 .archive/guides/*.md 2>/dev/null | wc -l
echo "files archived"

echo ""
echo "=== Critical Files Check ==="
for file in README.md CHANGELOG.md VERSIONING.md LICENSE; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file (MISSING)"
    fi
done
```

---

## Troubleshooting

### Issue: Files Not Archived

**Solution**:
1. Check file names match archive list
2. Verify file exists in root
3. Run cleanup again with verbose output

### Issue: Critical File Archived

**Solution**:
1. Restore from git: `git checkout <file>`
2. Update archive script to exclude file
3. Re-run cleanup

### Issue: Archive Index Missing

**Solution**:
1. Run cleanup again
2. Index will be recreated
3. Verify with: `cat .archive/guides/ARCHIVED_DOCS_INDEX.md`

### Issue: Too Many Files in Root

**Solution**:
1. Run cleanup: `npm run archive:docs`
2. Verify with: `ls -1 *.md | wc -l`
3. Should be ≤ 5 files

---

## Best Practices

### Before Phase Completion
1. Ensure all tasks are marked complete
2. Create phase summary document
3. Commit all changes
4. Review root directory

### During Cleanup
1. Run cleanup script
2. Verify cleanup success
3. Check archive index
4. Review archived files

### After Cleanup
1. Commit cleanup changes
2. Update git history
3. Document any issues
4. Prepare for next phase

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Phase Cleanup

on:
  workflow_dispatch:
    inputs:
      phase:
        description: 'Phase number'
        required: true
      phase_name:
        description: 'Phase name'
        required: true

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run cleanup
        run: bash scripts/on-phase-complete.sh ${{ github.event.inputs.phase }} "${{ github.event.inputs.phase_name }}"
      - name: Commit changes
        run: |
          git config user.name "Cleanup Bot"
          git config user.email "cleanup@example.com"
          git add .
          git commit -m "Phase ${{ github.event.inputs.phase }} cleanup"
          git push
```

---

## Maintenance

### Regular Maintenance Tasks

**Weekly**:
- Verify archive integrity
- Check for orphaned files
- Review archive index

**Monthly**:
- Audit archived files
- Update cleanup rules
- Review cleanup logs

**Quarterly**:
- Archive old archives
- Compress old files
- Update documentation

---

## Summary

### Cleanup System Features
- ✅ Automated archival
- ✅ Phase-triggered cleanup
- ✅ Archive index creation
- ✅ Critical file protection
- ✅ Verification checks
- ✅ Manual override options

### Benefits
- ✅ Clean root directory
- ✅ Organized documentation
- ✅ Easy retrieval
- ✅ Audit trail
- ✅ Automated process
- ✅ Reduced clutter

### Usage
```bash
# Manual cleanup
npm run archive:docs

# Phase completion cleanup
bash scripts/on-phase-complete.sh 2 "Interactions & Dependencies"
```

---

**Status**: ✅ Complete

**Last Updated**: January 8, 2026

