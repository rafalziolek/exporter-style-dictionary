# Token Validation - Quick Start Guide

## Overview

The token validator compares your new DTCG token exports against existing tokens to detect breaking changes, value changes, and new tokens. This ensures safe migration without breaking existing applications.

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
cd typescript
npm install
```

## Basic Usage

### 1. Run Basic Validation

```bash
cd typescript
npm run validate-tokens -- --target /path/to/existing/tokens
```

**Note**: Source defaults to `../.build`, so make sure you've exported tokens first.

### 2. Example Output

```
════════════════════════════════════════════════════════════
        TOKEN VALIDATION REPORT
════════════════════════════════════════════════════════════

📁 Comparing:
  Source: .build (6 files, 1,622 tokens)
  Target: ../other-repo/tokens (6 files, 1,598 tokens)

🚨 BREAKING CHANGES (2)
  ✗ components.button.secondary.shadow - REMOVED
  ✗ core.spacing.xxl - TYPE CHANGED (dimension → string)

⚠️  VALUE CHANGES (15)
  ⚬ components.tile.padding: "{semantic.space.m}" → "{semantic.space.l}"
  ... (14 more)

ℹ️  NEW TOKENS (52)
  + components.modal.backdrop
  ... (51 more)

✓ UNCHANGED (1,553 tokens)

════════════════════════════════════════════════════════════
Summary: 🚨 VALIDATION FAILED - Breaking changes detected
Exit Code: 1
════════════════════════════════════════════════════════════
```

## Common Workflows

### For Local Development

```bash
# After exporting from Supernova
cd typescript
npm run validate-tokens -- --target /path/to/production/tokens
```

### Generate Reports for Documentation

**Markdown Report** (for PRs, release notes):
```bash
npm run validate-tokens -- \
  --target /path/to/tokens \
  --format markdown \
  --output VALIDATION_REPORT.md
```

**JSON Report** (for automation):
```bash
npm run validate-tokens -- \
  --target /path/to/tokens \
  --format json \
  --output validation.json
```

### CI/CD Integration

```bash
# Fail build on breaking changes
npm run validate:ci -- --target $TARGET_PATH
```

Or with custom options:
```bash
npm run validate-tokens -- \
  --target /path/to/tokens \
  --fail-on-breaking \
  --format json \
  --output report.json
```

### With Custom Source Path

```bash
npm run validate-tokens -- \
  --source ./custom-build \
  --target /path/to/tokens
```

## Advanced Options

### Ignore Specific Tokens

```bash
npm run validate-tokens -- \
  --target /path/to/tokens \
  --ignore "**/_*" \
  --ignore "*.internal.*"
```

### Numeric Tolerance

For slight numeric differences (e.g., floating point):
```bash
npm run validate-tokens -- \
  --target /path/to/tokens \
  --tolerance 0.01
```

### Custom Configuration

Create `tools/validate-tokens.config.json`:

```json
{
  "tolerance": 0.01,
  "ignorePatterns": [
    "**/_*",
    "*._debug*"
  ],
  "strictTypes": true,
  "failOn": {
    "breaking": true,
    "valueChanges": false,
    "typeChanges": true
  }
}
```

Then run without extra flags:
```bash
npm run validate-tokens -- --target /path/to/tokens
```

## Understanding the Results

### 🚨 Breaking Changes
- **Removed tokens** - Tokens deleted from new export (apps may break)
- **Type changes** - Token type changed (e.g., color → dimension)

**Action Required**: Update consuming applications before deploying.

### ⚠️ Value Changes
- **Modified values** - Token values changed but type stayed same
- May or may not break apps depending on usage

**Action Required**: Review and test affected components.

### 🔄 Possible Renames
- Fuzzy matching suggests tokens that may have been renamed
- 80%+ similarity threshold

**Action Required**: Verify if intentional rename or accidental deletion + addition.

### ℹ️ New Tokens
- Tokens added in new export
- Non-breaking, informational only

**Action**: No action needed unless you want to start using them.

## Exit Codes

- `0` - Success (no breaking changes, or not configured to fail)
- `1` - Failure (breaking changes detected with `--fail-on-breaking` or `--ci`)

## Troubleshooting

### "Directory not found"
- Check that paths are correct (relative or absolute)
- Ensure `../.build` exists (run export first)

### "Cannot find module"
- Run `npm install` in the `typescript` directory

### No changes detected but you expect some
- Verify both directories contain valid DTCG JSON files
- Check file structure matches (recursive search through subdirectories)
- Try with `--format json` to see detailed token lists

## Next Steps

1. **Add to your workflow**: Run validation after each export
2. **Set up CI/CD**: Automate validation in your pipeline
3. **Document process**: Add validation step to your release checklist
4. **Configure patterns**: Customize `validate-tokens.config.json` for your needs

## Getting Help

- Check `tools/README.md` for detailed documentation
- Run `npm run validate-tokens -- --help` for all options
- Review generated reports for specific change details
