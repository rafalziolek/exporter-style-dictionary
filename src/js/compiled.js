/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.ts"
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
() {

// Simple Token Exporter - Clean Implementation
// Uses group.path for token location, tokenById map for references
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// ============================================================================
// MAIN EXPORT
// ============================================================================
Pulsar.export((sdk, context) => __awaiter(this, void 0, void 0, function* () {
    const remote = {
        designSystemId: context.dsId,
        versionId: context.versionId,
    };
    // 1. Fetch all data
    const baseTokens = toArray(yield sdk.tokens.getTokens(remote));
    const groups = toArray(yield sdk.tokens.getTokenGroups(remote));
    const themes = toArray(yield sdk.tokens.getTokenThemes(remote));
    // 2. Build base token lookup map (for core tokens - they don't change with themes)
    const baseTokenById = buildTokenMap(baseTokens);
    // 3. Group base tokens by collection
    const baseGrouped = groupByPlatform(baseTokens, groups);
    // 4. Build output files
    const outputs = [];
    // Debug: show collection detection results
    const debugCollections = {
        counts: {
            core: baseGrouped.core.length,
            web: baseGrouped.web.length,
            mobile: baseGrouped.mobile.length,
            unknown: baseGrouped.unknown.length,
        },
        allCollectionValues: {},
        unknownTokenDetails: [],
        sampleTokens: [],
        shadowTokens: [],
    };
    // Count all unique collection values
    for (let i = 0; i < baseTokens.length; i++) {
        const col = getTokenCollection(baseTokens[i]);
        debugCollections.allCollectionValues[col] = (debugCollections.allCollectionValues[col] || 0) + 1;
    }
    // Show details of unknown tokens (what collection do they have?)
    for (let i = 0; i < Math.min(baseGrouped.unknown.length, 10); i++) {
        const t = baseGrouped.unknown[i];
        const props = t.properties || [];
        const propValues = t.propertyValues || {};
        const group = findGroupForToken(t, groups);
        // Find collection property info
        let collectionPropInfo = null;
        for (let j = 0; j < props.length; j++) {
            const p = props[j];
            if ((p.name || '').toLowerCase() === 'collection' || (p.codeName || '').toLowerCase() === 'collection') {
                collectionPropInfo = {
                    name: p.name,
                    codeName: p.codeName,
                    id: p.id,
                    options: (p.options || []).map((o) => ({ id: o.id, name: o.name })),
                };
                break;
            }
        }
        debugCollections.unknownTokenDetails.push({
            name: t.name,
            groupPath: group ? group.path : null,
            hasCollectionProp: !!collectionPropInfo,
            collectionPropInfo: collectionPropInfo,
            propertyValueKeys: Object.keys(propValues),
            rawPropertyValues: JSON.stringify(propValues).substring(0, 300),
        });
    }
    // Sample a few tokens from each group
    const allSamples = [...baseGrouped.core.slice(0, 2), ...baseGrouped.web.slice(0, 2), ...baseGrouped.mobile.slice(0, 2)];
    for (let i = 0; i < allSamples.length; i++) {
        const t = allSamples[i];
        const group = findGroupForToken(t, groups);
        debugCollections.sampleTokens.push({
            name: t.name,
            collection: getTokenCollection(t),
            groupPath: group ? group.path : null,
            groupName: group ? group.name : null,
        });
    }
    // Find and capture shadow tokens, especially secondary button box-shadow
    for (let i = 0; i < baseTokens.length; i++) {
        const t = baseTokens[i];
        if (t.tokenType === 'Shadow' && t.isVirtual !== true) {
            const group = findGroupForToken(t, groups);
            const value = t.value;
            // Look for secondary button shadow or capture first few shadows
            const isSecondaryButton = t.name.toLowerCase().includes('secondary') ||
                (group && group.path.join('/').toLowerCase().includes('secondary'));
            const isBoxShadow = t.name.toLowerCase().includes('box-shadow') ||
                t.name.toLowerCase().includes('box') ||
                (group && group.name.toLowerCase().includes('button'));
            if (isSecondaryButton || isBoxShadow || debugCollections.shadowTokens.length < 3) {
                debugCollections.shadowTokens.push({
                    name: t.name,
                    tokenType: t.tokenType,
                    groupPath: group ? group.path : null,
                    groupName: group ? group.name : null,
                    fullPath: group ? [...group.path, group.name, t.name].join('.') : t.name,
                    valueStructure: JSON.parse(JSON.stringify(value)), // Deep clone
                });
            }
        }
    }
    outputs.push(createFile('_debug_collections.json', debugCollections));
    // Core tokens (always exported once, shared across all themes)
    if (baseGrouped.core.length > 0) {
        const tree = buildTree(baseGrouped.core, groups, baseTokenById, 0); // 0 = use full path
        outputs.push(createFile('core/core.json', tree));
    }
    // 4. Export ALL themes
    for (let t = 0; t < themes.length; t++) {
        const theme = themes[t];
        const themeName = theme.name; // e.g., "customer/light" or "patient/dark"
        // Build themed tokens by merging overriddenTokens with base tokens
        // The theme.overriddenTokens contains the actual themed values
        const overriddenTokens = toArray(theme.overriddenTokens || []);
        // Create a map of overridden tokens by ID
        const overriddenById = buildTokenMap(overriddenTokens);
        // Merge: use overridden token if exists, otherwise use base token
        const themedTokens = [];
        for (let i = 0; i < baseTokens.length; i++) {
            const baseToken = baseTokens[i];
            const overridden = overriddenById[baseToken.id];
            themedTokens.push(overridden || baseToken);
        }
        // Build token lookup for this theme
        const tokenById = buildTokenMap(themedTokens);
        // Group themed tokens by platform
        const grouped = groupByPlatform(themedTokens, groups);
        // Export platform-specific tokens for this theme
        const platforms = ['web', 'mobile'];
        for (let p = 0; p < platforms.length; p++) {
            const platform = platforms[p];
            const platformTokens = grouped[platform] || [];
            if (platformTokens.length > 0) {
                const tree = buildTree(platformTokens, groups, tokenById, 0); // 0 = use full path
                outputs.push(createFile(platform + '/' + themeName + '.json', tree));
            }
        }
    }
    return outputs;
}));
// ============================================================================
// GROUPING (by Collection property)
// ============================================================================
function getTokenCollection(token) {
    const properties = token.properties || [];
    const propertyValues = token.propertyValues || {};
    // Find the Collection property definition
    let collectionProp = null;
    for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];
        const name = (prop.name || '').toLowerCase();
        const codeName = (prop.codeName || '').toLowerCase();
        if (name === 'collection' || codeName === 'collection') {
            collectionProp = prop;
            break;
        }
    }
    if (!collectionProp)
        return 'unknown';
    // Get the value - could be keyed by id or codeName
    let rawValue = propertyValues[collectionProp.id] || propertyValues[collectionProp.codeName] || propertyValues['collection'];
    if (!rawValue)
        return 'unknown';
    // If it's an object with id, resolve from options
    const valueId = typeof rawValue === 'string' ? rawValue : (rawValue.id || rawValue.value);
    // Find matching option
    const options = collectionProp.options || [];
    for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        if (opt.id === valueId || opt.value === valueId || opt.name === valueId) {
            return (opt.name || opt.value || opt.id || 'unknown').toLowerCase();
        }
    }
    // Fallback: return the value itself if it's a string
    if (typeof valueId === 'string') {
        return valueId.toLowerCase();
    }
    return 'unknown';
}
function groupByPlatform(tokens, groups) {
    const result = {
        core: [],
        web: [],
        mobile: [],
        unknown: [],
    };
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const collection = getTokenCollection(token);
        if (collection === 'core') {
            result.core.push(token);
        }
        else if (collection === 'web') {
            result.web.push(token);
        }
        else if (collection === 'mobile') {
            result.mobile.push(token);
        }
        else {
            result.unknown.push(token);
        }
    }
    return result;
}
// ============================================================================
// TREE BUILDING
// ============================================================================
function buildTree(tokens, groups, tokenById, skipLevels) {
    const tree = {};
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        // Skip virtual shadow tokens
        if (token.isVirtual === true && token.tokenType === 'Shadow') {
            continue;
        }
        // Skip tokens with underscore in name (internal/private tokens)
        if (token.name.indexOf('_') !== -1) {
            continue;
        }
        const group = findGroupForToken(token, groups);
        // Skip tokens in groups with underscore in name or path
        if (group) {
            // Check group name
            if (group.name.indexOf('_') !== -1) {
                continue;
            }
            // Check group path
            let hasUnderscoreInPath = false;
            for (let p = 0; p < group.path.length; p++) {
                if (group.path[p].indexOf('_') !== -1) {
                    hasUnderscoreInPath = true;
                    break;
                }
            }
            if (hasUnderscoreInPath) {
                continue;
            }
        }
        const fullGroupPath = buildFullGroupPath(group);
        // Build the nested path: skip platform (and optionally more levels)
        const pathParts = fullGroupPath.slice(skipLevels);
        const fullPath = [];
        for (let j = 0; j < pathParts.length; j++) {
            fullPath.push(safeName(pathParts[j]));
        }
        fullPath.push(safeName(token.name));
        if (fullPath.length === 0)
            continue;
        // Format and set the token value
        const formatted = formatToken(token, tokenById, groups);
        setNested(tree, fullPath, formatted);
    }
    return tree;
}
function setNested(obj, path, value) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[path[path.length - 1]] = value;
}
// ============================================================================
// TOKEN FORMATTING (DTCG)
// ============================================================================
function resolveTokenType(token, groups) {
    if (isFontWeightToken(token, groups))
        return 'fontWeight';
    if (isLineHeightToken(token, groups))
        return 'number';
    return mapType(token.tokenType);
}
function formatToken(token, tokenById, groups) {
    const value = token.value;
    const $type = resolveTokenType(token, groups);
    // Check for top-level reference FIRST
    if (value && value.referencedTokenId) {
        const refToken = tokenById[value.referencedTokenId];
        if (refToken) {
            return {
                $value: '{' + buildRefPath(refToken, groups) + '}',
                $type,
            };
        }
    }
    // Format raw value
    let formatted;
    if ($type === 'fontWeight') {
        formatted = extractNumericValue(value, 400);
    }
    else if ($type === 'number' && isLineHeightToken(token, groups)) {
        formatted = extractNumericValue(value, 1.5);
    }
    else {
        formatted = formatValue(value, token.tokenType, tokenById, groups);
    }
    const result = { $value: formatted, $type };
    if (token.description && token.description.length > 0) {
        result.$description = token.description;
    }
    return result;
}
function formatValue(value, tokenType, tokenById, groups) {
    if (!value)
        return null;
    // Color: check for nested .color object or direct r/g/b
    if (value.color && typeof value.color.r === 'number') {
        // Check if color itself is a reference
        if (value.color.referencedTokenId) {
            const ref = tokenById[value.color.referencedTokenId];
            if (ref)
                return '{' + buildRefPath(ref, groups) + '}';
        }
        // Use formatColorValue to handle alpha properly
        return formatColorValue(value);
    }
    if (typeof value.r === 'number' && typeof value.g === 'number') {
        // Direct r/g/b (check for alpha too)
        const alpha = typeof value.a === 'number' ? value.a : 1;
        if (alpha < 1) {
            return toHexWithAlpha(value.r, value.g, value.b, alpha);
        }
        return toHex(value.r, value.g, value.b);
    }
    if (value.hex) {
        return '#' + value.hex;
    }
    // Dimension/Measure: has .measure and .unit
    if (typeof value.measure === 'number') {
        return {
            value: value.measure,
            unit: formatUnit(value.unit)
        };
    }
    // Text/String: has .text
    if (typeof value.text === 'string') {
        return value.text;
    }
    // Font: has .family (legacy combined font+weight token)
    // Maps to custom 'font' type to preserve both family and weight
    if (typeof value.family === 'string') {
        return {
            family: value.family,
            weight: value.subfamily || value.weight || 'Regular',
        };
    }
    // Typography: has .font and .fontSize
    if (value.font || value.fontSize) {
        return formatTypography(value, tokenById, groups);
    }
    // Shadow: Supernova provides array with shadow object(s)
    if (Array.isArray(value) && value.length > 0 && value[0].x !== undefined && value[0].y !== undefined) {
        return formatShadowArray(value, tokenById, groups);
    }
    // Gradient: Supernova provides array with gradient object(s)
    if (Array.isArray(value) && value.length > 0 && value[0].stops) {
        return formatGradient(value[0], tokenById, groups);
    }
    // Border: has .color and .width
    if (value.color && value.width) {
        return formatBorder(value, tokenById, groups);
    }
    // Radius: has .radius or corner values
    if (value.radius || value.topLeft || value.topRight) {
        return formatRadius(value, tokenById, groups);
    }
    // Fallback: return as-is
    return value;
}
function extractNumericValue(value, fallback) {
    var _a;
    if (value && typeof value === 'object') {
        const measure = (_a = value.measure) !== null && _a !== void 0 ? _a : value.value;
        if (typeof measure === 'number')
            return measure;
    }
    if (typeof value === 'number')
        return value;
    return fallback;
}
// ============================================================================
// COMPLEX VALUE FORMATTERS
// ============================================================================
function formatTypography(value, tokenById, groups) {
    const result = {};
    if (value.font) {
        if (value.font.referencedTokenId) {
            const ref = tokenById[value.font.referencedTokenId];
            result.fontFamily = ref ? '{' + buildRefPath(ref, groups) + '}' : value.font.family;
        }
        else {
            result.fontFamily = value.font.family || '';
            result.fontWeight = value.font.subfamily || 'Regular';
        }
    }
    if (value.fontSize) {
        if (value.fontSize.referencedTokenId) {
            const ref = tokenById[value.fontSize.referencedTokenId];
            result.fontSize = ref ? '{' + buildRefPath(ref, groups) + '}' : formatMeasure(value.fontSize);
        }
        else {
            result.fontSize = formatMeasure(value.fontSize);
        }
    }
    if (value.lineHeight) {
        if (value.lineHeight.referencedTokenId) {
            const ref = tokenById[value.lineHeight.referencedTokenId];
            result.lineHeight = ref ? '{' + buildRefPath(ref, groups) + '}' : formatMeasure(value.lineHeight);
        }
        else {
            result.lineHeight = formatMeasure(value.lineHeight);
        }
    }
    if (value.letterSpacing) {
        result.letterSpacing = formatMeasure(value.letterSpacing);
    }
    if (value.textCase)
        result.textTransform = value.textCase.toLowerCase();
    if (value.textDecoration)
        result.textDecoration = value.textDecoration.toLowerCase();
    return result;
}
function formatShadow(value, tokenById, groups) {
    const result = {
        offsetX: formatMeasure(value.x),
        offsetY: formatMeasure(value.y),
        blur: formatMeasure(value.radius),
        spread: formatMeasure(value.spread),
    };
    // Get alpha from shadow's opacity property (Supernova stores opacity at shadow level, not color level)
    // Reference: https://developers.supernova.io/latest/sdk-reference/data-model/tokens/token-values-Hnb3ieu5#section-shadowtokenvalue-65
    let alpha = 1;
    if (value.opacity && typeof value.opacity.measure === 'number') {
        alpha = value.opacity.measure;
    }
    else if (typeof value.opacity === 'number') {
        alpha = value.opacity;
    }
    // Handle color with full DTCG format
    if (value.color) {
        // Extract color from nested structure (Supernova has color.color)
        let colorValue = value.color;
        if (colorValue.color) {
            colorValue = colorValue.color; // Unwrap nested color
        }
        // Check for color reference
        if (colorValue.referencedTokenId) {
            const ref = tokenById[colorValue.referencedTokenId];
            result.color = ref ? '{' + buildRefPath(ref, groups) + '}' : null;
        }
        // Format color to full DTCG color object (not hex string)
        if (!result.color && colorValue) {
            const r = colorValue.r || 0;
            const g = colorValue.g || 0;
            const b = colorValue.b || 0;
            // DTCG requires RGB in 0-1 range, Supernova provides 0-255
            result.color = {
                colorSpace: 'srgb',
                components: [r / 255, g / 255, b / 255],
                alpha: alpha
            };
        }
    }
    // Handle inset property (from Supernova's type field)
    if (value.type) {
        const typeStr = String(value.type).toLowerCase();
        if (typeStr === 'inner' || typeStr === 'inset') {
            result.inset = true;
        }
        // Default is false (drop shadow), so no need to set explicitly
    }
    return result;
}
function formatShadowArray(value, tokenById, groups) {
    const shadows = [];
    for (let i = 0; i < value.length; i++) {
        const shadow = value[i];
        shadows.push(formatShadow(shadow, tokenById, groups));
    }
    // Return array directly (DTCG supports both single object and arrays)
    return shadows;
}
function formatGradient(value, tokenById, groups) {
    const stops = [];
    for (let i = 0; i < value.stops.length; i++) {
        const stop = value.stops[i];
        // Extract color from nested structure (Supernova has color.color)
        let colorValue = stop.color;
        if (colorValue && colorValue.color) {
            colorValue = colorValue.color; // Unwrap nested color
        }
        // Check for color reference
        let formattedColor;
        if (colorValue && colorValue.referencedTokenId) {
            const ref = tokenById[colorValue.referencedTokenId];
            formattedColor = ref ? '{' + buildRefPath(ref, groups) + '}' : null;
        }
        // Format color to full DTCG color object (not hex string)
        if (!formattedColor && colorValue) {
            const r = colorValue.r || 0;
            const g = colorValue.g || 0;
            const b = colorValue.b || 0;
            // Get alpha from opacity if present
            let alpha = 1;
            if (stop.color && stop.color.opacity && typeof stop.color.opacity.measure === 'number') {
                alpha = stop.color.opacity.measure;
            }
            // DTCG requires RGB in 0-1 range, Supernova provides 0-255
            formattedColor = {
                colorSpace: 'srgb',
                components: [r / 255, g / 255, b / 255],
                alpha: alpha
            };
        }
        stops.push({
            color: formattedColor || { colorSpace: 'srgb', components: [0, 0, 0] },
            position: stop.position || 0
        });
    }
    // Return array directly (DTCG compliant) - not wrapped in object
    return stops;
}
function formatBorder(value, tokenById, groups) {
    const result = {
        width: formatMeasure(value.width),
        style: 'solid',
    };
    if (value.color) {
        if (value.color.referencedTokenId) {
            const ref = tokenById[value.color.referencedTokenId];
            result.color = ref ? '{' + buildRefPath(ref, groups) + '}' : formatColorValue(value.color);
        }
        else {
            result.color = formatColorValue(value.color);
        }
    }
    return result;
}
function formatRadius(value, tokenById, groups) {
    // Single radius
    if (value.radius && !value.topLeft) {
        if (value.radius.referencedTokenId) {
            const ref = tokenById[value.radius.referencedTokenId];
            return ref ? '{' + buildRefPath(ref, groups) + '}' : formatMeasure(value.radius);
        }
        return formatMeasure(value.radius);
    }
    // Corner radii
    return {
        topLeft: formatMeasure(value.topLeft),
        topRight: formatMeasure(value.topRight),
        bottomLeft: formatMeasure(value.bottomLeft),
        bottomRight: formatMeasure(value.bottomRight),
    };
}
// ============================================================================
// PRIMITIVE FORMATTERS
// ============================================================================
function formatMeasure(value) {
    // If it's already a dimension object with value/unit, normalize it
    if (value && typeof value === 'object' && value.value !== undefined && value.unit !== undefined) {
        return {
            value: value.value,
            unit: formatUnit(value.unit)
        };
    }
    // If it's a number, create dimension object
    if (typeof value === 'number') {
        return {
            value: value,
            unit: 'px'
        };
    }
    // If it has measure/unit (Supernova format), convert
    if (value && typeof value === 'object' && value.measure !== undefined) {
        return {
            value: value.measure,
            unit: formatUnit(value.unit)
        };
    }
    // Fallback for backward compatibility (string values)
    if (typeof value === 'string') {
        return value;
    }
    // Default
    return {
        value: 0,
        unit: 'px'
    };
}
function formatColorValue(value) {
    if (!value)
        return '#000000';
    if (typeof value === 'string')
        return value;
    if (value.hex)
        return '#' + value.hex;
    // Get RGB values
    let r = 0, g = 0, b = 0;
    if (value.color && typeof value.color.r === 'number') {
        r = value.color.r;
        g = value.color.g;
        b = value.color.b;
    }
    else if (typeof value.r === 'number') {
        r = value.r;
        g = value.g;
        b = value.b;
    }
    // Get alpha/opacity (0-1)
    let alpha = 1;
    if (value.opacity && typeof value.opacity.measure === 'number') {
        alpha = value.opacity.measure;
    }
    else if (typeof value.a === 'number') {
        alpha = value.a;
    }
    else if (typeof value.alpha === 'number') {
        alpha = value.alpha;
    }
    // Output with alpha if not fully opaque
    if (alpha < 1) {
        return toHexWithAlpha(r, g, b, alpha);
    }
    return toHex(r, g, b);
}
function toHex(r, g, b) {
    const rh = Math.round(r).toString(16);
    const gh = Math.round(g).toString(16);
    const bh = Math.round(b).toString(16);
    return '#' + pad2(rh) + pad2(gh) + pad2(bh);
}
function toHexWithAlpha(r, g, b, a) {
    return toHex(r, g, b) + pad2(Math.round(a * 255).toString(16));
}
function pad2(s) {
    return s.length === 1 ? '0' + s : s;
}
function formatUnit(unit) {
    if (!unit)
        return 'px';
    const u = String(unit).toLowerCase();
    if (u === 'pixels' || u === 'px')
        return 'px';
    if (u === 'percent' || u === '%')
        return '%';
    if (u === 'ems' || u === 'em')
        return 'em';
    if (u === 'points' || u === 'pt')
        return 'pt';
    if (u === 'raw')
        return '';
    return u;
}
// ============================================================================
// REFERENCE PATH BUILDING
// ============================================================================
function buildRefPath(token, groups) {
    const group = findGroupForToken(token, groups);
    const fullGroupPath = buildFullGroupPath(group);
    const parts = [];
    for (let i = 0; i < fullGroupPath.length; i++) {
        parts.push(safeName(fullGroupPath[i]));
    }
    parts.push(safeName(token.name));
    return parts.join('.');
}
// ============================================================================
// TYPE MAPPING
// ============================================================================
const DTCG_TYPE_MAP = {
    // Standard types
    color: 'color',
    typography: 'typography',
    fontfamily: 'fontFamily',
    fontweight: 'fontWeight',
    shadow: 'shadow',
    border: 'border',
    gradient: 'gradient',
    duration: 'duration',
    // Dimension-like types
    dimension: 'dimension',
    measure: 'dimension',
    size: 'dimension',
    space: 'dimension',
    fontsize: 'dimension',
    letterspacing: 'dimension',
    paragraphspacing: 'dimension',
    borderwidth: 'dimension',
    radius: 'dimension',
    borderradius: 'dimension',
    blur: 'dimension',
    // Numeric types
    lineheight: 'number',
    opacity: 'number',
    zindex: 'number',
    // String types
    string: 'string',
    text: 'string',
    productcopy: 'string',
    textcase: 'string',
    textdecoration: 'string',
    visibility: 'string',
    // Legacy
    font: 'font',
};
function mapType(tokenType) {
    return DTCG_TYPE_MAP[String(tokenType).toLowerCase()] || String(tokenType).toLowerCase();
}
// ============================================================================
// UTILITIES
// ============================================================================
function safeName(name) {
    return String(name || '').replace(/\W+/g, '-').toLowerCase();
}
function buildTokenMap(tokens) {
    const map = {};
    for (let i = 0; i < tokens.length; i++) {
        map[tokens[i].id] = tokens[i];
    }
    return map;
}
function buildFullGroupPath(group) {
    if (!group)
        return [];
    const result = [];
    for (let i = 0; i < group.path.length; i++) {
        result.push(group.path[i]);
    }
    if (group.name && !group.isRoot) {
        result.push(group.name);
    }
    return result;
}
function findGroupForToken(token, groups) {
    for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        if (g.tokenIds && g.tokenIds.indexOf(token.id) !== -1) {
            return g;
        }
    }
    return null;
}
function isFontWeightToken(token, groups) {
    var _a;
    // Only check dimension-type tokens (performance optimization)
    const type = String(token.tokenType).toLowerCase();
    if (type !== 'dimension' && type !== 'measure') {
        return false;
    }
    // Check group path for 'font-weight'
    const group = findGroupForToken(token, groups);
    const fullPath = group ? [...group.path, group.name].join('.').toLowerCase() : '';
    const tokenName = token.name.toLowerCase();
    const hasFontWeightInPath = fullPath.includes('font-weight') ||
        fullPath.includes('fontweight');
    const hasFontWeightInName = tokenName.includes('font-weight') ||
        tokenName.includes('fontweight');
    // Must have font-weight in path or name
    if (!hasFontWeightInPath && !hasFontWeightInName) {
        return false;
    }
    // Validate value is in valid font-weight range (100-900)
    const value = token.value;
    const measure = (_a = value === null || value === void 0 ? void 0 : value.measure) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.value;
    if (typeof measure === 'number' && measure >= 100 && measure <= 900) {
        return true;
    }
    return false;
}
function isLineHeightToken(token, groups) {
    var _a;
    // Check dimension-type tokens AND LineHeight type
    const type = String(token.tokenType).toLowerCase();
    if (type !== 'dimension' && type !== 'measure' && type !== 'lineheight') {
        return false;
    }
    // Check group path for 'line-height'
    const group = findGroupForToken(token, groups);
    const fullPath = group ? [...group.path, group.name].join('.').toLowerCase() : '';
    const tokenName = token.name.toLowerCase();
    const hasLineHeightInPath = fullPath.includes('line-height') ||
        fullPath.includes('lineheight');
    const hasLineHeightInName = tokenName.includes('line-height') ||
        tokenName.includes('lineheight');
    // Must have line-height in path or name
    if (!hasLineHeightInPath && !hasLineHeightInName) {
        return false;
    }
    // Validate value is in valid line-height range (typically 0-3)
    const value = token.value;
    const measure = (_a = value === null || value === void 0 ? void 0 : value.measure) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.value;
    if (typeof measure === 'number' && measure >= 0 && measure <= 10) {
        return true;
    }
    return false;
}
function toArray(input) {
    if (!input)
        return [];
    if (Array.isArray(input))
        return input;
    if (typeof input === 'object' && typeof input.length === 'number') {
        const arr = [];
        for (let i = 0; i < input.length; i++) {
            arr.push(input[i]);
        }
        return arr;
    }
    return [];
}
// ============================================================================
// FILE OUTPUT
// ============================================================================
function createFile(filePath, content) {
    const normalized = filePath.replace(/^\/+/, '');
    const parts = normalized.split('/');
    const fileName = parts.pop() || 'output.json';
    const relativePath = parts.join('/');
    const jsonContent = JSON.stringify(content, null, 2);
    // Try FileHelper first, fallback to plain object
    if (typeof FileHelper !== 'undefined' && FileHelper.createTextFile) {
        return FileHelper.createTextFile({ relativePath, fileName, content: jsonContent });
    }
    return {
        path: relativePath.length > 0 ? relativePath : '.',
        name: fileName,
        type: 'text',
        content: jsonContent,
    };
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/index.ts"].call(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZWQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLCtEQUErRCxpQkFBaUI7QUFDNUc7QUFDQSxvQ0FBb0MsTUFBTSwrQkFBK0IsWUFBWTtBQUNyRixtQ0FBbUMsTUFBTSxtQ0FBbUMsWUFBWTtBQUN4RixnQ0FBZ0M7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCwrQkFBK0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQix1QkFBdUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsOENBQThDO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixrQkFBa0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkRBQTZELHdCQUF3QjtBQUNyRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQix1QkFBdUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLG9CQUFvQix1QkFBdUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRFQUE0RTtBQUM1RTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsbUJBQW1CO0FBQ3ZDO0FBQ0Esc0NBQXNDO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHVCQUF1QjtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixzQkFBc0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsOEVBQThFO0FBQzlFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQix1QkFBdUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLG9CQUFvQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsbUJBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLG1CQUFtQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsdUJBQXVCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHNCQUFzQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixxQkFBcUI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQix1Q0FBdUM7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsa0NBQWtDO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLGtDQUFrQztBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0Msa0NBQWtDO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0Msa0NBQWtDO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsa0NBQWtDO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isa0JBQWtCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isd0JBQXdCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsa0NBQWtDO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLDJDQUEyQztBQUNsRjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsa0NBQWtDO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixrQ0FBa0M7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLDBCQUEwQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixtQkFBbUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQix1QkFBdUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixtQkFBbUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixrQkFBa0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyw4Q0FBOEM7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7VUU1MEJBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdXBlcm5vdmEtZXhwb3J0ZXItc3R5bGUtZGljdGlvbmFyeS8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9zdXBlcm5vdmEtZXhwb3J0ZXItc3R5bGUtZGljdGlvbmFyeS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3N1cGVybm92YS1leHBvcnRlci1zdHlsZS1kaWN0aW9uYXJ5L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9zdXBlcm5vdmEtZXhwb3J0ZXItc3R5bGUtZGljdGlvbmFyeS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU2ltcGxlIFRva2VuIEV4cG9ydGVyIC0gQ2xlYW4gSW1wbGVtZW50YXRpb25cbi8vIFVzZXMgZ3JvdXAucGF0aCBmb3IgdG9rZW4gbG9jYXRpb24sIHRva2VuQnlJZCBtYXAgZm9yIHJlZmVyZW5jZXNcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTUFJTiBFWFBPUlRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblB1bHNhci5leHBvcnQoKHNkaywgY29udGV4dCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgIGNvbnN0IHJlbW90ZSA9IHtcbiAgICAgICAgZGVzaWduU3lzdGVtSWQ6IGNvbnRleHQuZHNJZCxcbiAgICAgICAgdmVyc2lvbklkOiBjb250ZXh0LnZlcnNpb25JZCxcbiAgICB9O1xuICAgIC8vIDEuIEZldGNoIGFsbCBkYXRhXG4gICAgY29uc3QgYmFzZVRva2VucyA9IHRvQXJyYXkoeWllbGQgc2RrLnRva2Vucy5nZXRUb2tlbnMocmVtb3RlKSk7XG4gICAgY29uc3QgZ3JvdXBzID0gdG9BcnJheSh5aWVsZCBzZGsudG9rZW5zLmdldFRva2VuR3JvdXBzKHJlbW90ZSkpO1xuICAgIGNvbnN0IHRoZW1lcyA9IHRvQXJyYXkoeWllbGQgc2RrLnRva2Vucy5nZXRUb2tlblRoZW1lcyhyZW1vdGUpKTtcbiAgICAvLyAyLiBCdWlsZCBiYXNlIHRva2VuIGxvb2t1cCBtYXAgKGZvciBjb3JlIHRva2VucyAtIHRoZXkgZG9uJ3QgY2hhbmdlIHdpdGggdGhlbWVzKVxuICAgIGNvbnN0IGJhc2VUb2tlbkJ5SWQgPSBidWlsZFRva2VuTWFwKGJhc2VUb2tlbnMpO1xuICAgIC8vIDMuIEdyb3VwIGJhc2UgdG9rZW5zIGJ5IGNvbGxlY3Rpb25cbiAgICBjb25zdCBiYXNlR3JvdXBlZCA9IGdyb3VwQnlQbGF0Zm9ybShiYXNlVG9rZW5zLCBncm91cHMpO1xuICAgIC8vIDQuIEJ1aWxkIG91dHB1dCBmaWxlc1xuICAgIGNvbnN0IG91dHB1dHMgPSBbXTtcbiAgICAvLyBEZWJ1Zzogc2hvdyBjb2xsZWN0aW9uIGRldGVjdGlvbiByZXN1bHRzXG4gICAgY29uc3QgZGVidWdDb2xsZWN0aW9ucyA9IHtcbiAgICAgICAgY291bnRzOiB7XG4gICAgICAgICAgICBjb3JlOiBiYXNlR3JvdXBlZC5jb3JlLmxlbmd0aCxcbiAgICAgICAgICAgIHdlYjogYmFzZUdyb3VwZWQud2ViLmxlbmd0aCxcbiAgICAgICAgICAgIG1vYmlsZTogYmFzZUdyb3VwZWQubW9iaWxlLmxlbmd0aCxcbiAgICAgICAgICAgIHVua25vd246IGJhc2VHcm91cGVkLnVua25vd24ubGVuZ3RoLFxuICAgICAgICB9LFxuICAgICAgICBhbGxDb2xsZWN0aW9uVmFsdWVzOiB7fSxcbiAgICAgICAgdW5rbm93blRva2VuRGV0YWlsczogW10sXG4gICAgICAgIHNhbXBsZVRva2VuczogW10sXG4gICAgICAgIHNoYWRvd1Rva2VuczogW10sXG4gICAgfTtcbiAgICAvLyBDb3VudCBhbGwgdW5pcXVlIGNvbGxlY3Rpb24gdmFsdWVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYXNlVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNvbCA9IGdldFRva2VuQ29sbGVjdGlvbihiYXNlVG9rZW5zW2ldKTtcbiAgICAgICAgZGVidWdDb2xsZWN0aW9ucy5hbGxDb2xsZWN0aW9uVmFsdWVzW2NvbF0gPSAoZGVidWdDb2xsZWN0aW9ucy5hbGxDb2xsZWN0aW9uVmFsdWVzW2NvbF0gfHwgMCkgKyAxO1xuICAgIH1cbiAgICAvLyBTaG93IGRldGFpbHMgb2YgdW5rbm93biB0b2tlbnMgKHdoYXQgY29sbGVjdGlvbiBkbyB0aGV5IGhhdmU/KVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5taW4oYmFzZUdyb3VwZWQudW5rbm93bi5sZW5ndGgsIDEwKTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHQgPSBiYXNlR3JvdXBlZC51bmtub3duW2ldO1xuICAgICAgICBjb25zdCBwcm9wcyA9IHQucHJvcGVydGllcyB8fCBbXTtcbiAgICAgICAgY29uc3QgcHJvcFZhbHVlcyA9IHQucHJvcGVydHlWYWx1ZXMgfHwge307XG4gICAgICAgIGNvbnN0IGdyb3VwID0gZmluZEdyb3VwRm9yVG9rZW4odCwgZ3JvdXBzKTtcbiAgICAgICAgLy8gRmluZCBjb2xsZWN0aW9uIHByb3BlcnR5IGluZm9cbiAgICAgICAgbGV0IGNvbGxlY3Rpb25Qcm9wSW5mbyA9IG51bGw7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcHJvcHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBwcm9wc1tqXTtcbiAgICAgICAgICAgIGlmICgocC5uYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpID09PSAnY29sbGVjdGlvbicgfHwgKHAuY29kZU5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT09ICdjb2xsZWN0aW9uJykge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25Qcm9wSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb2RlTmFtZTogcC5jb2RlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IChwLm9wdGlvbnMgfHwgW10pLm1hcCgobykgPT4gKHsgaWQ6IG8uaWQsIG5hbWU6IG8ubmFtZSB9KSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkZWJ1Z0NvbGxlY3Rpb25zLnVua25vd25Ub2tlbkRldGFpbHMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiB0Lm5hbWUsXG4gICAgICAgICAgICBncm91cFBhdGg6IGdyb3VwID8gZ3JvdXAucGF0aCA6IG51bGwsXG4gICAgICAgICAgICBoYXNDb2xsZWN0aW9uUHJvcDogISFjb2xsZWN0aW9uUHJvcEluZm8sXG4gICAgICAgICAgICBjb2xsZWN0aW9uUHJvcEluZm86IGNvbGxlY3Rpb25Qcm9wSW5mbyxcbiAgICAgICAgICAgIHByb3BlcnR5VmFsdWVLZXlzOiBPYmplY3Qua2V5cyhwcm9wVmFsdWVzKSxcbiAgICAgICAgICAgIHJhd1Byb3BlcnR5VmFsdWVzOiBKU09OLnN0cmluZ2lmeShwcm9wVmFsdWVzKS5zdWJzdHJpbmcoMCwgMzAwKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFNhbXBsZSBhIGZldyB0b2tlbnMgZnJvbSBlYWNoIGdyb3VwXG4gICAgY29uc3QgYWxsU2FtcGxlcyA9IFsuLi5iYXNlR3JvdXBlZC5jb3JlLnNsaWNlKDAsIDIpLCAuLi5iYXNlR3JvdXBlZC53ZWIuc2xpY2UoMCwgMiksIC4uLmJhc2VHcm91cGVkLm1vYmlsZS5zbGljZSgwLCAyKV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxTYW1wbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHQgPSBhbGxTYW1wbGVzW2ldO1xuICAgICAgICBjb25zdCBncm91cCA9IGZpbmRHcm91cEZvclRva2VuKHQsIGdyb3Vwcyk7XG4gICAgICAgIGRlYnVnQ29sbGVjdGlvbnMuc2FtcGxlVG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogdC5uYW1lLFxuICAgICAgICAgICAgY29sbGVjdGlvbjogZ2V0VG9rZW5Db2xsZWN0aW9uKHQpLFxuICAgICAgICAgICAgZ3JvdXBQYXRoOiBncm91cCA/IGdyb3VwLnBhdGggOiBudWxsLFxuICAgICAgICAgICAgZ3JvdXBOYW1lOiBncm91cCA/IGdyb3VwLm5hbWUgOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gRmluZCBhbmQgY2FwdHVyZSBzaGFkb3cgdG9rZW5zLCBlc3BlY2lhbGx5IHNlY29uZGFyeSBidXR0b24gYm94LXNoYWRvd1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFzZVRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0ID0gYmFzZVRva2Vuc1tpXTtcbiAgICAgICAgaWYgKHQudG9rZW5UeXBlID09PSAnU2hhZG93JyAmJiB0LmlzVmlydHVhbCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0LCBncm91cHMpO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0LnZhbHVlO1xuICAgICAgICAgICAgLy8gTG9vayBmb3Igc2Vjb25kYXJ5IGJ1dHRvbiBzaGFkb3cgb3IgY2FwdHVyZSBmaXJzdCBmZXcgc2hhZG93c1xuICAgICAgICAgICAgY29uc3QgaXNTZWNvbmRhcnlCdXR0b24gPSB0Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnc2Vjb25kYXJ5JykgfHxcbiAgICAgICAgICAgICAgICAoZ3JvdXAgJiYgZ3JvdXAucGF0aC5qb2luKCcvJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnc2Vjb25kYXJ5JykpO1xuICAgICAgICAgICAgY29uc3QgaXNCb3hTaGFkb3cgPSB0Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYm94LXNoYWRvdycpIHx8XG4gICAgICAgICAgICAgICAgdC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2JveCcpIHx8XG4gICAgICAgICAgICAgICAgKGdyb3VwICYmIGdyb3VwLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYnV0dG9uJykpO1xuICAgICAgICAgICAgaWYgKGlzU2Vjb25kYXJ5QnV0dG9uIHx8IGlzQm94U2hhZG93IHx8IGRlYnVnQ29sbGVjdGlvbnMuc2hhZG93VG9rZW5zLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICBkZWJ1Z0NvbGxlY3Rpb25zLnNoYWRvd1Rva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0b2tlblR5cGU6IHQudG9rZW5UeXBlLFxuICAgICAgICAgICAgICAgICAgICBncm91cFBhdGg6IGdyb3VwID8gZ3JvdXAucGF0aCA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwTmFtZTogZ3JvdXAgPyBncm91cC5uYW1lIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFBhdGg6IGdyb3VwID8gWy4uLmdyb3VwLnBhdGgsIGdyb3VwLm5hbWUsIHQubmFtZV0uam9pbignLicpIDogdC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cnVjdHVyZTogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpLCAvLyBEZWVwIGNsb25lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgb3V0cHV0cy5wdXNoKGNyZWF0ZUZpbGUoJ19kZWJ1Z19jb2xsZWN0aW9ucy5qc29uJywgZGVidWdDb2xsZWN0aW9ucykpO1xuICAgIC8vIENvcmUgdG9rZW5zIChhbHdheXMgZXhwb3J0ZWQgb25jZSwgc2hhcmVkIGFjcm9zcyBhbGwgdGhlbWVzKVxuICAgIGlmIChiYXNlR3JvdXBlZC5jb3JlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdHJlZSA9IGJ1aWxkVHJlZShiYXNlR3JvdXBlZC5jb3JlLCBncm91cHMsIGJhc2VUb2tlbkJ5SWQsIDApOyAvLyAwID0gdXNlIGZ1bGwgcGF0aFxuICAgICAgICBvdXRwdXRzLnB1c2goY3JlYXRlRmlsZSgnY29yZS9jb3JlLmpzb24nLCB0cmVlKSk7XG4gICAgfVxuICAgIC8vIDQuIEV4cG9ydCBBTEwgdGhlbWVzXG4gICAgZm9yIChsZXQgdCA9IDA7IHQgPCB0aGVtZXMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgY29uc3QgdGhlbWUgPSB0aGVtZXNbdF07XG4gICAgICAgIGNvbnN0IHRoZW1lTmFtZSA9IHRoZW1lLm5hbWU7IC8vIGUuZy4sIFwiY3VzdG9tZXIvbGlnaHRcIiBvciBcInBhdGllbnQvZGFya1wiXG4gICAgICAgIC8vIEJ1aWxkIHRoZW1lZCB0b2tlbnMgYnkgbWVyZ2luZyBvdmVycmlkZGVuVG9rZW5zIHdpdGggYmFzZSB0b2tlbnNcbiAgICAgICAgLy8gVGhlIHRoZW1lLm92ZXJyaWRkZW5Ub2tlbnMgY29udGFpbnMgdGhlIGFjdHVhbCB0aGVtZWQgdmFsdWVzXG4gICAgICAgIGNvbnN0IG92ZXJyaWRkZW5Ub2tlbnMgPSB0b0FycmF5KHRoZW1lLm92ZXJyaWRkZW5Ub2tlbnMgfHwgW10pO1xuICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2Ygb3ZlcnJpZGRlbiB0b2tlbnMgYnkgSURcbiAgICAgICAgY29uc3Qgb3ZlcnJpZGRlbkJ5SWQgPSBidWlsZFRva2VuTWFwKG92ZXJyaWRkZW5Ub2tlbnMpO1xuICAgICAgICAvLyBNZXJnZTogdXNlIG92ZXJyaWRkZW4gdG9rZW4gaWYgZXhpc3RzLCBvdGhlcndpc2UgdXNlIGJhc2UgdG9rZW5cbiAgICAgICAgY29uc3QgdGhlbWVkVG9rZW5zID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFzZVRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYmFzZVRva2VuID0gYmFzZVRva2Vuc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IG92ZXJyaWRkZW4gPSBvdmVycmlkZGVuQnlJZFtiYXNlVG9rZW4uaWRdO1xuICAgICAgICAgICAgdGhlbWVkVG9rZW5zLnB1c2gob3ZlcnJpZGRlbiB8fCBiYXNlVG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIHRva2VuIGxvb2t1cCBmb3IgdGhpcyB0aGVtZVxuICAgICAgICBjb25zdCB0b2tlbkJ5SWQgPSBidWlsZFRva2VuTWFwKHRoZW1lZFRva2Vucyk7XG4gICAgICAgIC8vIEdyb3VwIHRoZW1lZCB0b2tlbnMgYnkgcGxhdGZvcm1cbiAgICAgICAgY29uc3QgZ3JvdXBlZCA9IGdyb3VwQnlQbGF0Zm9ybSh0aGVtZWRUb2tlbnMsIGdyb3Vwcyk7XG4gICAgICAgIC8vIEV4cG9ydCBwbGF0Zm9ybS1zcGVjaWZpYyB0b2tlbnMgZm9yIHRoaXMgdGhlbWVcbiAgICAgICAgY29uc3QgcGxhdGZvcm1zID0gWyd3ZWInLCAnbW9iaWxlJ107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcGxhdGZvcm1zLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF0Zm9ybSA9IHBsYXRmb3Jtc1twXTtcbiAgICAgICAgICAgIGNvbnN0IHBsYXRmb3JtVG9rZW5zID0gZ3JvdXBlZFtwbGF0Zm9ybV0gfHwgW107XG4gICAgICAgICAgICBpZiAocGxhdGZvcm1Ub2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyZWUgPSBidWlsZFRyZWUocGxhdGZvcm1Ub2tlbnMsIGdyb3VwcywgdG9rZW5CeUlkLCAwKTsgLy8gMCA9IHVzZSBmdWxsIHBhdGhcbiAgICAgICAgICAgICAgICBvdXRwdXRzLnB1c2goY3JlYXRlRmlsZShwbGF0Zm9ybSArICcvJyArIHRoZW1lTmFtZSArICcuanNvbicsIHRyZWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0cztcbn0pKTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEdST1VQSU5HIChieSBDb2xsZWN0aW9uIHByb3BlcnR5KVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gZ2V0VG9rZW5Db2xsZWN0aW9uKHRva2VuKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRva2VuLnByb3BlcnRpZXMgfHwgW107XG4gICAgY29uc3QgcHJvcGVydHlWYWx1ZXMgPSB0b2tlbi5wcm9wZXJ0eVZhbHVlcyB8fCB7fTtcbiAgICAvLyBGaW5kIHRoZSBDb2xsZWN0aW9uIHByb3BlcnR5IGRlZmluaXRpb25cbiAgICBsZXQgY29sbGVjdGlvblByb3AgPSBudWxsO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwcm9wID0gcHJvcGVydGllc1tpXTtcbiAgICAgICAgY29uc3QgbmFtZSA9IChwcm9wLm5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGNvZGVOYW1lID0gKHByb3AuY29kZU5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChuYW1lID09PSAnY29sbGVjdGlvbicgfHwgY29kZU5hbWUgPT09ICdjb2xsZWN0aW9uJykge1xuICAgICAgICAgICAgY29sbGVjdGlvblByb3AgPSBwcm9wO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFjb2xsZWN0aW9uUHJvcClcbiAgICAgICAgcmV0dXJuICd1bmtub3duJztcbiAgICAvLyBHZXQgdGhlIHZhbHVlIC0gY291bGQgYmUga2V5ZWQgYnkgaWQgb3IgY29kZU5hbWVcbiAgICBsZXQgcmF3VmFsdWUgPSBwcm9wZXJ0eVZhbHVlc1tjb2xsZWN0aW9uUHJvcC5pZF0gfHwgcHJvcGVydHlWYWx1ZXNbY29sbGVjdGlvblByb3AuY29kZU5hbWVdIHx8IHByb3BlcnR5VmFsdWVzWydjb2xsZWN0aW9uJ107XG4gICAgaWYgKCFyYXdWYWx1ZSlcbiAgICAgICAgcmV0dXJuICd1bmtub3duJztcbiAgICAvLyBJZiBpdCdzIGFuIG9iamVjdCB3aXRoIGlkLCByZXNvbHZlIGZyb20gb3B0aW9uc1xuICAgIGNvbnN0IHZhbHVlSWQgPSB0eXBlb2YgcmF3VmFsdWUgPT09ICdzdHJpbmcnID8gcmF3VmFsdWUgOiAocmF3VmFsdWUuaWQgfHwgcmF3VmFsdWUudmFsdWUpO1xuICAgIC8vIEZpbmQgbWF0Y2hpbmcgb3B0aW9uXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbGxlY3Rpb25Qcm9wLm9wdGlvbnMgfHwgW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG9wdCA9IG9wdGlvbnNbaV07XG4gICAgICAgIGlmIChvcHQuaWQgPT09IHZhbHVlSWQgfHwgb3B0LnZhbHVlID09PSB2YWx1ZUlkIHx8IG9wdC5uYW1lID09PSB2YWx1ZUlkKSB7XG4gICAgICAgICAgICByZXR1cm4gKG9wdC5uYW1lIHx8IG9wdC52YWx1ZSB8fCBvcHQuaWQgfHwgJ3Vua25vd24nKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZhbGxiYWNrOiByZXR1cm4gdGhlIHZhbHVlIGl0c2VsZiBpZiBpdCdzIGEgc3RyaW5nXG4gICAgaWYgKHR5cGVvZiB2YWx1ZUlkID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gdmFsdWVJZC50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICByZXR1cm4gJ3Vua25vd24nO1xufVxuZnVuY3Rpb24gZ3JvdXBCeVBsYXRmb3JtKHRva2VucywgZ3JvdXBzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICBjb3JlOiBbXSxcbiAgICAgICAgd2ViOiBbXSxcbiAgICAgICAgbW9iaWxlOiBbXSxcbiAgICAgICAgdW5rbm93bjogW10sXG4gICAgfTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IGdldFRva2VuQ29sbGVjdGlvbih0b2tlbik7XG4gICAgICAgIGlmIChjb2xsZWN0aW9uID09PSAnY29yZScpIHtcbiAgICAgICAgICAgIHJlc3VsdC5jb3JlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbGxlY3Rpb24gPT09ICd3ZWInKSB7XG4gICAgICAgICAgICByZXN1bHQud2ViLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbGxlY3Rpb24gPT09ICdtb2JpbGUnKSB7XG4gICAgICAgICAgICByZXN1bHQubW9iaWxlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnVua25vd24ucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRSRUUgQlVJTERJTkdcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGJ1aWxkVHJlZSh0b2tlbnMsIGdyb3VwcywgdG9rZW5CeUlkLCBza2lwTGV2ZWxzKSB7XG4gICAgY29uc3QgdHJlZSA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgICAvLyBTa2lwIHZpcnR1YWwgc2hhZG93IHRva2Vuc1xuICAgICAgICBpZiAodG9rZW4uaXNWaXJ0dWFsID09PSB0cnVlICYmIHRva2VuLnRva2VuVHlwZSA9PT0gJ1NoYWRvdycpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNraXAgdG9rZW5zIHdpdGggdW5kZXJzY29yZSBpbiBuYW1lIChpbnRlcm5hbC9wcml2YXRlIHRva2VucylcbiAgICAgICAgaWYgKHRva2VuLm5hbWUuaW5kZXhPZignXycpICE9PSAtMSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKTtcbiAgICAgICAgLy8gU2tpcCB0b2tlbnMgaW4gZ3JvdXBzIHdpdGggdW5kZXJzY29yZSBpbiBuYW1lIG9yIHBhdGhcbiAgICAgICAgaWYgKGdyb3VwKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBncm91cCBuYW1lXG4gICAgICAgICAgICBpZiAoZ3JvdXAubmFtZS5pbmRleE9mKCdfJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBncm91cCBwYXRoXG4gICAgICAgICAgICBsZXQgaGFzVW5kZXJzY29yZUluUGF0aCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBncm91cC5wYXRoLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwLnBhdGhbcF0uaW5kZXhPZignXycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBoYXNVbmRlcnNjb3JlSW5QYXRoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc1VuZGVyc2NvcmVJblBhdGgpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmdWxsR3JvdXBQYXRoID0gYnVpbGRGdWxsR3JvdXBQYXRoKGdyb3VwKTtcbiAgICAgICAgLy8gQnVpbGQgdGhlIG5lc3RlZCBwYXRoOiBza2lwIHBsYXRmb3JtIChhbmQgb3B0aW9uYWxseSBtb3JlIGxldmVscylcbiAgICAgICAgY29uc3QgcGF0aFBhcnRzID0gZnVsbEdyb3VwUGF0aC5zbGljZShza2lwTGV2ZWxzKTtcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwYXRoUGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGZ1bGxQYXRoLnB1c2goc2FmZU5hbWUocGF0aFBhcnRzW2pdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVsbFBhdGgucHVzaChzYWZlTmFtZSh0b2tlbi5uYW1lKSk7XG4gICAgICAgIGlmIChmdWxsUGF0aC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgLy8gRm9ybWF0IGFuZCBzZXQgdGhlIHRva2VuIHZhbHVlXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdFRva2VuKHRva2VuLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgICAgIHNldE5lc3RlZCh0cmVlLCBmdWxsUGF0aCwgZm9ybWF0dGVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHRyZWU7XG59XG5mdW5jdGlvbiBzZXROZXN0ZWQob2JqLCBwYXRoLCB2YWx1ZSkge1xuICAgIGxldCBjdXJyZW50ID0gb2JqO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0gcGF0aFtpXTtcbiAgICAgICAgaWYgKCFjdXJyZW50W2tleV0gfHwgdHlwZW9mIGN1cnJlbnRba2V5XSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGN1cnJlbnRba2V5XSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tleV07XG4gICAgfVxuICAgIGN1cnJlbnRbcGF0aFtwYXRoLmxlbmd0aCAtIDFdXSA9IHZhbHVlO1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVE9LRU4gRk9STUFUVElORyAoRFRDRylcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIHJlc29sdmVUb2tlblR5cGUodG9rZW4sIGdyb3Vwcykge1xuICAgIGlmIChpc0ZvbnRXZWlnaHRUb2tlbih0b2tlbiwgZ3JvdXBzKSlcbiAgICAgICAgcmV0dXJuICdmb250V2VpZ2h0JztcbiAgICBpZiAoaXNMaW5lSGVpZ2h0VG9rZW4odG9rZW4sIGdyb3VwcykpXG4gICAgICAgIHJldHVybiAnbnVtYmVyJztcbiAgICByZXR1cm4gbWFwVHlwZSh0b2tlbi50b2tlblR5cGUpO1xufVxuZnVuY3Rpb24gZm9ybWF0VG9rZW4odG9rZW4sIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0b2tlbi52YWx1ZTtcbiAgICBjb25zdCAkdHlwZSA9IHJlc29sdmVUb2tlblR5cGUodG9rZW4sIGdyb3Vwcyk7XG4gICAgLy8gQ2hlY2sgZm9yIHRvcC1sZXZlbCByZWZlcmVuY2UgRklSU1RcbiAgICBpZiAodmFsdWUgJiYgdmFsdWUucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgY29uc3QgcmVmVG9rZW4gPSB0b2tlbkJ5SWRbdmFsdWUucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICBpZiAocmVmVG9rZW4pIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJHZhbHVlOiAneycgKyBidWlsZFJlZlBhdGgocmVmVG9rZW4sIGdyb3VwcykgKyAnfScsXG4gICAgICAgICAgICAgICAgJHR5cGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZvcm1hdCByYXcgdmFsdWVcbiAgICBsZXQgZm9ybWF0dGVkO1xuICAgIGlmICgkdHlwZSA9PT0gJ2ZvbnRXZWlnaHQnKSB7XG4gICAgICAgIGZvcm1hdHRlZCA9IGV4dHJhY3ROdW1lcmljVmFsdWUodmFsdWUsIDQwMCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCR0eXBlID09PSAnbnVtYmVyJyAmJiBpc0xpbmVIZWlnaHRUb2tlbih0b2tlbiwgZ3JvdXBzKSkge1xuICAgICAgICBmb3JtYXR0ZWQgPSBleHRyYWN0TnVtZXJpY1ZhbHVlKHZhbHVlLCAxLjUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZm9ybWF0dGVkID0gZm9ybWF0VmFsdWUodmFsdWUsIHRva2VuLnRva2VuVHlwZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSB7ICR2YWx1ZTogZm9ybWF0dGVkLCAkdHlwZSB9O1xuICAgIGlmICh0b2tlbi5kZXNjcmlwdGlvbiAmJiB0b2tlbi5kZXNjcmlwdGlvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlc3VsdC4kZGVzY3JpcHRpb24gPSB0b2tlbi5kZXNjcmlwdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKHZhbHVlLCB0b2tlblR5cGUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgLy8gQ29sb3I6IGNoZWNrIGZvciBuZXN0ZWQgLmNvbG9yIG9iamVjdCBvciBkaXJlY3Qgci9nL2JcbiAgICBpZiAodmFsdWUuY29sb3IgJiYgdHlwZW9mIHZhbHVlLmNvbG9yLnIgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIGNvbG9yIGl0c2VsZiBpcyBhIHJlZmVyZW5jZVxuICAgICAgICBpZiAodmFsdWUuY29sb3IucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICBpZiAocmVmKVxuICAgICAgICAgICAgICAgIHJldHVybiAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nO1xuICAgICAgICB9XG4gICAgICAgIC8vIFVzZSBmb3JtYXRDb2xvclZhbHVlIHRvIGhhbmRsZSBhbHBoYSBwcm9wZXJseVxuICAgICAgICByZXR1cm4gZm9ybWF0Q29sb3JWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUuciA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHZhbHVlLmcgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIERpcmVjdCByL2cvYiAoY2hlY2sgZm9yIGFscGhhIHRvbylcbiAgICAgICAgY29uc3QgYWxwaGEgPSB0eXBlb2YgdmFsdWUuYSA9PT0gJ251bWJlcicgPyB2YWx1ZS5hIDogMTtcbiAgICAgICAgaWYgKGFscGhhIDwgMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRvSGV4V2l0aEFscGhhKHZhbHVlLnIsIHZhbHVlLmcsIHZhbHVlLmIsIGFscGhhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9IZXgodmFsdWUuciwgdmFsdWUuZywgdmFsdWUuYik7XG4gICAgfVxuICAgIGlmICh2YWx1ZS5oZXgpIHtcbiAgICAgICAgcmV0dXJuICcjJyArIHZhbHVlLmhleDtcbiAgICB9XG4gICAgLy8gRGltZW5zaW9uL01lYXN1cmU6IGhhcyAubWVhc3VyZSBhbmQgLnVuaXRcbiAgICBpZiAodHlwZW9mIHZhbHVlLm1lYXN1cmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUubWVhc3VyZSxcbiAgICAgICAgICAgIHVuaXQ6IGZvcm1hdFVuaXQodmFsdWUudW5pdClcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gVGV4dC9TdHJpbmc6IGhhcyAudGV4dFxuICAgIGlmICh0eXBlb2YgdmFsdWUudGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRleHQ7XG4gICAgfVxuICAgIC8vIEZvbnQ6IGhhcyAuZmFtaWx5IChsZWdhY3kgY29tYmluZWQgZm9udCt3ZWlnaHQgdG9rZW4pXG4gICAgLy8gTWFwcyB0byBjdXN0b20gJ2ZvbnQnIHR5cGUgdG8gcHJlc2VydmUgYm90aCBmYW1pbHkgYW5kIHdlaWdodFxuICAgIGlmICh0eXBlb2YgdmFsdWUuZmFtaWx5ID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmFtaWx5OiB2YWx1ZS5mYW1pbHksXG4gICAgICAgICAgICB3ZWlnaHQ6IHZhbHVlLnN1YmZhbWlseSB8fCB2YWx1ZS53ZWlnaHQgfHwgJ1JlZ3VsYXInLFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBUeXBvZ3JhcGh5OiBoYXMgLmZvbnQgYW5kIC5mb250U2l6ZVxuICAgIGlmICh2YWx1ZS5mb250IHx8IHZhbHVlLmZvbnRTaXplKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRUeXBvZ3JhcGh5KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIFNoYWRvdzogU3VwZXJub3ZhIHByb3ZpZGVzIGFycmF5IHdpdGggc2hhZG93IG9iamVjdChzKVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPiAwICYmIHZhbHVlWzBdLnggIT09IHVuZGVmaW5lZCAmJiB2YWx1ZVswXS55ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdFNoYWRvd0FycmF5KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIEdyYWRpZW50OiBTdXBlcm5vdmEgcHJvdmlkZXMgYXJyYXkgd2l0aCBncmFkaWVudCBvYmplY3QocylcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID4gMCAmJiB2YWx1ZVswXS5zdG9wcykge1xuICAgICAgICByZXR1cm4gZm9ybWF0R3JhZGllbnQodmFsdWVbMF0sIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICB9XG4gICAgLy8gQm9yZGVyOiBoYXMgLmNvbG9yIGFuZCAud2lkdGhcbiAgICBpZiAodmFsdWUuY29sb3IgJiYgdmFsdWUud2lkdGgpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdEJvcmRlcih2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIH1cbiAgICAvLyBSYWRpdXM6IGhhcyAucmFkaXVzIG9yIGNvcm5lciB2YWx1ZXNcbiAgICBpZiAodmFsdWUucmFkaXVzIHx8IHZhbHVlLnRvcExlZnQgfHwgdmFsdWUudG9wUmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdFJhZGl1cyh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIH1cbiAgICAvLyBGYWxsYmFjazogcmV0dXJuIGFzLWlzXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gZXh0cmFjdE51bWVyaWNWYWx1ZSh2YWx1ZSwgZmFsbGJhY2spIHtcbiAgICB2YXIgX2E7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgbWVhc3VyZSA9IChfYSA9IHZhbHVlLm1lYXN1cmUpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IHZhbHVlLnZhbHVlO1xuICAgICAgICBpZiAodHlwZW9mIG1lYXN1cmUgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIG1lYXN1cmU7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgcmV0dXJuIGZhbGxiYWNrO1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gQ09NUExFWCBWQUxVRSBGT1JNQVRURVJTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBmb3JtYXRUeXBvZ3JhcGh5KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGlmICh2YWx1ZS5mb250KSB7XG4gICAgICAgIGlmICh2YWx1ZS5mb250LnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbdmFsdWUuZm9udC5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQuZm9udEZhbWlseSA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiB2YWx1ZS5mb250LmZhbWlseTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5mb250RmFtaWx5ID0gdmFsdWUuZm9udC5mYW1pbHkgfHwgJyc7XG4gICAgICAgICAgICByZXN1bHQuZm9udFdlaWdodCA9IHZhbHVlLmZvbnQuc3ViZmFtaWx5IHx8ICdSZWd1bGFyJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodmFsdWUuZm9udFNpemUpIHtcbiAgICAgICAgaWYgKHZhbHVlLmZvbnRTaXplLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbdmFsdWUuZm9udFNpemUucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgcmVzdWx0LmZvbnRTaXplID0gcmVmID8gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JyA6IGZvcm1hdE1lYXN1cmUodmFsdWUuZm9udFNpemUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmZvbnRTaXplID0gZm9ybWF0TWVhc3VyZSh2YWx1ZS5mb250U2l6ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbHVlLmxpbmVIZWlnaHQpIHtcbiAgICAgICAgaWYgKHZhbHVlLmxpbmVIZWlnaHQucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5saW5lSGVpZ2h0LnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIHJlc3VsdC5saW5lSGVpZ2h0ID0gcmVmID8gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JyA6IGZvcm1hdE1lYXN1cmUodmFsdWUubGluZUhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQubGluZUhlaWdodCA9IGZvcm1hdE1lYXN1cmUodmFsdWUubGluZUhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbHVlLmxldHRlclNwYWNpbmcpIHtcbiAgICAgICAgcmVzdWx0LmxldHRlclNwYWNpbmcgPSBmb3JtYXRNZWFzdXJlKHZhbHVlLmxldHRlclNwYWNpbmcpO1xuICAgIH1cbiAgICBpZiAodmFsdWUudGV4dENhc2UpXG4gICAgICAgIHJlc3VsdC50ZXh0VHJhbnNmb3JtID0gdmFsdWUudGV4dENhc2UudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodmFsdWUudGV4dERlY29yYXRpb24pXG4gICAgICAgIHJlc3VsdC50ZXh0RGVjb3JhdGlvbiA9IHZhbHVlLnRleHREZWNvcmF0aW9uLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGZvcm1hdFNoYWRvdyh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgIG9mZnNldFg6IGZvcm1hdE1lYXN1cmUodmFsdWUueCksXG4gICAgICAgIG9mZnNldFk6IGZvcm1hdE1lYXN1cmUodmFsdWUueSksXG4gICAgICAgIGJsdXI6IGZvcm1hdE1lYXN1cmUodmFsdWUucmFkaXVzKSxcbiAgICAgICAgc3ByZWFkOiBmb3JtYXRNZWFzdXJlKHZhbHVlLnNwcmVhZCksXG4gICAgfTtcbiAgICAvLyBHZXQgYWxwaGEgZnJvbSBzaGFkb3cncyBvcGFjaXR5IHByb3BlcnR5IChTdXBlcm5vdmEgc3RvcmVzIG9wYWNpdHkgYXQgc2hhZG93IGxldmVsLCBub3QgY29sb3IgbGV2ZWwpXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2RldmVsb3BlcnMuc3VwZXJub3ZhLmlvL2xhdGVzdC9zZGstcmVmZXJlbmNlL2RhdGEtbW9kZWwvdG9rZW5zL3Rva2VuLXZhbHVlcy1IbmIzaWV1NSNzZWN0aW9uLXNoYWRvd3Rva2VudmFsdWUtNjVcbiAgICBsZXQgYWxwaGEgPSAxO1xuICAgIGlmICh2YWx1ZS5vcGFjaXR5ICYmIHR5cGVvZiB2YWx1ZS5vcGFjaXR5Lm1lYXN1cmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGFscGhhID0gdmFsdWUub3BhY2l0eS5tZWFzdXJlO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUub3BhY2l0eSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgYWxwaGEgPSB2YWx1ZS5vcGFjaXR5O1xuICAgIH1cbiAgICAvLyBIYW5kbGUgY29sb3Igd2l0aCBmdWxsIERUQ0cgZm9ybWF0XG4gICAgaWYgKHZhbHVlLmNvbG9yKSB7XG4gICAgICAgIC8vIEV4dHJhY3QgY29sb3IgZnJvbSBuZXN0ZWQgc3RydWN0dXJlIChTdXBlcm5vdmEgaGFzIGNvbG9yLmNvbG9yKVxuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IHZhbHVlLmNvbG9yO1xuICAgICAgICBpZiAoY29sb3JWYWx1ZS5jb2xvcikge1xuICAgICAgICAgICAgY29sb3JWYWx1ZSA9IGNvbG9yVmFsdWUuY29sb3I7IC8vIFVud3JhcCBuZXN0ZWQgY29sb3JcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3IgY29sb3IgcmVmZXJlbmNlXG4gICAgICAgIGlmIChjb2xvclZhbHVlLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbY29sb3JWYWx1ZS5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBGb3JtYXQgY29sb3IgdG8gZnVsbCBEVENHIGNvbG9yIG9iamVjdCAobm90IGhleCBzdHJpbmcpXG4gICAgICAgIGlmICghcmVzdWx0LmNvbG9yICYmIGNvbG9yVmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBjb2xvclZhbHVlLnIgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IGcgPSBjb2xvclZhbHVlLmcgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IGIgPSBjb2xvclZhbHVlLmIgfHwgMDtcbiAgICAgICAgICAgIC8vIERUQ0cgcmVxdWlyZXMgUkdCIGluIDAtMSByYW5nZSwgU3VwZXJub3ZhIHByb3ZpZGVzIDAtMjU1XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSB7XG4gICAgICAgICAgICAgICAgY29sb3JTcGFjZTogJ3NyZ2InLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtyIC8gMjU1LCBnIC8gMjU1LCBiIC8gMjU1XSxcbiAgICAgICAgICAgICAgICBhbHBoYTogYWxwaGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gSGFuZGxlIGluc2V0IHByb3BlcnR5IChmcm9tIFN1cGVybm92YSdzIHR5cGUgZmllbGQpXG4gICAgaWYgKHZhbHVlLnR5cGUpIHtcbiAgICAgICAgY29uc3QgdHlwZVN0ciA9IFN0cmluZyh2YWx1ZS50eXBlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAodHlwZVN0ciA9PT0gJ2lubmVyJyB8fCB0eXBlU3RyID09PSAnaW5zZXQnKSB7XG4gICAgICAgICAgICByZXN1bHQuaW5zZXQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIERlZmF1bHQgaXMgZmFsc2UgKGRyb3Agc2hhZG93KSwgc28gbm8gbmVlZCB0byBzZXQgZXhwbGljaXRseVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZm9ybWF0U2hhZG93QXJyYXkodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3Qgc2hhZG93cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc2hhZG93ID0gdmFsdWVbaV07XG4gICAgICAgIHNoYWRvd3MucHVzaChmb3JtYXRTaGFkb3coc2hhZG93LCB0b2tlbkJ5SWQsIGdyb3VwcykpO1xuICAgIH1cbiAgICAvLyBSZXR1cm4gYXJyYXkgZGlyZWN0bHkgKERUQ0cgc3VwcG9ydHMgYm90aCBzaW5nbGUgb2JqZWN0IGFuZCBhcnJheXMpXG4gICAgcmV0dXJuIHNoYWRvd3M7XG59XG5mdW5jdGlvbiBmb3JtYXRHcmFkaWVudCh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBjb25zdCBzdG9wcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUuc3RvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc3RvcCA9IHZhbHVlLnN0b3BzW2ldO1xuICAgICAgICAvLyBFeHRyYWN0IGNvbG9yIGZyb20gbmVzdGVkIHN0cnVjdHVyZSAoU3VwZXJub3ZhIGhhcyBjb2xvci5jb2xvcilcbiAgICAgICAgbGV0IGNvbG9yVmFsdWUgPSBzdG9wLmNvbG9yO1xuICAgICAgICBpZiAoY29sb3JWYWx1ZSAmJiBjb2xvclZhbHVlLmNvbG9yKSB7XG4gICAgICAgICAgICBjb2xvclZhbHVlID0gY29sb3JWYWx1ZS5jb2xvcjsgLy8gVW53cmFwIG5lc3RlZCBjb2xvclxuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGZvciBjb2xvciByZWZlcmVuY2VcbiAgICAgICAgbGV0IGZvcm1hdHRlZENvbG9yO1xuICAgICAgICBpZiAoY29sb3JWYWx1ZSAmJiBjb2xvclZhbHVlLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbY29sb3JWYWx1ZS5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICBmb3JtYXR0ZWRDb2xvciA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZvcm1hdCBjb2xvciB0byBmdWxsIERUQ0cgY29sb3Igb2JqZWN0IChub3QgaGV4IHN0cmluZylcbiAgICAgICAgaWYgKCFmb3JtYXR0ZWRDb2xvciAmJiBjb2xvclZhbHVlKSB7XG4gICAgICAgICAgICBjb25zdCByID0gY29sb3JWYWx1ZS5yIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBnID0gY29sb3JWYWx1ZS5nIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBiID0gY29sb3JWYWx1ZS5iIHx8IDA7XG4gICAgICAgICAgICAvLyBHZXQgYWxwaGEgZnJvbSBvcGFjaXR5IGlmIHByZXNlbnRcbiAgICAgICAgICAgIGxldCBhbHBoYSA9IDE7XG4gICAgICAgICAgICBpZiAoc3RvcC5jb2xvciAmJiBzdG9wLmNvbG9yLm9wYWNpdHkgJiYgdHlwZW9mIHN0b3AuY29sb3Iub3BhY2l0eS5tZWFzdXJlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGFscGhhID0gc3RvcC5jb2xvci5vcGFjaXR5Lm1lYXN1cmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEVENHIHJlcXVpcmVzIFJHQiBpbiAwLTEgcmFuZ2UsIFN1cGVybm92YSBwcm92aWRlcyAwLTI1NVxuICAgICAgICAgICAgZm9ybWF0dGVkQ29sb3IgPSB7XG4gICAgICAgICAgICAgICAgY29sb3JTcGFjZTogJ3NyZ2InLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtyIC8gMjU1LCBnIC8gMjU1LCBiIC8gMjU1XSxcbiAgICAgICAgICAgICAgICBhbHBoYTogYWxwaGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgc3RvcHMucHVzaCh7XG4gICAgICAgICAgICBjb2xvcjogZm9ybWF0dGVkQ29sb3IgfHwgeyBjb2xvclNwYWNlOiAnc3JnYicsIGNvbXBvbmVudHM6IFswLCAwLCAwXSB9LFxuICAgICAgICAgICAgcG9zaXRpb246IHN0b3AucG9zaXRpb24gfHwgMFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gUmV0dXJuIGFycmF5IGRpcmVjdGx5IChEVENHIGNvbXBsaWFudCkgLSBub3Qgd3JhcHBlZCBpbiBvYmplY3RcbiAgICByZXR1cm4gc3RvcHM7XG59XG5mdW5jdGlvbiBmb3JtYXRCb3JkZXIodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICB3aWR0aDogZm9ybWF0TWVhc3VyZSh2YWx1ZS53aWR0aCksXG4gICAgICAgIHN0eWxlOiAnc29saWQnLFxuICAgIH07XG4gICAgaWYgKHZhbHVlLmNvbG9yKSB7XG4gICAgICAgIGlmICh2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmNvbG9yLnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIHJlc3VsdC5jb2xvciA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRDb2xvclZhbHVlKHZhbHVlLmNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5jb2xvciA9IGZvcm1hdENvbG9yVmFsdWUodmFsdWUuY29sb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBmb3JtYXRSYWRpdXModmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgLy8gU2luZ2xlIHJhZGl1c1xuICAgIGlmICh2YWx1ZS5yYWRpdXMgJiYgIXZhbHVlLnRvcExlZnQpIHtcbiAgICAgICAgaWYgKHZhbHVlLnJhZGl1cy5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLnJhZGl1cy5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXR1cm4gcmVmID8gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JyA6IGZvcm1hdE1lYXN1cmUodmFsdWUucmFkaXVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm9ybWF0TWVhc3VyZSh2YWx1ZS5yYWRpdXMpO1xuICAgIH1cbiAgICAvLyBDb3JuZXIgcmFkaWlcbiAgICByZXR1cm4ge1xuICAgICAgICB0b3BMZWZ0OiBmb3JtYXRNZWFzdXJlKHZhbHVlLnRvcExlZnQpLFxuICAgICAgICB0b3BSaWdodDogZm9ybWF0TWVhc3VyZSh2YWx1ZS50b3BSaWdodCksXG4gICAgICAgIGJvdHRvbUxlZnQ6IGZvcm1hdE1lYXN1cmUodmFsdWUuYm90dG9tTGVmdCksXG4gICAgICAgIGJvdHRvbVJpZ2h0OiBmb3JtYXRNZWFzdXJlKHZhbHVlLmJvdHRvbVJpZ2h0KSxcbiAgICB9O1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUFJJTUlUSVZFIEZPUk1BVFRFUlNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGZvcm1hdE1lYXN1cmUodmFsdWUpIHtcbiAgICAvLyBJZiBpdCdzIGFscmVhZHkgYSBkaW1lbnNpb24gb2JqZWN0IHdpdGggdmFsdWUvdW5pdCwgbm9ybWFsaXplIGl0XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUudmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZS51bml0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZS52YWx1ZSxcbiAgICAgICAgICAgIHVuaXQ6IGZvcm1hdFVuaXQodmFsdWUudW5pdClcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gSWYgaXQncyBhIG51bWJlciwgY3JlYXRlIGRpbWVuc2lvbiBvYmplY3RcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgdW5pdDogJ3B4J1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBJZiBpdCBoYXMgbWVhc3VyZS91bml0IChTdXBlcm5vdmEgZm9ybWF0KSwgY29udmVydFxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLm1lYXN1cmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLm1lYXN1cmUsXG4gICAgICAgICAgICB1bml0OiBmb3JtYXRVbml0KHZhbHVlLnVuaXQpXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIEZhbGxiYWNrIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IChzdHJpbmcgdmFsdWVzKVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgLy8gRGVmYXVsdFxuICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiAwLFxuICAgICAgICB1bml0OiAncHgnXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGZvcm1hdENvbG9yVmFsdWUodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKVxuICAgICAgICByZXR1cm4gJyMwMDAwMDAnO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgaWYgKHZhbHVlLmhleClcbiAgICAgICAgcmV0dXJuICcjJyArIHZhbHVlLmhleDtcbiAgICAvLyBHZXQgUkdCIHZhbHVlc1xuICAgIGxldCByID0gMCwgZyA9IDAsIGIgPSAwO1xuICAgIGlmICh2YWx1ZS5jb2xvciAmJiB0eXBlb2YgdmFsdWUuY29sb3IuciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgciA9IHZhbHVlLmNvbG9yLnI7XG4gICAgICAgIGcgPSB2YWx1ZS5jb2xvci5nO1xuICAgICAgICBiID0gdmFsdWUuY29sb3IuYjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLnIgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHIgPSB2YWx1ZS5yO1xuICAgICAgICBnID0gdmFsdWUuZztcbiAgICAgICAgYiA9IHZhbHVlLmI7XG4gICAgfVxuICAgIC8vIEdldCBhbHBoYS9vcGFjaXR5ICgwLTEpXG4gICAgbGV0IGFscGhhID0gMTtcbiAgICBpZiAodmFsdWUub3BhY2l0eSAmJiB0eXBlb2YgdmFsdWUub3BhY2l0eS5tZWFzdXJlID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbHBoYSA9IHZhbHVlLm9wYWNpdHkubWVhc3VyZTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLmEgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGFscGhhID0gdmFsdWUuYTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLmFscGhhID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbHBoYSA9IHZhbHVlLmFscGhhO1xuICAgIH1cbiAgICAvLyBPdXRwdXQgd2l0aCBhbHBoYSBpZiBub3QgZnVsbHkgb3BhcXVlXG4gICAgaWYgKGFscGhhIDwgMSkge1xuICAgICAgICByZXR1cm4gdG9IZXhXaXRoQWxwaGEociwgZywgYiwgYWxwaGEpO1xuICAgIH1cbiAgICByZXR1cm4gdG9IZXgociwgZywgYik7XG59XG5mdW5jdGlvbiB0b0hleChyLCBnLCBiKSB7XG4gICAgY29uc3QgcmggPSBNYXRoLnJvdW5kKHIpLnRvU3RyaW5nKDE2KTtcbiAgICBjb25zdCBnaCA9IE1hdGgucm91bmQoZykudG9TdHJpbmcoMTYpO1xuICAgIGNvbnN0IGJoID0gTWF0aC5yb3VuZChiKS50b1N0cmluZygxNik7XG4gICAgcmV0dXJuICcjJyArIHBhZDIocmgpICsgcGFkMihnaCkgKyBwYWQyKGJoKTtcbn1cbmZ1bmN0aW9uIHRvSGV4V2l0aEFscGhhKHIsIGcsIGIsIGEpIHtcbiAgICByZXR1cm4gdG9IZXgociwgZywgYikgKyBwYWQyKE1hdGgucm91bmQoYSAqIDI1NSkudG9TdHJpbmcoMTYpKTtcbn1cbmZ1bmN0aW9uIHBhZDIocykge1xuICAgIHJldHVybiBzLmxlbmd0aCA9PT0gMSA/ICcwJyArIHMgOiBzO1xufVxuZnVuY3Rpb24gZm9ybWF0VW5pdCh1bml0KSB7XG4gICAgaWYgKCF1bml0KVxuICAgICAgICByZXR1cm4gJ3B4JztcbiAgICBjb25zdCB1ID0gU3RyaW5nKHVuaXQpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHUgPT09ICdwaXhlbHMnIHx8IHUgPT09ICdweCcpXG4gICAgICAgIHJldHVybiAncHgnO1xuICAgIGlmICh1ID09PSAncGVyY2VudCcgfHwgdSA9PT0gJyUnKVxuICAgICAgICByZXR1cm4gJyUnO1xuICAgIGlmICh1ID09PSAnZW1zJyB8fCB1ID09PSAnZW0nKVxuICAgICAgICByZXR1cm4gJ2VtJztcbiAgICBpZiAodSA9PT0gJ3BvaW50cycgfHwgdSA9PT0gJ3B0JylcbiAgICAgICAgcmV0dXJuICdwdCc7XG4gICAgaWYgKHUgPT09ICdyYXcnKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgcmV0dXJuIHU7XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBSRUZFUkVOQ0UgUEFUSCBCVUlMRElOR1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gYnVpbGRSZWZQYXRoKHRva2VuLCBncm91cHMpIHtcbiAgICBjb25zdCBncm91cCA9IGZpbmRHcm91cEZvclRva2VuKHRva2VuLCBncm91cHMpO1xuICAgIGNvbnN0IGZ1bGxHcm91cFBhdGggPSBidWlsZEZ1bGxHcm91cFBhdGgoZ3JvdXApO1xuICAgIGNvbnN0IHBhcnRzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmdWxsR3JvdXBQYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcnRzLnB1c2goc2FmZU5hbWUoZnVsbEdyb3VwUGF0aFtpXSkpO1xuICAgIH1cbiAgICBwYXJ0cy5wdXNoKHNhZmVOYW1lKHRva2VuLm5hbWUpKTtcbiAgICByZXR1cm4gcGFydHMuam9pbignLicpO1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVFlQRSBNQVBQSU5HXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jb25zdCBEVENHX1RZUEVfTUFQID0ge1xuICAgIC8vIFN0YW5kYXJkIHR5cGVzXG4gICAgY29sb3I6ICdjb2xvcicsXG4gICAgdHlwb2dyYXBoeTogJ3R5cG9ncmFwaHknLFxuICAgIGZvbnRmYW1pbHk6ICdmb250RmFtaWx5JyxcbiAgICBmb250d2VpZ2h0OiAnZm9udFdlaWdodCcsXG4gICAgc2hhZG93OiAnc2hhZG93JyxcbiAgICBib3JkZXI6ICdib3JkZXInLFxuICAgIGdyYWRpZW50OiAnZ3JhZGllbnQnLFxuICAgIGR1cmF0aW9uOiAnZHVyYXRpb24nLFxuICAgIC8vIERpbWVuc2lvbi1saWtlIHR5cGVzXG4gICAgZGltZW5zaW9uOiAnZGltZW5zaW9uJyxcbiAgICBtZWFzdXJlOiAnZGltZW5zaW9uJyxcbiAgICBzaXplOiAnZGltZW5zaW9uJyxcbiAgICBzcGFjZTogJ2RpbWVuc2lvbicsXG4gICAgZm9udHNpemU6ICdkaW1lbnNpb24nLFxuICAgIGxldHRlcnNwYWNpbmc6ICdkaW1lbnNpb24nLFxuICAgIHBhcmFncmFwaHNwYWNpbmc6ICdkaW1lbnNpb24nLFxuICAgIGJvcmRlcndpZHRoOiAnZGltZW5zaW9uJyxcbiAgICByYWRpdXM6ICdkaW1lbnNpb24nLFxuICAgIGJvcmRlcnJhZGl1czogJ2RpbWVuc2lvbicsXG4gICAgYmx1cjogJ2RpbWVuc2lvbicsXG4gICAgLy8gTnVtZXJpYyB0eXBlc1xuICAgIGxpbmVoZWlnaHQ6ICdudW1iZXInLFxuICAgIG9wYWNpdHk6ICdudW1iZXInLFxuICAgIHppbmRleDogJ251bWJlcicsXG4gICAgLy8gU3RyaW5nIHR5cGVzXG4gICAgc3RyaW5nOiAnc3RyaW5nJyxcbiAgICB0ZXh0OiAnc3RyaW5nJyxcbiAgICBwcm9kdWN0Y29weTogJ3N0cmluZycsXG4gICAgdGV4dGNhc2U6ICdzdHJpbmcnLFxuICAgIHRleHRkZWNvcmF0aW9uOiAnc3RyaW5nJyxcbiAgICB2aXNpYmlsaXR5OiAnc3RyaW5nJyxcbiAgICAvLyBMZWdhY3lcbiAgICBmb250OiAnZm9udCcsXG59O1xuZnVuY3Rpb24gbWFwVHlwZSh0b2tlblR5cGUpIHtcbiAgICByZXR1cm4gRFRDR19UWVBFX01BUFtTdHJpbmcodG9rZW5UeXBlKS50b0xvd2VyQ2FzZSgpXSB8fCBTdHJpbmcodG9rZW5UeXBlKS50b0xvd2VyQ2FzZSgpO1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVVRJTElUSUVTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBzYWZlTmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIFN0cmluZyhuYW1lIHx8ICcnKS5yZXBsYWNlKC9cXFcrL2csICctJykudG9Mb3dlckNhc2UoKTtcbn1cbmZ1bmN0aW9uIGJ1aWxkVG9rZW5NYXAodG9rZW5zKSB7XG4gICAgY29uc3QgbWFwID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbWFwW3Rva2Vuc1tpXS5pZF0gPSB0b2tlbnNbaV07XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5mdW5jdGlvbiBidWlsZEZ1bGxHcm91cFBhdGgoZ3JvdXApIHtcbiAgICBpZiAoIWdyb3VwKVxuICAgICAgICByZXR1cm4gW107XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cC5wYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGdyb3VwLnBhdGhbaV0pO1xuICAgIH1cbiAgICBpZiAoZ3JvdXAubmFtZSAmJiAhZ3JvdXAuaXNSb290KSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGdyb3VwLm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZmluZEdyb3VwRm9yVG9rZW4odG9rZW4sIGdyb3Vwcykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ3JvdXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGcgPSBncm91cHNbaV07XG4gICAgICAgIGlmIChnLnRva2VuSWRzICYmIGcudG9rZW5JZHMuaW5kZXhPZih0b2tlbi5pZCkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gZztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIGlzRm9udFdlaWdodFRva2VuKHRva2VuLCBncm91cHMpIHtcbiAgICB2YXIgX2E7XG4gICAgLy8gT25seSBjaGVjayBkaW1lbnNpb24tdHlwZSB0b2tlbnMgKHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbilcbiAgICBjb25zdCB0eXBlID0gU3RyaW5nKHRva2VuLnRva2VuVHlwZSkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodHlwZSAhPT0gJ2RpbWVuc2lvbicgJiYgdHlwZSAhPT0gJ21lYXN1cmUnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQ2hlY2sgZ3JvdXAgcGF0aCBmb3IgJ2ZvbnQtd2VpZ2h0J1xuICAgIGNvbnN0IGdyb3VwID0gZmluZEdyb3VwRm9yVG9rZW4odG9rZW4sIGdyb3Vwcyk7XG4gICAgY29uc3QgZnVsbFBhdGggPSBncm91cCA/IFsuLi5ncm91cC5wYXRoLCBncm91cC5uYW1lXS5qb2luKCcuJykudG9Mb3dlckNhc2UoKSA6ICcnO1xuICAgIGNvbnN0IHRva2VuTmFtZSA9IHRva2VuLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBoYXNGb250V2VpZ2h0SW5QYXRoID0gZnVsbFBhdGguaW5jbHVkZXMoJ2ZvbnQtd2VpZ2h0JykgfHxcbiAgICAgICAgZnVsbFBhdGguaW5jbHVkZXMoJ2ZvbnR3ZWlnaHQnKTtcbiAgICBjb25zdCBoYXNGb250V2VpZ2h0SW5OYW1lID0gdG9rZW5OYW1lLmluY2x1ZGVzKCdmb250LXdlaWdodCcpIHx8XG4gICAgICAgIHRva2VuTmFtZS5pbmNsdWRlcygnZm9udHdlaWdodCcpO1xuICAgIC8vIE11c3QgaGF2ZSBmb250LXdlaWdodCBpbiBwYXRoIG9yIG5hbWVcbiAgICBpZiAoIWhhc0ZvbnRXZWlnaHRJblBhdGggJiYgIWhhc0ZvbnRXZWlnaHRJbk5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBWYWxpZGF0ZSB2YWx1ZSBpcyBpbiB2YWxpZCBmb250LXdlaWdodCByYW5nZSAoMTAwLTkwMClcbiAgICBjb25zdCB2YWx1ZSA9IHRva2VuLnZhbHVlO1xuICAgIGNvbnN0IG1lYXN1cmUgPSAoX2EgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogdmFsdWUubWVhc3VyZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHZhbHVlLnZhbHVlO1xuICAgIGlmICh0eXBlb2YgbWVhc3VyZSA9PT0gJ251bWJlcicgJiYgbWVhc3VyZSA+PSAxMDAgJiYgbWVhc3VyZSA8PSA5MDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGlzTGluZUhlaWdodFRva2VuKHRva2VuLCBncm91cHMpIHtcbiAgICB2YXIgX2E7XG4gICAgLy8gQ2hlY2sgZGltZW5zaW9uLXR5cGUgdG9rZW5zIEFORCBMaW5lSGVpZ2h0IHR5cGVcbiAgICBjb25zdCB0eXBlID0gU3RyaW5nKHRva2VuLnRva2VuVHlwZSkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodHlwZSAhPT0gJ2RpbWVuc2lvbicgJiYgdHlwZSAhPT0gJ21lYXN1cmUnICYmIHR5cGUgIT09ICdsaW5laGVpZ2h0Jykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIENoZWNrIGdyb3VwIHBhdGggZm9yICdsaW5lLWhlaWdodCdcbiAgICBjb25zdCBncm91cCA9IGZpbmRHcm91cEZvclRva2VuKHRva2VuLCBncm91cHMpO1xuICAgIGNvbnN0IGZ1bGxQYXRoID0gZ3JvdXAgPyBbLi4uZ3JvdXAucGF0aCwgZ3JvdXAubmFtZV0uam9pbignLicpLnRvTG93ZXJDYXNlKCkgOiAnJztcbiAgICBjb25zdCB0b2tlbk5hbWUgPSB0b2tlbi5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgaGFzTGluZUhlaWdodEluUGF0aCA9IGZ1bGxQYXRoLmluY2x1ZGVzKCdsaW5lLWhlaWdodCcpIHx8XG4gICAgICAgIGZ1bGxQYXRoLmluY2x1ZGVzKCdsaW5laGVpZ2h0Jyk7XG4gICAgY29uc3QgaGFzTGluZUhlaWdodEluTmFtZSA9IHRva2VuTmFtZS5pbmNsdWRlcygnbGluZS1oZWlnaHQnKSB8fFxuICAgICAgICB0b2tlbk5hbWUuaW5jbHVkZXMoJ2xpbmVoZWlnaHQnKTtcbiAgICAvLyBNdXN0IGhhdmUgbGluZS1oZWlnaHQgaW4gcGF0aCBvciBuYW1lXG4gICAgaWYgKCFoYXNMaW5lSGVpZ2h0SW5QYXRoICYmICFoYXNMaW5lSGVpZ2h0SW5OYW1lKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gVmFsaWRhdGUgdmFsdWUgaXMgaW4gdmFsaWQgbGluZS1oZWlnaHQgcmFuZ2UgKHR5cGljYWxseSAwLTMpXG4gICAgY29uc3QgdmFsdWUgPSB0b2tlbi52YWx1ZTtcbiAgICBjb25zdCBtZWFzdXJlID0gKF9hID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHZhbHVlLm1lYXN1cmUpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB2b2lkIDAgPyB2b2lkIDAgOiB2YWx1ZS52YWx1ZTtcbiAgICBpZiAodHlwZW9mIG1lYXN1cmUgPT09ICdudW1iZXInICYmIG1lYXN1cmUgPj0gMCAmJiBtZWFzdXJlIDw9IDEwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiB0b0FycmF5KGlucHV0KSB7XG4gICAgaWYgKCFpbnB1dClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSlcbiAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnICYmIHR5cGVvZiBpbnB1dC5sZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnN0IGFyciA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcnIucHVzaChpbnB1dFtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRklMRSBPVVRQVVRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGNyZWF0ZUZpbGUoZmlsZVBhdGgsIGNvbnRlbnQpIHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gZmlsZVBhdGgucmVwbGFjZSgvXlxcLysvLCAnJyk7XG4gICAgY29uc3QgcGFydHMgPSBub3JtYWxpemVkLnNwbGl0KCcvJyk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBwYXJ0cy5wb3AoKSB8fCAnb3V0cHV0Lmpzb24nO1xuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhcnRzLmpvaW4oJy8nKTtcbiAgICBjb25zdCBqc29uQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQsIG51bGwsIDIpO1xuICAgIC8vIFRyeSBGaWxlSGVscGVyIGZpcnN0LCBmYWxsYmFjayB0byBwbGFpbiBvYmplY3RcbiAgICBpZiAodHlwZW9mIEZpbGVIZWxwZXIgIT09ICd1bmRlZmluZWQnICYmIEZpbGVIZWxwZXIuY3JlYXRlVGV4dEZpbGUpIHtcbiAgICAgICAgcmV0dXJuIEZpbGVIZWxwZXIuY3JlYXRlVGV4dEZpbGUoeyByZWxhdGl2ZVBhdGgsIGZpbGVOYW1lLCBjb250ZW50OiBqc29uQ29udGVudCB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGF0aDogcmVsYXRpdmVQYXRoLmxlbmd0aCA+IDAgPyByZWxhdGl2ZVBhdGggOiAnLicsXG4gICAgICAgIG5hbWU6IGZpbGVOYW1lLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGNvbnRlbnQ6IGpzb25Db250ZW50LFxuICAgIH07XG59XG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IHt9O1xuX193ZWJwYWNrX21vZHVsZXNfX1tcIi4vc3JjL2luZGV4LnRzXCJdLmNhbGwoX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=