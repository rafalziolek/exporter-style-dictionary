# Token Export Architecture Plan

## Overview

This document outlines the approach for exporting design tokens from Supernova SDK to Style Dictionary-compatible JSON files, preserving the layered token architecture and reference chains.

---

## 1. Token Architecture Understanding

### 1.1 Token Hierarchy (from Figma/Supernova)

```
Platform (web, mobile)
└── Layer (core, semantic, components)
    └── Category (color, space, typography, etc.)
        └── Token Groups
            └── Individual Tokens
```

### 1.2 Reference Chain

```
Components → Semantic → Core

Example:
  button.primary.background  →  {semantic.color.primary}
  semantic.color.primary     →  {core.color.500}
  core.color.500             =  #256ec3  (raw value)
```

### 1.3 Desired Output Structure

```
.build/
├── core/
│   └── core.json                    # All core/primitive tokens (shared)
├── web/
│   ├── customer/
│   │   ├── light.json               # Web semantic + components
│   │   └── dark.json
│   └── patient/
│       ├── light.json
│       └── dark.json
└── mobile/
    ├── customer/
    │   ├── light.json               # Mobile semantic + components
    │   └── dark.json
    └── patient/
        ├── light.json
        └── dark.json
```

---

## 2. SDK Data Structures

### 2.1 Token Object (from `sdk.tokens.getTokens`)

```typescript
interface Token {
  id: string
  name: string
  tokenType: string        // "Color" | "Dimension" | "Shadow" | "Typography" | etc.
  value: TokenValue        // Type-specific value object
  description: string
  // ... other metadata
}
```

### 2.2 Token Value with References

```typescript
// Color token value structure (from debug logs)
interface ColorTokenValue {
  color: { r: number, g: number, b: number, referencedTokenId: string | null }
  opacity: { unit: string, measure: number, referencedTokenId: string | null }
  referencedTokenId: string | null  // Top-level reference to another token
}

// Key insight: References are stored as `referencedTokenId` (string ID)
// NOT as `referencedToken` (object) - must look up by ID
```

### 2.3 Token Group (from `sdk.tokens.getTokenGroups`)

```typescript
interface TokenGroup {
  id: string
  name: string
  path: string[]           // e.g., ["web", "semantic", "color", "background"]
  tokenIds: string[]       // IDs of tokens in this group
  parent: TokenGroup | null
  isRoot: boolean
}
```

### 2.4 Token Theme (from `sdk.tokens.getTokenThemes`)

```typescript
interface TokenTheme {
  id: string
  name: string             // e.g., "customer/light", "patient/dark"
  overriddenTokens: Token[] // Tokens with theme-specific values
}
```

---

## 3. Export Strategy

### 3.1 Data Extraction

```typescript
// Step 1: Fetch base data
const allTokens = await sdk.tokens.getTokens(remote)
const allGroups = await sdk.tokens.getTokenGroups(remote)
const allThemes = await sdk.tokens.getTokenThemes(remote)

// Step 2: Apply theme if selected
if (context.themeId) {
  const theme = allThemes.find(t => t.id === context.themeId)
  allTokens = await sdk.tokens.getTokens(remote, { themeId: theme.id })
  // OR use computeTokensByApplyingThemes as fallback
}

// Step 3: Build token lookup map (for resolving references)
const tokenById = new Map<string, Token>()
for (const token of allTokens) {
  tokenById.set(token.id, token)
}
```

### 3.2 Platform & Layer Detection

Platform and layer are derived from **group path**:

```typescript
// group.path = ["web", "semantic", "color", "background"]
//               ^^^^^   ^^^^^^^^
//               platform  layer

function getTokenPlatformAndLayer(token: Token, allGroups: TokenGroup[]): { platform: string, layer: string } {
  const group = findContainingGroup(token, allGroups)
  const path = group?.path ?? []
  
  return {
    platform: path[0]?.toLowerCase() ?? 'unknown',  // "web", "mobile", "core"
    layer: path[1]?.toLowerCase() ?? 'unknown'      // "semantic", "components", or category for core
  }
}
```

### 3.3 Reference Resolution

**Critical**: References use `referencedTokenId` (string), not `referencedToken` (object).

```typescript
function resolveReference(
  value: any,
  tokenById: Map<string, Token>,
  allGroups: TokenGroup[]
): string | null {
  // Check for top-level reference
  const refId = value?.referencedTokenId
  if (!refId) return null
  
  // Look up the referenced token
  const refToken = tokenById.get(refId)
  if (!refToken) return null
  
  // Build the reference path
  return buildReferencePath(refToken, allGroups)
}

function buildReferencePath(token: Token, allGroups: TokenGroup[]): string {
  const group = findContainingGroup(token, allGroups)
  const path = group?.path ?? []
  
  // path = ["web", "semantic", "color", "primary"]
  // We want: "semantic.color.primary" (skip platform for same-platform refs)
  // Or: "core.color.500" for cross-layer refs
  
  const pathParts = path.slice(1).map(p => safeName(p))  // Skip platform
  const tokenName = safeName(token.name)
  
  return [...pathParts, tokenName].join('.')
}

// Output format: "{semantic.color.primary}" or "{core.color.500}"
function referenceWrapper(path: string): string {
  return `{${path}}`
}
```

---

## 4. Token Representation

### 4.1 Token Types to Handle

| SDK Type | Output $type | Handler |
|----------|--------------|---------|
| Color | color | `representColorToken` |
| Dimension | dimension | `representDimensionToken` |
| Measure | dimension | `representMeasureToken` |
| Shadow | shadow | `representShadowToken` |
| Typography | typography | `representTypographyToken` |
| Font | font | `representFontToken` |
| Border | border | `representBorderToken` |
| Radius | radius | `representRadiusToken` |
| Gradient | gradient | `representGradientToken` |
| Text/String | string | `representTextToken` |

### 4.2 Output Format (DTCG-style)

```json
{
  "$value": "#256ec3",
  "$type": "color",
  "$description": "Primary brand color"
}
```

Or with reference:

```json
{
  "$value": "{core.color.500}",
  "$type": "color"
}
```

### 4.3 Representation Logic

```typescript
function representColorToken(
  token: ColorToken,
  tokenById: Map<string, Token>,
  allGroups: TokenGroup[]
): object {
  const value = token.value
  
  // Check for reference FIRST
  if (value.referencedTokenId) {
    const refToken = tokenById.get(value.referencedTokenId)
    if (refToken) {
      return {
        $value: referenceWrapper(buildReferencePath(refToken, allGroups)),
        $type: 'color'
      }
    }
  }
  
  // Raw value (no reference)
  const color = value.color
  return {
    $value: `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`,
    $type: 'color'
  }
}
```

---

## 5. Output Generation

### 5.1 Grouping Tokens

```typescript
function groupTokensForExport(
  allTokens: Token[],
  allGroups: TokenGroup[]
): {
  core: Token[],
  web: { semantic: Token[], components: Token[] },
  mobile: { semantic: Token[], components: Token[] }
} {
  const result = {
    core: [],
    web: { semantic: [], components: [] },
    mobile: { semantic: [], components: [] }
  }
  
  for (const token of allTokens) {
    const { platform, layer } = getTokenPlatformAndLayer(token, allGroups)
    
    if (platform === 'core') {
      result.core.push(token)
    } else if (platform === 'web' || platform === 'mobile') {
      if (layer === 'semantic') {
        result[platform].semantic.push(token)
      } else if (layer === 'components') {
        result[platform].components.push(token)
      }
    }
  }
  
  return result
}
```

### 5.2 Building Output Tree

```typescript
function buildTokenTree(
  tokens: Token[],
  tokenById: Map<string, Token>,
  allGroups: TokenGroup[],
  skipPathLevels: number  // 1 for platform-specific, 2 for within layer
): object {
  const tree = {}
  
  for (const token of tokens) {
    const group = findContainingGroup(token, allGroups)
    const path = group?.path ?? []
    
    // Build nested path: skip platform and optionally layer
    const treePath = path.slice(skipPathLevels).map(safeName)
    treePath.push(safeName(token.name))
    
    // Set value at path
    setNestedValue(tree, treePath, representToken(token, tokenById, allGroups))
  }
  
  return tree
}
```

### 5.3 File Output

```typescript
// Core tokens (always exported, same for all themes)
outputs.push({
  path: 'core',
  name: 'core.json',
  content: JSON.stringify(buildTokenTree(grouped.core, tokenById, allGroups, 1), null, 2)
})

// Platform-specific themed tokens
const themePath = normalizeThemeName(theme.name)  // "customer/light"

for (const platform of ['web', 'mobile']) {
  const platformTokens = [...grouped[platform].semantic, ...grouped[platform].components]
  const tree = {
    semantic: buildTokenTree(grouped[platform].semantic, tokenById, allGroups, 2),
    components: buildTokenTree(grouped[platform].components, tokenById, allGroups, 2)
  }
  
  outputs.push({
    path: `${platform}/${themePath}`,
    name: `${themePath.split('/').pop()}.json`,
    content: JSON.stringify(tree, null, 2)
  })
}
```

---

## 6. Implementation Checklist

### Phase 1: Data Foundation
- [ ] Create `tokenById` map for reference lookups
- [ ] Implement `getTokenPlatformAndLayer` from group path
- [ ] Implement `buildReferencePath` for generating reference strings
- [ ] Test reference resolution with sample tokens

### Phase 2: Token Representation
- [ ] Fix `representColorToken` to check `referencedTokenId`
- [ ] Fix `representDimensionToken` (handle Dimension type)
- [ ] Fix all other represent functions with same reference pattern
- [ ] Verify all token types produce valid output

### Phase 3: Tree Building
- [ ] Implement proper token grouping by platform/layer
- [ ] Build separate trees for semantic and components
- [ ] Ensure core tokens go to dedicated file
- [ ] Validate tree structure matches expected output

### Phase 4: Testing
- [ ] Export with "customer/light" theme
- [ ] Verify core/core.json has all token types
- [ ] Verify web/customer/light.json has semantic + components
- [ ] Verify references are preserved (not resolved to raw values)
- [ ] Verify reference paths are correct

---

## 7. Key Fixes Required

### 7.1 Reference Detection (CRITICAL)

Current code checks wrong property:
```typescript
// WRONG
if (value.referencedToken) { ... }

// CORRECT
if (value.referencedTokenId) {
  const refToken = tokenById.get(value.referencedTokenId)
  ...
}
```

### 7.2 Token Type Handling

Add missing types to switch statement:
```typescript
case "Dimension":
  return representDimensionToken(token, tokenById, allGroups)
case "String":
  return representTextToken(token, tokenById, allGroups)
```

### 7.3 Token Lookup Map

Must create lookup map before representing tokens:
```typescript
const tokenById = new Map<string, Token>()
for (let i = 0; i < allTokens.length; i++) {
  tokenById.set(allTokens[i].id, allTokens[i])
}
```

---

## 8. Example Output

### core/core.json
```json
{
  "color": {
    "50": { "$value": "#f8fafe", "$type": "color" },
    "500": { "$value": "#256ec3", "$type": "color" }
  },
  "space": {
    "xs": { "$value": "4px", "$type": "dimension" },
    "sm": { "$value": "8px", "$type": "dimension" }
  }
}
```

### web/customer/light.json
```json
{
  "semantic": {
    "color": {
      "primary": { "$value": "{core.color.500}", "$type": "color" },
      "background": { "$value": "{core.color.50}", "$type": "color" }
    },
    "space": {
      "gap": { "$value": "{core.space.sm}", "$type": "dimension" }
    }
  },
  "components": {
    "button": {
      "primary": {
        "background": { "$value": "{semantic.color.primary}", "$type": "color" }
      }
    }
  }
}
```

---

## 9. Next Steps

1. **Implement token lookup map** - Essential for reference resolution
2. **Fix reference detection** - Check `referencedTokenId` instead of `referencedToken`
3. **Run with instrumentation** - Verify token types and references are captured
4. **Validate output** - Ensure references are preserved, not resolved
