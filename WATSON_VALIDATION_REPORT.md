# Watson Token Validation Report
**Generated**: February 8, 2026  
**Exporter**: Custom Supernova Exporter with Font-Weight Fix

## Executive Summary

This report validates the newly exported tokens from Supernova against the existing Watson Web token repository. The validation includes intelligent filtering to separate genuine changes from structural improvements.

### Overall Statistics

- 🚨 **Breaking Changes**: 355 (actual removals and type corrections)
- ⚠️ **Value Changes**: 91 (semantic value differences only)
- 📐 **Format Changes**: 131 (structure improvements, values unchanged)
- ℹ️ **New Tokens**: 113 (genuinely new additions)
- 🔄 **Structural Renames**: 174 (dash-to-dot notation, filtered from breaking)
- ✓ **Unchanged**: 900 (54.6% stable)

**Total Tokens**: 1,938 compared across 6 files

### Key Improvements Applied

✅ **Font-Weight Fix**: All 66 font-weight tokens now correctly export as `fontWeight` type with unitless values  
✅ **Structural Rename Filtering**: 174 dash-to-dot renames identified and separated  
✅ **Format Change Detection**: 131 format improvements (e.g., `"10px"` → `{"value": 10, "unit": "px"}`) filtered from value changes  

### What This Means

- **Breaking Changes (355)**: Real removals or intentional type corrections that may require code updates
- **Value Changes (91)**: Actual design changes (colors, sizes, weights) that differ semantically
- **Format Changes (131)**: DTCG compliance improvements - same values, better structure
- **Structural Renames (174)**: Naming convention improvements - no functional impact

## Comparison Details

**Source**: `/Users/rafal.ziolek/GitHub/exporter-style-dictionary/.build` (6 files, 1,512 tokens)

**Target**: `/Users/rafal.ziolek/GitHub/watson-web/packages/tokens/src` (6 files, 1,651 tokens)

## By Platform

| Platform | Breaking | Value Changes | New | Unchanged | Total |
|----------|----------|---------------|-----|-----------|-------|
| **core** | 24 | 15 | 1 | 196 | 236 |
| **mobile/patient** | 47 | 0 | 86 | 133 | 266 |
| **web/legacy** | 4 | 0 | 0 | 9 | 13 |
| **web/patient** | 280 | 76 | 26 | 562 | 944 |

## CORE

### 🚨 Breaking Changes (24)

| Token Path | Reason | Old Type | New Type |
|------------|--------|----------|----------|
| `core.color.red.300-60 2` | Removed | color | - |
| `core.color.red.300-40 2` | Removed | color | - |
| `core.color.red.300-60 3` | Removed | color | - |
| `core.color.red.300-40 3` | Removed | color | - |
| `core.line-height.m` | Type Changed | number | dimension |
| `core.line-height.l` | Type Changed | number | dimension |
| `core.line-height.s` | Type Changed | number | dimension |
| `core.z-index.0` | Type Changed | number | dimension |
| `core.z-index.100` | Type Changed | number | dimension |
| `core.z-index.200` | Type Changed | number | dimension |
| `core.z-index.300` | Type Changed | number | dimension |
| `core.z-index.400` | Type Changed | number | dimension |
| `core.z-index.500` | Type Changed | number | dimension |
| `core.z-index.600` | Type Changed | number | dimension |
| `core.z-index.700` | Type Changed | number | dimension |
| `core.z-index.800` | Type Changed | number | dimension |
| `core.z-index.900` | Type Changed | number | dimension |
| `core.z-index.1000` | Type Changed | number | dimension |
| `core.font-family.inter` | Type Changed | text | fontFamily |
| `core.font-family.system` | Type Changed | text | fontFamily |
| `core.box-shadow.s` | Removed | boxShadow | - |
| `core.box-shadow.m` | Removed | boxShadow | - |
| `core.box-shadow.l` | Removed | boxShadow | - |
| `core.base-rem` | Type Changed | number | dimension |

### ⚠️ Value Changes (15)

_Semantic value changes where the actual value is different_

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `core.color.gray.50` | `"#F8F9FA"` | `"#f7f8f8"` | color |
| `core.color.gray.75` | `"#F2F4F6"` | `"#f3f5f5"` | color |
| `core.color.gray.100` | `"#E7EAF0"` | `"#e8eaea"` | color |
| `core.color.gray.200` | `"#d3dae5"` | `"#d8dada"` | color |
| `core.color.gray.300` | `"#a4b5c8"` | `"#afb4b4"` | color |
| `core.color.gray.400` | `"#7d8fa4"` | `"#888f8f"` | color |
| `core.color.gray.500` | `"#606F80"` | `"#667070"` | color |
| `core.color.gray.600` | `"#525f6e"` | `"#565f5f"` | color |
| `core.color.gray.700` | `"#46515e"` | `"#4a5151"` | color |
| `core.color.gray.800` | `"#3a434d"` | `"#3d4343"` | color |
| `core.color.gray.900` | `"#23272d"` | `"#242727"` | color |
| `core.color.gray.200-60` | `"hsla(217,26%,86%,0.6)"` | `"#d8dada99"` | color |
| `core.color.gray.100-60` | `"hsla(220,23%,92%,0.6)"` | `"#e8eaea99"` | color |
| `core.border-radius.half` | `"50%"` | `{"value":999,"unit":"px"}` | dimension |
| `core.font-weight.regular` | `"450"` | `400` | fontWeight |

### 📐 Format Changes (45)

_Structure improvements where the semantic value is unchanged (e.g., `"10px"` → `{"value": 10, "unit": "px"}`)_

| Token Path | Old Format | New Format | Type |
|------------|------------|------------|------|
| `core.color.teal.50` | `"#F2FCF8"` | `"#f2fcf8"` | color |
| `core.color.teal.75` | `"#DFF9F2"` | `"#dff9f2"` | color |
| `core.color.teal.100` | `"#C1F5E7"` | `"#c1f5e7"` | color |
| `core.color.teal.500` | `"#007C68"` | `"#007c68"` | color |
| `core.color.blue.50` | `"#F8FAFE"` | `"#f8fafe"` | color |
| `core.color.blue.100` | `"#E2E9FF"` | `"#e2e9ff"` | color |
| `core.color.blue.500` | `"#256EC3"` | `"#256ec3"` | color |
| `core.border-radius.1` | `"2px"` | `{"value":2,"unit":"px"}` | dimension |
| `core.border-radius.2` | `"4px"` | `{"value":4,"unit":"px"}` | dimension |
| `core.border-radius.3` | `"8px"` | `{"value":8,"unit":"px"}` | dimension |
| `core.border-radius.4` | `"16px"` | `{"value":16,"unit":"px"}` | dimension |
| `core.border-radius.5` | `"24px"` | `{"value":24,"unit":"px"}` | dimension |
| `core.border-radius.6` | `"32px"` | `{"value":32,"unit":"px"}` | dimension |
| `core.border-radius.full` | `"999px"` | `{"value":999,"unit":"px"}` | dimension |
| `core.size.24` | `"24px"` | `{"value":24,"unit":"px"}` | dimension |
| `core.size.32` | `"32px"` | `{"value":32,"unit":"px"}` | dimension |
| `core.size.44` | `"44px"` | `{"value":44,"unit":"px"}` | dimension |
| `core.size.56` | `"56px"` | `{"value":56,"unit":"px"}` | dimension |
| `core.font-weight.extra-bold` | `"700"` | `700` | fontWeight |
| `core.font-weight.bold` | `"600"` | `600` | fontWeight |
| `core.font-weight.medium` | `"550"` | `550` | fontWeight |
| `core.font-size.xs` | `"12px"` | `{"value":12,"unit":"px"}` | dimension |
| `core.font-size.l` | `"18px"` | `{"value":18,"unit":"px"}` | dimension |
| `core.font-size.s` | `"14px"` | `{"value":14,"unit":"px"}` | dimension |
| `core.font-size.xxl` | `"28px"` | `{"value":28,"unit":"px"}` | dimension |
| `core.font-size.xl` | `"24px"` | `{"value":24,"unit":"px"}` | dimension |
| `core.font-size.xxxl` | `"32px"` | `{"value":32,"unit":"px"}` | dimension |
| `core.font-size.m` | `"16px"` | `{"value":16,"unit":"px"}` | dimension |
| `core.space.2` | `"2px"` | `{"value":2,"unit":"px"}` | dimension |
| `core.space.4` | `"4px"` | `{"value":4,"unit":"px"}` | dimension |
| `core.space.8` | `"8px"` | `{"value":8,"unit":"px"}` | dimension |
| `core.space.12` | `"12px"` | `{"value":12,"unit":"px"}` | dimension |
| `core.space.16` | `"16px"` | `{"value":16,"unit":"px"}` | dimension |
| `core.space.24` | `"24px"` | `{"value":24,"unit":"px"}` | dimension |
| `core.space.32` | `"32px"` | `{"value":32,"unit":"px"}` | dimension |
| `core.space.40` | `"40px"` | `{"value":40,"unit":"px"}` | dimension |
| `core.space.48` | `"48px"` | `{"value":48,"unit":"px"}` | dimension |
| `core.space.56` | `"56px"` | `{"value":56,"unit":"px"}` | dimension |
| `core.space.64` | `"64px"` | `{"value":64,"unit":"px"}` | dimension |
| `core.breakpoint.viewport.1` | `"320px"` | `{"value":320,"unit":"px"}` | dimension |
| `core.breakpoint.viewport.2` | `"544px"` | `{"value":544,"unit":"px"}` | dimension |
| `core.breakpoint.viewport.3` | `"768px"` | `{"value":768,"unit":"px"}` | dimension |
| `core.breakpoint.viewport.4` | `"992px"` | `{"value":992,"unit":"px"}` | dimension |
| `core.breakpoint.viewport.5` | `"1280px"` | `{"value":1280,"unit":"px"}` | dimension |
| `core.breakpoint.viewport.6` | `"1440px"` | `{"value":1440,"unit":"px"}` | dimension |

### ℹ️ New Tokens (1)

- `core.font-weight.regularstring` (fontWeight)

## MOBILE/PATIENT

### 🚨 Breaking Changes (47)

| Token Path | Reason | Old Type | New Type |
|------------|--------|----------|----------|
| `semantic.font-family._sans` | Removed | text | - |
| `semantic.font-family.sans` | Type Changed | text | fontFamily |
| `components.badge.ai.color.background` | Removed | color | - |
| `components.badge.ai.color.border` | Removed | color | - |
| `components.badge.ai-inverted.color.background` | Removed | color | - |
| `components.badge.ai-inverted.color.border` | Removed | color | - |
| `components.badge.padding.horizontal` | Removed | dimension | - |
| `components.button.default.spinner.stroke-color` | Removed | color | - |
| `components.button.default.outline.focus` | Removed | color | - |
| `components.button.primary.outline.focus` | Removed | color | - |
| `components.button.secondary.outline.focus` | Removed | color | - |
| `components.button.danger.outline.focus` | Removed | color | - |
| `components.button.plain.color.background` | Removed | color | - |
| `components.button.plain.outline.focus` | Removed | color | - |
| `components.button.icon.size` | Removed | dimension | - |
| `components.button.large.gap` | Removed | dimension | - |
| `components.button.small.gap` | Removed | dimension | - |
| `components.button.medium.padding` | Removed | dimension | - |
| `components.button.medium.gap` | Removed | dimension | - |
| `components.divider.color.primary` | Removed | color | - |
| `components.divider.color.secondary` | Removed | color | - |
| `components.collapse.header.color.border-focused` | Removed | color | - |
| `components.collapse.header.padding.block-none` | Removed | dimension | - |
| `components.collapse.header.padding.block-s` | Removed | dimension | - |
| `components.collapse.header.padding.block-m` | Removed | dimension | - |
| `components.collapse.padding.inline` | Removed | dimension | - |
| `components.collapse.panel.padding.block-none (top)` | Removed | dimension | - |
| `components.collapse.panel.padding.block-none (bottom)` | Removed | dimension | - |
| `components.collapse.panel.padding.block-s (top)` | Removed | dimension | - |
| `components.collapse.panel.padding.block-s (bottom)` | Removed | dimension | - |
| `components.collapse.panel.padding.block-m (top)` | Removed | dimension | - |
| `components.collapse.panel.padding.block-m (bottom)` | Removed | dimension | - |
| `components.checkbox.icon.margin.top` | Removed | dimension | - |
| `components.icon-button.outline.focus` | Removed | color | - |
| `components.icon-button.color.border` | Removed | color | - |
| `components.icon-button.primary.color.background` | Removed | color | - |
| `components.icon-button.primary.color.background-active` | Removed | color | - |
| `components.icon-button.danger.outline.focus` | Removed | color | - |
| `components.icon-button.plain.outline.focus` | Removed | color | - |
| `components.icon-button.secondary.outline.focus` | Removed | color | - |
| `components.icon-button.icon.size` | Removed | dimension | - |
| `components.input.affix.icon.size` | Removed | dimension | - |
| `components.radio.outline.focus` | Removed | color | - |
| `components.radio.outline.offset` | Removed | dimension | - |
| `components.segmented-control.button.icon-size` | Removed | dimension | - |
| `components.segmented-control.button.color.background-pressed` | Removed | color | - |
| `components.toggle.outline.color-active` | Removed | color | - |

### 🔄 Structural Renames (2)

_Tokens renamed from dash notation to dot notation (e.g., `color-background` → `color.background`)_

| Old Path | New Path |
|----------|----------|
| `components.icon-button.primary.outline.focus` | `components.icon-button.primary.outline-focus` |
| `components.segmented-control.button.padding-horizontal` | `components.segmented-control.button.padding.horizontal` |

### 🔄 Possible Renames (16)

| Removed Token | Possible Match | Similarity |
|---------------|----------------|------------|
| `components.badge.ai.color.background` | `components.toggle.color.background` | 81% |
| `components.button.primary.outline.focus` | `components.button.primary.outline.color-focus` | 87% |
| `components.button.secondary.outline.focus` | `components.button.secondary.outline.color-focus` | 87% |
| `components.button.danger.outline.focus` | `components.button.danger.outline.color-focus` | 86% |
| `components.button.plain.color.background` | `components.tooltip.color.background` | 80% |
| `components.button.plain.outline.focus` | `components.button.plain.outline.color-focus` | 86% |
| `components.button.icon.size` | `components.button.large.icon.size` | 82% |
| `components.checkbox.icon.margin.top` | `components.checkbox.icon.icon.margin.top` | 88% |
| `components.icon-button.color.border` | `components.icon-button.default.color.border` | 81% |
| `components.icon-button.primary.color.background` | `components.icon-button.default.color.background` | 85% |
| `components.icon-button.primary.color.background-active` | `components.icon-button.default.color.background-active` | 87% |
| `components.icon-button.danger.outline.focus` | `components.icon-button.danger.color.outline-focus` | 86% |
| `components.icon-button.plain.outline.focus` | `components.icon-button.plain.color.outline-focus` | 85% |
| `components.icon-button.secondary.outline.focus` | `components.icon-button.secondary.color.outline-focus` | 87% |
| `components.icon-button.icon.size` | `components.icon-button.medium.size` | 82% |
| `components.segmented-control.button.icon-size` | `components.segmented-control.button.color-focus` | 81% |

### 📐 Format Changes (6)

_Structure improvements where the semantic value is unchanged (e.g., `"10px"` → `{"value": 10, "unit": "px"}`)_

| Token Path | Old Format | New Format | Type |
|------------|------------|------------|------|
| `components.avatar.xlarge.size` | `"92px"` | `{"value":92,"unit":"px"}` | dimension |
| `components.icon.background.size.l.padding` | `"6px"` | `{"value":6,"unit":"px"}` | dimension |
| `components.radio.hint.margin` | `"28px"` | `{"value":28,"unit":"px"}` | dimension |
| `components.segmented-control.color.border` | `"#DAD3CA00"` | `"#dad3ca00"` | color |
| `components.segmented-control.button.border-width` | `"2px"` | `{"value":2,"unit":"px"}` | dimension |
| `components.toggle.outline.width` | `"2px"` | `{"value":2,"unit":"px"}` | dimension |

### ℹ️ New Tokens (86)

- `components.button.secondary.border-width` (dimension)
- `components.button.secondary.outline.color-focus` (color)
- `components.button.label.max-lines` (dimension)
- `components.button.scale-pressed` (dimension)
- `components.button.small.hit-slop` (dimension)
- `components.button.medium.icon.size` (dimension)
- `components.button.large.icon.size` (dimension)
- `components.button.primary.outline.color-focus` (color)
- `components.button.danger.outline.color-focus` (color)
- `components.button.plain.outline.color-focus` (color)
- `components.checkbox.icon.icon.margin.top` (dimension)
- `components.checkbox.icon.color.foreground` (color)
- `components.checkbox.icon.color.foreground-error` (color)
- `components.icon-button.default.border-width` (dimension)
- `components.icon-button.default.color.foreground` (color)
- `components.icon-button.default.color.border` (color)
- `components.icon-button.default.color.background` (color)
- `components.icon-button.default.color.background-active` (color)
- `components.icon-button.secondary.border-width` (dimension)
- `components.icon-button.secondary.color.outline-focus` (color)
- `components.icon-button.medium.border-radius` (dimension)
- `components.icon-button.medium.size` (dimension)
- `components.icon-button.medium.icon.size` (dimension)
- `components.icon-button.plain.color.outline-focus` (color)
- `components.icon-button.danger.color.outline-focus` (color)
- `components.icon-button.danger.color.foreground` (color)
- `components.segmented-control.button.color-focus` (color)
- `components.radio.icon.color` (color)
- `components.toggle.color.background` (color)
- `components.toggle.color.background-active` (color)
- `components.tile.gap` (dimension)
- `components.link.outline.color-focus` (color)
- `semantic.color.background.muted` (color)
- `line-height` (string)
- `size` (dimension)
- `height` (dimension)
- `border-width` (dimension)
- `y` (dimension)
- `spread` (dimension)
- `blur` (dimension)
- `stroke-width` (dimension)
- `width` (string)
- `padding-block-none` (dimension)
- `padding-block-none-bottom-` (dimension)
- `text-decoration` (string)
- `offset-focus` (dimension)
- `outline-offset` (dimension)
- `border-radius` (dimension)
- `font-weight` (fontWeight)
- `font-size` (dimension)
- `horizontal` (dimension)
- `padding` (dimension)
- `gap` (dimension)
- `checkbox.errormargin` (dimension)
- `padding-inline` (dimension)
- `padding-block-s` (dimension)
- `padding-block-m` (dimension)
- `padding-block-none-top-` (dimension)
- `padding-block-s-top-` (dimension)
- `padding-block-s-bottom-` (dimension)
- `padding-block-m-top-` (dimension)
- `padding-block-m-bottom-` (dimension)
- `icon-size` (dimension)
- `border-radius-focus` (dimension)
- `background` (color)
- `foreground` (color)
- `border` (color)
- `stroke-color` (color)
- `background-active` (color)
- `color-focus` (color)
- `foreground-active` (color)
- `color-border-focused` (color)
- `color-primary` (color)
- `color-secondary` (color)
- `outline-focus` (color)
- `color-background` (color)
- `color-foreground` (color)
- `color-background-active` (color)
- `background-readonly` (color)
- `border-focused` (color)
- `border-error` (color)
- `border-error-focused` (color)
- `foreground-readonly` (color)
- `background-pressed` (color)
- `border-checked` (color)
- `color-active` (color)

## WEB/LEGACY

### 🚨 Breaking Changes (4)

| Token Path | Reason | Old Type | New Type |
|------------|--------|----------|----------|
| `component.progress-bar.color.background` | Removed | color | - |
| `component.radio.outline.focus` | Removed | other | - |
| `component.table.tr.color.background.hover` | Removed | color | - |
| `component.table.tr.color.background.active` | Removed | color | - |

### 🔄 Possible Renames (1)

| Removed Token | Possible Match | Similarity |
|---------------|----------------|------------|
| `component.table.tr.color.background.active` | `components.toggle.color.background-active` | 81% |

## WEB/PATIENT

### 🚨 Breaking Changes (280)

| Token Path | Reason | Old Type | New Type |
|------------|--------|----------|----------|
| `semantic.font-weight.emphasis` | Type Changed | dimension | fontWeight |
| `semantic.font-weight.heading` | Type Changed | dimension | fontWeight |
| `semantic.z-index.notification` | Type Changed | number | dimension |
| `semantic.z-index.modal` | Type Changed | number | dimension |
| `semantic.z-index.popout` | Type Changed | number | dimension |
| `semantic.z-index.sticky` | Type Changed | number | dimension |
| `semantic.line-height.condensed` | Type Changed | number | dimension |
| `semantic.line-height.heading` | Type Changed | number | dimension |
| `semantic.line-height.body` | Type Changed | number | dimension |
| `semantic.gradient.ai.light` | Type Changed | color | gradient |
| `semantic.gradient.ai.dark` | Type Changed | color | gradient |
| `semantic.gradient.ai.soft-hints` | Type Changed | color | gradient |
| `semantic.gradient.ai.subtle-highlight` | Type Changed | color | gradient |
| `components.avatar.initials.large.line-height` | Type Changed | number | dimension |
| `components.avatar.initials.medium.line-height` | Type Changed | number | dimension |
| `components.avatar.initials.xsmall.line-height` | Type Changed | number | dimension |
| `components.badge.line-height` | Type Changed | number | dimension |
| `components.button.box-shadow` | Removed | boxShadow | - |
| `components.button.default.box-shadow` | Removed | boxShadow | - |
| `components.button.default.border` | Removed | boxShadow | - |
| `components.button.secondary.border` | Removed | boxShadow | - |
| `components.divider.width` | Type Changed | text | string |
| `components.checkbox.label.line-height` | Type Changed | text | dimension |
| `components.checkbox.error.line-height` | Type Changed | number | dimension |
| `components.checkbox.width` | Type Changed | text | string |
| `components.checkbox.error-hint._margin` | Removed | dimension | - |
| `components.icon.background.border-radius` | Removed | dimension | - |
| `components.input._height` | Removed | dimension | - |
| `components.input._padding` | Removed | dimension | - |
| `components.link.text-decoration` | Type Changed | text | string |
| `components.radio.label.line-height` | Type Changed | number | dimension |
| `components.radio.width` | Type Changed | text | string |
| `semantic.font-family.body` | Type Changed | text | fontFamily |
| `semantic.font-family._body` | Removed | text | - |
| `semantic.box-shadow.popout` | Type Changed | boxShadow | shadow |
| `semantic.box-shadow.dialog` | Type Changed | boxShadow | shadow |
| `semantic.box-shadow.emphasis` | Type Changed | boxShadow | shadow |
| `components.action-bar.z-index` | Type Changed | number | dimension |
| `components.action-bar.box-shadow` | Removed | boxShadow | - |
| `components.avatar.user.initials.color-background` | Removed | color | - |
| `components.avatar.user.initials.color-foreground` | Removed | color | - |
| `components.avatar.user.initials.color-border` | Removed | color | - |
| `components.avatar.user.initials.inverted.color-background` | Removed | color | - |
| `components.avatar.user.initials.inverted.color-foreground` | Removed | color | - |
| `components.avatar.empty.color-foreground` | Removed | color | - |
| `components.avatar.empty.color-background` | Removed | color | - |
| `components.avatar.entity.initials.color-background` | Removed | color | - |
| `components.avatar.entity.initials.color-foreground` | Removed | color | - |
| `components.badge.neutral.color-background` | Removed | color | - |
| `components.badge.neutral.color-foreground` | Removed | color | - |
| `components.badge.neutral.color-border` | Removed | color | - |
| `components.badge.accent.color-background` | Removed | color | - |
| `components.badge.accent.color-foreground` | Removed | color | - |
| `components.badge.accent.color-border` | Removed | color | - |
| `components.badge.info.color-background` | Removed | color | - |
| `components.badge.info.color-foreground` | Removed | color | - |
| `components.badge.info.color-border` | Removed | color | - |
| `components.badge.success.color-background` | Removed | color | - |
| `components.badge.success.color-foreground` | Removed | color | - |
| `components.badge.success.color-border` | Removed | color | - |
| `components.badge.danger.color-background` | Removed | color | - |
| `components.badge.danger.color-foreground` | Removed | color | - |
| `components.badge.danger.color-border` | Removed | color | - |
| `components.badge.warning.color-background` | Removed | color | - |
| `components.badge.warning.color-foreground` | Removed | color | - |
| `components.badge.warning.color-border` | Removed | color | - |
| `components.badge.accent-inverted.color-background` | Removed | color | - |
| `components.badge.accent-inverted.color-foreground` | Removed | color | - |
| `components.badge.neutral-inverted.color-background` | Removed | color | - |
| `components.badge.neutral-inverted.color-foreground` | Removed | color | - |
| `components.badge.info-inverted.color-background` | Removed | color | - |
| `components.badge.info-inverted.color-foreground` | Removed | color | - |
| `components.badge.success-inverted.color-background` | Removed | color | - |
| `components.badge.success-inverted.color-foreground` | Removed | color | - |
| `components.badge.danger-inverted.color-background` | Removed | color | - |
| `components.badge.danger-inverted.color-foreground` | Removed | color | - |
| `components.badge.warning-inverted.color-background` | Removed | color | - |
| `components.badge.warning-inverted.color-foreground` | Removed | color | - |
| `components.badge.ai.color-foreground` | Removed | color | - |
| `components.badge.ai.color-background` | Removed | color | - |
| `components.badge.ai.color-border` | Removed | color | - |
| `components.badge.ai-inverted.color-foreground` | Removed | color | - |
| `components.badge.ai-inverted.color-background` | Removed | color | - |
| `components.badge.ai-inverted.color-border` | Removed | color | - |
| `components.banner.heading.font-size` | Removed | dimension | - |
| `components.banner.box-shadow` | Removed | boxShadow | - |
| `components.banner.error.border` | Removed | boxShadow | - |
| `components.banner.error.box-shadow` | Removed | boxShadow | - |
| `components.banner.info.border` | Removed | boxShadow | - |
| `components.banner.info.box-shadow` | Removed | boxShadow | - |
| `components.banner.warning.border` | Removed | boxShadow | - |
| `components.banner.warning.box-shadow` | Removed | boxShadow | - |
| `components.banner.success.border` | Removed | boxShadow | - |
| `components.banner.success.box-shadow` | Removed | boxShadow | - |
| `components.banner.button._variant` | Removed | text | - |
| `components.button.primary.color-background` | Removed | color | - |
| `components.button.primary.color-background-active` | Removed | color | - |
| `components.button.primary.color-foreground` | Removed | color | - |
| `components.button.secondary.color-background` | Removed | color | - |
| `components.button.secondary.color-background-active` | Removed | color | - |

*... and 180 more breaking changes*

### 🔄 Structural Renames (172)

_Tokens renamed from dash notation to dot notation (e.g., `color-background` → `color.background`)_

| Old Path | New Path |
|----------|----------|
| `components.action-bar.color-background` | `components.action-bar.color.background` |
| `components.action-bar.color-background-hover` | `components.action-bar.color.background-hover` |
| `components.action-bar.color-background-active` | `components.action-bar.color.background-active` |
| `components.action-bar.color-foreground` | `components.action-bar.color.foreground` |
| `components.action-bar.padding-block` | `components.action-bar.padding.block` |
| `components.action-bar.padding-inline` | `components.action-bar.padding.inline` |
| `components.action-bar.title-padding-inline` | `components.action-bar.title.padding.inline` |
| `components.banner.error.color-border` | `components.banner.error.color.border` |
| `components.banner.error.color-foreground` | `components.banner.error.color.foreground` |
| `components.banner.error.color-background` | `components.banner.error.color.background` |
| `components.banner.info.color-foreground` | `components.banner.info.color.foreground` |
| `components.banner.info.color-border` | `components.banner.info.color.border` |
| `components.banner.info.color-background` | `components.banner.info.color.background` |
| `components.banner.warning.color-border` | `components.banner.warning.color.border` |
| `components.banner.warning.color-foreground` | `components.banner.warning.color.foreground` |
| `components.banner.warning.color-background` | `components.banner.warning.color.background` |
| `components.banner.success.color-border` | `components.banner.success.color.border` |
| `components.banner.success.color-foreground` | `components.banner.success.color.foreground` |
| `components.banner.success.color-background` | `components.banner.success.color.background` |
| `components.banner.button.info.color-background` | `components.banner.button.info.color.background` |
| `components.banner.button.info.color-background-hover` | `components.banner.button.info.color.background-hover` |
| `components.banner.button.info.color-background-active` | `components.banner.button.info.color.background-active` |
| `components.banner.button.error.color-background` | `components.banner.button.error.color.background` |
| `components.banner.button.error.color-background-hover` | `components.banner.button.error.color.background-hover` |
| `components.banner.button.error.color-background-active` | `components.banner.button.error.color.background-active` |
| `components.banner.button.warning.color-background` | `components.banner.button.warning.color.background` |
| `components.banner.button.warning.color-background-hover` | `components.banner.button.warning.color.background-hover` |
| `components.banner.button.warning.color-background-active` | `components.banner.button.warning.color.background-active` |
| `components.banner.button.success.color-background` | `components.banner.button.success.color.background` |
| `components.banner.button.success.color-background-hover` | `components.banner.button.success.color.background-hover` |
| `components.banner.button.success.color-background-active` | `components.banner.button.success.color.background-active` |
| `components.banner.content-padding` | `components.banner.content.padding` |
| `components.banner.close-button-margin` | `components.banner.close-button.margin` |
| `components.banner.close-button-margin-mobile` | `components.banner.close-button.margin-mobile` |
| `components.banner.content-padding-mobile` | `components.banner.content.padding-mobile` |
| `components.banner.close-button.info.color-background` | `components.banner.close-button.info.color.background` |
| `components.banner.close-button.info.color-background-hover` | `components.banner.close-button.info.color.background-hover` |
| `components.banner.close-button.info.color-background-active` | `components.banner.close-button.info.color.background-active` |
| `components.banner.close-button.error.color-background` | `components.banner.close-button.error.color.background` |
| `components.banner.close-button.error.color-background-hover` | `components.banner.close-button.error.color.background-hover` |
| `components.banner.close-button.error.color-background-active` | `components.banner.close-button.error.color.background-active` |
| `components.banner.close-button.warning.color-background` | `components.banner.close-button.warning.color.background` |
| `components.banner.close-button.warning.color-background-hover` | `components.banner.close-button.warning.color.background-hover` |
| `components.banner.close-button.warning.color-background-active` | `components.banner.close-button.warning.color.background-active` |
| `components.banner.close-button.success.color-background` | `components.banner.close-button.success.color.background` |
| `components.banner.close-button.success.color-background-hover` | `components.banner.close-button.success.color.background-hover` |
| `components.banner.close-button.success.color-background-active` | `components.banner.close-button.success.color.background-active` |
| `components.button.primary.color-background-hover` | `components.button.primary.color.background-hover` |
| `components.button.secondary.color-background-hover` | `components.button.secondary.color.background-hover` |
| `components.button.danger.color-background-hover` | `components.button.danger.color.background-hover` |

*... and 122 more structural renames*

### 🔄 Possible Renames (18)

| Removed Token | Possible Match | Similarity |
|---------------|----------------|------------|
| `components.button.secondary.border` | `components.button.secondary.border-width` | 85% |
| `components.banner.heading.font-size` | `components.banner.header.font-size` | 91% |
| `components.button.danger.color-foreground` | `components.icon-button.danger.color.foreground` | 87% |
| `components.dropdown.group.divider._height` | `components.dropdown.group.divider.height` | 98% |
| `components.checkbox.label.color-foreground` | `components.checkbox.icon.color.foreground` | 86% |
| `components.checkbox.error.color-foreground` | `components.checkbox.icon.color.foreground` | 88% |
| `components.checkbox.hint.color-foreground` | `components.checkbox.icon.color.foreground` | 88% |
| `components.checkbox.disabled.color-foreground` | `components.checkbox.icon.color.foreground` | 82% |
| `components.icon-button.color-background-active` | `components.icon-button.default.color.background-active` | 83% |
| `components.icon-button.color-background` | `components.icon-button.default.color.background` | 81% |
| `components.input.color-background` | `components.tooltip.color.background` | 80% |
| `components.input.color-foreground` | `components.tooltip.color.foreground` | 80% |
| `components.radio.color-background` | `components.tooltip.color.background` | 80% |
| `components.toast.button.border-radius 2` | `components.toast.button.border-radius-2` | 97% |
| `components.segmented-control.button.color` | `components.segmented-control.button.color-focus` | 87% |
| `components.segmented-control.button._icon-size` | `components.segmented-control.button.color-focus` | 81% |
| `components.label.gap` | `components.tile.gap` | 80% |
| `components.label.font-size-mobile` | `components.tabs.item.font-size-mobile` | 84% |

### ⚠️ Value Changes (76)

_Semantic value changes where the actual value is different_

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `semantic.color.tag.background.gray` | `"{core.color.tag.gray.300}"` | `"#c6c6c6"` | color |
| `semantic.color.tag.background.gray-inverted` | `"{core.color.tag.gray.600}"` | `"#6f6f6f"` | color |
| `semantic.color.tag.background.gray-decorative` | `"{core.color.tag.gray.500}"` | `"#898989"` | color |
| `semantic.color.tag.background.slategray` | `"{core.color.tag.slategray.300}"` | `"#c6c6cd"` | color |
| `semantic.color.tag.background.slategray-inverted` | `"{core.color.tag.slategray.600}"` | `"#6e6e7f"` | color |
| `semantic.color.tag.background.slategray-decorative` | `"{core.color.tag.slategray.500}"` | `"#878895"` | color |
| `semantic.color.tag.background.pink` | `"{core.color.tag.pink.300}"` | `"#e5bbca"` | color |
| `semantic.color.tag.background.pink-inverted` | `"{core.color.tag.pink.600}"` | `"#b84772"` | color |
| `semantic.color.tag.background.pink-decorative` | `"{core.color.tag.pink.500}"` | `"#c76c8f"` | color |
| `semantic.color.tag.background.red` | `"{core.color.tag.red.300}"` | `"#feb3b3"` | color |
| `semantic.color.tag.background.red-inverted` | `"{core.color.tag.red.600}"` | `"#c83e3e"` | color |
| `semantic.color.tag.background.red-decorative` | `"{core.color.tag.red.500}"` | `"#f54b4b"` | color |
| `semantic.color.tag.background.orange` | `"{core.color.tag.orange.300}"` | `"#e6bfa5"` | color |
| `semantic.color.tag.background.orange-inverted` | `"{core.color.tag.orange.600}"` | `"#ba4e06"` | color |
| `semantic.color.tag.background.orange-decorative` | `"{core.color.tag.orange.500}"` | `"#c9733a"` | color |
| `semantic.color.tag.background.yellow` | `"{core.color.tag.yellow.300}"` | `"#fdb95b"` | color |
| `semantic.color.tag.background.yellow-inverted` | `"{core.color.tag.yellow.600}"` | `"#90672f"` | color |
| `semantic.color.tag.background.yellow-decorative` | `"{core.color.tag.yellow.500}"` | `"#b17f3a"` | color |
| `semantic.color.tag.background.olive` | `"{core.color.tag.olive.300}"` | `"#c6cb90"` | color |
| `semantic.color.tag.background.olive-inverted` | `"{core.color.tag.olive.600}"` | `"#6c7515"` | color |
| `semantic.color.tag.background.olive-decorative` | `"{core.color.tag.olive.500}"` | `"#859019"` | color |
| `semantic.color.tag.background.teal` | `"{core.color.tag.teal.300}"` | `"#2edebe"` | color |
| `semantic.color.tag.background.teal-inverted` | `"{core.color.tag.teal.600}"` | `"#167d6b"` | color |
| `semantic.color.tag.background.teal-decorative` | `"{core.color.tag.teal.500}"` | `"#1b9a83"` | color |
| `semantic.color.tag.background.tealblue` | `"{core.color.tag.tealblue.300}"` | `"#8fd1dd"` | color |
| `semantic.color.tag.background.tealblue-inverted` | `"{core.color.tag.tealblue.600}"` | `"#157a8d"` | color |
| `semantic.color.tag.background.tealblue-decorative` | `"{core.color.tag.tealblue.500}"` | `"#1a95ad"` | color |
| `semantic.color.tag.background.skyblue` | `"{core.color.tag.skyblue.300}"` | `"#83cffb"` | color |
| `semantic.color.tag.background.skyblue-inverted` | `"{core.color.tag.skyblue.600}"` | `"#1e75a7"` | color |
| `semantic.color.tag.background.skyblue-decorative` | `"{core.color.tag.skyblue.500}"` | `"#2591ce"` | color |
| `semantic.color.tag.background.blue` | `"{core.color.tag.blue.300}"` | `"#bac4f7"` | color |
| `semantic.color.tag.background.blue-inverted` | `"{core.color.tag.blue.600}"` | `"#5668c5"` | color |
| `semantic.color.tag.background.blue-decorative` | `"{core.color.tag.blue.500}"` | `"#6b81ee"` | color |
| `semantic.color.tag.background.lavender` | `"{core.color.tag.lavender.300}"` | `"#d3bbfc"` | color |
| `semantic.color.tag.background.lavender-inverted` | `"{core.color.tag.lavender.600}"` | `"#7c62a8"` | color |
| `semantic.color.tag.background.lavender-decorative` | `"{core.color.tag.lavender.500}"` | `"#9979cf"` | color |
| `semantic.color.tag.background.purple` | `"{core.color.tag.purple.300}"` | `"#debce0"` | color |
| `semantic.color.tag.background.purple-inverted` | `"{core.color.tag.purple.600}"` | `"#a54bab"` | color |
| `semantic.color.tag.background.purple-decorative` | `"{core.color.tag.purple.500}"` | `"#b76ebc"` | color |
| `semantic.color.tag.foreground.gray` | `"{core.color.tag.gray.900}"` | `"#424242"` | color |
| `semantic.color.tag.foreground.gray-inverted` | `"{core.color.tag.gray.100}"` | `"#f7f7f7"` | color |
| `semantic.color.tag.foreground.slategray` | `"{core.color.tag.slategray.900}"` | `"#404154"` | color |
| `semantic.color.tag.foreground.slategray-inverted` | `"{core.color.tag.slategray.100}"` | `"#f8f8f8"` | color |
| `semantic.color.tag.foreground.pink` | `"{core.color.tag.pink.900}"` | `"#6f2a44"` | color |
| `semantic.color.tag.foreground.pink-inverted` | `"{core.color.tag.pink.100}"` | `"#fbf6f8"` | color |
| `semantic.color.tag.foreground.red` | `"{core.color.tag.red.900}"` | `"#782525"` | color |
| `semantic.color.tag.foreground.red-inverted` | `"{core.color.tag.red.100}"` | `"#fff6f6"` | color |
| `semantic.color.tag.foreground.orange` | `"{core.color.tag.orange.900}"` | `"#722e01"` | color |
| `semantic.color.tag.foreground.orange-inverted` | `"{core.color.tag.orange.100}"` | `"#fbf6f2"` | color |
| `semantic.color.tag.foreground.yellow` | `"{core.color.tag.yellow.900}"` | `"#563e1c"` | color |
| `semantic.color.tag.foreground.yellow-inverted` | `"{core.color.tag.yellow.100}"` | `"#fff6ea"` | color |
| `semantic.color.tag.foreground.olive` | `"{core.color.tag.olive.900}"` | `"#40460d"` | color |
| `semantic.color.tag.foreground.olive-inverted` | `"{core.color.tag.olive.100}"` | `"#f8f9f1"` | color |
| `semantic.color.tag.foreground.teal` | `"{core.color.tag.teal.900}"` | `"#0d4b40"` | color |
| `semantic.color.tag.foreground.teal-inverted` | `"{core.color.tag.teal.100}"` | `"#e8fbf8"` | color |
| `semantic.color.tag.foreground.tealblue` | `"{core.color.tag.tealblue.900}"` | `"#0d4954"` | color |
| `semantic.color.tag.foreground.tealblue-inverted` | `"{core.color.tag.tealblue.100}"` | `"#f1f9fb"` | color |
| `semantic.color.tag.foreground.skyblue` | `"{core.color.tag.skyblue.900}"` | `"#124664"` | color |
| `semantic.color.tag.foreground.skyblue-inverted` | `"{core.color.tag.skyblue.100}"` | `"#f0f9fe"` | color |
| `semantic.color.tag.foreground.blue` | `"{core.color.tag.blue.900}"` | `"#343f76"` | color |
| `semantic.color.tag.foreground.blue-inverted` | `"{core.color.tag.blue.100}"` | `"#f6f8fe"` | color |
| `semantic.color.tag.foreground.lavender` | `"{core.color.tag.lavender.900}"` | `"#4a3b64"` | color |
| `semantic.color.tag.foreground.lavender-inverted` | `"{core.color.tag.lavender.100}"` | `"#faf7ff"` | color |
| `semantic.color.tag.foreground.purple` | `"{core.color.tag.purple.900}"` | `"#652b68"` | color |
| `semantic.color.tag.foreground.purple-inverted` | `"{core.color.tag.purple.100}"` | `"#faf6fb"` | color |
| `semantic.border-radius.circle` | `"{core.border-radius.half}"` | `{"value":999,"unit":"px"}` | dimension |
| `semantic.breakpoint.viewport.xs` | `"{core.breakpoint.viewport.1}"` | `{"value":320,"unit":"px"}` | dimension |
| `components.dropdown.group.heading.padding-inline-start` | `"32px"` | `{"value":42,"unit":"px"}` | dimension |
| `components.dropdown.group.heading.padding-inline-start-mobile` | `"32px"` | `{"value":48,"unit":"px"}` | dimension |
| `components.dropdown.item.selectable.padding-inline-start` | `"32px"` | `{"value":40,"unit":"px"}` | dimension |
| `components.dropdown.item.selectable.padding-inline-start-mobile` | `"32px"` | `{"value":48,"unit":"px"}` | dimension |
| `components.skeleton.color-background` | `"{semantic.color.background.neutral}"` | `"{semantic.color.background.placeholder}"` | color |
| `components.tooltip.popout.border-radius` | `"{semantic.border-radius.l}"` | `"{semantic.border-radius.pill}"` | dimension |
| `components.filter.select.size` | `"{semantic.size.m}"` | `"{semantic.size.s}"` | dimension |
| `components.filter.popout.content.padding` | `"{semantic.space.xs}"` | `"{semantic.space.s}"` | dimension |
| `components.filter.popout.header.min-height` | `"{semantic.size.m}"` | `"{semantic.space.m}"` | dimension |

### 📐 Format Changes (80)

_Structure improvements where the semantic value is unchanged (e.g., `"10px"` → `{"value": 10, "unit": "px"}`)_

| Token Path | Old Format | New Format | Type |
|------------|------------|------------|------|
| `components.avatar.initials.xsmall.font-size` | `"10px"` | `{"value":10,"unit":"px"}` | dimension |
| `components.avatar.medium.size` | `"32px"` | `{"value":32,"unit":"px"}` | dimension |
| `components.avatar.large.size` | `"64px"` | `{"value":64,"unit":"px"}` | dimension |
| `components.avatar.xsmall.size` | `"16px"` | `{"value":16,"unit":"px"}` | dimension |
| `components.badge.height` | `"22px"` | `{"value":22,"unit":"px"}` | dimension |
| `components.button.counter.height` | `"22px"` | `{"value":22,"unit":"px"}` | dimension |
| `components.divider.height` | `"1px"` | `{"value":1,"unit":"px"}` | dimension |
| `components.checkbox.icon.stroke-width` | `"1px"` | `{"value":1,"unit":"px"}` | dimension |
| `components.checkbox.size` | `"20px"` | `{"value":20,"unit":"px"}` | dimension |
| `components.checkbox.border-radius` | `"6px"` | `{"value":6,"unit":"px"}` | dimension |
| `components.checkbox.border-width` | `"2px"` | `{"value":2,"unit":"px"}` | dimension |
| `components.icon.size.s` | `"12px"` | `{"value":12,"unit":"px"}` | dimension |
| `components.icon.size.m` | `"16px"` | `{"value":16,"unit":"px"}` | dimension |
| `components.icon.size.l` | `"20px"` | `{"value":20,"unit":"px"}` | dimension |
| `components.icon.size.xl` | `"24px"` | `{"value":24,"unit":"px"}` | dimension |
| `components.link.outline.offset-focus` | `"1px"` | `{"value":1,"unit":"px"}` | dimension |
| `components.radio.size` | `"20px"` | `{"value":20,"unit":"px"}` | dimension |
| `components.radio.border-width` | `"2px"` | `{"value":2,"unit":"px"}` | dimension |
| `components.segmented-control.border-width` | `"1px"` | `{"value":1,"unit":"px"}` | dimension |
| `components.segmented-control.padding` | `"4px"` | `{"value":4,"unit":"px"}` | dimension |
| `components.segmented-control.gap` | `"2px"` | `{"value":2,"unit":"px"}` | dimension |
| `components.segmented-control.button.size` | `"38px"` | `{"value":38,"unit":"px"}` | dimension |
| `components.toggle.knob.size` | `"20px"` | `{"value":20,"unit":"px"}` | dimension |
| `components.toggle.height` | `"24px"` | `{"value":24,"unit":"px"}` | dimension |
| `components.action-bar.min-width` | `"288px"` | `{"value":288,"unit":"px"}` | dimension |
| `components.banner.compact.min-height-actions` | `"29px"` | `{"value":29,"unit":"px"}` | dimension |
| `components.banner.compact.content-text-padding` | `"10px"` | `{"value":10,"unit":"px"}` | dimension |
| `components.combobox.trigger.multiselect-options.button.size` | `"21px"` | `{"value":21,"unit":"px"}` | dimension |
| `components.combobox.trigger.prefix.size` | `"20px"` | `{"value":20,"unit":"px"}` | dimension |
| `components.combobox.group.divider.divider-height` | `"3px"` | `{"value":3,"unit":"px"}` | dimension |
| `components.combobox.item.indicator.offset` | `"44px"` | `{"value":44,"unit":"px"}` | dimension |
| `components.combobox.item.divider.margin-vertical` | `"4px"` | `{"value":4,"unit":"px"}` | dimension |
| `components.combobox.popout-content.height` | `"400px"` | `{"value":400,"unit":"px"}` | dimension |
| `components.collapse.header.padding-block-none` | `"0px"` | `{"value":0,"unit":"px"}` | dimension |
| `components.collapse.panel.padding-block-end-none` | `"0px"` | `{"value":0,"unit":"px"}` | dimension |
| `components.dropdown.popout.padding-vertical-mobile` | `"0px"` | `{"value":0,"unit":"px"}` | dimension |
| `components.empty-state.width` | `"400px"` | `{"value":400,"unit":"px"}` | dimension |
| `components.empty-state.illustration.width` | `"200px"` | `{"value":200,"unit":"px"}` | dimension |
| `components.empty-state.illustration.height` | `"180px"` | `{"value":180,"unit":"px"}` | dimension |
| `components.checkbox.icon.margin-top` | `"2.5px"` | `{"value":2.5,"unit":"px"}` | dimension |
| `components.checkbox.size-mobile` | `"20px"` | `{"value":20,"unit":"px"}` | dimension |
| `components.modal.medium.width` | `"460px"` | `{"value":460,"unit":"px"}` | dimension |
| `components.modal.large.width` | `"720px"` | `{"value":720,"unit":"px"}` | dimension |
| `components.modal.xlarge.width` | `"980px"` | `{"value":980,"unit":"px"}` | dimension |
| `components.nav-list.indicator.height` | `"32px"` | `{"value":32,"unit":"px"}` | dimension |
| `components.nav-list.indicator.height-mobile` | `"32px"` | `{"value":32,"unit":"px"}` | dimension |
| `components.nav-list.sub-item.padding-left` | `"44px"` | `{"value":44,"unit":"px"}` | dimension |
| `components.nav-list.sub-item.padding-left-mobile` | `"44px"` | `{"value":44,"unit":"px"}` | dimension |
| `components.nav-list.counter.height` | `"20px"` | `{"value":20,"unit":"px"}` | dimension |
| `components.radio.size-mobile` | `"20px"` | `{"value":20,"unit":"px"}` | dimension |

*... and 30 more format changes*

### ℹ️ New Tokens (26)

- `components.button.secondary.box-shadow` (shadow)
- `components.icon.border-radius` (dimension)
- `components.banner.header.font-size` (dimension)
- `components.banner.header.font-size-mobile` (dimension)
- `components.checkbox.icon.margin-top-mobile` (dimension)
- `components.datepicker.popout.margin-mobile` (dimension)
- `components.dropdown.group.divider.height` (dimension)
- `components.filter.trigger.font-size-mobile` (dimension)
- `components.filter.trigger.font-weight` (fontWeight)
- `components.icon.background.size-l-padding` (dimension)
- `components.icon.background.size-m-padding` (dimension)
- `components.icon.background.size-s-padding` (dimension)
- `components.icon.background.size-xl-padding` (dimension)
- `components.icon.color-foreground.accent` (color)
- `components.segmented-control.button.selected.background-color` (color)
- `components.tabs.item.font-size-mobile` (dimension)
- `components.toast.button.border-radius-2` (dimension)
- `components.input.suffix.border-radius` (dimension)
- `components.input.suffix.border-radius-mobile` (dimension)
- `components.tooltip.border-radius` (dimension)
- `components.tooltip.padding-block` (dimension)
- `components.tooltip.z-index` (dimension)
- `components.tooltip.font-size` (dimension)
- `components.tooltip.padding-inline` (dimension)
- `components.tooltip.color.background` (color)
- `components.tooltip.color.foreground` (color)

---

**Result**: 🚨 VALIDATION FAILED - Breaking changes detected
