# Token Validation Report

_This report shows only breaking changes (removed tokens, type changes), semantic value changes, and new tokens. Structural renames (dash-to-dot notation) and format improvements are automatically filtered out._

## Summary

- 🚨 **Removed Tokens**: 124
- 🔄 **Type Changes**: 69
- ⚠️ **Value Changes**: 28 (semantic differences only)
- ℹ️ **New Tokens**: 100
- ✓ **Unchanged**: 1006

## Comparison Details

**Source**: `/Users/rafal.ziolek/GitHub/exporter-style-dictionary/.build` (6 files, 1510 tokens)

**Target**: `/Users/rafal.ziolek/GitHub/watson-web/packages/tokens/src` (6 files, 1651 tokens)

## By Platform

| Platform | Removed | Type Changes | Value Changes | New | Unchanged | Total |
|----------|---------|--------------|---------------|-----|-----------|-------|
| **core** | 7 | 14 | 14 | 0 | 199 | 234 |
| **mobile/patient** | 16 | 1 | 1 | 53 | 146 | 217 |
| **web/legacy** | 4 | 0 | 0 | 0 | 9 | 13 |
| **web/patient** | 97 | 54 | 13 | 47 | 652 | 863 |

## 🚨 Removed Tokens

_124 tokens were removed from the new export_

### CORE (7 removed)

#### box-shadow (3)

- `core.box-shadow.s` (boxShadow)
- `core.box-shadow.m` (boxShadow)
- `core.box-shadow.l` (boxShadow)

#### color (4)

- `core.color.red.300-60 2` (color)
- `core.color.red.300-40 2` (color)
- `core.color.red.300-60 3` (color)
- `core.color.red.300-40 3` (color)

### MOBILE/PATIENT (16 removed)

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

#### font-family (1)

- `semantic.font-family._sans` (text)

#### icon-button (4)

- `components.icon-button.color.border` (color)
- `components.icon-button.danger.outline.focus` (color)
- `components.icon-button.plain.outline.focus` (color)
- `components.icon-button.secondary.outline.focus` (color)

#### segmented-control (1)

- `components.segmented-control.button.icon-size` (dimension)

### WEB/LEGACY (4 removed)

#### component (4)

- `component.progress-bar.color.background` (color)
- `component.radio.outline.focus` (other)
- `component.table.tr.color.background.hover` (color)
- `component.table.tr.color.background.active` (color)

### WEB/PATIENT (97 removed)

#### action-bar (1)

- `components.action-bar.box-shadow` (boxShadow)

#### avatar (1)

- `components.avatar.user.border-radius` (dimension)

#### badge (4)

- `components.badge.ai.color-background` (color)
- `components.badge.ai.color-border` (color)
- `components.badge.ai-inverted.color-background` (color)
- `components.badge.ai-inverted.color-border` (color)

#### banner (11)

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
- `components.banner.button._variant` (text)

#### button (4)

- `components.button.box-shadow` (boxShadow)
- `components.button.default.box-shadow` (boxShadow)
- `components.button.default.border` (boxShadow)
- `components.button.secondary.border` (boxShadow)

#### calendar (1)

- `components.calendar._min-width` (dimension)

#### checkbox (2)

- `components.checkbox.error-hint._margin` (dimension)
- `components.checkbox.error-hint._margin-mobile` (dimension)

#### combobox (6)

- `components.combobox.item.single-select._offset` (dimension)
- `components.combobox.item.single-select._offset-mobile` (dimension)
- `components.combobox.item.divider._single-select.offset.left-mobile` (dimension)
- `components.combobox.item.divider._multi-select.offset.left-mobile` (dimension)
- `components.combobox.popout-content.box-shadow` (boxShadow)
- `components.combobox.popout-content.box-shadow-mobile` (boxShadow)

#### datepicker (2)

- `components.datepicker.popout.box-shadow` (boxShadow)
- `components.datepicker.popout._min-width` (dimension)

#### dropdown (7)

- `components.dropdown.popout.box-shadow` (boxShadow)
- `components.dropdown.popout.box-shadow-mobile` (boxShadow)
- `components.dropdown.group._padding-horizontal` (dimension)
- `components.dropdown.group._padding-horizontal-mobile` (dimension)
- `components.dropdown.group.divider._height` (dimension)
- `components.dropdown.item._border-radius-mobile` (dimension)
- `components.dropdown.item._selected-indicator-size` (dimension)

#### feedback (4)

- `components.feedback.color.info` (color)
- `components.feedback.color.warning` (color)
- `components.feedback.color.danger` (color)
- `components.feedback.gap` (dimension)

#### filter (5)

- `components.filter.trigger.main.gap` (dimension)
- `components.filter.trigger.box-shadow` (boxShadow)
- `components.filter.popout.box-shadow` (boxShadow)
- `components.filter.popout.box-shadow-mobile` (boxShadow)
- `components.filter.select.line-height` (number)

#### font-family (1)

- `semantic.font-family._body` (text)

#### input (2)

- `components.input._height` (dimension)
- `components.input._padding` (dimension)

#### label (7)

- `components.label.color-foreground` (color)
- `components.label.gap` (dimension)
- `components.label.font-family` (fontFamily)
- `components.label.font-size` (dimension)
- `components.label.font-size-mobile` (dimension)
- `components.label.font-weight-text` (fontWeight)
- `components.label.font-weight-optional` (fontWeight)

#### modal (2)

- `components.modal.box-shadow` (boxShadow)
- `components.modal._width-mobile` (dimension)

#### popover (3)

- `components.popover.popout._margin` (dimension)
- `components.popover.popout.box-shadow` (boxShadow)
- `components.popover.popout.box-shadow-mobile` (boxShadow)

#### radio (2)

- `components.radio.hint._margin-mobile` (dimension)
- `components.radio.hint._margin` (dimension)

#### segmented-control (5)

- `components.segmented-control.button.color` (color)
- `components.segmented-control.button.selected-color-background` (color)
- `components.segmented-control.button._icon-size` (dimension)
- `components.segmented-control.button._icon-size-mobile` (dimension)
- `components.segmented-control.button._padding-horizontal` (dimension)

#### skeleton (3)

- `components.skeleton.ai.gradient-background` (color)
- `components.skeleton.ai.gradient-shimmer` (color)
- `components.skeleton.gradient-shimmer` (color)

#### skeleton-text (5)

- `components.skeleton-text.body._height` (dimension)
- `components.skeleton-text.caption._height` (dimension)
- `components.skeleton-text.sub-section-heading._height` (dimension)
- `components.skeleton-text.section-heading._height` (dimension)
- `components.skeleton-text.display-heading._height` (dimension)

#### tabs (2)

- `components.tabs._color-background` (color)
- `components.tabs.item._icon-spacing` (dimension)

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

## 🔄 Type Changes

_69 tokens changed type_

### CORE (14 type changes)

#### base-rem (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `core.base-rem` | number | dimension |

#### font-family (2)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `core.font-family.inter` | text | fontFamily |
| `core.font-family.system` | text | fontFamily |

#### z-index (11)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `core.z-index.0` | number | dimension |
| `core.z-index.100` | number | dimension |
| `core.z-index.200` | number | dimension |
| `core.z-index.300` | number | dimension |
| `core.z-index.400` | number | dimension |
| `core.z-index.500` | number | dimension |
| `core.z-index.600` | number | dimension |
| `core.z-index.700` | number | dimension |
| `core.z-index.800` | number | dimension |
| `core.z-index.900` | number | dimension |
| `core.z-index.1000` | number | dimension |

### MOBILE/PATIENT (1 type changes)

#### font-family (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `semantic.font-family.sans` | text | fontFamily |

### WEB/PATIENT (54 type changes)

#### action-bar (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.action-bar.z-index` | number | dimension |

#### box-shadow (3)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `semantic.box-shadow.popout` | boxShadow | shadow |
| `semantic.box-shadow.dialog` | boxShadow | shadow |
| `semantic.box-shadow.emphasis` | boxShadow | shadow |

#### button (3)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.button.font-size` | number | dimension |
| `components.button.font-size-mobile` | number | dimension |
| `components.button.font-weight` | number | fontWeight |

#### checkbox (2)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.checkbox.label.line-height` | text | number |
| `components.checkbox.width` | text | string |

#### combobox (2)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.combobox.item.opacity-disabled` | number | dimension |
| `components.combobox.popout-content.z-index` | number | dimension |

#### datepicker (2)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.datepicker.popout.z-index` | number | dimension |
| `components.datepicker.popout.z-index-mobile` | number | dimension |

#### divider (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.divider.width` | text | string |

#### dropdown (2)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.dropdown.popout.z-index` | number | dimension |
| `components.dropdown.group.heading.font-weight` | dimension | fontWeight |

#### filter (2)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.filter.popout.z-index` | number | dimension |
| `components.filter.popout.header.label.font-weight` | dimension | fontWeight |

#### font-family (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `semantic.font-family.body` | text | fontFamily |

#### font-weight (2)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `semantic.font-weight.emphasis` | dimension | fontWeight |
| `semantic.font-weight.heading` | dimension | fontWeight |

#### gradient (4)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `semantic.gradient.ai.light` | color | gradient |
| `semantic.gradient.ai.dark` | color | gradient |
| `semantic.gradient.ai.soft-hints` | color | gradient |
| `semantic.gradient.ai.subtle-highlight` | color | gradient |

#### layout (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.layout.sidebar.z-index` | number | dimension |

#### link (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.link.text-decoration` | text | string |

#### modal (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.modal.z-index` | number | dimension |

#### nav-list (2)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.nav-list.item.font-family` | text | string |
| `components.nav-list.item.font-weight-selected` | dimension | fontWeight |

#### popover (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.popover.popout.z-index` | number | dimension |

#### radio (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.radio.width` | text | string |

#### select (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.select.background-size` | text | string |

#### skeleton (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.skeleton.background-size` | text | string |

#### spinner (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.spinner.opacity` | number | dimension |

#### table (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.table.z-index` | number | dimension |

#### tabs (3)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.tabs.item.font-weight-default` | dimension | fontWeight |
| `components.tabs.item.font-weight-hover` | dimension | fontWeight |
| `components.tabs.item.font-weight-active` | dimension | fontWeight |

#### text (7)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.text.body.font-weight` | dimension | fontWeight |
| `components.text.section-heading.font-weight` | dimension | fontWeight |
| `components.text.sub-section-heading.font-weight` | dimension | fontWeight |
| `components.text.display-heading.font-weight` | dimension | fontWeight |
| `components.text.caption.font-weight` | dimension | fontWeight |
| `components.text.body-emphasis.font-weight` | dimension | fontWeight |
| `components.text.caption-emphasis.font-weight` | dimension | fontWeight |

#### toast (1)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.toast.z-index` | number | dimension |

#### tooltip (3)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `components.tooltip.popout.z-index` | number | dimension |
| `components.tooltip.popout.font-size` | number | dimension |
| `components.tooltip.popout.padding-inline` | number | dimension |

#### z-index (4)

| Token Path | Old Type | New Type |
|------------|----------|----------|
| `semantic.z-index.notification` | number | dimension |
| `semantic.z-index.modal` | number | dimension |
| `semantic.z-index.popout` | number | dimension |
| `semantic.z-index.sticky` | number | dimension |

## ⚠️ Value Changes

_28 tokens have semantic value changes_

### CORE (14 value changes)

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

### MOBILE/PATIENT (1 value changes)

#### button (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.button.plain.color.background` | `"#00000000"` | `"#ffffff00"` | color |

### WEB/PATIENT (13 value changes)

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

#### filter (3)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.filter.select.size` | `"{semantic.size.m}"` | `"{semantic.size.s}"` | dimension |
| `components.filter.popout.content.padding` | `"{semantic.space.xs}"` | `"{semantic.space.s}"` | dimension |
| `components.filter.popout.header.min-height` | `"{semantic.size.m}"` | `"{semantic.space.m}"` | dimension |

#### skeleton (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.skeleton.color-background` | `"{semantic.color.background.neutral}"` | `"{semantic.color.background.placeholder}"` | color |

#### tooltip (1)

| Token Path | Old Value | New Value | Type |
|------------|-----------|-----------|------|
| `components.tooltip.popout.border-radius` | `"{semantic.border-radius.l}"` | `"{semantic.border-radius.pill}"` | dimension |

## ℹ️ New Tokens

_100 tokens were added in the new export_

### MOBILE/PATIENT (53 new)

#### border-radius (1)

- `border-radius` (dimension)

#### border-radius-focus (1)

- `border-radius-focus` (dimension)

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

#### font-size (1)

- `font-size` (dimension)

#### font-weight (1)

- `font-weight` (fontWeight)

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

#### line-height (1)

- `line-height` (string)

#### link (1)

- `components.link.outline.color-focus` (color)

#### offset-focus (1)

- `offset-focus` (dimension)

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

### WEB/PATIENT (47 new)

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

#### banner (2)

- `components.banner.header.font-size` (dimension)
- `components.banner.header.font-size-mobile` (dimension)

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

#### segmented-control (1)

- `components.segmented-control.button.selected.background-color` (color)

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
