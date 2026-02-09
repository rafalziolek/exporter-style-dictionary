# Missing Tokens Summary
**Generated**: February 8, 2026

## Overview

**Total Missing**: 128 tokens exist in watson-web but are NOT in the new Supernova export.

These tokens are present in the current Watson Web repository but will be missing if you adopt the new export.

---

## Missing Tokens by Category

### CORE (7 tokens)

**Colors (4)**
- `core.color.red.300-60 2` (color) - duplicate/temp token?
- `core.color.red.300-40 2` (color) - duplicate/temp token?
- `core.color.red.300-60 3` (color) - duplicate/temp token?
- `core.color.red.300-40 3` (color) - duplicate/temp token?

**Box Shadows (3)**
- `core.box-shadow.s` (boxShadow)
- `core.box-shadow.m` (boxShadow)
- `core.box-shadow.l` (boxShadow)

---

### MOBILE/PATIENT (47 tokens)

**Badge Tokens (6)**
- `components.badge.ai.color.background` (color)
- `components.badge.ai.color.border` (color)
- `components.badge.ai-inverted.color.background` (color)
- `components.badge.ai-inverted.color.border` (color)
- `components.badge.padding.horizontal` (dimension)

**Button Tokens (13)**
<!-- - `components.button.default.spinner.stroke-color` (color) -->
<!-- - `components.button.default.outline.focus` (color)
- `components.button.primary.outline.focus` (color)
- `components.button.secondary.outline.focus` (color)
- `components.button.danger.outline.focus` (color)
- `components.button.plain.color.background` (color)
- `components.button.plain.outline.focus` (color)
- `components.button.icon.size` (dimension) -->
<!-- - `components.button.large.gap` (dimension)
- `components.button.small.gap` (dimension)
- `components.button.medium.padding` (dimension)
- `components.button.medium.gap` (dimension) -->

**Divider & Collapse (9)**
<!-- - `components.divider.color.primary` (color)
- `components.divider.color.secondary` (color)
- `components.collapse.header.color.border-focused` (color)
- `components.collapse.header.padding.block-none` (dimension)
- `components.collapse.header.padding.block-s` (dimension)
- `components.collapse.header.padding.block-m` (dimension)
- `components.collapse.padding.inline` (dimension)
- `components.collapse.panel.padding.block-none (top)` (dimension)
- `components.collapse.panel.padding.block-none (bottom)` (dimension)
- `components.collapse.panel.padding.block-s (top)` (dimension)
- `components.collapse.panel.padding.block-s (bottom)` (dimension)
- `components.collapse.panel.padding.block-m (top)` (dimension)
- `components.collapse.panel.padding.block-m (bottom)` (dimension) -->

**Form Controls (10)**
- `components.checkbox.icon.margin.top` (dimension)
- `components.icon-button.outline.focus` (color)
<!-- - `components.icon-button.color.border` (color) -->
<!-- - `components.icon-button.primary.color.background` (color) -->
<!-- - `components.icon-button.primary.color.background-active` (color) -->
- `components.icon-button.danger.outline.focus` (color)
- `components.icon-button.plain.outline.focus` (color)
- `components.icon-button.secondary.outline.focus` (color)
<!-- - `components.icon-button.icon.size` (dimension) -->
- `components.input.affix.icon.size` (dimension)
- `components.radio.outline.focus` (color)
- `components.radio.outline.offset` (dimension)

**Other Mobile Components (3)**
- `components.segmented-control.button.icon-size` (dimension)
- `components.segmented-control.button.color.background-pressed` (color)
- `components.toggle.outline.color-active` (color)

**Font Family (1)**
<!-- - `semantic.font-family._sans` (text) -->

---

<!-- ### WEB/LEGACY (4 tokens)

- `component.progress-bar.color.background` (color)
- `component.radio.outline.focus` (other)
- `component.table.tr.color.background.hover` (color)
- `component.table.tr.color.background.active` (color)

_Note: You mentioned you don't care about web-legacy, so these 4 can be ignored._

--- -->

### WEB/PATIENT (70 tokens)

**Button & Box Shadows (4)**
- `components.button.box-shadow` (boxShadow)
- `components.button.default.box-shadow` (boxShadow)
- `components.button.default.border` (boxShadow)
- `components.button.secondary.border` (boxShadow)

<!-- **Button Colors (Many removed, likely replaced with new structure)**
- `components.button.primary.color-background` (color)
- `components.button.primary.color-background-active` (color)
- `components.button.primary.color-foreground` (color)
- `components.button.secondary.color-background` (color)
- `components.button.secondary.color-background-active` (color)
- ... and more button color tokens -->

<!-- **Badge Variants (36 tokens)**
All these badge color tokens are missing:
- `components.badge.neutral.*` (9 tokens: background, foreground, border for normal/inverted/decorative)
- `components.badge.accent.*` (9 tokens)
- `components.badge.info.*` (9 tokens)
- `components.badge.success.*` (9 tokens)
- `components.badge.danger.*` (9 tokens)
- `components.badge.warning.*` (9 tokens) -->
- `components.badge.ai.*` (6 tokens)

<!-- **Avatar Tokens (9)**
- `components.avatar.user.initials.color-background` (color)
- `components.avatar.user.initials.color-foreground` (color)
- `components.avatar.user.initials.color-border` (color)
- `components.avatar.user.initials.inverted.*` (2 tokens)
- `components.avatar.empty.*` (2 tokens)
- `components.avatar.entity.initials.*` (2 tokens) -->

**Banner Tokens (11)**
- `components.banner.heading.font-size` (dimension)
- `components.banner.box-shadow` (boxShadow)
- `components.banner.error.border` (boxShadow)
- `components.banner.error.box-shadow` (boxShadow)
- `components.banner.info.border` (boxShadow)
- `components.banner.info.box-shadow` (boxShadow)
- `components.banner.warning.border` (boxShadow)
- `components.banner.warning.box-shadow` (boxShadow)
- `components.banner.success.border` (boxShadow)
- `components.banner.success.box-shadow` (boxShadow)

**Internal/Private Tokens (4)**
<!-- - `components.checkbox.error-hint._margin` (dimension) - underscore prefix -->
<!-- - `components.icon.background.border-radius` (dimension) -->
- `components.input._height` (dimension) - underscore prefix
- `components.input._padding` (dimension) - underscore prefix
- `semantic.font-family._body` (text) - underscore prefix

**Action Bar & Box Shadow (2)**
- `components.action-bar.box-shadow` (boxShadow)
- `semantic.box-shadow` - NOTE: This may have been replaced by proper `shadow` type tokens

---

## Analysis

### Likely Intentional Removals
1. **Underscore-prefixed tokens** (5 tokens) - These are internal/private tokens
2. **Legacy web tokens** (4 tokens) - You confirmed these aren't needed
3. **Box-shadow tokens** (13 tokens) - May have been replaced with new `shadow` type tokens
4. **Duplicate/temp color tokens** (4 core colors with "2" and "3" suffixes)

### Tokens That May Need Investigation (102 tokens)

**High Priority - Component Tokens:**
- 36 badge variant tokens (all neutral, accent, info, success, danger, warning, ai variants)
- 13 button tokens (gaps, padding, icon sizes, outline focus states)
- 13 collapse/padding tokens
- 10 icon-button/form control tokens
- 9 avatar variant tokens
- 11 banner tokens

**Medium Priority:**
- 6 mobile badge AI variants
- 3 segmented-control/toggle tokens
- 2 divider color tokens

### ✅ RESOLVED: Badge Variants (36 tokens)

**Status**: NOT ACTUALLY MISSING - These are **structural renames**!

**What we found**: Watson-web has inconsistent badge token structure across platforms:
- **Mobile** (both customer & patient): Already uses new nested structure
  - `badge.neutral.color.background` ✅
  - `badge.neutral.color.foreground` ✅
  - `badge.neutral.color.border` ✅
- **Web** (both customer & patient): Still uses old flat structure
  - `badge.neutral.color-background` (dash, not dot)
  - `badge.neutral.color-foreground`
  - `badge.neutral.color-border`

**New export**: Consistently uses nested structure for ALL platforms (mobile + web)

**Conclusion**: These 36 tokens exist in the new export with improved, consistent structure!

---

### Questions to Answer

1. ~~**Badge variants**~~: ✅ RESOLVED - Structural renames, not missing
2. **Button gaps/padding**: Are these now defined differently? Or truly removed?
3. **Outline focus states**: Were these consolidated into a different naming pattern?
4. **Box shadows**: Were these replaced with new shadow tokens? (See new tokens section)

---

## Recommendations

1. ~~**Review badge tokens**~~ - ✅ RESOLVED: Structural renames, not missing (66 remaining)
2. **Check button component** - Multiple sizing/spacing tokens gone
3. **Verify outline focus pattern** - Many `*.outline.focus` tokens removed
4. **Compare box-shadow → shadow** - May have been migrated to new type

**Updated Priority**: Focus on the remaining 66 potentially missing tokens (mostly button, collapse, icon-button, avatar, and banner component tokens)
