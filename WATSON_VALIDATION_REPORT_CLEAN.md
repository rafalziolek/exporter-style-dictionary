# Token Validation Report

_This report shows only breaking changes (removed tokens, type changes), semantic value changes, and new tokens. Structural renames (dash-to-dot notation), format improvements, and intentional DTCG type corrections are automatically filtered out._

## Summary

- 🚨 **Removed Tokens**: 78
- 🔄 **Type Changes**: 10
- ⚠️ **Value Changes**: 31 (semantic differences only)
- ℹ️ **New Tokens**: 92
- ✓ **Unchanged**: 1012

## Comparison Details

**Source**: `/Users/rafal.ziolek/GitHub/exporter-style-dictionary/.build` (6 files, 1516 tokens)

**Target**: `/Users/rafal.ziolek/GitHub/watson-web/packages/tokens/src` (6 files, 1651 tokens)

## By Platform

| Platform | Removed | Type Changes | Value Changes | New | Unchanged | Total |
|----------|---------|--------------|---------------|-----|-----------|-------|
| **core** | 7 | 0 | 14 | 0 | 199 | 234 |
| **mobile/patient** | 15 | 0 | 1 | 47 | 146 | 210 |
| **web/legacy** | 4 | 0 | 0 | 0 | 9 | 13 |
| **web/patient** | 52 | 10 | 16 | 45 | 658 | 826 |

## CORE

### 🚨 Removed Tokens (7)

#### box-shadow (3)

- `core.box-shadow.s` (boxShadow)
- `core.box-shadow.m` (boxShadow)
- `core.box-shadow.l` (boxShadow)

#### color (4)

- `core.color.red.300-60 2` (color)
- `core.color.red.300-40 2` (color)
- `core.color.red.300-60 3` (color)
- `core.color.red.300-40 3` (color)

### ⚠️ Value Changes (14)

#### border-radius (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `core.border-radius.half` | `"50%"` | `{"value":999,"unit":"px"}` | dimension |

#### color (13)

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

## MOBILE/PATIENT

### 🚨 Removed Tokens (15)

#### badge (4)

- `components.badge.ai.color.background` (color)
- `components.badge.ai.color.border` (color)
- `components.badge.ai-inverted.color.background` (color)
- `components.badge.ai-inverted.color.border` (color)

#### collapse (6)

- `components.collapse.panel.padding.block-none (top)` (dimension)
- `components.collapse.panel.padding.block-none (bottom)` (dimension)
- `components.collapse.panel.padding.block-s (top)` (dimension)
- `components.collapse.panel.padding.block-s (bottom)` (dimension)
- `components.collapse.panel.padding.block-m (top)` (dimension)
- `components.collapse.panel.padding.block-m (bottom)` (dimension)

#### icon-button (4)

- `components.icon-button.color.border` (color)
- `components.icon-button.danger.outline.focus` (color)
- `components.icon-button.plain.outline.focus` (color)
- `components.icon-button.secondary.outline.focus` (color)

#### segmented-control (1)

- `components.segmented-control.button.icon-size` (dimension)

### ⚠️ Value Changes (1)

#### button (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.button.plain.color.background` | `"#00000000"` | `"#ffffff00"` | color |

### ℹ️ New Tokens (47)

#### button (11)

- `components.button.secondary.border-width` (dimension)
- `components.button.secondary.outline.color-focus` (color)
- `components.button.default.border-width` (dimension)
- `components.button.label.max-lines` (dimension)
- `components.button.scale-pressed` (dimension)
- `components.button.small.hit-slop` (dimension)
- `components.button.medium.icon.size` (dimension)
- `components.button.large.icon.size` (dimension)
- `components.button.plain.outline.color-focus` (color)
- `components.button.primary.outline.color-focus` (color)
- `components.button.danger.outline.color-focus` (color)

#### checkbox (4)

- `components.checkbox.icon.icon.margin.top` (dimension)
- `components.checkbox.icon.color.foreground` (color)
- `components.checkbox.icon.color.foreground-error` (color)
- `components.checkbox.errormargin` (dimension)

#### collapse (6)

- `components.collapse.panel.padding-block-none-bottom-` (dimension)
- `components.collapse.panel.padding-block-none-top-` (dimension)
- `components.collapse.panel.padding-block-s-top-` (dimension)
- `components.collapse.panel.padding-block-s-bottom-` (dimension)
- `components.collapse.panel.padding-block-m-top-` (dimension)
- `components.collapse.panel.padding-block-m-bottom-` (dimension)

#### color (1)

- `semantic.color.background.muted` (color)

#### color-focus (1)

- `color-focus` (color)

#### divider (2)

- `components.divider.primary.color` (color)
- `components.divider.secondary.color` (color)

#### icon (1)

- `components.icon.border-radius` (dimension)

#### icon-button (14)

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
- `components.icon-button.primary.color.foreground` (color)

#### link (1)

- `components.link.outline.color-focus` (color)

#### outline-focus (1)

- `outline-focus` (color)

#### radio (1)

- `components.radio.icon.color` (color)

#### segmented-control (1)

- `components.segmented-control.button.color-focus` (color)

#### tile (1)

- `components.tile.gap` (dimension)

#### toggle (2)

- `components.toggle.color.background` (color)
- `components.toggle.color.background-active` (color)

## WEB/LEGACY

### 🚨 Removed Tokens (4)

#### component (4)

- `component.progress-bar.color.background` (color)
- `component.radio.outline.focus` (other)
- `component.table.tr.color.background.hover` (color)
- `component.table.tr.color.background.active` (color)

## WEB/PATIENT

### 🚨 Removed Tokens (52)

#### action-bar (1)

- `components.action-bar.box-shadow` (boxShadow)

#### avatar (1)

- `components.avatar.user.border-radius` (dimension)

#### badge (4)

- `components.badge.ai.color-background` (color)
- `components.badge.ai.color-border` (color)
- `components.badge.ai-inverted.color-background` (color)
- `components.badge.ai-inverted.color-border` (color)

#### banner (9)

- `components.banner.box-shadow` (boxShadow)
- `components.banner.error.border` (boxShadow)
- `components.banner.error.box-shadow` (boxShadow)
- `components.banner.info.border` (boxShadow)
- `components.banner.info.box-shadow` (boxShadow)
- `components.banner.warning.border` (boxShadow)
- `components.banner.warning.box-shadow` (boxShadow)
- `components.banner.success.border` (boxShadow)
- `components.banner.success.box-shadow` (boxShadow)

#### button (4)

- `components.button.box-shadow` (boxShadow)
- `components.button.default.box-shadow` (boxShadow)
- `components.button.default.border` (boxShadow)
- `components.button.secondary.border` (boxShadow)

#### combobox (2)

- `components.combobox.popout-content.box-shadow` (boxShadow)
- `components.combobox.popout-content.box-shadow-mobile` (boxShadow)

#### datepicker (1)

- `components.datepicker.popout.box-shadow` (boxShadow)

#### dropdown (2)

- `components.dropdown.popout.box-shadow` (boxShadow)
- `components.dropdown.popout.box-shadow-mobile` (boxShadow)

#### filter (4)

- `components.filter.trigger.gap` (dimension)
- `components.filter.trigger.box-shadow` (boxShadow)
- `components.filter.popout.box-shadow` (boxShadow)
- `components.filter.popout.box-shadow-mobile` (boxShadow)

#### modal (1)

- `components.modal.box-shadow` (boxShadow)

#### popover (2)

- `components.popover.popout.box-shadow` (boxShadow)
- `components.popover.popout.box-shadow-mobile` (boxShadow)

#### segmented-control (1)

- `components.segmented-control.button.color` (color)

#### skeleton (3)

- `components.skeleton.ai.gradient-background` (color)
- `components.skeleton.ai.gradient-shimmer` (color)
- `components.skeleton.gradient-shimmer` (color)

#### tile (15)

- `components.tile.clickable.color.label` (color)
- `components.tile.clickable.color.caption` (color)
- `components.tile.input.background` (color)
- `components.tile.input.background-checked` (color)
- `components.tile.input.border-color` (color)
- `components.tile.input.checkbox.border-radius` (dimension)
- `components.tile.input.checkbox.icon-stroke-color` (color)
- `components.tile.input.checkbox.icon-stroke-width` (dimension)
- `components.tile.input.checkbox.size` (dimension)
- `components.tile.input.radio.border-radius` (dimension)
- `components.tile.input.radio.icon-size` (dimension)
- `components.tile.input.radio.size` (dimension)
- `components.tile.min-width.default` (dimension)
- `components.tile.min-width.icon-only` (dimension)
- `components.tile.min-width.text-only` (dimension)

#### toast (1)

- `components.toast.button.border-radius 2` (dimension)

#### toggle (1)

- `components.toggle.box-shadow` (boxShadow)

### 🔄 Type Changes (10)

#### box-shadow (3)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `semantic.box-shadow.popout` | boxShadow | shadow |
| `semantic.box-shadow.dialog` | boxShadow | shadow |
| `semantic.box-shadow.emphasis` | boxShadow | shadow |

#### button (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.button.font-weight` | number | fontWeight |

#### checkbox (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.checkbox.label.line-height` | text | number |

#### gradient (4)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `semantic.gradient.ai.light` | color | gradient |
| `semantic.gradient.ai.dark` | color | gradient |
| `semantic.gradient.ai.soft-hints` | color | gradient |
| `semantic.gradient.ai.subtle-highlight` | color | gradient |

#### label (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.label.font-family` | fontFamily | string |

### ⚠️ Value Changes (16)

#### avatar (2)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.avatar.initials.large.font-size` | `"{semantic.font-size.section-heading}"` | `{"value":24,"unit":"px"}` | dimension |
| `components.avatar.xlarge.size` | `"92px"` | `{"value":96,"unit":"px"}` | dimension |

#### border-radius (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `semantic.border-radius.circle` | `"{core.border-radius.half}"` | `{"value":999,"unit":"px"}` | dimension |

#### breakpoint (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `semantic.breakpoint.viewport.xs` | `"{core.breakpoint.viewport.1}"` | `{"value":320,"unit":"px"}` | dimension |

#### dropdown (4)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.dropdown.group.heading.padding-inline-start` | `"32px"` | `{"value":42,"unit":"px"}` | dimension |
| `components.dropdown.group.heading.padding-inline-start-mobile` | `"32px"` | `{"value":48,"unit":"px"}` | dimension |
| `components.dropdown.item.selectable.padding-inline-start` | `"32px"` | `{"value":40,"unit":"px"}` | dimension |
| `components.dropdown.item.selectable.padding-inline-start-mobile` | `"32px"` | `{"value":48,"unit":"px"}` | dimension |

#### feedback (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.feedback.gap` | `"{semantic.space.xs}"` | `"{semantic.space.xxs}"` | dimension |

#### filter (4)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.filter.select.size` | `"{semantic.size.m}"` | `"{semantic.size.s}"` | dimension |
| `components.filter.popout.content.padding` | `"{semantic.space.xs}"` | `"{semantic.space.s}"` | dimension |
| `components.filter.popout.header.min-height` | `"{semantic.size.m}"` | `"{semantic.space.m}"` | dimension |
| `components.filter.select.line-height` | `"{semantic.line-height.heading}"` | `"{semantic.line-height.body}"` | number |

#### label (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.label.gap` | `"{core.space.4}"` | `"{semantic.space.xxs}"` | dimension |

#### skeleton (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.skeleton.color-background` | `"{semantic.color.background.neutral}"` | `"{semantic.color.background.placeholder}"` | color |

#### tooltip (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.tooltip.popout.border-radius` | `"{semantic.border-radius.l}"` | `"{semantic.border-radius.pill}"` | dimension |

### ℹ️ New Tokens (45)

#### avatar (23)

- `components.avatar.initials.xlarge.font-size` (dimension)
- `components.avatar.initials.xlarge.font-weight` (fontWeight)
- `components.avatar.initials.xlarge.line-height` (number)
- `components.avatar.initials.xxlarge.font-size` (dimension)
- `components.avatar.initials.xxlarge.font-weight` (fontWeight)
- `components.avatar.initials.xxlarge.line-height` (number)
- `components.avatar.initials.xxxlarge.font-size` (dimension)
- `components.avatar.initials.xxxlarge.font-weight` (fontWeight)
- `components.avatar.initials.xxxlarge.line-height` (number)
- `components.avatar.initials.xxxxlarge.font-size` (dimension)
- `components.avatar.initials.xxxxlarge.font-weight` (fontWeight)
- `components.avatar.initials.xxxxlarge.line-height` (number)
- `components.avatar.xxlarge.size` (dimension)
- `components.avatar.xxxlarge.size` (dimension)
- `components.avatar.xxxxlarge.size` (dimension)
- `components.avatar.square.xsmall.border-radius` (dimension)
- `components.avatar.square.medium.border-radius` (dimension)
- `components.avatar.square.large.border-radius` (dimension)
- `components.avatar.square.xlarge.border-radius` (dimension)
- `components.avatar.square.xxlarge.border-radius` (dimension)
- `components.avatar.square.xxxlarge.border-radius` (dimension)
- `components.avatar.square.xxxxlarge.border-radius` (dimension)
- `components.avatar.round.border-radius` (dimension)

#### banner (1)

- `components.banner.heading.font-size-mobile` (dimension)

#### button (1)

- `components.button.secondary.box-shadow` (shadow)

#### checkbox (1)

- `components.checkbox.icon.margin-top-mobile` (dimension)

#### datepicker (1)

- `components.datepicker.popout.margin-mobile` (dimension)

#### dropdown (1)

- `components.dropdown.group.divider.height` (dimension)

#### filter (2)

- `components.filter.trigger.font-size-mobile` (dimension)
- `components.filter.trigger.font-weight` (fontWeight)

#### icon (5)

- `components.icon.background.size-l-padding` (dimension)
- `components.icon.background.size-m-padding` (dimension)
- `components.icon.background.size-s-padding` (dimension)
- `components.icon.background.size-xl-padding` (dimension)
- `components.icon.color-foreground.accent` (color)

#### input (2)

- `components.input.suffix.border-radius` (dimension)
- `components.input.suffix.border-radius-mobile` (dimension)

#### tabs (1)

- `components.tabs.item.font-size-mobile` (dimension)

#### tooltip (7)

- `components.tooltip.border-radius` (dimension)
- `components.tooltip.padding-block` (dimension)
- `components.tooltip.z-index` (dimension)
- `components.tooltip.font-size` (dimension)
- `components.tooltip.padding-inline` (dimension)
- `components.tooltip.color.background` (color)
- `components.tooltip.color.foreground` (color)

---

**Result**: 🚨 VALIDATION FAILED - Breaking changes detected
