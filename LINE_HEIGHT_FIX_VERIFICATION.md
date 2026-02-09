# Line-Height Token Fix - Verification Guide

## Problem
Line-height tokens were being exported incorrectly:
- **Type**: `dimension` (incorrect)
- **Value**: `{value: 1.15, unit: "px"}` (incorrect - px makes it 115%)
- **Expected Type**: `number`
- **Expected Value**: `1.15` (plain number, unitless)

## Solution Implemented

### 1. Added `isLineHeightToken()` Helper Function
Location: `typescript/src/index.ts` (after `isFontWeightToken()`)

Detects line-height tokens by:
- Checking if token type is `dimension` or `measure`
- Checking if path/name contains "line-height" or "lineheight"
- Validating value is in valid range (0-10)

### 2. Added `formatLineHeightValue()` Formatter
Location: `typescript/src/index.ts` (after `formatFontWeightValue()`)

Extracts the numeric value without units:
- Input: `{value: 1.15, unit: "px"}` or `{measure: 1.15}`
- Output: `1.15` (plain number)

### 3. Updated `formatToken()` Function
Location: `typescript/src/index.ts`

Modified to:
- Check if token is a line-height token
- Override `$type` to `"number"` instead of `"dimension"`
- Use `formatLineHeightValue()` instead of `formatValue()`

## Files Affected

### Core Tokens
- `core.line-height.s` (1.15)
- `core.line-height.m` (1.25)
- `core.line-height.l` (1.5)

### Semantic Tokens
- `semantic.line-height.condensed` → `{core.line-height.s}`
- `semantic.line-height.body` → `{core.line-height.l}`
- `semantic.line-height.heading` → `{core.line-height.m}`

### Component Tokens
All components that reference line-height tokens (e.g., `components.badge.line-height`)

## Verification Steps

### 1. Export Fresh Tokens from Supernova
Run your exporter against the Supernova workspace to generate new `.build` files.

### 2. Check Core Line-Height Tokens

```bash
jq '.core."line-height"' .build/core/core.json
```

**Expected Output:**
```json
{
  "s": {
    "$value": 1.15,
    "$type": "number"
  },
  "m": {
    "$value": 1.25,
    "$type": "number"
  },
  "l": {
    "$value": 1.5,
    "$type": "number"
  }
}
```

**Before (incorrect):**
```json
{
  "s": {
    "$value": {
      "value": 1.15,
      "unit": "px"
    },
    "$type": "dimension"
  }
}
```

### 3. Check Semantic References

```bash
jq '.semantic."line-height"' .build/web/patient/light.json
```

**Expected Output:**
```json
{
  "condensed": {
    "$value": "{core.line-height.s}",
    "$type": "number"
  },
  "body": {
    "$value": "{core.line-height.l}",
    "$type": "number"
  },
  "heading": {
    "$value": "{core.line-height.m}",
    "$type": "number"
  }
}
```

### 4. Check Component Usage

```bash
jq '.components.badge."line-height"' .build/web/patient/light.json
```

**Expected:**
```json
{
  "$value": "{semantic.line-height.condensed}",
  "$type": "number"
}
```

### 5. Search for Any Remaining Dimension Line-Heights

```bash
# This should return NO results
jq 'paths(type == "object" and has("$value")) as $p | 
    select($p | join(".") | contains("line-height")) | 
    select(getpath($p)."$type" == "dimension")' .build/core/core.json
```

If this returns any results, those tokens weren't caught by the detection logic.

## Technical Details

### Detection Logic
The `isLineHeightToken()` function uses multiple checks:
1. **Type check**: Only `dimension` or `measure` tokens (performance)
2. **Path check**: Group path contains "line-height" or "lineheight"
3. **Name check**: Token name contains "line-height" or "lineheight"
4. **Value validation**: Numeric value between 0-10 (reasonable line-height range)

### Why This Works
- Figma exports unitless line-heights as generic dimensions with "px" unit
- Our detection catches these before they're formatted
- We override the type to "number" and strip the unit
- CSS and other consumers will correctly interpret `1.15` as unitless

## Notes

- This fix is similar to the font-weight fix implemented earlier
- Both use name-based detection because Figma doesn't preserve the correct type
- Alternative would be to fix in Supernova, but that requires manual type setting for each token
- This approach is automatic and works across all token tiers (core, semantic, component)

## Related Issues

- Font-weight tokens: Fixed using same pattern (see `FONT_WEIGHT_FIX_VERIFICATION.md`)
- Badge tokens: Structural rename issue (see `MISSING_TOKENS_SUMMARY.md`)

## Build Status

✅ TypeScript compiled successfully
✅ Helper functions added
✅ formatToken() updated
✅ **VERIFIED WORKING** - Line-height tokens export correctly as plain numbers

## Root Cause

The issue was that core line-height tokens in Supernova have `tokenType = 'LineHeight'` (not `'Dimension'`), but the detection function only checked for `'dimension'` and `'measure'` types. Once we added `'lineheight'` to the type check, the detection worked correctly.

## Solution Summary

1. **Type Detection**: Added `'lineheight'` to the type check in `isLineHeightToken()`
2. **Value Extraction**: Extracts numeric value from `measure` or `value` property
3. **Type Override**: Sets `$type: "number"` instead of `"dimension"`
4. **Unit Removal**: Returns plain number without any unit wrapper
