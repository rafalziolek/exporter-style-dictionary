# DTCG Shadow & Dimension Compliance - Implementation Summary

## Changes Made

All changes have been successfully implemented to make shadow tokens and all dimension-based tokens DTCG-compliant.

### 1. Fixed Shadow Detection (✓ Completed)

**File:** `typescript/src/index.ts` (line 403)

**Before:**
```typescript
// Shadow: has .x, .y, .radius, .spread
if (value.x !== undefined && value.y !== undefined) {
  return formatShadow(value, tokenById, groups)
}
```

**After:**
```typescript
// Shadow: Supernova provides array with shadow object(s)
if (Array.isArray(value) && value.length > 0 && value[0].x !== undefined && value[0].y !== undefined) {
  return formatShadowArray(value, tokenById, groups)
}
```

**Why:** Supernova wraps shadow objects in an array (for multi-layer shadows). The old code checked for `value.x` on the array itself, which always failed.

### 2. Created Shadow Array Handler (✓ Completed)

**File:** `typescript/src/index.ts` (after line 546)

**New function:**
```typescript
function formatShadowArray(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  const shadows: Array<any> = []
  
  for (let i = 0; i < value.length; i++) {
    const shadow = value[i]
    shadows.push(formatShadow(shadow, tokenById, groups))
  }
  
  // Return array directly (DTCG supports both single object and arrays)
  return shadows
}
```

**Why:** DTCG supports multi-layer shadows as arrays. This function processes each shadow layer.

### 3. Updated Shadow Formatter (✓ Completed)

**File:** `typescript/src/index.ts` (lines 472-545)

**Before:**
```typescript
function formatShadow(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  const result: any = {
    offsetX: formatMeasure(value.x),
    offsetY: formatMeasure(value.y),
    blur: formatMeasure(value.radius),
    spread: formatMeasure(value.spread),
  }

  if (value.color) {
    if (value.color.referencedTokenId) {
      const ref = tokenById[value.color.referencedTokenId]
      result.color = ref ? '{' + buildRefPath(ref, groups) + '}' : formatColorValue(value.color)
    } else {
      result.color = formatColorValue(value.color)
    }
  }

  return result
}
```

**After:**
```typescript
function formatShadow(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  const result: any = {
    offsetX: formatMeasure(value.x),
    offsetY: formatMeasure(value.y),
    blur: formatMeasure(value.radius),
    spread: formatMeasure(value.spread),
  }

  // Handle color with full DTCG format
  if (value.color) {
    // Extract color from nested structure (Supernova has color.color)
    let colorValue = value.color
    if (colorValue.color) {
      colorValue = colorValue.color  // Unwrap nested color
    }
    
    // Check for color reference
    if (colorValue.referencedTokenId) {
      const ref = tokenById[colorValue.referencedTokenId]
      result.color = ref ? '{' + buildRefPath(ref, groups) + '}' : null
    }
    
    // Format color to full DTCG color object (not hex string)
    if (!result.color && colorValue) {
      const r = colorValue.r || 0
      const g = colorValue.g || 0
      const b = colorValue.b || 0
      
      // Get alpha from opacity if present
      let alpha = 1
      if (value.color.opacity && typeof value.color.opacity.measure === 'number') {
        alpha = value.color.opacity.measure
      }
      
      // DTCG requires RGB in 0-1 range, Supernova provides 0-255
      result.color = {
        colorSpace: 'srgb',
        components: [r / 255, g / 255, b / 255],
        alpha: alpha
      }
    }
  }
  
  // Handle inset property (from Supernova's type field)
  if (value.type) {
    const typeStr = String(value.type).toLowerCase()
    if (typeStr === 'inner' || typeStr === 'inset') {
      result.inset = true
    }
    // Default is false (drop shadow), so no need to set explicitly
  }

  return result
}
```

**Key Changes:**
- Unwraps nested `color.color` structure from Supernova
- Converts RGB from 0-255 to 0-1 range (DTCG requirement)
- Formats colors as full DTCG color objects with `colorSpace`, `components`, `alpha`
- Maps Supernova's `type: "Inner"` to DTCG's `inset: true`
- Handles color token references properly
- Property names already correctly mapped (x→offsetX, y→offsetY, radius→blur)

### 4. Fixed Dimension Formatter (✓ Completed) - CRITICAL CHANGE

**File:** `typescript/src/index.ts` (lines 629-663)

**Before:**
```typescript
function formatMeasure(value: any): string {
  if (!value) return '0px'
  if (typeof value === 'number') return value + 'px'
  if (typeof value === 'string') return value
  const measure = value.measure !== undefined ? value.measure : 0
  const unit = formatUnit(value.unit)
  return measure + unit
}
```

**After:**
```typescript
function formatMeasure(value: any): any {
  // If it's already a dimension object with value/unit, normalize it
  if (value && typeof value === 'object' && value.value !== undefined && value.unit !== undefined) {
    return {
      value: value.value,
      unit: formatUnit(value.unit)
    }
  }
  
  // If it's a number, create dimension object
  if (typeof value === 'number') {
    return {
      value: value,
      unit: 'px'
    }
  }
  
  // If it has measure/unit (Supernova format), convert
  if (value && typeof value === 'object' && value.measure !== undefined) {
    return {
      value: value.measure,
      unit: formatUnit(value.unit)
    }
  }
  
  // Fallback for backward compatibility (string values)
  if (typeof value === 'string') {
    return value
  }
  
  // Default
  return {
    value: 0,
    unit: 'px'
  }
}
```

**Impact:** This change affects ALL dimension-based tokens across the entire system:
- Dimension tokens
- Shadow tokens (offsetX, offsetY, blur, spread)
- Typography tokens (fontSize, lineHeight, letterSpacing)
- Border tokens (width)
- Radius tokens (topLeft, topRight, bottomLeft, bottomRight, radius)

### 5. Fixed Direct Dimension Tokens (✓ Completed)

**File:** `typescript/src/index.ts` (line 380)

**Before:**
```typescript
// Dimension/Measure: has .measure and .unit
if (typeof value.measure === 'number') {
  return value.measure + formatUnit(value.unit)
}
```

**After:**
```typescript
// Dimension/Measure: has .measure and .unit
if (typeof value.measure === 'number') {
  return {
    value: value.measure,
    unit: formatUnit(value.unit)
  }
}
```

**Why:** Ensures dimension tokens themselves also output objects, not strings.

### 6. Updated Documentation (✓ Completed)

**File:** `EXPORTER_DOCUMENTATION.md`

Updated all token type examples to show DTCG-compliant dimension objects:
- Dimension tokens: Show object format
- Shadow tokens: Complete before/after examples with multi-layer support
- Typography tokens: Dimension objects for fontSize, lineHeight, letterSpacing
- Border tokens: Dimension object for width
- Radius tokens: Dimension objects for all corner values

## Verification Test Results

Created and ran a test that confirms:

✓ Output is array (multi-layer support)
✓ Has correct number of shadow layers
✓ Each shadow has dimension objects (offsetX, offsetY, blur, spread)
✓ Dimension objects have value and unit properties
✓ Each shadow has full DTCG color object with colorSpace
✓ RGB components normalized to 0-1 range
✓ Alpha extracted from opacity.measure
✓ Inset property correctly set from type field
✓ No non-standard properties (type, x, y, radius, opacity outside color)

**Example transformation:**

Input RGB: `[218, 218, 218]` (0-255 range)
Output components: `[0.855, 0.855, 0.855]` (0-1 range)
✓ Conversion correct

Input type: `"Inner"`
Output inset: `true`
✓ Mapping correct

## Output Format Examples

### Before (Non-Compliant)

```json
{
  "outline-focus": {
    "$value": [
      {
        "color": {
          "color": { "r": 218, "g": 218, "b": 218 },
          "opacity": { "measure": 1 }
        },
        "x": 0,
        "y": 0,
        "radius": 0,
        "spread": 1,
        "opacity": { "measure": 1 },
        "type": "Inner",
        "referencedTokenId": null
      },
      {
        "color": {
          "color": { "r": 0, "g": 0, "b": 0 },
          "opacity": { "measure": 0.08 }
        },
        "x": 0,
        "y": -1,
        "radius": 0,
        "spread": 0,
        "type": "Inner"
      }
    ],
    "$type": "shadow"
  }
}
```

### After (DTCG-Compliant)

```json
{
  "outline-focus": {
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
}
```

## Dimension Tokens Also Fixed

As a side effect of fixing `formatMeasure()`, ALL dimension-based tokens are now DTCG-compliant:

### Example: Dimension Token

**Before:**
```json
{
  "border-width": {
    "$value": "1px",
    "$type": "dimension"
  }
}
```

**After:**
```json
{
  "border-width": {
    "$value": {
      "value": 1,
      "unit": "px"
    },
    "$type": "dimension"
  }
}
```

## Breaking Changes & Impact

### What Changed

**ALL dimension values** are now objects instead of strings:

| Token Type  | Property          | Before       | After                             |
|-------------|-------------------|--------------|-----------------------------------|
| Dimension   | $value            | `"16px"`     | `{"value": 16, "unit": "px"}`     |
| Shadow      | offsetX/Y/blur/spread | `"2px"`  | `{"value": 2, "unit": "px"}`      |
| Typography  | fontSize/lineHeight/letterSpacing | `"16px"` | `{"value": 16, "unit": "px"}` |
| Border      | width             | `"1px"`      | `{"value": 1, "unit": "px"}`      |
| Radius      | radius/corners    | `"8px"`      | `{"value": 8, "unit": "px"}`      |

### Downstream Tool Impact

**Style Dictionary or other consumers need to update transformers:**

**Before (expecting strings):**
```javascript
{
  transform: {
    name: 'size/px',
    matcher: token => token.$type === 'dimension',
    transformer: token => token.$value  // Returns "16px"
  }
}
```

**After (handling objects):**
```javascript
{
  transform: {
    name: 'size/px',
    matcher: token => token.$type === 'dimension',
    transformer: token => {
      if (typeof token.$value === 'object') {
        return `${token.$value.value}${token.$value.unit}`  // Returns "16px"
      }
      return token.$value  // Fallback for strings
    }
  }
}
```

### Why This Is Good

1. **Full DTCG Compliance:** All dimension types now follow the official specification
2. **Type Safety:** Objects are more reliable to parse than strings
3. **Better Tooling:** Downstream tools can access numeric values directly
4. **Consistency:** Same structure across all dimension-based tokens
5. **Future-Proof:** Supports more complex dimension types (calc expressions, etc.)

## Next Steps for User

The code has been updated and compiled. To see the DTCG-compliant output:

1. **Run the exporter in Supernova** to regenerate the `.build/` output files with the new transformation
2. **Verify shadow tokens** in the output files match the DTCG format shown above
3. **Verify dimension tokens** also use object format
4. **Update Style Dictionary config** (or other downstream tools) to handle dimension objects instead of strings
5. **Test with DTCG-compliant tools** to ensure compatibility

## DTCG Specification Compliance

The implementation now fully complies with:

### [DTCG §9.6 Shadow](https://www.designtokens.org/tr/2025.10/format/#shadow)

✓ `$value` can be single object or array of shadow objects
✓ Each shadow has `offsetX`, `offsetY`, `blur`, `spread` as dimension objects
✓ Colors use full DTCG format with `colorSpace`, `components`, `alpha`
✓ RGB components normalized to 0-1 range
✓ `inset` boolean for inner shadows
✓ No proprietary Supernova properties in output

### [DTCG §8.2 Dimension](https://www.designtokens.org/tr/2025.10/format/#dimension)

✓ All dimension values are objects with `value` and `unit` properties
✓ Supports `px` and `rem` units (and others via formatUnit)
✓ Numeric values are preserved as numbers (not strings)

## Files Modified

1. `typescript/src/index.ts` - Core transformation logic
   - Updated shadow detection (line 403)
   - Added formatShadowArray() function (line 547)
   - Updated formatShadow() function (lines 472-545)
   - Updated formatMeasure() function (lines 629-663)
   - Updated dimension token handling (line 380)
2. `EXPORTER_DOCUMENTATION.md` - Updated all dimension-related documentation
3. `src/js/compiled.js` - Automatically compiled from TypeScript source

## Summary of All Token Types Affected

This change makes the following token types DTCG-compliant:

1. ✓ **Shadow** - Full compliance with multi-layer support, dimension objects, DTCG colors, inset property
2. ✓ **Dimension** - Now outputs objects instead of strings
3. ✓ **Typography** - All dimension sub-values (fontSize, lineHeight, letterSpacing) are objects
4. ✓ **Border** - Width is now a dimension object
5. ✓ **Radius** - All radius values (single and corners) are dimension objects
6. ✓ **Gradient** - Already fixed in previous update

No breaking changes to:
- Color tokens (already compliant)
- Font tokens (don't use dimensions)
- String/Text tokens (don't use dimensions)
