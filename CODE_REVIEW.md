# Code Review: `typescript/src/index.ts`

**Date:** February 6, 2026
**File under review:** `typescript/src/index.ts` (873 lines)
**Context:** Supernova Pulsar exporter producing DTCG-compliant Style Dictionary JSON
**Status:** Working. This review focuses on making it good and fast.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Function Design: Duplicated Patterns](#2-function-design-duplicated-patterns)
3. [Function Design: Fragile Dispatch](#3-function-design-fragile-dispatch)
4. [Performance](#4-performance)
5. [Structural Cleanup](#5-structural-cleanup)
6. [DTCG Compliance Gaps](#6-dtcg-compliance-gaps)
7. [Type Definitions Gap](#7-type-definitions-gap)
8. [Refactoring Plan](#8-refactoring-plan)

---

## 1. Executive Summary

The exporter works. The architecture (fetch -> group by collection -> build tree -> format DTCG -> output) is sound and produces correct output. The code was built iteratively through many prompt-driven iterations, and it shows: the same logic appears in multiple functions with slight variations, there are formatting functions that solve the same problem three different ways, and one key function ignores the type information it already has in favour of fragile property-sniffing.

**The goal of this review is to identify where the approach can be simplified and made faster, not to polish syntax.**

### What needs to change (in order of impact)

| Area | Problem | Lines saved | Speed gain |
|------|---------|-------------|------------|
| Shared helpers | Same logic written 2-3 times across functions | ~120 | Marginal |
| `formatValue` dispatch | Duck-typing when `tokenType` is already available | ~55 | Marginal |
| Group lookup | O(n * m) scan called thousands of times | 0 | **Significant** |
| Debug block | ~90 lines of instrumentation in production path | ~90 | Moderate |
| Color approach | Three different implementations of color extraction | ~50 | Marginal |

**Estimated total:** ~200 lines removed or consolidated, one major performance fix, same output.

---

## 2. Function Design: Duplicated Patterns

The iterative development process produced several functions that solve the same sub-problem independently. Consolidating these into shared helpers is the single largest simplification opportunity.

### 2.1 "Build full group path" — duplicated between `buildTree` and `buildRefPath`

Lines 299-309 and 773-780 are nearly identical:

```typescript
// In buildTree (lines 299-309)
const groupPath = group ? group.path : []
const groupName = group ? group.name : ''
const fullGroupPath: Array<string> = []
for (let j = 0; j < groupPath.length; j++) {
  fullGroupPath.push(groupPath[j])
}
if (groupName && !group?.isRoot) {
  fullGroupPath.push(groupName)
}

// In buildRefPath (lines 770-780) — same thing
const groupPath = group ? group.path : []
const groupName = group ? group.name : ''
const fullGroupPath: Array<string> = []
for (let i = 0; i < groupPath.length; i++) {
  fullGroupPath.push(groupPath[i])
}
if (groupName && !group?.isRoot) {
  fullGroupPath.push(groupName)
}
```

**Proposed:** One helper, used in both places.

```typescript
function getFullGroupPath(group: TokenGroup | null): Array<string> {
  if (!group) return []
  const result: Array<string> = []
  for (let i = 0; i < group.path.length; i++) {
    result.push(group.path[i])
  }
  if (group.name && !group.isRoot) {
    result.push(group.name)
  }
  return result
}
```

---

### 2.2 "Resolve reference or format value" — repeated ~6 times

Every composite formatter has the same pattern: check for `referencedTokenId`, look up the token, build a reference path, or fall back to formatting the raw value. This appears in `formatTypography` (3 times: font, fontSize, lineHeight), `formatBorder`, `formatRadius`, and `formatShadow`.

**Example — the pattern repeats for each typography sub-property (lines 475-491):**

```typescript
if (value.fontSize) {
  if (value.fontSize.referencedTokenId) {
    const ref = tokenById[value.fontSize.referencedTokenId]
    result.fontSize = ref ? '{' + buildRefPath(ref, groups) + '}' : formatMeasure(value.fontSize)
  } else {
    result.fontSize = formatMeasure(value.fontSize)
  }
}

if (value.lineHeight) {
  if (value.lineHeight.referencedTokenId) {
    const ref = tokenById[value.lineHeight.referencedTokenId]
    result.lineHeight = ref ? '{' + buildRefPath(ref, groups) + '}' : formatMeasure(value.lineHeight)
  } else {
    result.lineHeight = formatMeasure(value.lineHeight)
  }
}
```

And again in `formatBorder` (lines 629-631), `formatRadius` (lines 643-645), etc.

**Proposed:** One helper that every formatter calls.

```typescript
function resolveOrFormat(
  value: any,
  formatter: (v: any) => any,
  tokenById: Record<string, Token>,
  groups: Array<TokenGroup>
): any {
  if (value && value.referencedTokenId) {
    const ref = tokenById[value.referencedTokenId]
    if (ref) return '{' + buildRefPath(ref, groups) + '}'
  }
  return formatter(value)
}
```

Then `formatTypography` becomes:

```typescript
if (value.fontSize) {
  result.fontSize = resolveOrFormat(value.fontSize, formatMeasure, tokenById, groups)
}
if (value.lineHeight) {
  result.lineHeight = resolveOrFormat(value.lineHeight, formatMeasure, tokenById, groups)
}
```

Every formatter gets reference resolution for free. The 6+ copies of the pattern collapse to 1.

---

### 2.3 Color extraction — written three different ways

The logic of "unwrap Supernova's nested `color.color` structure, extract r/g/b, get alpha from opacity" exists in three separate implementations:

| Function | Lines | Unwraps nested color? | Alpha source | Output format |
|----------|-------|----------------------|--------------|---------------|
| `formatShadow` | 521-546 | Yes (`color.color`) | `opacity.measure` at shadow level | DTCG object `{ colorSpace, components, alpha }` |
| `formatGradient` | 580-610 | Yes (`color.color`) | `stop.color.opacity.measure` | DTCG object `{ colorSpace, components, alpha }` |
| `formatColorValue` | 700-732 | Yes (`color.color`) | `opacity.measure` or `a` or `alpha` | Hex string `#rrggbb` or `#rrggbbaa` |

These are three iterations of solving the same problem. The shadow and gradient versions converged on DTCG color objects, but `formatColorValue` still outputs hex (which is then used by `formatBorder` and standalone colors in `formatValue`).

**Proposed:** Two shared functions — one extracts RGBA from any Supernova color shape, one formats to DTCG.

```typescript
function extractRGBA(value: any): { r: number; g: number; b: number; a: number } {
  // Handle nested color.color (Supernova's wrapping)
  let colorObj = value
  if (colorObj && colorObj.color && typeof colorObj.color.r === 'number') {
    colorObj = colorObj.color
  }

  // Get alpha from opacity property or direct alpha
  let alpha = 1
  if (value && value.opacity && typeof value.opacity.measure === 'number') {
    alpha = value.opacity.measure
  } else if (typeof colorObj.a === 'number') {
    alpha = colorObj.a
  }

  return { r: colorObj.r || 0, g: colorObj.g || 0, b: colorObj.b || 0, a: alpha }
}

function toDTCGColor(rgba: { r: number; g: number; b: number; a: number }): any {
  return {
    colorSpace: 'srgb',
    components: [rgba.r / 255, rgba.g / 255, rgba.b / 255],
    alpha: rgba.a
  }
}
```

Then `formatShadow`'s 25-line color handling becomes ~3 lines. `formatGradient`'s similar block does too. And `formatColorValue` can call the same extraction, choosing hex or DTCG output as needed.

---

### 2.4 Underscore filtering — verbose inline block that should be a helper

Lines 273-296 are 23 lines inside `buildTree` that check "does the token name, group name, or any group path segment contain `_`?" This is a self-contained decision that clutters the main loop.

```typescript
// Current: 23 lines inline
if (token.name.indexOf('_') !== -1) { continue }

const group = findGroupForToken(token, groups)

if (group) {
  if (group.name.indexOf('_') !== -1) { continue }
  let hasUnderscoreInPath = false
  for (let p = 0; p < group.path.length; p++) {
    if (group.path[p].indexOf('_') !== -1) {
      hasUnderscoreInPath = true
      break
    }
  }
  if (hasUnderscoreInPath) { continue }
}
```

**Proposed:** One helper.

```typescript
function isPrivateToken(token: Token, group: TokenGroup | null): boolean {
  if (token.name.indexOf('_') !== -1) return true
  if (!group) return false
  if (group.name.indexOf('_') !== -1) return true
  for (let i = 0; i < group.path.length; i++) {
    if (group.path[i].indexOf('_') !== -1) return true
  }
  return false
}
```

Then the `buildTree` loop just says: `if (isPrivateToken(token, group)) continue`

---

### 2.5 `formatMeasure` — 5 input shapes accumulated from trial and error

`formatMeasure` (lines 663-698) handles 5 different input shapes in 35 lines. The Supernova SDK always sends `{ measure, unit }` for dimensions. The other branches (`value/unit` already-formatted object, bare number, bare string) are defensive fallbacks that likely accumulated as edge cases surfaced during iteration.

```typescript
// Current: 35 lines, 5 branches
function formatMeasure(value: any): any {
  if (value && typeof value === 'object' && value.value !== undefined && value.unit !== undefined) { ... }
  if (typeof value === 'number') { ... }
  if (value && typeof value === 'object' && value.measure !== undefined) { ... }
  if (typeof value === 'string') { ... }
  return { value: 0, unit: 'px' }
}
```

**Proposed:** Simplified to handle the primary SDK shape and defensive fallbacks clearly.

```typescript
function formatMeasure(value: any): any {
  if (!value) return { value: 0, unit: 'px' }
  if (typeof value === 'number') return { value: value, unit: 'px' }
  if (typeof value === 'string') return value
  return {
    value: value.measure !== undefined ? value.measure : (value.value || 0),
    unit: formatUnit(value.unit)
  }
}
```

~8 lines instead of 35, same behaviour.

---

## 3. Function Design: Fragile Dispatch

### 3.1 `formatValue` ignores `tokenType` and duck-types instead

This is the clearest sign of iterative development. `formatValue` (lines 378-456) receives `tokenType` as a parameter but **never uses it**. Instead, it probes the value object's properties in a specific order to guess what type it is:

```typescript
function formatValue(value: any, tokenType: string, tokenById, groups): any {
  // tokenType is available but unused ^^^^^^^^^^^

  if (value.color && typeof value.color.r === 'number') { ... }  // Color?
  if (typeof value.r === 'number') { ... }                        // Also color?
  if (value.hex) { ... }                                          // Still color?
  if (typeof value.measure === 'number') { ... }                  // Dimension?
  if (typeof value.text === 'string') { ... }                     // Text?
  if (typeof value.family === 'string') { ... }                   // Font?
  if (value.font || value.fontSize) { ... }                       // Typography?
  if (Array.isArray(value) && value[0].x !== undefined) { ... }   // Shadow?
  if (Array.isArray(value) && value[0].stops) { ... }             // Gradient?
  if (value.color && value.width) { ... }                         // Border?
  if (value.radius || value.topLeft) { ... }                      // Radius?
  return value  // Fallback
}
```

**Problems with this approach:**
- **Order-dependent:** A border token has `value.color` — if color's `r` check matches first, a border could be misclassified as color.
- **Fragile:** If the SDK adds a new property to any value type, the detection chain could break.
- **Redundant:** We already know the type. It's passed in and ignored.

**Proposed:** Switch on `tokenType`. ~15 lines replace ~70.

```typescript
function formatValue(value: any, tokenType: string, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  if (!value) return null

  switch (tokenType) {
    case 'Color':      return formatColor(value, tokenById, groups)
    case 'Measure':
    case 'Dimension':  return formatMeasure(value)
    case 'Text':
    case 'String':     return typeof value.text === 'string' ? value.text : value
    case 'Font':       return { family: value.family || '', weight: value.subfamily || 'Regular' }
    case 'Typography': return formatTypography(value, tokenById, groups)
    case 'Shadow':     return Array.isArray(value) ? formatShadowArray(value, tokenById, groups) : value
    case 'Gradient':   return Array.isArray(value) ? formatGradient(value[0], tokenById, groups) : value
    case 'Border':     return formatBorder(value, tokenById, groups)
    case 'Radius':     return formatRadius(value, tokenById, groups)
    default:           return value
  }
}
```

Shorter, impossible to misclassify, and each type handler only worries about its own shape.

---

## 4. Performance

### 4.1 `findGroupForToken` is O(n * m) and called thousands of times

**Lines:** 819-827
**Impact:** Significant with current data volumes. Will get worse as tokens scale.

```typescript
function findGroupForToken(token: Token, groups: Array<TokenGroup>): TokenGroup | null {
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]
    if (g.tokenIds && g.tokenIds.indexOf(token.id) !== -1) {
      return g
    }
  }
  return null
}
```

This scans **all 1,106 groups**, and for each, calls `indexOf` on its `tokenIds` array. It's called for:
- Every token in `buildTree()` (line 278)
- Every referenced token in `buildRefPath()` (line 769) — called from inside `buildTree` and every formatter
- Every token in the debug block (lines 56, 87, 100)

With ~2,000 tokens and ~1,100 groups, this is called thousands of times. The total work is O(tokens * groups * avgTokenIdsPerGroup) — potentially millions of comparisons.

**Proposed:** Build a `tokenId -> group` lookup map once at startup. O(1) per lookup after that.

```typescript
// Build once after fetching groups (add after line 16)
const groupByTokenId: Record<string, TokenGroup> = {}
for (let i = 0; i < groups.length; i++) {
  const g = groups[i]
  if (g.tokenIds) {
    for (let j = 0; j < g.tokenIds.length; j++) {
      groupByTokenId[g.tokenIds[j]] = g
    }
  }
}

// Then findGroupForToken becomes:
function findGroupForToken(token: Token): TokenGroup | null {
  return groupByTokenId[token.id] || null
}
```

This is the **single most impactful change** in the review.

---

### 4.2 Theme loop rebuilds three data structures that could be two

Lines 138-158 per theme build: an override map, a merged token array, and then another map from the merged array. The merged array and the final map can be built in one pass.

```typescript
// Current: 3 separate loops
const overriddenById = {}          // Loop 1: build override map
for (...) overriddenById[...] = ...

const themedTokens = []            // Loop 2: merge
for (...) themedTokens.push(overridden || base)

const tokenById = {}               // Loop 3: build lookup from merged
for (...) tokenById[...] = ...
```

**Proposed:** Merge loops 2 and 3.

```typescript
const overriddenById: Record<string, Token> = {}
for (let i = 0; i < overriddenTokens.length; i++) {
  overriddenById[overriddenTokens[i].id] = overriddenTokens[i]
}

const themedTokens: Array<Token> = []
const tokenById: Record<string, Token> = {}
for (let i = 0; i < baseTokens.length; i++) {
  const token = overriddenById[baseTokens[i].id] || baseTokens[i]
  themedTokens.push(token)
  tokenById[token.id] = token
}
```

Minor improvement, but cleaner intent.

---

## 5. Structural Cleanup

### 5.1 Debug block: ~90 lines of instrumentation in the production path

**Lines:** 32-123

The main export function is 175 lines. Of those, **90 lines** (over half) are debug instrumentation that:
- Creates a `_debug_collections.json` file on every export
- Iterates all tokens an extra time to count collections
- Iterates unknown tokens to inspect properties
- Iterates all tokens again to find shadow tokens
- Uses `JSON.parse(JSON.stringify(value))` for deep cloning

This was essential during development. Now that the exporter works, this block should be either removed or extracted into a separate function behind a flag.

**Proposed:** Extract to a function, gate behind a flag.

```typescript
// At the top of the export function:
const DEBUG = false  // Set to true during development

if (DEBUG) {
  outputs.push(createFile('_debug_collections.json',
    buildDebugOutput(baseTokens, baseGrouped, groups)))
}
```

This makes the main export function ~85 lines — clear, linear, easy to follow.

---

### 5.2 Dead function: `findThemeById`

**Lines:** 829-834

`findThemeById` is defined but never called. It's a remnant of an earlier approach. Remove it.

---

### 5.3 Missing error handling for SDK calls

**Lines:** 15-17

The three SDK calls (`getTokens`, `getTokenGroups`, `getTokenThemes`) have no try/catch. If any fails, the entire export crashes with no useful output.

**Proposed:** Wrap in try/catch and return an error file:

```typescript
try {
  baseTokens = toArray<Token>(await sdk.tokens.getTokens(remote))
  groups = toArray<TokenGroup>(await sdk.tokens.getTokenGroups(remote))
  themes = toArray<TokenTheme>(await sdk.tokens.getTokenThemes(remote))
} catch (error) {
  return [createFile('_error.json', {
    error: 'Failed to fetch data from Supernova SDK',
    message: String(error)
  })]
}
```

---

## 6. DTCG Compliance Gaps

### 6.1 Inconsistent color format across formatters

Shadow and gradient formatters output DTCG color objects:
```json
{ "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1 }
```

But `formatColorValue` (used by standalone colors and borders) outputs hex strings:
```json
"#000000"
```

This is a direct consequence of the color logic being written independently in three places (see section 2.3). Unifying the color helpers will fix this as a side effect.

**Decision needed:** Should standalone `color` type tokens use hex strings or DTCG color objects? Either is valid per DTCG, but it should be the same everywhere.

### 6.2 `borderRadius` is not a standard DTCG type

**Line:** 804

```typescript
if (t === 'radius') return 'borderRadius'
```

DTCG spec has no `borderRadius` type. Single radius values are `dimension`. Multi-corner radii don't have a DTCG equivalent. Consider mapping to `dimension` and documenting the multi-corner case as a custom extension.

### 6.3 Font token value structure doesn't match DTCG `fontFamily`

**Line:** 806, 422-427

The type is mapped to `fontFamily` (correct), but the value is `{ family, weight }`. DTCG `fontFamily` expects a string or array of strings. The weight belongs in `typography`, not `fontFamily`.

### 6.4 Gradient output loses directional information

**Lines:** 573-620

`type`, `from`, and `to` are stripped. This is DTCG-compliant (the spec only defines stops), but consumers lose gradient direction. Consider preserving via `$extensions`:

```json
{
  "$value": [...stops],
  "$type": "gradient",
  "$extensions": { "io.supernova": { "type": "Linear", "from": { "x": 0, "y": 0 }, "to": { "x": 1, "y": 1 } } }
}
```

---

## 7. Type Definitions Gap

### 7.1 `supernova.d.ts` doesn't match the runtime SDK

The root cause of ~25 `as any` casts throughout the code is that `supernova.d.ts` is incomplete. The type definitions say `referencedToken` (object), the runtime provides `referencedTokenId` (string). Properties like `isVirtual`, `properties`, `propertyValues`, and `overriddenTokens` aren't defined at all.

**Proposed:** Update `supernova.d.ts` to reflect the actual runtime shapes:

- Add `referencedTokenId: string | null` to all token value types
- Add `isVirtual?: boolean` to `TokenValue`
- Add `properties?: Array<TokenProperty>` and `propertyValues?: Record<string, any>` to `TokenValue` 
- Add `overriddenTokens?: Array<Token>` to `TokenTheme`
- Add a `TokenProperty` type with `id`, `name`, `codeName`, `options`

This eliminates most `as any` casts, making the code safer and more readable without changing any runtime behaviour.

---

## 8. Refactoring Plan

### Phase 1: Foundation (do first, everything else depends on it)

| # | Change | Why | Effort |
|---|--------|-----|--------|
| 1 | Build `tokenId -> group` lookup map | Biggest performance win. Current approach is O(n*m) per token. | Low |
| 2 | Update `supernova.d.ts` with runtime types | Eliminates ~25 `as any` casts, makes all other changes safer. | Medium |

### Phase 2: Consolidate (the big cleanup)

| # | Change | Why | Lines saved |
|---|--------|-----|-------------|
| 3 | Extract `resolveOrFormat` helper | Replaces repeated ref-check pattern in 6+ places. | ~40 |
| 4 | Extract `extractRGBA` + `toDTCGColor` helpers | Replaces 3 independent color implementations. Fixes color inconsistency (6.1). | ~50 |
| 5 | Switch `formatValue` to `tokenType`-based dispatch | Replaces fragile duck-typing with explicit routing. | ~55 |
| 6 | Extract `getFullGroupPath` helper | Replaces duplicate path-building in `buildTree` and `buildRefPath`. | ~15 |
| 7 | Simplify `formatMeasure` | 5 branches → clear 3-branch fallback. | ~25 |
| 8 | Extract `isPrivateToken` helper | Cleans up 23-line inline block in `buildTree`. | ~15 |

### Phase 3: Clean up (quick wins after consolidation)

| # | Change | Why |
|---|--------|-----|
| 9 | Remove or feature-flag debug block | ~90 lines out of the main export path, performance benefit. |
| 10 | Remove dead `findThemeById` | Unused code. |
| 11 | Add try/catch around SDK calls | Prevents silent crash, gives actionable error output. |
| 12 | Fix DTCG compliance issues (6.2, 6.3) | Correct type mappings for `borderRadius` and `fontFamily`. |
| 13 | Merge theme processing loops | 3 loops → 2, cleaner intent. |

### Expected result

- **~200 fewer lines** (873 → ~670)
- **Same output** — no functional changes
- **O(1) group lookups** instead of O(n * m)
- **One place** for color extraction, reference resolution, path building, measure formatting
- **No more duck-typing** — explicit dispatch on known types
- **Proper TypeScript types** — `as any` reduced from ~25 to near zero

---

## Appendix: Reference Links

- [DTCG Specification (2025.10)](https://www.designtokens.org/tr/2025.10/format/)
- [Supernova SDK - Token Values](https://developers.supernova.io/latest/sdk-reference/data-model/tokens/token-values-Hnb3ieu5)
- [Supernova Developer Docs](https://developers.supernova.io/latest/introduction-AkjCkqA2)
- [Style Dictionary Documentation](https://styledictionary.com/)
- Project docs: `EXPORTER_DOCUMENTATION.md`, `EXPORT_PLAN.md`, `DTCG_COMPLIANCE_SUMMARY.md`

---

## Appendix: Supernova Runtime Constraints

The Supernova Pulsar runtime does **not** support:
- `for...of` loops — use indexed `for` loops
- `String.padStart` — custom `pad2()` is used
- `Array.from`, spread in some contexts
- `FileHelper` may not exist — fallback to plain objects

Any refactoring must preserve C-style `for` loops and avoid modern JS features. This should be documented with a comment at the top of the source file.
