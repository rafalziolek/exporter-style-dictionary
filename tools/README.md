# Token Validation Tool

Automated validation tool to compare DTCG token exports and detect breaking changes.

## Quick Start

```bash
# From the typescript directory
npm run validate-tokens -- --target /path/to/existing/tokens

# With specific options
npm run validate-tokens -- \
  --source ../.build \
  --target /path/to/existing/tokens \
  --fail-on-breaking \
  --format markdown \
  --output VALIDATION_REPORT.md
```

## Usage

### Basic Command

```bash
npm run validate-tokens -- --target <path-to-existing-tokens>
```

### Options

- `-s, --source <path>` - Path to new token exports (default: `.build`)
- `-t, --target <path>` - Path to existing tokens (required)
- `--fail-on-breaking` - Exit with code 1 if breaking changes detected
- `--fail-on-value-changes` - Exit with code 1 if any values changed
- `-o, --output <file>` - Save report to file
- `-f, --format <type>` - Report format: `console`, `json`, or `markdown` (default: `console`)
- `--ci` - CI mode (machine-readable output, exit codes)
- `--tolerance <number>` - Numeric value tolerance (e.g., 0.01 for 1%)
- `--ignore <pattern>` - Ignore token paths matching pattern (can be repeated)
- `-c, --config <path>` - Path to config file
- `-h, --help` - Show help

### Examples

**Basic validation**:
```bash
npm run validate-tokens -- --target ../other-repo/tokens
```

**CI/CD mode** (fails on breaking changes):
```bash
npm run validate:ci -- --target ../other-repo/tokens
```

**Generate markdown report**:
```bash
npm run validate-tokens -- \
  --target /path/to/tokens \
  --format markdown \
  --output VALIDATION_REPORT.md
```

**Generate JSON report for automation**:
```bash
npm run validate-tokens -- \
  --target /path/to/tokens \
  --format json \
  --output report.json
```

**Ignore specific patterns**:
```bash
npm run validate-tokens -- \
  --target /path/to/tokens \
  --ignore "**/_*" \
  --ignore "*.internal.*"
```

## Configuration File

Create `tools/validate-tokens.config.json` to set default options:

```json
{
  "tolerance": 0.01,
  "ignorePatterns": [
    "**/_*",
    "*.internal.*"
  ],
  "strictTypes": true,
  "failOn": {
    "breaking": true,
    "valueChanges": false,
    "typeChanges": true
  },
  "fuzzyMatching": {
    "enabled": true,
    "threshold": 0.8
  }
}
```

## What Gets Validated

### Breaking Changes (🚨)
- **Removed tokens** - Tokens that existed in the target but are missing in the source
- **Type changes** - Tokens where the `$type` changed (e.g., `color` → `dimension`)

### Value Changes (⚠️)
- **Modified values** - Tokens where the `$value` changed but type stayed the same
- Handles references, objects, arrays, and primitives
- Respects numeric tolerance setting

### New Tokens (ℹ️)
- **Added tokens** - Tokens present in source but not in target
- Non-breaking, informational only

### Possible Renames (🔄)
- **Fuzzy matching** - Suggests tokens that may have been renamed
- Uses Levenshtein distance with 80% similarity threshold
- Example: `button.primary.bg` → `button.primary.background`

## Report Formats

### Console (Default)
Colored, human-readable output perfect for local development.

### JSON
Machine-readable format for automation and CI/CD pipelines. Includes:
- Summary statistics
- Complete lists of all changes
- Exit code

### Markdown
Documentation-friendly format perfect for:
- Pull request descriptions
- Release notes
- Stakeholder reports

## Exit Codes

- `0` - Validation passed (or only non-breaking changes)
- `1` - Validation failed (breaking changes detected when `--fail-on-breaking` is set)

## Integration

### Pre-Export Validation
```bash
# After running your export
npm run build
npm run validate-tokens -- --target /path/to/production/tokens
```

### CI/CD Pipeline
```yaml
# .github/workflows/validate-tokens.yml
- name: Validate Tokens
  run: |
    cd typescript
    npm run validate:ci -- \
      --target ${{ github.workspace }}/../other-repo/tokens \
      --output validation-report.json
      
- name: Upload Report
  uses: actions/upload-artifact@v3
  with:
    name: token-validation-report
    path: typescript/validation-report.json
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit
npm run validate-tokens -- \
  --target /path/to/tokens \
  --fail-on-breaking \
  --format console
```

## How It Works

1. **Load & Flatten** - Recursively reads all JSON files from both directories and flattens nested DTCG structures into token paths
2. **Compare** - Builds lookup maps and detects removed, added, modified, and type-changed tokens
3. **Analyze** - Performs deep value comparison and fuzzy matching for renamed tokens
4. **Report** - Generates human or machine-readable reports

## Tips

- Run validation **before** pushing token changes to production
- Use `--format markdown --output REPORT.md` for PR documentation
- Set up CI/CD validation to catch issues automatically
- Review value changes even if they're not breaking - apps may be affected
- Use ignore patterns to exclude internal/debug tokens
- Check possible renames to avoid confusion

## Troubleshooting

**"Directory not found" error**:
- Ensure paths are correct (absolute or relative to execution directory)
- Check that token files exist in the target directory

**"No tokens found" warning**:
- Verify JSON files are valid DTCG format with `$value` and `$type`
- Check that files have `.json` extension

**Too many false positives**:
- Adjust `tolerance` in config for numeric values
- Add patterns to `ignorePatterns` to exclude specific tokens
- Use `--ignore` flag to test patterns before adding to config

**Missing dependencies**:
```bash
cd typescript
npm install
```
