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
    const baseTokenById = {};
    for (let i = 0; i < baseTokens.length; i++) {
        baseTokenById[baseTokens[i].id] = baseTokens[i];
    }
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
        const overriddenById = {};
        for (let i = 0; i < overriddenTokens.length; i++) {
            overriddenById[overriddenTokens[i].id] = overriddenTokens[i];
        }
        // Merge: use overridden token if exists, otherwise use base token
        const themedTokens = [];
        for (let i = 0; i < baseTokens.length; i++) {
            const baseToken = baseTokens[i];
            const overridden = overriddenById[baseToken.id];
            themedTokens.push(overridden || baseToken);
        }
        // Build token lookup for this theme
        const tokenById = {};
        for (let i = 0; i < themedTokens.length; i++) {
            tokenById[themedTokens[i].id] = themedTokens[i];
        }
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
        // Build full group path: group.path + group.name
        // e.g., path=["core"], name="border-radius" -> ["core", "border-radius"]
        const groupPath = group ? group.path : [];
        const groupName = group ? group.name : '';
        const fullGroupPath = [];
        for (let j = 0; j < groupPath.length; j++) {
            fullGroupPath.push(groupPath[j]);
        }
        if (groupName && !(group === null || group === void 0 ? void 0 : group.isRoot)) {
            fullGroupPath.push(groupName);
        }
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
function formatToken(token, tokenById, groups) {
    const value = token.value;
    // Check for font-weight token (Figma imports these incorrectly as dimensions)
    const isFontWeight = isFontWeightToken(token, groups);
    // Check for line-height token (Figma imports these incorrectly as dimensions)
    const isLineHeight = isLineHeightToken(token, groups);
    // Check for top-level reference FIRST
    if (value && value.referencedTokenId) {
        const refToken = tokenById[value.referencedTokenId];
        if (refToken) {
            return {
                $value: '{' + buildRefPath(refToken, groups) + '}',
                $type: isFontWeight ? 'fontWeight' : isLineHeight ? 'number' : mapType(token.tokenType),
            };
        }
    }
    // Format raw value - handle font-weight and line-height specially
    const formatted = isFontWeight
        ? formatFontWeightValue(value)
        : isLineHeight
            ? formatLineHeightValue(value)
            : formatValue(value, token.tokenType, tokenById, groups);
    const result = {
        $value: formatted,
        $type: isFontWeight ? 'fontWeight' : isLineHeight ? 'number' : mapType(token.tokenType),
    };
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
function formatFontWeightValue(value) {
    var _a;
    // Extract numeric value from dimension object
    if (value && typeof value === 'object') {
        const measure = (_a = value.measure) !== null && _a !== void 0 ? _a : value.value;
        if (typeof measure === 'number') {
            return measure; // Return plain number, no unit
        }
    }
    // Fallback to direct number
    if (typeof value === 'number') {
        return value;
    }
    // Default fallback
    return 400;
}
function formatLineHeightValue(value) {
    var _a;
    // Extract numeric value from dimension object
    if (value && typeof value === 'object') {
        const measure = (_a = value.measure) !== null && _a !== void 0 ? _a : value.value;
        if (typeof measure === 'number') {
            return measure; // Return plain number, no unit (e.g., 1.15, not "1.15px")
        }
    }
    // Fallback to direct number
    if (typeof value === 'number') {
        return value;
    }
    // Default fallback (normal line-height)
    return 1.5;
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
    const rh = Math.round(r).toString(16);
    const gh = Math.round(g).toString(16);
    const bh = Math.round(b).toString(16);
    const ah = Math.round(a * 255).toString(16);
    return '#' + pad2(rh) + pad2(gh) + pad2(bh) + pad2(ah);
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
    const groupPath = group ? group.path : [];
    const groupName = group ? group.name : '';
    // Build full group path: group.path + group.name
    const fullGroupPath = [];
    for (let i = 0; i < groupPath.length; i++) {
        fullGroupPath.push(groupPath[i]);
    }
    if (groupName && !(group === null || group === void 0 ? void 0 : group.isRoot)) {
        fullGroupPath.push(groupName);
    }
    // Build path: use full path (collection handles platform routing)
    // Result: "color.500" or "semantic.color.primary"
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
function mapType(tokenType) {
    const t = String(tokenType).toLowerCase();
    // DTCG standard types
    if (t === 'color')
        return 'color';
    if (t === 'typography')
        return 'typography';
    if (t === 'fontfamily')
        return 'fontFamily';
    if (t === 'fontweight')
        return 'fontWeight';
    if (t === 'shadow')
        return 'shadow';
    if (t === 'border')
        return 'border';
    if (t === 'gradient')
        return 'gradient';
    if (t === 'duration')
        return 'duration';
    // All dimension-like types → DTCG dimension
    if (t === 'dimension' || t === 'measure')
        return 'dimension';
    if (t === 'size')
        return 'dimension';
    if (t === 'space')
        return 'dimension';
    if (t === 'fontsize')
        return 'dimension';
    if (t === 'lineheight')
        return 'dimension';
    if (t === 'letterspacing')
        return 'dimension';
    if (t === 'paragraphspacing')
        return 'dimension';
    if (t === 'borderwidth')
        return 'dimension';
    if (t === 'radius')
        return 'dimension';
    if (t === 'borderradius')
        return 'dimension';
    if (t === 'blur')
        return 'dimension';
    // Numeric types → DTCG number
    if (t === 'opacity')
        return 'number';
    if (t === 'zindex')
        return 'number';
    // String types → DTCG string
    if (t === 'string' || t === 'text')
        return 'string';
    if (t === 'productcopy')
        return 'string';
    if (t === 'textcase')
        return 'string';
    if (t === 'textdecoration')
        return 'string';
    if (t === 'visibility')
        return 'string';
    // Legacy: 'Font' (combined family+weight) → custom type to preserve data
    if (t === 'font')
        return 'font';
    // Fallback: return as-is (allows custom types to pass through)
    return t;
}
// ============================================================================
// UTILITIES
// ============================================================================
function safeName(name) {
    return String(name || '').replace(/\W+/g, '-').toLowerCase();
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
function findThemeById(arr, id) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id)
            return arr[i];
    }
    return null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsa0NBQWtDO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixzQkFBc0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiwwQkFBMEI7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsbUJBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsZ0JBQWdCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixrQkFBa0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyw4Q0FBOEM7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7VUUxNEJBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdXBlcm5vdmEtZXhwb3J0ZXItc3R5bGUtZGljdGlvbmFyeS8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9zdXBlcm5vdmEtZXhwb3J0ZXItc3R5bGUtZGljdGlvbmFyeS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3N1cGVybm92YS1leHBvcnRlci1zdHlsZS1kaWN0aW9uYXJ5L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9zdXBlcm5vdmEtZXhwb3J0ZXItc3R5bGUtZGljdGlvbmFyeS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU2ltcGxlIFRva2VuIEV4cG9ydGVyIC0gQ2xlYW4gSW1wbGVtZW50YXRpb25cbi8vIFVzZXMgZ3JvdXAucGF0aCBmb3IgdG9rZW4gbG9jYXRpb24sIHRva2VuQnlJZCBtYXAgZm9yIHJlZmVyZW5jZXNcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTUFJTiBFWFBPUlRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblB1bHNhci5leHBvcnQoKHNkaywgY29udGV4dCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgIGNvbnN0IHJlbW90ZSA9IHtcbiAgICAgICAgZGVzaWduU3lzdGVtSWQ6IGNvbnRleHQuZHNJZCxcbiAgICAgICAgdmVyc2lvbklkOiBjb250ZXh0LnZlcnNpb25JZCxcbiAgICB9O1xuICAgIC8vIDEuIEZldGNoIGFsbCBkYXRhXG4gICAgY29uc3QgYmFzZVRva2VucyA9IHRvQXJyYXkoeWllbGQgc2RrLnRva2Vucy5nZXRUb2tlbnMocmVtb3RlKSk7XG4gICAgY29uc3QgZ3JvdXBzID0gdG9BcnJheSh5aWVsZCBzZGsudG9rZW5zLmdldFRva2VuR3JvdXBzKHJlbW90ZSkpO1xuICAgIGNvbnN0IHRoZW1lcyA9IHRvQXJyYXkoeWllbGQgc2RrLnRva2Vucy5nZXRUb2tlblRoZW1lcyhyZW1vdGUpKTtcbiAgICAvLyAyLiBCdWlsZCBiYXNlIHRva2VuIGxvb2t1cCBtYXAgKGZvciBjb3JlIHRva2VucyAtIHRoZXkgZG9uJ3QgY2hhbmdlIHdpdGggdGhlbWVzKVxuICAgIGNvbnN0IGJhc2VUb2tlbkJ5SWQgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJhc2VUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmFzZVRva2VuQnlJZFtiYXNlVG9rZW5zW2ldLmlkXSA9IGJhc2VUb2tlbnNbaV07XG4gICAgfVxuICAgIC8vIDMuIEdyb3VwIGJhc2UgdG9rZW5zIGJ5IGNvbGxlY3Rpb25cbiAgICBjb25zdCBiYXNlR3JvdXBlZCA9IGdyb3VwQnlQbGF0Zm9ybShiYXNlVG9rZW5zLCBncm91cHMpO1xuICAgIC8vIDQuIEJ1aWxkIG91dHB1dCBmaWxlc1xuICAgIGNvbnN0IG91dHB1dHMgPSBbXTtcbiAgICAvLyBEZWJ1Zzogc2hvdyBjb2xsZWN0aW9uIGRldGVjdGlvbiByZXN1bHRzXG4gICAgY29uc3QgZGVidWdDb2xsZWN0aW9ucyA9IHtcbiAgICAgICAgY291bnRzOiB7XG4gICAgICAgICAgICBjb3JlOiBiYXNlR3JvdXBlZC5jb3JlLmxlbmd0aCxcbiAgICAgICAgICAgIHdlYjogYmFzZUdyb3VwZWQud2ViLmxlbmd0aCxcbiAgICAgICAgICAgIG1vYmlsZTogYmFzZUdyb3VwZWQubW9iaWxlLmxlbmd0aCxcbiAgICAgICAgICAgIHVua25vd246IGJhc2VHcm91cGVkLnVua25vd24ubGVuZ3RoLFxuICAgICAgICB9LFxuICAgICAgICBhbGxDb2xsZWN0aW9uVmFsdWVzOiB7fSxcbiAgICAgICAgdW5rbm93blRva2VuRGV0YWlsczogW10sXG4gICAgICAgIHNhbXBsZVRva2VuczogW10sXG4gICAgICAgIHNoYWRvd1Rva2VuczogW10sXG4gICAgfTtcbiAgICAvLyBDb3VudCBhbGwgdW5pcXVlIGNvbGxlY3Rpb24gdmFsdWVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYXNlVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNvbCA9IGdldFRva2VuQ29sbGVjdGlvbihiYXNlVG9rZW5zW2ldKTtcbiAgICAgICAgZGVidWdDb2xsZWN0aW9ucy5hbGxDb2xsZWN0aW9uVmFsdWVzW2NvbF0gPSAoZGVidWdDb2xsZWN0aW9ucy5hbGxDb2xsZWN0aW9uVmFsdWVzW2NvbF0gfHwgMCkgKyAxO1xuICAgIH1cbiAgICAvLyBTaG93IGRldGFpbHMgb2YgdW5rbm93biB0b2tlbnMgKHdoYXQgY29sbGVjdGlvbiBkbyB0aGV5IGhhdmU/KVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5taW4oYmFzZUdyb3VwZWQudW5rbm93bi5sZW5ndGgsIDEwKTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHQgPSBiYXNlR3JvdXBlZC51bmtub3duW2ldO1xuICAgICAgICBjb25zdCBwcm9wcyA9IHQucHJvcGVydGllcyB8fCBbXTtcbiAgICAgICAgY29uc3QgcHJvcFZhbHVlcyA9IHQucHJvcGVydHlWYWx1ZXMgfHwge307XG4gICAgICAgIGNvbnN0IGdyb3VwID0gZmluZEdyb3VwRm9yVG9rZW4odCwgZ3JvdXBzKTtcbiAgICAgICAgLy8gRmluZCBjb2xsZWN0aW9uIHByb3BlcnR5IGluZm9cbiAgICAgICAgbGV0IGNvbGxlY3Rpb25Qcm9wSW5mbyA9IG51bGw7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcHJvcHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBwcm9wc1tqXTtcbiAgICAgICAgICAgIGlmICgocC5uYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpID09PSAnY29sbGVjdGlvbicgfHwgKHAuY29kZU5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT09ICdjb2xsZWN0aW9uJykge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25Qcm9wSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb2RlTmFtZTogcC5jb2RlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IChwLm9wdGlvbnMgfHwgW10pLm1hcCgobykgPT4gKHsgaWQ6IG8uaWQsIG5hbWU6IG8ubmFtZSB9KSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkZWJ1Z0NvbGxlY3Rpb25zLnVua25vd25Ub2tlbkRldGFpbHMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiB0Lm5hbWUsXG4gICAgICAgICAgICBncm91cFBhdGg6IGdyb3VwID8gZ3JvdXAucGF0aCA6IG51bGwsXG4gICAgICAgICAgICBoYXNDb2xsZWN0aW9uUHJvcDogISFjb2xsZWN0aW9uUHJvcEluZm8sXG4gICAgICAgICAgICBjb2xsZWN0aW9uUHJvcEluZm86IGNvbGxlY3Rpb25Qcm9wSW5mbyxcbiAgICAgICAgICAgIHByb3BlcnR5VmFsdWVLZXlzOiBPYmplY3Qua2V5cyhwcm9wVmFsdWVzKSxcbiAgICAgICAgICAgIHJhd1Byb3BlcnR5VmFsdWVzOiBKU09OLnN0cmluZ2lmeShwcm9wVmFsdWVzKS5zdWJzdHJpbmcoMCwgMzAwKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFNhbXBsZSBhIGZldyB0b2tlbnMgZnJvbSBlYWNoIGdyb3VwXG4gICAgY29uc3QgYWxsU2FtcGxlcyA9IFsuLi5iYXNlR3JvdXBlZC5jb3JlLnNsaWNlKDAsIDIpLCAuLi5iYXNlR3JvdXBlZC53ZWIuc2xpY2UoMCwgMiksIC4uLmJhc2VHcm91cGVkLm1vYmlsZS5zbGljZSgwLCAyKV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxTYW1wbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHQgPSBhbGxTYW1wbGVzW2ldO1xuICAgICAgICBjb25zdCBncm91cCA9IGZpbmRHcm91cEZvclRva2VuKHQsIGdyb3Vwcyk7XG4gICAgICAgIGRlYnVnQ29sbGVjdGlvbnMuc2FtcGxlVG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogdC5uYW1lLFxuICAgICAgICAgICAgY29sbGVjdGlvbjogZ2V0VG9rZW5Db2xsZWN0aW9uKHQpLFxuICAgICAgICAgICAgZ3JvdXBQYXRoOiBncm91cCA/IGdyb3VwLnBhdGggOiBudWxsLFxuICAgICAgICAgICAgZ3JvdXBOYW1lOiBncm91cCA/IGdyb3VwLm5hbWUgOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gRmluZCBhbmQgY2FwdHVyZSBzaGFkb3cgdG9rZW5zLCBlc3BlY2lhbGx5IHNlY29uZGFyeSBidXR0b24gYm94LXNoYWRvd1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFzZVRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0ID0gYmFzZVRva2Vuc1tpXTtcbiAgICAgICAgaWYgKHQudG9rZW5UeXBlID09PSAnU2hhZG93JyAmJiB0LmlzVmlydHVhbCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0LCBncm91cHMpO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0LnZhbHVlO1xuICAgICAgICAgICAgLy8gTG9vayBmb3Igc2Vjb25kYXJ5IGJ1dHRvbiBzaGFkb3cgb3IgY2FwdHVyZSBmaXJzdCBmZXcgc2hhZG93c1xuICAgICAgICAgICAgY29uc3QgaXNTZWNvbmRhcnlCdXR0b24gPSB0Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnc2Vjb25kYXJ5JykgfHxcbiAgICAgICAgICAgICAgICAoZ3JvdXAgJiYgZ3JvdXAucGF0aC5qb2luKCcvJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnc2Vjb25kYXJ5JykpO1xuICAgICAgICAgICAgY29uc3QgaXNCb3hTaGFkb3cgPSB0Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYm94LXNoYWRvdycpIHx8XG4gICAgICAgICAgICAgICAgdC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2JveCcpIHx8XG4gICAgICAgICAgICAgICAgKGdyb3VwICYmIGdyb3VwLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnYnV0dG9uJykpO1xuICAgICAgICAgICAgaWYgKGlzU2Vjb25kYXJ5QnV0dG9uIHx8IGlzQm94U2hhZG93IHx8IGRlYnVnQ29sbGVjdGlvbnMuc2hhZG93VG9rZW5zLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICBkZWJ1Z0NvbGxlY3Rpb25zLnNoYWRvd1Rva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0b2tlblR5cGU6IHQudG9rZW5UeXBlLFxuICAgICAgICAgICAgICAgICAgICBncm91cFBhdGg6IGdyb3VwID8gZ3JvdXAucGF0aCA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwTmFtZTogZ3JvdXAgPyBncm91cC5uYW1lIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFBhdGg6IGdyb3VwID8gWy4uLmdyb3VwLnBhdGgsIGdyb3VwLm5hbWUsIHQubmFtZV0uam9pbignLicpIDogdC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cnVjdHVyZTogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpLCAvLyBEZWVwIGNsb25lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgb3V0cHV0cy5wdXNoKGNyZWF0ZUZpbGUoJ19kZWJ1Z19jb2xsZWN0aW9ucy5qc29uJywgZGVidWdDb2xsZWN0aW9ucykpO1xuICAgIC8vIENvcmUgdG9rZW5zIChhbHdheXMgZXhwb3J0ZWQgb25jZSwgc2hhcmVkIGFjcm9zcyBhbGwgdGhlbWVzKVxuICAgIGlmIChiYXNlR3JvdXBlZC5jb3JlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdHJlZSA9IGJ1aWxkVHJlZShiYXNlR3JvdXBlZC5jb3JlLCBncm91cHMsIGJhc2VUb2tlbkJ5SWQsIDApOyAvLyAwID0gdXNlIGZ1bGwgcGF0aFxuICAgICAgICBvdXRwdXRzLnB1c2goY3JlYXRlRmlsZSgnY29yZS9jb3JlLmpzb24nLCB0cmVlKSk7XG4gICAgfVxuICAgIC8vIDQuIEV4cG9ydCBBTEwgdGhlbWVzXG4gICAgZm9yIChsZXQgdCA9IDA7IHQgPCB0aGVtZXMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgY29uc3QgdGhlbWUgPSB0aGVtZXNbdF07XG4gICAgICAgIGNvbnN0IHRoZW1lTmFtZSA9IHRoZW1lLm5hbWU7IC8vIGUuZy4sIFwiY3VzdG9tZXIvbGlnaHRcIiBvciBcInBhdGllbnQvZGFya1wiXG4gICAgICAgIC8vIEJ1aWxkIHRoZW1lZCB0b2tlbnMgYnkgbWVyZ2luZyBvdmVycmlkZGVuVG9rZW5zIHdpdGggYmFzZSB0b2tlbnNcbiAgICAgICAgLy8gVGhlIHRoZW1lLm92ZXJyaWRkZW5Ub2tlbnMgY29udGFpbnMgdGhlIGFjdHVhbCB0aGVtZWQgdmFsdWVzXG4gICAgICAgIGNvbnN0IG92ZXJyaWRkZW5Ub2tlbnMgPSB0b0FycmF5KHRoZW1lLm92ZXJyaWRkZW5Ub2tlbnMgfHwgW10pO1xuICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2Ygb3ZlcnJpZGRlbiB0b2tlbnMgYnkgSURcbiAgICAgICAgY29uc3Qgb3ZlcnJpZGRlbkJ5SWQgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdmVycmlkZGVuVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBvdmVycmlkZGVuQnlJZFtvdmVycmlkZGVuVG9rZW5zW2ldLmlkXSA9IG92ZXJyaWRkZW5Ub2tlbnNbaV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWVyZ2U6IHVzZSBvdmVycmlkZGVuIHRva2VuIGlmIGV4aXN0cywgb3RoZXJ3aXNlIHVzZSBiYXNlIHRva2VuXG4gICAgICAgIGNvbnN0IHRoZW1lZFRva2VucyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJhc2VUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJhc2VUb2tlbiA9IGJhc2VUb2tlbnNbaV07XG4gICAgICAgICAgICBjb25zdCBvdmVycmlkZGVuID0gb3ZlcnJpZGRlbkJ5SWRbYmFzZVRva2VuLmlkXTtcbiAgICAgICAgICAgIHRoZW1lZFRva2Vucy5wdXNoKG92ZXJyaWRkZW4gfHwgYmFzZVRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCB0b2tlbiBsb29rdXAgZm9yIHRoaXMgdGhlbWVcbiAgICAgICAgY29uc3QgdG9rZW5CeUlkID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhlbWVkVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0b2tlbkJ5SWRbdGhlbWVkVG9rZW5zW2ldLmlkXSA9IHRoZW1lZFRva2Vuc1tpXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBHcm91cCB0aGVtZWQgdG9rZW5zIGJ5IHBsYXRmb3JtXG4gICAgICAgIGNvbnN0IGdyb3VwZWQgPSBncm91cEJ5UGxhdGZvcm0odGhlbWVkVG9rZW5zLCBncm91cHMpO1xuICAgICAgICAvLyBFeHBvcnQgcGxhdGZvcm0tc3BlY2lmaWMgdG9rZW5zIGZvciB0aGlzIHRoZW1lXG4gICAgICAgIGNvbnN0IHBsYXRmb3JtcyA9IFsnd2ViJywgJ21vYmlsZSddO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHBsYXRmb3Jtcy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgY29uc3QgcGxhdGZvcm0gPSBwbGF0Zm9ybXNbcF07XG4gICAgICAgICAgICBjb25zdCBwbGF0Zm9ybVRva2VucyA9IGdyb3VwZWRbcGxhdGZvcm1dIHx8IFtdO1xuICAgICAgICAgICAgaWYgKHBsYXRmb3JtVG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmVlID0gYnVpbGRUcmVlKHBsYXRmb3JtVG9rZW5zLCBncm91cHMsIHRva2VuQnlJZCwgMCk7IC8vIDAgPSB1c2UgZnVsbCBwYXRoXG4gICAgICAgICAgICAgICAgb3V0cHV0cy5wdXNoKGNyZWF0ZUZpbGUocGxhdGZvcm0gKyAnLycgKyB0aGVtZU5hbWUgKyAnLmpzb24nLCB0cmVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dHM7XG59KSk7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBHUk9VUElORyAoYnkgQ29sbGVjdGlvbiBwcm9wZXJ0eSlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGdldFRva2VuQ29sbGVjdGlvbih0b2tlbikge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0b2tlbi5wcm9wZXJ0aWVzIHx8IFtdO1xuICAgIGNvbnN0IHByb3BlcnR5VmFsdWVzID0gdG9rZW4ucHJvcGVydHlWYWx1ZXMgfHwge307XG4gICAgLy8gRmluZCB0aGUgQ29sbGVjdGlvbiBwcm9wZXJ0eSBkZWZpbml0aW9uXG4gICAgbGV0IGNvbGxlY3Rpb25Qcm9wID0gbnVsbDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcHJvcCA9IHByb3BlcnRpZXNbaV07XG4gICAgICAgIGNvbnN0IG5hbWUgPSAocHJvcC5uYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBjb2RlTmFtZSA9IChwcm9wLmNvZGVOYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAobmFtZSA9PT0gJ2NvbGxlY3Rpb24nIHx8IGNvZGVOYW1lID09PSAnY29sbGVjdGlvbicpIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb25Qcm9wID0gcHJvcDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghY29sbGVjdGlvblByb3ApXG4gICAgICAgIHJldHVybiAndW5rbm93bic7XG4gICAgLy8gR2V0IHRoZSB2YWx1ZSAtIGNvdWxkIGJlIGtleWVkIGJ5IGlkIG9yIGNvZGVOYW1lXG4gICAgbGV0IHJhd1ZhbHVlID0gcHJvcGVydHlWYWx1ZXNbY29sbGVjdGlvblByb3AuaWRdIHx8IHByb3BlcnR5VmFsdWVzW2NvbGxlY3Rpb25Qcm9wLmNvZGVOYW1lXSB8fCBwcm9wZXJ0eVZhbHVlc1snY29sbGVjdGlvbiddO1xuICAgIGlmICghcmF3VmFsdWUpXG4gICAgICAgIHJldHVybiAndW5rbm93bic7XG4gICAgLy8gSWYgaXQncyBhbiBvYmplY3Qgd2l0aCBpZCwgcmVzb2x2ZSBmcm9tIG9wdGlvbnNcbiAgICBjb25zdCB2YWx1ZUlkID0gdHlwZW9mIHJhd1ZhbHVlID09PSAnc3RyaW5nJyA/IHJhd1ZhbHVlIDogKHJhd1ZhbHVlLmlkIHx8IHJhd1ZhbHVlLnZhbHVlKTtcbiAgICAvLyBGaW5kIG1hdGNoaW5nIG9wdGlvblxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb2xsZWN0aW9uUHJvcC5vcHRpb25zIHx8IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBvcHQgPSBvcHRpb25zW2ldO1xuICAgICAgICBpZiAob3B0LmlkID09PSB2YWx1ZUlkIHx8IG9wdC52YWx1ZSA9PT0gdmFsdWVJZCB8fCBvcHQubmFtZSA9PT0gdmFsdWVJZCkge1xuICAgICAgICAgICAgcmV0dXJuIChvcHQubmFtZSB8fCBvcHQudmFsdWUgfHwgb3B0LmlkIHx8ICd1bmtub3duJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGYWxsYmFjazogcmV0dXJuIHRoZSB2YWx1ZSBpdHNlbGYgaWYgaXQncyBhIHN0cmluZ1xuICAgIGlmICh0eXBlb2YgdmFsdWVJZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlSWQudG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gICAgcmV0dXJuICd1bmtub3duJztcbn1cbmZ1bmN0aW9uIGdyb3VwQnlQbGF0Zm9ybSh0b2tlbnMsIGdyb3Vwcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgY29yZTogW10sXG4gICAgICAgIHdlYjogW10sXG4gICAgICAgIG1vYmlsZTogW10sXG4gICAgICAgIHVua25vd246IFtdLFxuICAgIH07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBnZXRUb2tlbkNvbGxlY3Rpb24odG9rZW4pO1xuICAgICAgICBpZiAoY29sbGVjdGlvbiA9PT0gJ2NvcmUnKSB7XG4gICAgICAgICAgICByZXN1bHQuY29yZS5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjb2xsZWN0aW9uID09PSAnd2ViJykge1xuICAgICAgICAgICAgcmVzdWx0LndlYi5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjb2xsZWN0aW9uID09PSAnbW9iaWxlJykge1xuICAgICAgICAgICAgcmVzdWx0Lm1vYmlsZS5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC51bmtub3duLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBUUkVFIEJVSUxESU5HXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBidWlsZFRyZWUodG9rZW5zLCBncm91cHMsIHRva2VuQnlJZCwgc2tpcExldmVscykge1xuICAgIGNvbnN0IHRyZWUgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgICAgLy8gU2tpcCB2aXJ0dWFsIHNoYWRvdyB0b2tlbnNcbiAgICAgICAgaWYgKHRva2VuLmlzVmlydHVhbCA9PT0gdHJ1ZSAmJiB0b2tlbi50b2tlblR5cGUgPT09ICdTaGFkb3cnKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTa2lwIHRva2VucyB3aXRoIHVuZGVyc2NvcmUgaW4gbmFtZSAoaW50ZXJuYWwvcHJpdmF0ZSB0b2tlbnMpXG4gICAgICAgIGlmICh0b2tlbi5uYW1lLmluZGV4T2YoJ18nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdyb3VwID0gZmluZEdyb3VwRm9yVG9rZW4odG9rZW4sIGdyb3Vwcyk7XG4gICAgICAgIC8vIFNraXAgdG9rZW5zIGluIGdyb3VwcyB3aXRoIHVuZGVyc2NvcmUgaW4gbmFtZSBvciBwYXRoXG4gICAgICAgIGlmIChncm91cCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZ3JvdXAgbmFtZVxuICAgICAgICAgICAgaWYgKGdyb3VwLm5hbWUuaW5kZXhPZignXycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgZ3JvdXAgcGF0aFxuICAgICAgICAgICAgbGV0IGhhc1VuZGVyc2NvcmVJblBhdGggPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgZ3JvdXAucGF0aC5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgIGlmIChncm91cC5wYXRoW3BdLmluZGV4T2YoJ18nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzVW5kZXJzY29yZUluUGF0aCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoYXNVbmRlcnNjb3JlSW5QYXRoKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgZnVsbCBncm91cCBwYXRoOiBncm91cC5wYXRoICsgZ3JvdXAubmFtZVxuICAgICAgICAvLyBlLmcuLCBwYXRoPVtcImNvcmVcIl0sIG5hbWU9XCJib3JkZXItcmFkaXVzXCIgLT4gW1wiY29yZVwiLCBcImJvcmRlci1yYWRpdXNcIl1cbiAgICAgICAgY29uc3QgZ3JvdXBQYXRoID0gZ3JvdXAgPyBncm91cC5wYXRoIDogW107XG4gICAgICAgIGNvbnN0IGdyb3VwTmFtZSA9IGdyb3VwID8gZ3JvdXAubmFtZSA6ICcnO1xuICAgICAgICBjb25zdCBmdWxsR3JvdXBQYXRoID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZ3JvdXBQYXRoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBmdWxsR3JvdXBQYXRoLnB1c2goZ3JvdXBQYXRoW2pdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ3JvdXBOYW1lICYmICEoZ3JvdXAgPT09IG51bGwgfHwgZ3JvdXAgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGdyb3VwLmlzUm9vdCkpIHtcbiAgICAgICAgICAgIGZ1bGxHcm91cFBhdGgucHVzaChncm91cE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIHRoZSBuZXN0ZWQgcGF0aDogc2tpcCBwbGF0Zm9ybSAoYW5kIG9wdGlvbmFsbHkgbW9yZSBsZXZlbHMpXG4gICAgICAgIGNvbnN0IHBhdGhQYXJ0cyA9IGZ1bGxHcm91cFBhdGguc2xpY2Uoc2tpcExldmVscyk7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGF0aFBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBmdWxsUGF0aC5wdXNoKHNhZmVOYW1lKHBhdGhQYXJ0c1tqXSkpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bGxQYXRoLnB1c2goc2FmZU5hbWUodG9rZW4ubmFtZSkpO1xuICAgICAgICBpZiAoZnVsbFBhdGgubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIC8vIEZvcm1hdCBhbmQgc2V0IHRoZSB0b2tlbiB2YWx1ZVxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRUb2tlbih0b2tlbiwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgICAgICBzZXROZXN0ZWQodHJlZSwgZnVsbFBhdGgsIGZvcm1hdHRlZCk7XG4gICAgfVxuICAgIHJldHVybiB0cmVlO1xufVxuZnVuY3Rpb24gc2V0TmVzdGVkKG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgICBsZXQgY3VycmVudCA9IG9iajtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGgubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHBhdGhbaV07XG4gICAgICAgIGlmICghY3VycmVudFtrZXldIHx8IHR5cGVvZiBjdXJyZW50W2tleV0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjdXJyZW50W2tleV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY3VycmVudFtrZXldO1xuICAgIH1cbiAgICBjdXJyZW50W3BhdGhbcGF0aC5sZW5ndGggLSAxXV0gPSB2YWx1ZTtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRPS0VOIEZPUk1BVFRJTkcgKERUQ0cpXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBmb3JtYXRUb2tlbih0b2tlbiwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRva2VuLnZhbHVlO1xuICAgIC8vIENoZWNrIGZvciBmb250LXdlaWdodCB0b2tlbiAoRmlnbWEgaW1wb3J0cyB0aGVzZSBpbmNvcnJlY3RseSBhcyBkaW1lbnNpb25zKVxuICAgIGNvbnN0IGlzRm9udFdlaWdodCA9IGlzRm9udFdlaWdodFRva2VuKHRva2VuLCBncm91cHMpO1xuICAgIC8vIENoZWNrIGZvciBsaW5lLWhlaWdodCB0b2tlbiAoRmlnbWEgaW1wb3J0cyB0aGVzZSBpbmNvcnJlY3RseSBhcyBkaW1lbnNpb25zKVxuICAgIGNvbnN0IGlzTGluZUhlaWdodCA9IGlzTGluZUhlaWdodFRva2VuKHRva2VuLCBncm91cHMpO1xuICAgIC8vIENoZWNrIGZvciB0b3AtbGV2ZWwgcmVmZXJlbmNlIEZJUlNUXG4gICAgaWYgKHZhbHVlICYmIHZhbHVlLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgIGNvbnN0IHJlZlRva2VuID0gdG9rZW5CeUlkW3ZhbHVlLnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgaWYgKHJlZlRva2VuKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICR2YWx1ZTogJ3snICsgYnVpbGRSZWZQYXRoKHJlZlRva2VuLCBncm91cHMpICsgJ30nLFxuICAgICAgICAgICAgICAgICR0eXBlOiBpc0ZvbnRXZWlnaHQgPyAnZm9udFdlaWdodCcgOiBpc0xpbmVIZWlnaHQgPyAnbnVtYmVyJyA6IG1hcFR5cGUodG9rZW4udG9rZW5UeXBlKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRm9ybWF0IHJhdyB2YWx1ZSAtIGhhbmRsZSBmb250LXdlaWdodCBhbmQgbGluZS1oZWlnaHQgc3BlY2lhbGx5XG4gICAgY29uc3QgZm9ybWF0dGVkID0gaXNGb250V2VpZ2h0XG4gICAgICAgID8gZm9ybWF0Rm9udFdlaWdodFZhbHVlKHZhbHVlKVxuICAgICAgICA6IGlzTGluZUhlaWdodFxuICAgICAgICAgICAgPyBmb3JtYXRMaW5lSGVpZ2h0VmFsdWUodmFsdWUpXG4gICAgICAgICAgICA6IGZvcm1hdFZhbHVlKHZhbHVlLCB0b2tlbi50b2tlblR5cGUsIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICR2YWx1ZTogZm9ybWF0dGVkLFxuICAgICAgICAkdHlwZTogaXNGb250V2VpZ2h0ID8gJ2ZvbnRXZWlnaHQnIDogaXNMaW5lSGVpZ2h0ID8gJ251bWJlcicgOiBtYXBUeXBlKHRva2VuLnRva2VuVHlwZSksXG4gICAgfTtcbiAgICBpZiAodG9rZW4uZGVzY3JpcHRpb24gJiYgdG9rZW4uZGVzY3JpcHRpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICByZXN1bHQuJGRlc2NyaXB0aW9uID0gdG9rZW4uZGVzY3JpcHRpb247XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBmb3JtYXRWYWx1ZSh2YWx1ZSwgdG9rZW5UeXBlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIGlmICghdmFsdWUpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vIENvbG9yOiBjaGVjayBmb3IgbmVzdGVkIC5jb2xvciBvYmplY3Qgb3IgZGlyZWN0IHIvZy9iXG4gICAgaWYgKHZhbHVlLmNvbG9yICYmIHR5cGVvZiB2YWx1ZS5jb2xvci5yID09PSAnbnVtYmVyJykge1xuICAgICAgICAvLyBDaGVjayBpZiBjb2xvciBpdHNlbGYgaXMgYSByZWZlcmVuY2VcbiAgICAgICAgaWYgKHZhbHVlLmNvbG9yLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbdmFsdWUuY29sb3IucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgaWYgKHJlZilcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JztcbiAgICAgICAgfVxuICAgICAgICAvLyBVc2UgZm9ybWF0Q29sb3JWYWx1ZSB0byBoYW5kbGUgYWxwaGEgcHJvcGVybHlcbiAgICAgICAgcmV0dXJuIGZvcm1hdENvbG9yVmFsdWUodmFsdWUpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlLnIgPT09ICdudW1iZXInICYmIHR5cGVvZiB2YWx1ZS5nID09PSAnbnVtYmVyJykge1xuICAgICAgICAvLyBEaXJlY3Qgci9nL2IgKGNoZWNrIGZvciBhbHBoYSB0b28pXG4gICAgICAgIGNvbnN0IGFscGhhID0gdHlwZW9mIHZhbHVlLmEgPT09ICdudW1iZXInID8gdmFsdWUuYSA6IDE7XG4gICAgICAgIGlmIChhbHBoYSA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0b0hleFdpdGhBbHBoYSh2YWx1ZS5yLCB2YWx1ZS5nLCB2YWx1ZS5iLCBhbHBoYSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvSGV4KHZhbHVlLnIsIHZhbHVlLmcsIHZhbHVlLmIpO1xuICAgIH1cbiAgICBpZiAodmFsdWUuaGV4KSB7XG4gICAgICAgIHJldHVybiAnIycgKyB2YWx1ZS5oZXg7XG4gICAgfVxuICAgIC8vIERpbWVuc2lvbi9NZWFzdXJlOiBoYXMgLm1lYXN1cmUgYW5kIC51bml0XG4gICAgaWYgKHR5cGVvZiB2YWx1ZS5tZWFzdXJlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLm1lYXN1cmUsXG4gICAgICAgICAgICB1bml0OiBmb3JtYXRVbml0KHZhbHVlLnVuaXQpXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIFRleHQvU3RyaW5nOiBoYXMgLnRleHRcbiAgICBpZiAodHlwZW9mIHZhbHVlLnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS50ZXh0O1xuICAgIH1cbiAgICAvLyBGb250OiBoYXMgLmZhbWlseSAobGVnYWN5IGNvbWJpbmVkIGZvbnQrd2VpZ2h0IHRva2VuKVxuICAgIC8vIE1hcHMgdG8gY3VzdG9tICdmb250JyB0eXBlIHRvIHByZXNlcnZlIGJvdGggZmFtaWx5IGFuZCB3ZWlnaHRcbiAgICBpZiAodHlwZW9mIHZhbHVlLmZhbWlseSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZhbWlseTogdmFsdWUuZmFtaWx5LFxuICAgICAgICAgICAgd2VpZ2h0OiB2YWx1ZS5zdWJmYW1pbHkgfHwgdmFsdWUud2VpZ2h0IHx8ICdSZWd1bGFyJyxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gVHlwb2dyYXBoeTogaGFzIC5mb250IGFuZCAuZm9udFNpemVcbiAgICBpZiAodmFsdWUuZm9udCB8fCB2YWx1ZS5mb250U2l6ZSkge1xuICAgICAgICByZXR1cm4gZm9ybWF0VHlwb2dyYXBoeSh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIH1cbiAgICAvLyBTaGFkb3c6IFN1cGVybm92YSBwcm92aWRlcyBhcnJheSB3aXRoIHNoYWRvdyBvYmplY3QocylcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID4gMCAmJiB2YWx1ZVswXS54ICE9PSB1bmRlZmluZWQgJiYgdmFsdWVbMF0ueSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRTaGFkb3dBcnJheSh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIH1cbiAgICAvLyBHcmFkaWVudDogU3VwZXJub3ZhIHByb3ZpZGVzIGFycmF5IHdpdGggZ3JhZGllbnQgb2JqZWN0KHMpXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDAgJiYgdmFsdWVbMF0uc3RvcHMpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdEdyYWRpZW50KHZhbHVlWzBdLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIEJvcmRlcjogaGFzIC5jb2xvciBhbmQgLndpZHRoXG4gICAgaWYgKHZhbHVlLmNvbG9yICYmIHZhbHVlLndpZHRoKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRCb3JkZXIodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICB9XG4gICAgLy8gUmFkaXVzOiBoYXMgLnJhZGl1cyBvciBjb3JuZXIgdmFsdWVzXG4gICAgaWYgKHZhbHVlLnJhZGl1cyB8fCB2YWx1ZS50b3BMZWZ0IHx8IHZhbHVlLnRvcFJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRSYWRpdXModmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICB9XG4gICAgLy8gRmFsbGJhY2s6IHJldHVybiBhcy1pc1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGZvcm1hdEZvbnRXZWlnaHRWYWx1ZSh2YWx1ZSkge1xuICAgIHZhciBfYTtcbiAgICAvLyBFeHRyYWN0IG51bWVyaWMgdmFsdWUgZnJvbSBkaW1lbnNpb24gb2JqZWN0XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgbWVhc3VyZSA9IChfYSA9IHZhbHVlLm1lYXN1cmUpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IHZhbHVlLnZhbHVlO1xuICAgICAgICBpZiAodHlwZW9mIG1lYXN1cmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gbWVhc3VyZTsgLy8gUmV0dXJuIHBsYWluIG51bWJlciwgbm8gdW5pdFxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZhbGxiYWNrIHRvIGRpcmVjdCBudW1iZXJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIC8vIERlZmF1bHQgZmFsbGJhY2tcbiAgICByZXR1cm4gNDAwO1xufVxuZnVuY3Rpb24gZm9ybWF0TGluZUhlaWdodFZhbHVlKHZhbHVlKSB7XG4gICAgdmFyIF9hO1xuICAgIC8vIEV4dHJhY3QgbnVtZXJpYyB2YWx1ZSBmcm9tIGRpbWVuc2lvbiBvYmplY3RcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBjb25zdCBtZWFzdXJlID0gKF9hID0gdmFsdWUubWVhc3VyZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogdmFsdWUudmFsdWU7XG4gICAgICAgIGlmICh0eXBlb2YgbWVhc3VyZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBtZWFzdXJlOyAvLyBSZXR1cm4gcGxhaW4gbnVtYmVyLCBubyB1bml0IChlLmcuLCAxLjE1LCBub3QgXCIxLjE1cHhcIilcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGYWxsYmFjayB0byBkaXJlY3QgbnVtYmVyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICAvLyBEZWZhdWx0IGZhbGxiYWNrIChub3JtYWwgbGluZS1oZWlnaHQpXG4gICAgcmV0dXJuIDEuNTtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIENPTVBMRVggVkFMVUUgRk9STUFUVEVSU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gZm9ybWF0VHlwb2dyYXBoeSh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBpZiAodmFsdWUuZm9udCkge1xuICAgICAgICBpZiAodmFsdWUuZm9udC5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmZvbnQucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgcmVzdWx0LmZvbnRGYW1pbHkgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogdmFsdWUuZm9udC5mYW1pbHk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQuZm9udEZhbWlseSA9IHZhbHVlLmZvbnQuZmFtaWx5IHx8ICcnO1xuICAgICAgICAgICAgcmVzdWx0LmZvbnRXZWlnaHQgPSB2YWx1ZS5mb250LnN1YmZhbWlseSB8fCAnUmVndWxhcic7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbHVlLmZvbnRTaXplKSB7XG4gICAgICAgIGlmICh2YWx1ZS5mb250U2l6ZS5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmZvbnRTaXplLnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIHJlc3VsdC5mb250U2l6ZSA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRNZWFzdXJlKHZhbHVlLmZvbnRTaXplKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5mb250U2l6ZSA9IGZvcm1hdE1lYXN1cmUodmFsdWUuZm9udFNpemUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh2YWx1ZS5saW5lSGVpZ2h0KSB7XG4gICAgICAgIGlmICh2YWx1ZS5saW5lSGVpZ2h0LnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbdmFsdWUubGluZUhlaWdodC5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQubGluZUhlaWdodCA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRNZWFzdXJlKHZhbHVlLmxpbmVIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmxpbmVIZWlnaHQgPSBmb3JtYXRNZWFzdXJlKHZhbHVlLmxpbmVIZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh2YWx1ZS5sZXR0ZXJTcGFjaW5nKSB7XG4gICAgICAgIHJlc3VsdC5sZXR0ZXJTcGFjaW5nID0gZm9ybWF0TWVhc3VyZSh2YWx1ZS5sZXR0ZXJTcGFjaW5nKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlLnRleHRDYXNlKVxuICAgICAgICByZXN1bHQudGV4dFRyYW5zZm9ybSA9IHZhbHVlLnRleHRDYXNlLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHZhbHVlLnRleHREZWNvcmF0aW9uKVxuICAgICAgICByZXN1bHQudGV4dERlY29yYXRpb24gPSB2YWx1ZS50ZXh0RGVjb3JhdGlvbi50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBmb3JtYXRTaGFkb3codmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICBvZmZzZXRYOiBmb3JtYXRNZWFzdXJlKHZhbHVlLngpLFxuICAgICAgICBvZmZzZXRZOiBmb3JtYXRNZWFzdXJlKHZhbHVlLnkpLFxuICAgICAgICBibHVyOiBmb3JtYXRNZWFzdXJlKHZhbHVlLnJhZGl1cyksXG4gICAgICAgIHNwcmVhZDogZm9ybWF0TWVhc3VyZSh2YWx1ZS5zcHJlYWQpLFxuICAgIH07XG4gICAgLy8gR2V0IGFscGhhIGZyb20gc2hhZG93J3Mgb3BhY2l0eSBwcm9wZXJ0eSAoU3VwZXJub3ZhIHN0b3JlcyBvcGFjaXR5IGF0IHNoYWRvdyBsZXZlbCwgbm90IGNvbG9yIGxldmVsKVxuICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9kZXZlbG9wZXJzLnN1cGVybm92YS5pby9sYXRlc3Qvc2RrLXJlZmVyZW5jZS9kYXRhLW1vZGVsL3Rva2Vucy90b2tlbi12YWx1ZXMtSG5iM2lldTUjc2VjdGlvbi1zaGFkb3d0b2tlbnZhbHVlLTY1XG4gICAgbGV0IGFscGhhID0gMTtcbiAgICBpZiAodmFsdWUub3BhY2l0eSAmJiB0eXBlb2YgdmFsdWUub3BhY2l0eS5tZWFzdXJlID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbHBoYSA9IHZhbHVlLm9wYWNpdHkubWVhc3VyZTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLm9wYWNpdHkgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGFscGhhID0gdmFsdWUub3BhY2l0eTtcbiAgICB9XG4gICAgLy8gSGFuZGxlIGNvbG9yIHdpdGggZnVsbCBEVENHIGZvcm1hdFxuICAgIGlmICh2YWx1ZS5jb2xvcikge1xuICAgICAgICAvLyBFeHRyYWN0IGNvbG9yIGZyb20gbmVzdGVkIHN0cnVjdHVyZSAoU3VwZXJub3ZhIGhhcyBjb2xvci5jb2xvcilcbiAgICAgICAgbGV0IGNvbG9yVmFsdWUgPSB2YWx1ZS5jb2xvcjtcbiAgICAgICAgaWYgKGNvbG9yVmFsdWUuY29sb3IpIHtcbiAgICAgICAgICAgIGNvbG9yVmFsdWUgPSBjb2xvclZhbHVlLmNvbG9yOyAvLyBVbndyYXAgbmVzdGVkIGNvbG9yXG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbG9yIHJlZmVyZW5jZVxuICAgICAgICBpZiAoY29sb3JWYWx1ZS5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW2NvbG9yVmFsdWUucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgcmVzdWx0LmNvbG9yID0gcmVmID8gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JyA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRm9ybWF0IGNvbG9yIHRvIGZ1bGwgRFRDRyBjb2xvciBvYmplY3QgKG5vdCBoZXggc3RyaW5nKVxuICAgICAgICBpZiAoIXJlc3VsdC5jb2xvciAmJiBjb2xvclZhbHVlKSB7XG4gICAgICAgICAgICBjb25zdCByID0gY29sb3JWYWx1ZS5yIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBnID0gY29sb3JWYWx1ZS5nIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBiID0gY29sb3JWYWx1ZS5iIHx8IDA7XG4gICAgICAgICAgICAvLyBEVENHIHJlcXVpcmVzIFJHQiBpbiAwLTEgcmFuZ2UsIFN1cGVybm92YSBwcm92aWRlcyAwLTI1NVxuICAgICAgICAgICAgcmVzdWx0LmNvbG9yID0ge1xuICAgICAgICAgICAgICAgIGNvbG9yU3BhY2U6ICdzcmdiJyxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbciAvIDI1NSwgZyAvIDI1NSwgYiAvIDI1NV0sXG4gICAgICAgICAgICAgICAgYWxwaGE6IGFscGhhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEhhbmRsZSBpbnNldCBwcm9wZXJ0eSAoZnJvbSBTdXBlcm5vdmEncyB0eXBlIGZpZWxkKVxuICAgIGlmICh2YWx1ZS50eXBlKSB7XG4gICAgICAgIGNvbnN0IHR5cGVTdHIgPSBTdHJpbmcodmFsdWUudHlwZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHR5cGVTdHIgPT09ICdpbm5lcicgfHwgdHlwZVN0ciA9PT0gJ2luc2V0Jykge1xuICAgICAgICAgICAgcmVzdWx0Lmluc2V0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBEZWZhdWx0IGlzIGZhbHNlIChkcm9wIHNoYWRvdyksIHNvIG5vIG5lZWQgdG8gc2V0IGV4cGxpY2l0bHlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGZvcm1hdFNoYWRvd0FycmF5KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIGNvbnN0IHNoYWRvd3MgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHNoYWRvdyA9IHZhbHVlW2ldO1xuICAgICAgICBzaGFkb3dzLnB1c2goZm9ybWF0U2hhZG93KHNoYWRvdywgdG9rZW5CeUlkLCBncm91cHMpKTtcbiAgICB9XG4gICAgLy8gUmV0dXJuIGFycmF5IGRpcmVjdGx5IChEVENHIHN1cHBvcnRzIGJvdGggc2luZ2xlIG9iamVjdCBhbmQgYXJyYXlzKVxuICAgIHJldHVybiBzaGFkb3dzO1xufVxuZnVuY3Rpb24gZm9ybWF0R3JhZGllbnQodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3Qgc3RvcHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLnN0b3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHN0b3AgPSB2YWx1ZS5zdG9wc1tpXTtcbiAgICAgICAgLy8gRXh0cmFjdCBjb2xvciBmcm9tIG5lc3RlZCBzdHJ1Y3R1cmUgKFN1cGVybm92YSBoYXMgY29sb3IuY29sb3IpXG4gICAgICAgIGxldCBjb2xvclZhbHVlID0gc3RvcC5jb2xvcjtcbiAgICAgICAgaWYgKGNvbG9yVmFsdWUgJiYgY29sb3JWYWx1ZS5jb2xvcikge1xuICAgICAgICAgICAgY29sb3JWYWx1ZSA9IGNvbG9yVmFsdWUuY29sb3I7IC8vIFVud3JhcCBuZXN0ZWQgY29sb3JcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3IgY29sb3IgcmVmZXJlbmNlXG4gICAgICAgIGxldCBmb3JtYXR0ZWRDb2xvcjtcbiAgICAgICAgaWYgKGNvbG9yVmFsdWUgJiYgY29sb3JWYWx1ZS5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW2NvbG9yVmFsdWUucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgZm9ybWF0dGVkQ29sb3IgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBGb3JtYXQgY29sb3IgdG8gZnVsbCBEVENHIGNvbG9yIG9iamVjdCAobm90IGhleCBzdHJpbmcpXG4gICAgICAgIGlmICghZm9ybWF0dGVkQ29sb3IgJiYgY29sb3JWYWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgciA9IGNvbG9yVmFsdWUuciB8fCAwO1xuICAgICAgICAgICAgY29uc3QgZyA9IGNvbG9yVmFsdWUuZyB8fCAwO1xuICAgICAgICAgICAgY29uc3QgYiA9IGNvbG9yVmFsdWUuYiB8fCAwO1xuICAgICAgICAgICAgLy8gR2V0IGFscGhhIGZyb20gb3BhY2l0eSBpZiBwcmVzZW50XG4gICAgICAgICAgICBsZXQgYWxwaGEgPSAxO1xuICAgICAgICAgICAgaWYgKHN0b3AuY29sb3IgJiYgc3RvcC5jb2xvci5vcGFjaXR5ICYmIHR5cGVvZiBzdG9wLmNvbG9yLm9wYWNpdHkubWVhc3VyZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBhbHBoYSA9IHN0b3AuY29sb3Iub3BhY2l0eS5tZWFzdXJlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRFRDRyByZXF1aXJlcyBSR0IgaW4gMC0xIHJhbmdlLCBTdXBlcm5vdmEgcHJvdmlkZXMgMC0yNTVcbiAgICAgICAgICAgIGZvcm1hdHRlZENvbG9yID0ge1xuICAgICAgICAgICAgICAgIGNvbG9yU3BhY2U6ICdzcmdiJyxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbciAvIDI1NSwgZyAvIDI1NSwgYiAvIDI1NV0sXG4gICAgICAgICAgICAgICAgYWxwaGE6IGFscGhhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHN0b3BzLnB1c2goe1xuICAgICAgICAgICAgY29sb3I6IGZvcm1hdHRlZENvbG9yIHx8IHsgY29sb3JTcGFjZTogJ3NyZ2InLCBjb21wb25lbnRzOiBbMCwgMCwgMF0gfSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBzdG9wLnBvc2l0aW9uIHx8IDBcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFJldHVybiBhcnJheSBkaXJlY3RseSAoRFRDRyBjb21wbGlhbnQpIC0gbm90IHdyYXBwZWQgaW4gb2JqZWN0XG4gICAgcmV0dXJuIHN0b3BzO1xufVxuZnVuY3Rpb24gZm9ybWF0Qm9yZGVyKHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgd2lkdGg6IGZvcm1hdE1lYXN1cmUodmFsdWUud2lkdGgpLFxuICAgICAgICBzdHlsZTogJ3NvbGlkJyxcbiAgICB9O1xuICAgIGlmICh2YWx1ZS5jb2xvcikge1xuICAgICAgICBpZiAodmFsdWUuY29sb3IucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogZm9ybWF0Q29sb3JWYWx1ZSh2YWx1ZS5jb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSBmb3JtYXRDb2xvclZhbHVlKHZhbHVlLmNvbG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZm9ybWF0UmFkaXVzKHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIC8vIFNpbmdsZSByYWRpdXNcbiAgICBpZiAodmFsdWUucmFkaXVzICYmICF2YWx1ZS50b3BMZWZ0KSB7XG4gICAgICAgIGlmICh2YWx1ZS5yYWRpdXMucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5yYWRpdXMucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgcmV0dXJuIHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRNZWFzdXJlKHZhbHVlLnJhZGl1cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvcm1hdE1lYXN1cmUodmFsdWUucmFkaXVzKTtcbiAgICB9XG4gICAgLy8gQ29ybmVyIHJhZGlpXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG9wTGVmdDogZm9ybWF0TWVhc3VyZSh2YWx1ZS50b3BMZWZ0KSxcbiAgICAgICAgdG9wUmlnaHQ6IGZvcm1hdE1lYXN1cmUodmFsdWUudG9wUmlnaHQpLFxuICAgICAgICBib3R0b21MZWZ0OiBmb3JtYXRNZWFzdXJlKHZhbHVlLmJvdHRvbUxlZnQpLFxuICAgICAgICBib3R0b21SaWdodDogZm9ybWF0TWVhc3VyZSh2YWx1ZS5ib3R0b21SaWdodCksXG4gICAgfTtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFBSSU1JVElWRSBGT1JNQVRURVJTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBmb3JtYXRNZWFzdXJlKHZhbHVlKSB7XG4gICAgLy8gSWYgaXQncyBhbHJlYWR5IGEgZGltZW5zaW9uIG9iamVjdCB3aXRoIHZhbHVlL3VuaXQsIG5vcm1hbGl6ZSBpdFxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLnZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUudW5pdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUudmFsdWUsXG4gICAgICAgICAgICB1bml0OiBmb3JtYXRVbml0KHZhbHVlLnVuaXQpXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIElmIGl0J3MgYSBudW1iZXIsIGNyZWF0ZSBkaW1lbnNpb24gb2JqZWN0XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIHVuaXQ6ICdweCdcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gSWYgaXQgaGFzIG1lYXN1cmUvdW5pdCAoU3VwZXJub3ZhIGZvcm1hdCksIGNvbnZlcnRcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5tZWFzdXJlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZS5tZWFzdXJlLFxuICAgICAgICAgICAgdW5pdDogZm9ybWF0VW5pdCh2YWx1ZS51bml0KVxuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBGYWxsYmFjayBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSAoc3RyaW5nIHZhbHVlcylcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIC8vIERlZmF1bHRcbiAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgdW5pdDogJ3B4J1xuICAgIH07XG59XG5mdW5jdGlvbiBmb3JtYXRDb2xvclZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuICcjMDAwMDAwJztcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJylcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIGlmICh2YWx1ZS5oZXgpXG4gICAgICAgIHJldHVybiAnIycgKyB2YWx1ZS5oZXg7XG4gICAgLy8gR2V0IFJHQiB2YWx1ZXNcbiAgICBsZXQgciA9IDAsIGcgPSAwLCBiID0gMDtcbiAgICBpZiAodmFsdWUuY29sb3IgJiYgdHlwZW9mIHZhbHVlLmNvbG9yLnIgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHIgPSB2YWx1ZS5jb2xvci5yO1xuICAgICAgICBnID0gdmFsdWUuY29sb3IuZztcbiAgICAgICAgYiA9IHZhbHVlLmNvbG9yLmI7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZS5yID09PSAnbnVtYmVyJykge1xuICAgICAgICByID0gdmFsdWUucjtcbiAgICAgICAgZyA9IHZhbHVlLmc7XG4gICAgICAgIGIgPSB2YWx1ZS5iO1xuICAgIH1cbiAgICAvLyBHZXQgYWxwaGEvb3BhY2l0eSAoMC0xKVxuICAgIGxldCBhbHBoYSA9IDE7XG4gICAgaWYgKHZhbHVlLm9wYWNpdHkgJiYgdHlwZW9mIHZhbHVlLm9wYWNpdHkubWVhc3VyZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgYWxwaGEgPSB2YWx1ZS5vcGFjaXR5Lm1lYXN1cmU7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZS5hID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbHBoYSA9IHZhbHVlLmE7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZS5hbHBoYSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgYWxwaGEgPSB2YWx1ZS5hbHBoYTtcbiAgICB9XG4gICAgLy8gT3V0cHV0IHdpdGggYWxwaGEgaWYgbm90IGZ1bGx5IG9wYXF1ZVxuICAgIGlmIChhbHBoYSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIHRvSGV4V2l0aEFscGhhKHIsIGcsIGIsIGFscGhhKTtcbiAgICB9XG4gICAgcmV0dXJuIHRvSGV4KHIsIGcsIGIpO1xufVxuZnVuY3Rpb24gdG9IZXgociwgZywgYikge1xuICAgIGNvbnN0IHJoID0gTWF0aC5yb3VuZChyKS50b1N0cmluZygxNik7XG4gICAgY29uc3QgZ2ggPSBNYXRoLnJvdW5kKGcpLnRvU3RyaW5nKDE2KTtcbiAgICBjb25zdCBiaCA9IE1hdGgucm91bmQoYikudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiAnIycgKyBwYWQyKHJoKSArIHBhZDIoZ2gpICsgcGFkMihiaCk7XG59XG5mdW5jdGlvbiB0b0hleFdpdGhBbHBoYShyLCBnLCBiLCBhKSB7XG4gICAgY29uc3QgcmggPSBNYXRoLnJvdW5kKHIpLnRvU3RyaW5nKDE2KTtcbiAgICBjb25zdCBnaCA9IE1hdGgucm91bmQoZykudG9TdHJpbmcoMTYpO1xuICAgIGNvbnN0IGJoID0gTWF0aC5yb3VuZChiKS50b1N0cmluZygxNik7XG4gICAgY29uc3QgYWggPSBNYXRoLnJvdW5kKGEgKiAyNTUpLnRvU3RyaW5nKDE2KTtcbiAgICByZXR1cm4gJyMnICsgcGFkMihyaCkgKyBwYWQyKGdoKSArIHBhZDIoYmgpICsgcGFkMihhaCk7XG59XG5mdW5jdGlvbiBwYWQyKHMpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPT09IDEgPyAnMCcgKyBzIDogcztcbn1cbmZ1bmN0aW9uIGZvcm1hdFVuaXQodW5pdCkge1xuICAgIGlmICghdW5pdClcbiAgICAgICAgcmV0dXJuICdweCc7XG4gICAgY29uc3QgdSA9IFN0cmluZyh1bml0KS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh1ID09PSAncGl4ZWxzJyB8fCB1ID09PSAncHgnKVxuICAgICAgICByZXR1cm4gJ3B4JztcbiAgICBpZiAodSA9PT0gJ3BlcmNlbnQnIHx8IHUgPT09ICclJylcbiAgICAgICAgcmV0dXJuICclJztcbiAgICBpZiAodSA9PT0gJ2VtcycgfHwgdSA9PT0gJ2VtJylcbiAgICAgICAgcmV0dXJuICdlbSc7XG4gICAgaWYgKHUgPT09ICdwb2ludHMnIHx8IHUgPT09ICdwdCcpXG4gICAgICAgIHJldHVybiAncHQnO1xuICAgIGlmICh1ID09PSAncmF3JylcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIHJldHVybiB1O1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUkVGRVJFTkNFIFBBVEggQlVJTERJTkdcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGJ1aWxkUmVmUGF0aCh0b2tlbiwgZ3JvdXBzKSB7XG4gICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKTtcbiAgICBjb25zdCBncm91cFBhdGggPSBncm91cCA/IGdyb3VwLnBhdGggOiBbXTtcbiAgICBjb25zdCBncm91cE5hbWUgPSBncm91cCA/IGdyb3VwLm5hbWUgOiAnJztcbiAgICAvLyBCdWlsZCBmdWxsIGdyb3VwIHBhdGg6IGdyb3VwLnBhdGggKyBncm91cC5uYW1lXG4gICAgY29uc3QgZnVsbEdyb3VwUGF0aCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ3JvdXBQYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZ1bGxHcm91cFBhdGgucHVzaChncm91cFBhdGhbaV0pO1xuICAgIH1cbiAgICBpZiAoZ3JvdXBOYW1lICYmICEoZ3JvdXAgPT09IG51bGwgfHwgZ3JvdXAgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGdyb3VwLmlzUm9vdCkpIHtcbiAgICAgICAgZnVsbEdyb3VwUGF0aC5wdXNoKGdyb3VwTmFtZSk7XG4gICAgfVxuICAgIC8vIEJ1aWxkIHBhdGg6IHVzZSBmdWxsIHBhdGggKGNvbGxlY3Rpb24gaGFuZGxlcyBwbGF0Zm9ybSByb3V0aW5nKVxuICAgIC8vIFJlc3VsdDogXCJjb2xvci41MDBcIiBvciBcInNlbWFudGljLmNvbG9yLnByaW1hcnlcIlxuICAgIGNvbnN0IHBhcnRzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmdWxsR3JvdXBQYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcnRzLnB1c2goc2FmZU5hbWUoZnVsbEdyb3VwUGF0aFtpXSkpO1xuICAgIH1cbiAgICBwYXJ0cy5wdXNoKHNhZmVOYW1lKHRva2VuLm5hbWUpKTtcbiAgICByZXR1cm4gcGFydHMuam9pbignLicpO1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVFlQRSBNQVBQSU5HXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBtYXBUeXBlKHRva2VuVHlwZSkge1xuICAgIGNvbnN0IHQgPSBTdHJpbmcodG9rZW5UeXBlKS50b0xvd2VyQ2FzZSgpO1xuICAgIC8vIERUQ0cgc3RhbmRhcmQgdHlwZXNcbiAgICBpZiAodCA9PT0gJ2NvbG9yJylcbiAgICAgICAgcmV0dXJuICdjb2xvcic7XG4gICAgaWYgKHQgPT09ICd0eXBvZ3JhcGh5JylcbiAgICAgICAgcmV0dXJuICd0eXBvZ3JhcGh5JztcbiAgICBpZiAodCA9PT0gJ2ZvbnRmYW1pbHknKVxuICAgICAgICByZXR1cm4gJ2ZvbnRGYW1pbHknO1xuICAgIGlmICh0ID09PSAnZm9udHdlaWdodCcpXG4gICAgICAgIHJldHVybiAnZm9udFdlaWdodCc7XG4gICAgaWYgKHQgPT09ICdzaGFkb3cnKVxuICAgICAgICByZXR1cm4gJ3NoYWRvdyc7XG4gICAgaWYgKHQgPT09ICdib3JkZXInKVxuICAgICAgICByZXR1cm4gJ2JvcmRlcic7XG4gICAgaWYgKHQgPT09ICdncmFkaWVudCcpXG4gICAgICAgIHJldHVybiAnZ3JhZGllbnQnO1xuICAgIGlmICh0ID09PSAnZHVyYXRpb24nKVxuICAgICAgICByZXR1cm4gJ2R1cmF0aW9uJztcbiAgICAvLyBBbGwgZGltZW5zaW9uLWxpa2UgdHlwZXMg4oaSIERUQ0cgZGltZW5zaW9uXG4gICAgaWYgKHQgPT09ICdkaW1lbnNpb24nIHx8IHQgPT09ICdtZWFzdXJlJylcbiAgICAgICAgcmV0dXJuICdkaW1lbnNpb24nO1xuICAgIGlmICh0ID09PSAnc2l6ZScpXG4gICAgICAgIHJldHVybiAnZGltZW5zaW9uJztcbiAgICBpZiAodCA9PT0gJ3NwYWNlJylcbiAgICAgICAgcmV0dXJuICdkaW1lbnNpb24nO1xuICAgIGlmICh0ID09PSAnZm9udHNpemUnKVxuICAgICAgICByZXR1cm4gJ2RpbWVuc2lvbic7XG4gICAgaWYgKHQgPT09ICdsaW5laGVpZ2h0JylcbiAgICAgICAgcmV0dXJuICdkaW1lbnNpb24nO1xuICAgIGlmICh0ID09PSAnbGV0dGVyc3BhY2luZycpXG4gICAgICAgIHJldHVybiAnZGltZW5zaW9uJztcbiAgICBpZiAodCA9PT0gJ3BhcmFncmFwaHNwYWNpbmcnKVxuICAgICAgICByZXR1cm4gJ2RpbWVuc2lvbic7XG4gICAgaWYgKHQgPT09ICdib3JkZXJ3aWR0aCcpXG4gICAgICAgIHJldHVybiAnZGltZW5zaW9uJztcbiAgICBpZiAodCA9PT0gJ3JhZGl1cycpXG4gICAgICAgIHJldHVybiAnZGltZW5zaW9uJztcbiAgICBpZiAodCA9PT0gJ2JvcmRlcnJhZGl1cycpXG4gICAgICAgIHJldHVybiAnZGltZW5zaW9uJztcbiAgICBpZiAodCA9PT0gJ2JsdXInKVxuICAgICAgICByZXR1cm4gJ2RpbWVuc2lvbic7XG4gICAgLy8gTnVtZXJpYyB0eXBlcyDihpIgRFRDRyBudW1iZXJcbiAgICBpZiAodCA9PT0gJ29wYWNpdHknKVxuICAgICAgICByZXR1cm4gJ251bWJlcic7XG4gICAgaWYgKHQgPT09ICd6aW5kZXgnKVxuICAgICAgICByZXR1cm4gJ251bWJlcic7XG4gICAgLy8gU3RyaW5nIHR5cGVzIOKGkiBEVENHIHN0cmluZ1xuICAgIGlmICh0ID09PSAnc3RyaW5nJyB8fCB0ID09PSAndGV4dCcpXG4gICAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICBpZiAodCA9PT0gJ3Byb2R1Y3Rjb3B5JylcbiAgICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIGlmICh0ID09PSAndGV4dGNhc2UnKVxuICAgICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgaWYgKHQgPT09ICd0ZXh0ZGVjb3JhdGlvbicpXG4gICAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICBpZiAodCA9PT0gJ3Zpc2liaWxpdHknKVxuICAgICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgLy8gTGVnYWN5OiAnRm9udCcgKGNvbWJpbmVkIGZhbWlseSt3ZWlnaHQpIOKGkiBjdXN0b20gdHlwZSB0byBwcmVzZXJ2ZSBkYXRhXG4gICAgaWYgKHQgPT09ICdmb250JylcbiAgICAgICAgcmV0dXJuICdmb250JztcbiAgICAvLyBGYWxsYmFjazogcmV0dXJuIGFzLWlzIChhbGxvd3MgY3VzdG9tIHR5cGVzIHRvIHBhc3MgdGhyb3VnaClcbiAgICByZXR1cm4gdDtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFVUSUxJVElFU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gc2FmZU5hbWUobmFtZSkge1xuICAgIHJldHVybiBTdHJpbmcobmFtZSB8fCAnJykucmVwbGFjZSgvXFxXKy9nLCAnLScpLnRvTG93ZXJDYXNlKCk7XG59XG5mdW5jdGlvbiBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZyA9IGdyb3Vwc1tpXTtcbiAgICAgICAgaWYgKGcudG9rZW5JZHMgJiYgZy50b2tlbklkcy5pbmRleE9mKHRva2VuLmlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gaXNGb250V2VpZ2h0VG9rZW4odG9rZW4sIGdyb3Vwcykge1xuICAgIHZhciBfYTtcbiAgICAvLyBPbmx5IGNoZWNrIGRpbWVuc2lvbi10eXBlIHRva2VucyAocGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uKVxuICAgIGNvbnN0IHR5cGUgPSBTdHJpbmcodG9rZW4udG9rZW5UeXBlKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh0eXBlICE9PSAnZGltZW5zaW9uJyAmJiB0eXBlICE9PSAnbWVhc3VyZScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBDaGVjayBncm91cCBwYXRoIGZvciAnZm9udC13ZWlnaHQnXG4gICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKTtcbiAgICBjb25zdCBmdWxsUGF0aCA9IGdyb3VwID8gWy4uLmdyb3VwLnBhdGgsIGdyb3VwLm5hbWVdLmpvaW4oJy4nKS50b0xvd2VyQ2FzZSgpIDogJyc7XG4gICAgY29uc3QgdG9rZW5OYW1lID0gdG9rZW4ubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IGhhc0ZvbnRXZWlnaHRJblBhdGggPSBmdWxsUGF0aC5pbmNsdWRlcygnZm9udC13ZWlnaHQnKSB8fFxuICAgICAgICBmdWxsUGF0aC5pbmNsdWRlcygnZm9udHdlaWdodCcpO1xuICAgIGNvbnN0IGhhc0ZvbnRXZWlnaHRJbk5hbWUgPSB0b2tlbk5hbWUuaW5jbHVkZXMoJ2ZvbnQtd2VpZ2h0JykgfHxcbiAgICAgICAgdG9rZW5OYW1lLmluY2x1ZGVzKCdmb250d2VpZ2h0Jyk7XG4gICAgLy8gTXVzdCBoYXZlIGZvbnQtd2VpZ2h0IGluIHBhdGggb3IgbmFtZVxuICAgIGlmICghaGFzRm9udFdlaWdodEluUGF0aCAmJiAhaGFzRm9udFdlaWdodEluTmFtZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFZhbGlkYXRlIHZhbHVlIGlzIGluIHZhbGlkIGZvbnQtd2VpZ2h0IHJhbmdlICgxMDAtOTAwKVxuICAgIGNvbnN0IHZhbHVlID0gdG9rZW4udmFsdWU7XG4gICAgY29uc3QgbWVhc3VyZSA9IChfYSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB2b2lkIDAgPyB2b2lkIDAgOiB2YWx1ZS5tZWFzdXJlKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogdmFsdWUudmFsdWU7XG4gICAgaWYgKHR5cGVvZiBtZWFzdXJlID09PSAnbnVtYmVyJyAmJiBtZWFzdXJlID49IDEwMCAmJiBtZWFzdXJlIDw9IDkwMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gaXNMaW5lSGVpZ2h0VG9rZW4odG9rZW4sIGdyb3Vwcykge1xuICAgIHZhciBfYTtcbiAgICAvLyBDaGVjayBkaW1lbnNpb24tdHlwZSB0b2tlbnMgQU5EIExpbmVIZWlnaHQgdHlwZVxuICAgIGNvbnN0IHR5cGUgPSBTdHJpbmcodG9rZW4udG9rZW5UeXBlKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh0eXBlICE9PSAnZGltZW5zaW9uJyAmJiB0eXBlICE9PSAnbWVhc3VyZScgJiYgdHlwZSAhPT0gJ2xpbmVoZWlnaHQnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQ2hlY2sgZ3JvdXAgcGF0aCBmb3IgJ2xpbmUtaGVpZ2h0J1xuICAgIGNvbnN0IGdyb3VwID0gZmluZEdyb3VwRm9yVG9rZW4odG9rZW4sIGdyb3Vwcyk7XG4gICAgY29uc3QgZnVsbFBhdGggPSBncm91cCA/IFsuLi5ncm91cC5wYXRoLCBncm91cC5uYW1lXS5qb2luKCcuJykudG9Mb3dlckNhc2UoKSA6ICcnO1xuICAgIGNvbnN0IHRva2VuTmFtZSA9IHRva2VuLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBoYXNMaW5lSGVpZ2h0SW5QYXRoID0gZnVsbFBhdGguaW5jbHVkZXMoJ2xpbmUtaGVpZ2h0JykgfHxcbiAgICAgICAgZnVsbFBhdGguaW5jbHVkZXMoJ2xpbmVoZWlnaHQnKTtcbiAgICBjb25zdCBoYXNMaW5lSGVpZ2h0SW5OYW1lID0gdG9rZW5OYW1lLmluY2x1ZGVzKCdsaW5lLWhlaWdodCcpIHx8XG4gICAgICAgIHRva2VuTmFtZS5pbmNsdWRlcygnbGluZWhlaWdodCcpO1xuICAgIC8vIE11c3QgaGF2ZSBsaW5lLWhlaWdodCBpbiBwYXRoIG9yIG5hbWVcbiAgICBpZiAoIWhhc0xpbmVIZWlnaHRJblBhdGggJiYgIWhhc0xpbmVIZWlnaHRJbk5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBWYWxpZGF0ZSB2YWx1ZSBpcyBpbiB2YWxpZCBsaW5lLWhlaWdodCByYW5nZSAodHlwaWNhbGx5IDAtMylcbiAgICBjb25zdCB2YWx1ZSA9IHRva2VuLnZhbHVlO1xuICAgIGNvbnN0IG1lYXN1cmUgPSAoX2EgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogdmFsdWUubWVhc3VyZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHZhbHVlLnZhbHVlO1xuICAgIGlmICh0eXBlb2YgbWVhc3VyZSA9PT0gJ251bWJlcicgJiYgbWVhc3VyZSA+PSAwICYmIG1lYXN1cmUgPD0gMTApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGZpbmRUaGVtZUJ5SWQoYXJyLCBpZCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcnJbaV0uaWQgPT09IGlkKVxuICAgICAgICAgICAgcmV0dXJuIGFycltpXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiB0b0FycmF5KGlucHV0KSB7XG4gICAgaWYgKCFpbnB1dClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSlcbiAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnICYmIHR5cGVvZiBpbnB1dC5sZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnN0IGFyciA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcnIucHVzaChpbnB1dFtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRklMRSBPVVRQVVRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGNyZWF0ZUZpbGUoZmlsZVBhdGgsIGNvbnRlbnQpIHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gZmlsZVBhdGgucmVwbGFjZSgvXlxcLysvLCAnJyk7XG4gICAgY29uc3QgcGFydHMgPSBub3JtYWxpemVkLnNwbGl0KCcvJyk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBwYXJ0cy5wb3AoKSB8fCAnb3V0cHV0Lmpzb24nO1xuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhcnRzLmpvaW4oJy8nKTtcbiAgICBjb25zdCBqc29uQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQsIG51bGwsIDIpO1xuICAgIC8vIFRyeSBGaWxlSGVscGVyIGZpcnN0LCBmYWxsYmFjayB0byBwbGFpbiBvYmplY3RcbiAgICBpZiAodHlwZW9mIEZpbGVIZWxwZXIgIT09ICd1bmRlZmluZWQnICYmIEZpbGVIZWxwZXIuY3JlYXRlVGV4dEZpbGUpIHtcbiAgICAgICAgcmV0dXJuIEZpbGVIZWxwZXIuY3JlYXRlVGV4dEZpbGUoeyByZWxhdGl2ZVBhdGgsIGZpbGVOYW1lLCBjb250ZW50OiBqc29uQ29udGVudCB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGF0aDogcmVsYXRpdmVQYXRoLmxlbmd0aCA+IDAgPyByZWxhdGl2ZVBhdGggOiAnLicsXG4gICAgICAgIG5hbWU6IGZpbGVOYW1lLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGNvbnRlbnQ6IGpzb25Db250ZW50LFxuICAgIH07XG59XG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IHt9O1xuX193ZWJwYWNrX21vZHVsZXNfX1tcIi4vc3JjL2luZGV4LnRzXCJdLmNhbGwoX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=