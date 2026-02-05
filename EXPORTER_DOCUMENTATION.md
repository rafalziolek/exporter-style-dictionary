# Supernova Token Exporter Documentation

## Overview

This custom exporter transforms design tokens from Supernova into Style Dictionary-compatible JSON files with DTCG (Design Token Community Group) format. It organizes tokens by collection (platform) and theme, maintaining proper reference chains and hierarchical structure.

---

## Goals

1. **Export tokens organized by collection** (web, mobile, core)
2. **Support multiple themes** in a single export run
3. **Preserve token references** instead of resolving to raw values
4. **Output DTCG-compliant format** (`{ $value, $type, $description }`)
5. **Maintain hierarchical structure** based on Supernova group organization
6. **Filter private/internal tokens** (marked with underscore)

---

## How It Works

### Architecture Flow

```
1. Fetch base tokens + groups + themes from Supernova SDK
2. Group tokens by Collection property (web/mobile/core)
3. Export core tokens once (theme-independent)
4. For each theme:
   a. Merge theme.overriddenTokens with base tokens
   b. Group themed tokens by collection
   c. Build nested tree structure from group paths
   d. Output collection/theme JSON files
```

### Collection-Based Routing

**Token → Collection Detection:**

Tokens are routed to output files based on their **Collection custom property**:

```javascript
Token properties: {
  Collection: "web" | "mobile" | "core"
}

Output routing:
- Collection = "web"    → web/{theme}.json
- Collection = "mobile" → mobile/{theme}.json  
- Collection = "core"   → core/core.json
```

**Why Collection instead of Group Path?**

- Keeps Figma token organization clean (no platform prefixes needed)
- Explicit assignment per token
- Allows flexible reorganization without changing output

### Theme Application

**Theme overrides are applied via `theme.overriddenTokens`:**

```javascript
// Base token
semantic.space.m = 16px

// Theme: patient/light has overridden value
theme.overriddenTokens contains semantic.space.m = 24px

// Output for customer/light: 16px
// Output for patient/light: 24px
```

The SDK's `computeTokensByApplyingThemes` method was found to be unreliable, so we directly merge `overriddenTokens` with base tokens.

### Reference Resolution

**References use `referencedTokenId` (string), not `referencedToken` (object):**

```javascript
// Token value structure
value: {
  color: { r: 255, g: 255, b: 255 },
  opacity: { measure: 0.5 },
  referencedTokenId: "abc-123-def"  // ← ID of referenced token
}

// Resolution process
1. Check if value.referencedTokenId exists
2. Look up token by ID in tokenById map
3. Build reference path from token's group structure
4. Output: { $value: "{semantic.color.primary}", $type: "color" }
```

**Reference path construction:**

```
Token: "primary"
Group path: ["semantic", "color"]
Group name: "background"

Full path: ["semantic", "color", "background", "primary"]
Reference: "{semantic.color.background.primary}"
```

---

## Input Requirements

### Token Structure in Supernova

**Required:**
- Tokens must have a **Collection custom property** (web, mobile, or core)
- Tokens must belong to token groups with proper hierarchy

**Optional:**
- Tokens can reference other tokens via `referencedTokenId`
- Tokens can have descriptions (exported as `$description`)

### Group Structure

Groups define the nested output structure:

```
Group path: ["semantic", "color"]
Group name: "background"
Token name: "primary"

Output path in JSON:
semantic.color.background.primary
```

**Important:** `group.path` does NOT include the group's own name - it's added separately during tree building.

### Theme Structure

Themes must have:
- `name` property (e.g., "customer/light", "patient/dark")
- `overriddenTokens` array containing themed token values

---

## Output Structure

### File Organization

```
.build/
├── core/
│   └── core.json                    # Shared foundation tokens
├── web/
│   ├── customer/
│   │   └── light.json              # Web platform, customer theme, light mode
│   ├── patient/
│   │   └── light.json              # Web platform, patient theme, light mode
│   └── ...
└── mobile/
    ├── customer/
    │   └── light.json              # Mobile platform, customer theme
    └── patient/
        └── light.json
```

### File Format (DTCG)

```json
{
  "semantic": {
    "color": {
      "primary": {
        "$value": "{core.color.500}",
        "$type": "color",
        "$description": "Primary brand color"
      },
      "background": {
        "$value": "#ffffff",
        "$type": "color"
      }
    }
  },
  "components": {
    "button": {
      "primary": {
        "background": {
          "$value": "{semantic.color.primary}",
          "$type": "color"
        }
      }
    }
  }
}
```

---

## Token Type Handling

### Color Tokens

**Input:**
```javascript
value: {
  color: { r: 218, g: 211, b: 202 },
  opacity: { measure: 0.6 }  // 60% opacity
}
```

**Output:**
```json
{
  "$value": "#dad3ca99",  // 8-char hex with alpha
  "$type": "color"
}
```

**Opacity handling:**
- Opacity < 1.0 → 8-character hex (#rrggbbaa)
- Opacity = 1.0 → 6-character hex (#rrggbb)
- Alpha byte = Math.round(opacity * 255)

### Dimension/Measure Tokens

**Input:**
```javascript
value: {
  measure: 16,
  unit: "Pixels"
}
```

**DTCG-Compliant Output:**
```json
{
  "$value": {
    "value": 16,
    "unit": "px"
  },
  "$type": "dimension"
}
```

**Unit mapping:**
- `Pixels` → `px`
- `Percent` → `%`
- `Ems` → `em`
- `Points` → `pt`
- `Raw` → (empty string)

### Typography Tokens

**DTCG-Compliant Output:**
```json
{
  "$value": {
    "fontFamily": "Inter",
    "fontWeight": "Bold",
    "fontSize": {
      "value": 16,
      "unit": "px"
    },
    "lineHeight": {
      "value": 24,
      "unit": "px"
    },
    "letterSpacing": {
      "value": 0.5,
      "unit": "px"
    },
    "textTransform": "uppercase",
    "textDecoration": "underline"
  },
  "$type": "typography"
}
```

### Shadow Tokens

**Input from Supernova:**
```json
{
  "$value": [
    {
      "color": {
        "color": { "r": 0, "g": 0, "b": 0 },
        "opacity": { "measure": 0.5 }
      },
      "x": 0,
      "y": 2,
      "radius": 4,
      "spread": 0,
      "type": "Drop",
      "referencedTokenId": null
    }
  ]
}
```

**DTCG-Compliant Output (Single Shadow):**
```json
{
  "$value": [
    {
      "color": {
        "colorSpace": "srgb",
        "components": [0, 0, 0],
        "alpha": 0.5
      },
      "offsetX": { "value": 0, "unit": "px" },
      "offsetY": { "value": 2, "unit": "px" },
      "blur": { "value": 4, "unit": "px" },
      "spread": { "value": 0, "unit": "px" }
    }
  ],
  "$type": "shadow"
}
```

**DTCG-Compliant Output (Multi-layer with Inset):**
```json
{
  "$value": [
    {
      "color": {
        "colorSpace": "srgb",
        "components": [0.855, 0.855, 0.855],
        "alpha": 1
      },
      "offsetX": { "value": 0, "unit": "px" },
      "offsetY": { "value": 0, "unit": "px" },
      "blur": { "value": 0, "unit": "px" },
      "spread": { "value": 1, "unit": "px" },
      "inset": true
    },
    {
      "color": {
        "colorSpace": "srgb",
        "components": [0, 0, 0],
        "alpha": 0.08
      },
      "offsetX": { "value": 0, "unit": "px" },
      "offsetY": { "value": -1, "unit": "px" },
      "blur": { "value": 0, "unit": "px" },
      "spread": { "value": 0, "unit": "px" },
      "inset": true
    }
  ],
  "$type": "shadow"
}
```

**Transformation:**
- Processes each shadow in array (supports multi-layer shadows)
- Maps property names: `x`→`offsetX`, `y`→`offsetY`, `radius`→`blur`
- Unwraps nested `color.color` structure
- Converts RGB from 0-255 to 0-1 range
- Formats colors as DTCG color objects with `colorSpace`, `components`, `alpha`
- Converts dimensions to objects with `value` and `unit` properties
- Maps Supernova's `type: "Inner"` to DTCG's `inset: true`
- Removes non-standard properties (`type`, `opacity` outside color, `referencedTokenId`)

### Font Tokens

**Output:**
```json
{
  "$value": {
    "family": "Inter",
    "weight": "Regular"
  },
  "$type": "fontFamily"
}
```

### Border Tokens

**DTCG-Compliant Output:**
```json
{
  "$value": {
    "width": {
      "value": 1,
      "unit": "px"
    },
    "style": "solid",
    "color": "#000000"
  },
  "$type": "border"
}
```

### Radius Tokens

**DTCG-Compliant Output (Single radius):**
```json
{
  "$value": {
    "value": 8,
    "unit": "px"
  },
  "$type": "borderRadius"
}
```

**DTCG-Compliant Output (Individual corners):**
```json
{
  "$value": {
    "topLeft": {
      "value": 8,
      "unit": "px"
    },
    "topRight": {
      "value": 8,
      "unit": "px"
    },
    "bottomLeft": {
      "value": 0,
      "unit": "px"
    },
    "bottomRight": {
      "value": 0,
      "unit": "px"
    }
  },
  "$type": "borderRadius"
}
```

### Gradient Tokens

**Input from Supernova:**
```json
{
  "$value": [
    {
      "type": "Linear",
      "from": { "x": 0, "y": 0 },
      "to": { "x": 1, "y": 1 },
      "stops": [
        {
          "position": 0,
          "color": {
            "color": { "r": 255, "g": 0, "b": 0 },
            "opacity": { "measure": 1 }
          }
        },
        {
          "position": 1,
          "color": {
            "color": { "r": 0, "g": 0, "b": 255 },
            "opacity": { "measure": 1 }
          }
        }
      ]
    }
  ]
}
```

**DTCG-Compliant Output:**
```json
{
  "$value": [
    {
      "color": {
        "colorSpace": "srgb",
        "components": [1, 0, 0],
        "alpha": 1
      },
      "position": 0
    },
    {
      "color": {
        "colorSpace": "srgb",
        "components": [0, 0, 1],
        "alpha": 1
      },
      "position": 1
    }
  ],
  "$type": "gradient"
}
```

**Transformation:**
- Extracts stops array from Supernova gradient object (first element of value array)
- Unwraps nested `color.color` structure
- Converts RGB values from 0-255 range to 0-1 range per DTCG specification
- Formats as DTCG color objects with `colorSpace`, `components`, and `alpha`
- Includes alpha from `opacity.measure`
- Returns array directly (not wrapped in object with type property)
- Removes non-standard Supernova properties (`type`, `from`, `to`)

---

## Special Cases & Edge Cases

### 1. Virtual Shadow Tokens

**Issue:** Supernova creates virtual tokens for multi-layer shadows.

**Handling:**
```javascript
if (token.isVirtual === true && token.tokenType === 'Shadow') {
  skip // Don't export virtual layer tokens
}
```

Only the parent shadow token (with all layers) is exported.

### 2. Underscore Filtering (Private Tokens)

**Tokens are skipped if:**
- Token name contains `_` (e.g., `_internal`)
- Group name contains `_` (e.g., `_helpers`)
- Any segment in group path contains `_`

**Rationale:** Underscore indicates private/internal tokens not meant for consumption.

```javascript
// Skipped examples
token.name = "_body"           // Skip
token.name = "internal_value"  // Skip
group.name = "_utilities"      // Skip all tokens in this group
group.path = ["semantic", "_private", "color"]  // Skip
```

### 3. Tokens Without Collection Property

**Handling:**
```javascript
if (!collectionProperty || collectionValue === null) {
  collection = "unknown"  // Grouped separately
}
```

Tokens without a valid Collection property are grouped as "unknown" but **not exported** (only web/mobile/core are output).

### 4. Missing Group References

**Handling:**
```javascript
const group = findGroupForToken(token, groups)
if (!group) {
  // Use empty path, token name only
  path = [token.name]
}
```

Tokens without a containing group are placed at the root level of their collection output.

### 5. Group Path vs Group Name

**Critical detail:** `group.path` does NOT include the group's own name.

```javascript
Group with:
  path: ["core"]
  name: "border-radius"

Full path = [...path, name] = ["core", "border-radius"]
```

This is why we merge `group.path + group.name` when building token paths.

### 6. Root Groups

**Handling:**
```javascript
if (group.isRoot) {
  // Don't include root group name in path
  fullPath = [...group.path]
} else {
  fullPath = [...group.path, group.name]
}
```

Root groups (type containers like "Color", "Dimension") are skipped from the path to avoid redundant nesting.

### 7. Theme Override Merging

**Process:**
```javascript
1. Start with base tokens (no theme applied)
2. Get theme.overriddenTokens
3. Create overriddenById map
4. For each base token:
   - If override exists: use overridden token
   - Else: use base token
```

**Result:** Themed token array with selective overrides, maintaining all base tokens.

### 8. Reference Loop Prevention

**Not explicitly handled** - assumes Supernova prevents circular references at the source.

If circular references exist:
```
A → B → C → A
```

Output would be:
```json
{
  "a": { "$value": "{b}" },
  "b": { "$value": "{c}" },
  "c": { "$value": "{a}" }
}
```

Consumer (Style Dictionary) must handle circular reference errors.

---

## Type Mapping

### SDK Type → DTCG Type

| Supernova Type | DTCG `$type` |
|----------------|--------------|
| Color | `color` |
| Dimension | `dimension` |
| Measure | `dimension` |
| Typography | `typography` |
| Shadow | `shadow` |
| Border | `border` |
| Radius | `borderRadius` |
| Gradient | `gradient` |
| Font | `fontFamily` |
| Text | `string` |
| String | `string` |

**Unknown types:** Output as lowercase of SDK type name.

---

## Limitations

### 1. SDK Method Reliability

**`computeTokensByApplyingThemes` does not work reliably** - it returns the same values regardless of theme.

**Workaround:** Directly use `theme.overriddenTokens` and manually merge.

### 2. Collection Property Required

Tokens **must** have a Collection custom property set in Supernova. Tokens without it are grouped as "unknown" and not exported.

**Setup requirement:** Ensure Collection property exists and is assigned to all tokens.

### 3. No Cross-Collection References

References are built from token paths without collection prefix:

```
Core token: "color.500"
Reference: "{color.500}"

NOT: "{core.color.500}"
```

If web tokens reference core tokens, the consumer must resolve cross-collection references.

**Potential issue:** Name collisions between collections (web.color.500 and core.color.500 both become `{color.500}`).

### 4. JavaScript Runtime Constraints

The Supernova runtime environment has limitations:

- **No `for...of` loops** - Must use indexed `for` loops
- **No `String.padStart`** - Custom `pad2()` function used
- **`FileHelper` may not exist** - Fallback to plain objects

### 5. No Validation

The exporter does not validate:
- Token value correctness
- Reference target existence (broken references output as-is)
- DTCG format compliance
- Circular references

### 6. Theme Name as Path

Theme names (e.g., "customer/light") are used directly as directory structure:

```
theme.name = "customer/light"
Output: web/customer/light.json
```

**Edge case:** Theme names with special characters could cause file system issues. No sanitization is performed.

### 7. Single Output Format

Only JSON output is supported. No alternative formats (YAML, SCSS variables, etc.).

### 8. No Token Filtering by Type

All token types are exported. No way to exclude specific types (e.g., export only colors).

### 9. No Custom Transformations

Token values are formatted based on SDK structure. No custom value transformations or calculations.

### 10. Memory Constraints

All tokens, groups, and themes are loaded into memory simultaneously. Very large design systems (10k+ tokens) may hit memory limits.

---

## Configuration

### None Required

The exporter has no configuration file. Behavior is hardcoded:

- Collections: `web`, `mobile`, `core`
- Output format: DTCG JSON
- Filtering: Underscore-prefixed tokens
- Skip levels: 0 (use full path since collection handles routing)

### Customization Points

To modify behavior, edit [`typescript/src/index.ts`](typescript/src/index.ts):

**Change collection names:**
```javascript
// Line ~150
if (collection === 'core') { ... }
else if (collection === 'web') { ... }
else if (collection === 'mobile') { ... }
```

**Change underscore filtering:**
```javascript
// Line ~245
if (token.name.indexOf('_') !== -1) { skip }
```

**Change output format:**
```javascript
// Line ~312
function formatToken(token, tokenById, groups) {
  return {
    $value: ...,
    $type: ...,
    $description: ...
  }
}
```

---

## Debugging

### Debug Output Files

When debug code is present, the exporter generates:

**`_debug_collections.json`** - Collection detection results:
```json
{
  "counts": { "core": 281, "web": 1123, "mobile": 89 },
  "allCollectionValues": { "core": 281, "web": 1123, ... },
  "sampleTokens": [ ... ]
}
```

**`_debug_themes.json`** - Theme application results:
```json
{
  "themes": [
    {
      "themeName": "customer/light",
      "baseTokenCount": 2027,
      "overriddenTokensInTheme": 1289
    }
  ]
}
```

### Common Issues

**1. Empty output files / No tokens exported**

**Cause:** Collection property not set or has unexpected value.

**Debug:** Check `_debug_collections.json` → `allCollectionValues` to see actual collection names.

**2. References not working (showing raw values)**

**Cause:** `referencedTokenId` is null, or tokenById map doesn't contain referenced token.

**Debug:** Log `value.referencedTokenId` and check if `tokenById[id]` exists.

**3. Missing tokens in themed output**

**Cause:** Theme overrides not being merged correctly.

**Debug:** Check `theme.overriddenTokens.length` vs actual overridden count in debug output.

**4. Broken hierarchy / Flat structure**

**Cause:** Group path not being constructed correctly (missing group name).

**Debug:** Log `group.path` and `group.name` to verify full path construction.

**5. Tokens with underscore still appearing**

**Cause:** Underscore in parent group path not being checked.

**Verify:** Ensure all path segments are checked, not just token name.

---

## Performance

### Token Count Benchmarks

Based on current implementation:

| Tokens | Groups | Themes | Export Time |
|--------|--------|--------|-------------|
| 2,027 | 1,106 | 2 | ~2-3 seconds |

### Optimization Opportunities

1. **Lazy group lookup** - Cache `findGroupForToken` results
2. **Parallel theme processing** - Process themes concurrently
3. **Incremental builds** - Only rebuild changed themes
4. **Stream output** - Write files as generated instead of collecting all in memory

---

## Future Enhancements

### Potential Improvements

1. **Configuration file** - Externalize collection names, output paths, filtering rules
2. **Custom formatters** - Plugin system for value transformations
3. **Validation** - Check reference integrity, DTCG compliance
4. **Multiple output formats** - YAML, SCSS variables, CSS custom properties
5. **Selective export** - Filter by token type, collection, theme
6. **Incremental mode** - Only export changed tokens
7. **Reference path options** - Include/exclude collection in reference paths
8. **Error reporting** - Detailed logs of skipped tokens, broken references
9. **Watch mode** - Auto-rebuild on Supernova changes
10. **Dry run mode** - Preview output without writing files

---

## Technical Reference

### Key Functions

**`getTokenCollection(token)`**
- Reads Collection custom property
- Resolves property option ID to name
- Returns: `"web" | "mobile" | "core" | "unknown"`

**`groupByPlatform(tokens, groups)`**
- Groups tokens by collection
- Returns: `{ core: [], web: [], mobile: [], unknown: [] }`

**`buildTree(tokens, groups, tokenById, skipLevels)`**
- Constructs nested JSON from token group paths
- Skips underscore-prefixed tokens/groups
- Returns: Nested object representing token hierarchy

**`formatToken(token, tokenById, groups)`**
- Checks for references first
- Formats value based on token type
- Returns: `{ $value, $type, $description }`

**`buildRefPath(token, groups)`**
- Constructs reference path from group structure
- Returns: `"semantic.color.primary"` (dot-separated path)

**`formatValue(value, tokenType, tokenById, groups)`**
- Pattern-matches value structure
- Calls type-specific formatters
- Returns: Formatted value (string, object, or reference)

### Dependencies

- **Supernova SDK** - `Pulsar.export`, `sdk.tokens.*` APIs
- **No external npm packages** - Pure JavaScript/TypeScript
- **Webpack** - For TypeScript compilation

### Build Process

```bash
cd typescript
NODE_OPTIONS=--openssl-legacy-provider npx webpack --mode=development
```

Output: `dist/main.js` (or `src/js/compiled.js`)

---

## Changelog

### v2.0 - Collection-based routing
- Switch from group path to Collection property for platform detection
- Add underscore filtering for private tokens
- Add alpha channel support for colors
- Fix theme override merging

### v1.0 - Initial implementation
- Path-based routing (web/mobile/core in group structure)
- DTCG format output
- Multi-theme support
- Reference preservation

---

## Support

For issues or questions:
1. Check debug output files first
2. Verify Collection property is set correctly
3. Inspect group paths in Supernova UI
4. Review TypeScript source: [`typescript/src/index.ts`](typescript/src/index.ts)

---

**Last Updated:** February 3, 2026
