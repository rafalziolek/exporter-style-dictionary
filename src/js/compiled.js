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
    // Check for top-level reference FIRST
    if (value && value.referencedTokenId) {
        const refToken = tokenById[value.referencedTokenId];
        if (refToken) {
            return {
                $value: '{' + buildRefPath(refToken, groups) + '}',
                $type: mapType(token.tokenType),
            };
        }
    }
    // Format raw value
    const formatted = formatValue(value, token.tokenType, tokenById, groups);
    const result = {
        $value: formatted,
        $type: mapType(token.tokenType),
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
    // Font: has .family
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
    if (t === 'color')
        return 'color';
    if (t === 'dimension' || t === 'measure')
        return 'dimension';
    if (t === 'typography')
        return 'typography';
    if (t === 'shadow')
        return 'shadow';
    if (t === 'border')
        return 'border';
    if (t === 'radius')
        return 'borderRadius';
    if (t === 'gradient')
        return 'gradient';
    if (t === 'font')
        return 'fontFamily';
    if (t === 'text' || t === 'string')
        return 'string';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxrQ0FBa0M7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQix3QkFBd0I7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxrQ0FBa0M7QUFDdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsMkNBQTJDO0FBQ2xGO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxrQ0FBa0M7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGtDQUFrQztBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isc0JBQXNCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsMEJBQTBCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLG1CQUFtQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isa0JBQWtCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsOENBQThDO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O1VFandCQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3VwZXJub3ZhLWV4cG9ydGVyLXN0eWxlLWRpY3Rpb25hcnkvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vc3VwZXJub3ZhLWV4cG9ydGVyLXN0eWxlLWRpY3Rpb25hcnkvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9zdXBlcm5vdmEtZXhwb3J0ZXItc3R5bGUtZGljdGlvbmFyeS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3VwZXJub3ZhLWV4cG9ydGVyLXN0eWxlLWRpY3Rpb25hcnkvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNpbXBsZSBUb2tlbiBFeHBvcnRlciAtIENsZWFuIEltcGxlbWVudGF0aW9uXG4vLyBVc2VzIGdyb3VwLnBhdGggZm9yIHRva2VuIGxvY2F0aW9uLCB0b2tlbkJ5SWQgbWFwIGZvciByZWZlcmVuY2VzXG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIE1BSU4gRVhQT1JUXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5QdWxzYXIuZXhwb3J0KChzZGssIGNvbnRleHQpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICBjb25zdCByZW1vdGUgPSB7XG4gICAgICAgIGRlc2lnblN5c3RlbUlkOiBjb250ZXh0LmRzSWQsXG4gICAgICAgIHZlcnNpb25JZDogY29udGV4dC52ZXJzaW9uSWQsXG4gICAgfTtcbiAgICAvLyAxLiBGZXRjaCBhbGwgZGF0YVxuICAgIGNvbnN0IGJhc2VUb2tlbnMgPSB0b0FycmF5KHlpZWxkIHNkay50b2tlbnMuZ2V0VG9rZW5zKHJlbW90ZSkpO1xuICAgIGNvbnN0IGdyb3VwcyA9IHRvQXJyYXkoeWllbGQgc2RrLnRva2Vucy5nZXRUb2tlbkdyb3VwcyhyZW1vdGUpKTtcbiAgICBjb25zdCB0aGVtZXMgPSB0b0FycmF5KHlpZWxkIHNkay50b2tlbnMuZ2V0VG9rZW5UaGVtZXMocmVtb3RlKSk7XG4gICAgLy8gMi4gQnVpbGQgYmFzZSB0b2tlbiBsb29rdXAgbWFwIChmb3IgY29yZSB0b2tlbnMgLSB0aGV5IGRvbid0IGNoYW5nZSB3aXRoIHRoZW1lcylcbiAgICBjb25zdCBiYXNlVG9rZW5CeUlkID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYXNlVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJhc2VUb2tlbkJ5SWRbYmFzZVRva2Vuc1tpXS5pZF0gPSBiYXNlVG9rZW5zW2ldO1xuICAgIH1cbiAgICAvLyAzLiBHcm91cCBiYXNlIHRva2VucyBieSBjb2xsZWN0aW9uXG4gICAgY29uc3QgYmFzZUdyb3VwZWQgPSBncm91cEJ5UGxhdGZvcm0oYmFzZVRva2VucywgZ3JvdXBzKTtcbiAgICAvLyA0LiBCdWlsZCBvdXRwdXQgZmlsZXNcbiAgICBjb25zdCBvdXRwdXRzID0gW107XG4gICAgLy8gRGVidWc6IHNob3cgY29sbGVjdGlvbiBkZXRlY3Rpb24gcmVzdWx0c1xuICAgIGNvbnN0IGRlYnVnQ29sbGVjdGlvbnMgPSB7XG4gICAgICAgIGNvdW50czoge1xuICAgICAgICAgICAgY29yZTogYmFzZUdyb3VwZWQuY29yZS5sZW5ndGgsXG4gICAgICAgICAgICB3ZWI6IGJhc2VHcm91cGVkLndlYi5sZW5ndGgsXG4gICAgICAgICAgICBtb2JpbGU6IGJhc2VHcm91cGVkLm1vYmlsZS5sZW5ndGgsXG4gICAgICAgICAgICB1bmtub3duOiBiYXNlR3JvdXBlZC51bmtub3duLmxlbmd0aCxcbiAgICAgICAgfSxcbiAgICAgICAgYWxsQ29sbGVjdGlvblZhbHVlczoge30sXG4gICAgICAgIHVua25vd25Ub2tlbkRldGFpbHM6IFtdLFxuICAgICAgICBzYW1wbGVUb2tlbnM6IFtdLFxuICAgICAgICBzaGFkb3dUb2tlbnM6IFtdLFxuICAgIH07XG4gICAgLy8gQ291bnQgYWxsIHVuaXF1ZSBjb2xsZWN0aW9uIHZhbHVlc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFzZVRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjb2wgPSBnZXRUb2tlbkNvbGxlY3Rpb24oYmFzZVRva2Vuc1tpXSk7XG4gICAgICAgIGRlYnVnQ29sbGVjdGlvbnMuYWxsQ29sbGVjdGlvblZhbHVlc1tjb2xdID0gKGRlYnVnQ29sbGVjdGlvbnMuYWxsQ29sbGVjdGlvblZhbHVlc1tjb2xdIHx8IDApICsgMTtcbiAgICB9XG4gICAgLy8gU2hvdyBkZXRhaWxzIG9mIHVua25vd24gdG9rZW5zICh3aGF0IGNvbGxlY3Rpb24gZG8gdGhleSBoYXZlPylcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWluKGJhc2VHcm91cGVkLnVua25vd24ubGVuZ3RoLCAxMCk7IGkrKykge1xuICAgICAgICBjb25zdCB0ID0gYmFzZUdyb3VwZWQudW5rbm93bltpXTtcbiAgICAgICAgY29uc3QgcHJvcHMgPSB0LnByb3BlcnRpZXMgfHwgW107XG4gICAgICAgIGNvbnN0IHByb3BWYWx1ZXMgPSB0LnByb3BlcnR5VmFsdWVzIHx8IHt9O1xuICAgICAgICBjb25zdCBncm91cCA9IGZpbmRHcm91cEZvclRva2VuKHQsIGdyb3Vwcyk7XG4gICAgICAgIC8vIEZpbmQgY29sbGVjdGlvbiBwcm9wZXJ0eSBpbmZvXG4gICAgICAgIGxldCBjb2xsZWN0aW9uUHJvcEluZm8gPSBudWxsO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHByb3BzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gcHJvcHNbal07XG4gICAgICAgICAgICBpZiAoKHAubmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbGxlY3Rpb24nIHx8IChwLmNvZGVOYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpID09PSAnY29sbGVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uUHJvcEluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29kZU5hbWU6IHAuY29kZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGlkOiBwLmlkLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiAocC5vcHRpb25zIHx8IFtdKS5tYXAoKG8pID0+ICh7IGlkOiBvLmlkLCBuYW1lOiBvLm5hbWUgfSkpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZGVidWdDb2xsZWN0aW9ucy51bmtub3duVG9rZW5EZXRhaWxzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogdC5uYW1lLFxuICAgICAgICAgICAgZ3JvdXBQYXRoOiBncm91cCA/IGdyb3VwLnBhdGggOiBudWxsLFxuICAgICAgICAgICAgaGFzQ29sbGVjdGlvblByb3A6ICEhY29sbGVjdGlvblByb3BJbmZvLFxuICAgICAgICAgICAgY29sbGVjdGlvblByb3BJbmZvOiBjb2xsZWN0aW9uUHJvcEluZm8sXG4gICAgICAgICAgICBwcm9wZXJ0eVZhbHVlS2V5czogT2JqZWN0LmtleXMocHJvcFZhbHVlcyksXG4gICAgICAgICAgICByYXdQcm9wZXJ0eVZhbHVlczogSlNPTi5zdHJpbmdpZnkocHJvcFZhbHVlcykuc3Vic3RyaW5nKDAsIDMwMCksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBTYW1wbGUgYSBmZXcgdG9rZW5zIGZyb20gZWFjaCBncm91cFxuICAgIGNvbnN0IGFsbFNhbXBsZXMgPSBbLi4uYmFzZUdyb3VwZWQuY29yZS5zbGljZSgwLCAyKSwgLi4uYmFzZUdyb3VwZWQud2ViLnNsaWNlKDAsIDIpLCAuLi5iYXNlR3JvdXBlZC5tb2JpbGUuc2xpY2UoMCwgMildO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsU2FtcGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0ID0gYWxsU2FtcGxlc1tpXTtcbiAgICAgICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0LCBncm91cHMpO1xuICAgICAgICBkZWJ1Z0NvbGxlY3Rpb25zLnNhbXBsZVRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IHQubmFtZSxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGdldFRva2VuQ29sbGVjdGlvbih0KSxcbiAgICAgICAgICAgIGdyb3VwUGF0aDogZ3JvdXAgPyBncm91cC5wYXRoIDogbnVsbCxcbiAgICAgICAgICAgIGdyb3VwTmFtZTogZ3JvdXAgPyBncm91cC5uYW1lIDogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIEZpbmQgYW5kIGNhcHR1cmUgc2hhZG93IHRva2VucywgZXNwZWNpYWxseSBzZWNvbmRhcnkgYnV0dG9uIGJveC1zaGFkb3dcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJhc2VUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgdCA9IGJhc2VUb2tlbnNbaV07XG4gICAgICAgIGlmICh0LnRva2VuVHlwZSA9PT0gJ1NoYWRvdycgJiYgdC5pc1ZpcnR1YWwgIT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGdyb3VwID0gZmluZEdyb3VwRm9yVG9rZW4odCwgZ3JvdXBzKTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdC52YWx1ZTtcbiAgICAgICAgICAgIC8vIExvb2sgZm9yIHNlY29uZGFyeSBidXR0b24gc2hhZG93IG9yIGNhcHR1cmUgZmlyc3QgZmV3IHNoYWRvd3NcbiAgICAgICAgICAgIGNvbnN0IGlzU2Vjb25kYXJ5QnV0dG9uID0gdC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3NlY29uZGFyeScpIHx8XG4gICAgICAgICAgICAgICAgKGdyb3VwICYmIGdyb3VwLnBhdGguam9pbignLycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3NlY29uZGFyeScpKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQm94U2hhZG93ID0gdC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2JveC1zaGFkb3cnKSB8fFxuICAgICAgICAgICAgICAgIHQubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdib3gnKSB8fFxuICAgICAgICAgICAgICAgIChncm91cCAmJiBncm91cC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2J1dHRvbicpKTtcbiAgICAgICAgICAgIGlmIChpc1NlY29uZGFyeUJ1dHRvbiB8fCBpc0JveFNoYWRvdyB8fCBkZWJ1Z0NvbGxlY3Rpb25zLnNoYWRvd1Rva2Vucy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgZGVidWdDb2xsZWN0aW9ucy5zaGFkb3dUb2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5UeXBlOiB0LnRva2VuVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBQYXRoOiBncm91cCA/IGdyb3VwLnBhdGggOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBncm91cE5hbWU6IGdyb3VwID8gZ3JvdXAubmFtZSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxQYXRoOiBncm91cCA/IFsuLi5ncm91cC5wYXRoLCBncm91cC5uYW1lLCB0Lm5hbWVdLmpvaW4oJy4nKSA6IHQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVTdHJ1Y3R1cmU6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpKSwgLy8gRGVlcCBjbG9uZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG91dHB1dHMucHVzaChjcmVhdGVGaWxlKCdfZGVidWdfY29sbGVjdGlvbnMuanNvbicsIGRlYnVnQ29sbGVjdGlvbnMpKTtcbiAgICAvLyBDb3JlIHRva2VucyAoYWx3YXlzIGV4cG9ydGVkIG9uY2UsIHNoYXJlZCBhY3Jvc3MgYWxsIHRoZW1lcylcbiAgICBpZiAoYmFzZUdyb3VwZWQuY29yZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHRyZWUgPSBidWlsZFRyZWUoYmFzZUdyb3VwZWQuY29yZSwgZ3JvdXBzLCBiYXNlVG9rZW5CeUlkLCAwKTsgLy8gMCA9IHVzZSBmdWxsIHBhdGhcbiAgICAgICAgb3V0cHV0cy5wdXNoKGNyZWF0ZUZpbGUoJ2NvcmUvY29yZS5qc29uJywgdHJlZSkpO1xuICAgIH1cbiAgICAvLyA0LiBFeHBvcnQgQUxMIHRoZW1lc1xuICAgIGZvciAobGV0IHQgPSAwOyB0IDwgdGhlbWVzLmxlbmd0aDsgdCsrKSB7XG4gICAgICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzW3RdO1xuICAgICAgICBjb25zdCB0aGVtZU5hbWUgPSB0aGVtZS5uYW1lOyAvLyBlLmcuLCBcImN1c3RvbWVyL2xpZ2h0XCIgb3IgXCJwYXRpZW50L2RhcmtcIlxuICAgICAgICAvLyBCdWlsZCB0aGVtZWQgdG9rZW5zIGJ5IG1lcmdpbmcgb3ZlcnJpZGRlblRva2VucyB3aXRoIGJhc2UgdG9rZW5zXG4gICAgICAgIC8vIFRoZSB0aGVtZS5vdmVycmlkZGVuVG9rZW5zIGNvbnRhaW5zIHRoZSBhY3R1YWwgdGhlbWVkIHZhbHVlc1xuICAgICAgICBjb25zdCBvdmVycmlkZGVuVG9rZW5zID0gdG9BcnJheSh0aGVtZS5vdmVycmlkZGVuVG9rZW5zIHx8IFtdKTtcbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9mIG92ZXJyaWRkZW4gdG9rZW5zIGJ5IElEXG4gICAgICAgIGNvbnN0IG92ZXJyaWRkZW5CeUlkID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3ZlcnJpZGRlblRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgb3ZlcnJpZGRlbkJ5SWRbb3ZlcnJpZGRlblRva2Vuc1tpXS5pZF0gPSBvdmVycmlkZGVuVG9rZW5zW2ldO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1lcmdlOiB1c2Ugb3ZlcnJpZGRlbiB0b2tlbiBpZiBleGlzdHMsIG90aGVyd2lzZSB1c2UgYmFzZSB0b2tlblxuICAgICAgICBjb25zdCB0aGVtZWRUb2tlbnMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYXNlVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBiYXNlVG9rZW4gPSBiYXNlVG9rZW5zW2ldO1xuICAgICAgICAgICAgY29uc3Qgb3ZlcnJpZGRlbiA9IG92ZXJyaWRkZW5CeUlkW2Jhc2VUb2tlbi5pZF07XG4gICAgICAgICAgICB0aGVtZWRUb2tlbnMucHVzaChvdmVycmlkZGVuIHx8IGJhc2VUb2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgdG9rZW4gbG9va3VwIGZvciB0aGlzIHRoZW1lXG4gICAgICAgIGNvbnN0IHRva2VuQnlJZCA9IHt9O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoZW1lZFRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdG9rZW5CeUlkW3RoZW1lZFRva2Vuc1tpXS5pZF0gPSB0aGVtZWRUb2tlbnNbaV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gR3JvdXAgdGhlbWVkIHRva2VucyBieSBwbGF0Zm9ybVxuICAgICAgICBjb25zdCBncm91cGVkID0gZ3JvdXBCeVBsYXRmb3JtKHRoZW1lZFRva2VucywgZ3JvdXBzKTtcbiAgICAgICAgLy8gRXhwb3J0IHBsYXRmb3JtLXNwZWNpZmljIHRva2VucyBmb3IgdGhpcyB0aGVtZVxuICAgICAgICBjb25zdCBwbGF0Zm9ybXMgPSBbJ3dlYicsICdtb2JpbGUnXTtcbiAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBwbGF0Zm9ybXMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXRmb3JtID0gcGxhdGZvcm1zW3BdO1xuICAgICAgICAgICAgY29uc3QgcGxhdGZvcm1Ub2tlbnMgPSBncm91cGVkW3BsYXRmb3JtXSB8fCBbXTtcbiAgICAgICAgICAgIGlmIChwbGF0Zm9ybVRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJlZSA9IGJ1aWxkVHJlZShwbGF0Zm9ybVRva2VucywgZ3JvdXBzLCB0b2tlbkJ5SWQsIDApOyAvLyAwID0gdXNlIGZ1bGwgcGF0aFxuICAgICAgICAgICAgICAgIG91dHB1dHMucHVzaChjcmVhdGVGaWxlKHBsYXRmb3JtICsgJy8nICsgdGhlbWVOYW1lICsgJy5qc29uJywgdHJlZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXRzO1xufSkpO1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gR1JPVVBJTkcgKGJ5IENvbGxlY3Rpb24gcHJvcGVydHkpXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBnZXRUb2tlbkNvbGxlY3Rpb24odG9rZW4pIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdG9rZW4ucHJvcGVydGllcyB8fCBbXTtcbiAgICBjb25zdCBwcm9wZXJ0eVZhbHVlcyA9IHRva2VuLnByb3BlcnR5VmFsdWVzIHx8IHt9O1xuICAgIC8vIEZpbmQgdGhlIENvbGxlY3Rpb24gcHJvcGVydHkgZGVmaW5pdGlvblxuICAgIGxldCBjb2xsZWN0aW9uUHJvcCA9IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHByb3AgPSBwcm9wZXJ0aWVzW2ldO1xuICAgICAgICBjb25zdCBuYW1lID0gKHByb3AubmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgY29kZU5hbWUgPSAocHJvcC5jb2RlTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdjb2xsZWN0aW9uJyB8fCBjb2RlTmFtZSA9PT0gJ2NvbGxlY3Rpb24nKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uUHJvcCA9IHByb3A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWNvbGxlY3Rpb25Qcm9wKVxuICAgICAgICByZXR1cm4gJ3Vua25vd24nO1xuICAgIC8vIEdldCB0aGUgdmFsdWUgLSBjb3VsZCBiZSBrZXllZCBieSBpZCBvciBjb2RlTmFtZVxuICAgIGxldCByYXdWYWx1ZSA9IHByb3BlcnR5VmFsdWVzW2NvbGxlY3Rpb25Qcm9wLmlkXSB8fCBwcm9wZXJ0eVZhbHVlc1tjb2xsZWN0aW9uUHJvcC5jb2RlTmFtZV0gfHwgcHJvcGVydHlWYWx1ZXNbJ2NvbGxlY3Rpb24nXTtcbiAgICBpZiAoIXJhd1ZhbHVlKVxuICAgICAgICByZXR1cm4gJ3Vua25vd24nO1xuICAgIC8vIElmIGl0J3MgYW4gb2JqZWN0IHdpdGggaWQsIHJlc29sdmUgZnJvbSBvcHRpb25zXG4gICAgY29uc3QgdmFsdWVJZCA9IHR5cGVvZiByYXdWYWx1ZSA9PT0gJ3N0cmluZycgPyByYXdWYWx1ZSA6IChyYXdWYWx1ZS5pZCB8fCByYXdWYWx1ZS52YWx1ZSk7XG4gICAgLy8gRmluZCBtYXRjaGluZyBvcHRpb25cbiAgICBjb25zdCBvcHRpb25zID0gY29sbGVjdGlvblByb3Aub3B0aW9ucyB8fCBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgb3B0ID0gb3B0aW9uc1tpXTtcbiAgICAgICAgaWYgKG9wdC5pZCA9PT0gdmFsdWVJZCB8fCBvcHQudmFsdWUgPT09IHZhbHVlSWQgfHwgb3B0Lm5hbWUgPT09IHZhbHVlSWQpIHtcbiAgICAgICAgICAgIHJldHVybiAob3B0Lm5hbWUgfHwgb3B0LnZhbHVlIHx8IG9wdC5pZCB8fCAndW5rbm93bicpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmFsbGJhY2s6IHJldHVybiB0aGUgdmFsdWUgaXRzZWxmIGlmIGl0J3MgYSBzdHJpbmdcbiAgICBpZiAodHlwZW9mIHZhbHVlSWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZUlkLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICAgIHJldHVybiAndW5rbm93bic7XG59XG5mdW5jdGlvbiBncm91cEJ5UGxhdGZvcm0odG9rZW5zLCBncm91cHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgIGNvcmU6IFtdLFxuICAgICAgICB3ZWI6IFtdLFxuICAgICAgICBtb2JpbGU6IFtdLFxuICAgICAgICB1bmtub3duOiBbXSxcbiAgICB9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gZ2V0VG9rZW5Db2xsZWN0aW9uKHRva2VuKTtcbiAgICAgICAgaWYgKGNvbGxlY3Rpb24gPT09ICdjb3JlJykge1xuICAgICAgICAgICAgcmVzdWx0LmNvcmUucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29sbGVjdGlvbiA9PT0gJ3dlYicpIHtcbiAgICAgICAgICAgIHJlc3VsdC53ZWIucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29sbGVjdGlvbiA9PT0gJ21vYmlsZScpIHtcbiAgICAgICAgICAgIHJlc3VsdC5tb2JpbGUucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudW5rbm93bi5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVFJFRSBCVUlMRElOR1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gYnVpbGRUcmVlKHRva2VucywgZ3JvdXBzLCB0b2tlbkJ5SWQsIHNraXBMZXZlbHMpIHtcbiAgICBjb25zdCB0cmVlID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICAgIC8vIFNraXAgdmlydHVhbCBzaGFkb3cgdG9rZW5zXG4gICAgICAgIGlmICh0b2tlbi5pc1ZpcnR1YWwgPT09IHRydWUgJiYgdG9rZW4udG9rZW5UeXBlID09PSAnU2hhZG93Jykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2tpcCB0b2tlbnMgd2l0aCB1bmRlcnNjb3JlIGluIG5hbWUgKGludGVybmFsL3ByaXZhdGUgdG9rZW5zKVxuICAgICAgICBpZiAodG9rZW4ubmFtZS5pbmRleE9mKCdfJykgIT09IC0xKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBncm91cCA9IGZpbmRHcm91cEZvclRva2VuKHRva2VuLCBncm91cHMpO1xuICAgICAgICAvLyBTa2lwIHRva2VucyBpbiBncm91cHMgd2l0aCB1bmRlcnNjb3JlIGluIG5hbWUgb3IgcGF0aFxuICAgICAgICBpZiAoZ3JvdXApIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGdyb3VwIG5hbWVcbiAgICAgICAgICAgIGlmIChncm91cC5uYW1lLmluZGV4T2YoJ18nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGdyb3VwIHBhdGhcbiAgICAgICAgICAgIGxldCBoYXNVbmRlcnNjb3JlSW5QYXRoID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IGdyb3VwLnBhdGgubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXAucGF0aFtwXS5pbmRleE9mKCdfJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc1VuZGVyc2NvcmVJblBhdGggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGFzVW5kZXJzY29yZUluUGF0aCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIGZ1bGwgZ3JvdXAgcGF0aDogZ3JvdXAucGF0aCArIGdyb3VwLm5hbWVcbiAgICAgICAgLy8gZS5nLiwgcGF0aD1bXCJjb3JlXCJdLCBuYW1lPVwiYm9yZGVyLXJhZGl1c1wiIC0+IFtcImNvcmVcIiwgXCJib3JkZXItcmFkaXVzXCJdXG4gICAgICAgIGNvbnN0IGdyb3VwUGF0aCA9IGdyb3VwID8gZ3JvdXAucGF0aCA6IFtdO1xuICAgICAgICBjb25zdCBncm91cE5hbWUgPSBncm91cCA/IGdyb3VwLm5hbWUgOiAnJztcbiAgICAgICAgY29uc3QgZnVsbEdyb3VwUGF0aCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGdyb3VwUGF0aC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZnVsbEdyb3VwUGF0aC5wdXNoKGdyb3VwUGF0aFtqXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdyb3VwTmFtZSAmJiAhKGdyb3VwID09PSBudWxsIHx8IGdyb3VwID09PSB2b2lkIDAgPyB2b2lkIDAgOiBncm91cC5pc1Jvb3QpKSB7XG4gICAgICAgICAgICBmdWxsR3JvdXBQYXRoLnB1c2goZ3JvdXBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCB0aGUgbmVzdGVkIHBhdGg6IHNraXAgcGxhdGZvcm0gKGFuZCBvcHRpb25hbGx5IG1vcmUgbGV2ZWxzKVxuICAgICAgICBjb25zdCBwYXRoUGFydHMgPSBmdWxsR3JvdXBQYXRoLnNsaWNlKHNraXBMZXZlbHMpO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhdGhQYXJ0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZnVsbFBhdGgucHVzaChzYWZlTmFtZShwYXRoUGFydHNbal0pKTtcbiAgICAgICAgfVxuICAgICAgICBmdWxsUGF0aC5wdXNoKHNhZmVOYW1lKHRva2VuLm5hbWUpKTtcbiAgICAgICAgaWYgKGZ1bGxQYXRoLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAvLyBGb3JtYXQgYW5kIHNldCB0aGUgdG9rZW4gdmFsdWVcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0VG9rZW4odG9rZW4sIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICAgICAgc2V0TmVzdGVkKHRyZWUsIGZ1bGxQYXRoLCBmb3JtYXR0ZWQpO1xuICAgIH1cbiAgICByZXR1cm4gdHJlZTtcbn1cbmZ1bmN0aW9uIHNldE5lc3RlZChvYmosIHBhdGgsIHZhbHVlKSB7XG4gICAgbGV0IGN1cnJlbnQgPSBvYmo7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICBjb25zdCBrZXkgPSBwYXRoW2ldO1xuICAgICAgICBpZiAoIWN1cnJlbnRba2V5XSB8fCB0eXBlb2YgY3VycmVudFtrZXldICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgY3VycmVudFtrZXldID0ge307XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnRba2V5XTtcbiAgICB9XG4gICAgY3VycmVudFtwYXRoW3BhdGgubGVuZ3RoIC0gMV1dID0gdmFsdWU7XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBUT0tFTiBGT1JNQVRUSU5HIChEVENHKVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gZm9ybWF0VG9rZW4odG9rZW4sIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0b2tlbi52YWx1ZTtcbiAgICAvLyBDaGVjayBmb3IgdG9wLWxldmVsIHJlZmVyZW5jZSBGSVJTVFxuICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICBjb25zdCByZWZUb2tlbiA9IHRva2VuQnlJZFt2YWx1ZS5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgIGlmIChyZWZUb2tlbikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAkdmFsdWU6ICd7JyArIGJ1aWxkUmVmUGF0aChyZWZUb2tlbiwgZ3JvdXBzKSArICd9JyxcbiAgICAgICAgICAgICAgICAkdHlwZTogbWFwVHlwZSh0b2tlbi50b2tlblR5cGUpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGb3JtYXQgcmF3IHZhbHVlXG4gICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0VmFsdWUodmFsdWUsIHRva2VuLnRva2VuVHlwZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgJHZhbHVlOiBmb3JtYXR0ZWQsXG4gICAgICAgICR0eXBlOiBtYXBUeXBlKHRva2VuLnRva2VuVHlwZSksXG4gICAgfTtcbiAgICBpZiAodG9rZW4uZGVzY3JpcHRpb24gJiYgdG9rZW4uZGVzY3JpcHRpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICByZXN1bHQuJGRlc2NyaXB0aW9uID0gdG9rZW4uZGVzY3JpcHRpb247XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBmb3JtYXRWYWx1ZSh2YWx1ZSwgdG9rZW5UeXBlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIGlmICghdmFsdWUpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vIENvbG9yOiBjaGVjayBmb3IgbmVzdGVkIC5jb2xvciBvYmplY3Qgb3IgZGlyZWN0IHIvZy9iXG4gICAgaWYgKHZhbHVlLmNvbG9yICYmIHR5cGVvZiB2YWx1ZS5jb2xvci5yID09PSAnbnVtYmVyJykge1xuICAgICAgICAvLyBDaGVjayBpZiBjb2xvciBpdHNlbGYgaXMgYSByZWZlcmVuY2VcbiAgICAgICAgaWYgKHZhbHVlLmNvbG9yLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbdmFsdWUuY29sb3IucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgaWYgKHJlZilcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JztcbiAgICAgICAgfVxuICAgICAgICAvLyBVc2UgZm9ybWF0Q29sb3JWYWx1ZSB0byBoYW5kbGUgYWxwaGEgcHJvcGVybHlcbiAgICAgICAgcmV0dXJuIGZvcm1hdENvbG9yVmFsdWUodmFsdWUpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlLnIgPT09ICdudW1iZXInICYmIHR5cGVvZiB2YWx1ZS5nID09PSAnbnVtYmVyJykge1xuICAgICAgICAvLyBEaXJlY3Qgci9nL2IgKGNoZWNrIGZvciBhbHBoYSB0b28pXG4gICAgICAgIGNvbnN0IGFscGhhID0gdHlwZW9mIHZhbHVlLmEgPT09ICdudW1iZXInID8gdmFsdWUuYSA6IDE7XG4gICAgICAgIGlmIChhbHBoYSA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0b0hleFdpdGhBbHBoYSh2YWx1ZS5yLCB2YWx1ZS5nLCB2YWx1ZS5iLCBhbHBoYSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvSGV4KHZhbHVlLnIsIHZhbHVlLmcsIHZhbHVlLmIpO1xuICAgIH1cbiAgICBpZiAodmFsdWUuaGV4KSB7XG4gICAgICAgIHJldHVybiAnIycgKyB2YWx1ZS5oZXg7XG4gICAgfVxuICAgIC8vIERpbWVuc2lvbi9NZWFzdXJlOiBoYXMgLm1lYXN1cmUgYW5kIC51bml0XG4gICAgaWYgKHR5cGVvZiB2YWx1ZS5tZWFzdXJlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLm1lYXN1cmUsXG4gICAgICAgICAgICB1bml0OiBmb3JtYXRVbml0KHZhbHVlLnVuaXQpXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIFRleHQvU3RyaW5nOiBoYXMgLnRleHRcbiAgICBpZiAodHlwZW9mIHZhbHVlLnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS50ZXh0O1xuICAgIH1cbiAgICAvLyBGb250OiBoYXMgLmZhbWlseVxuICAgIGlmICh0eXBlb2YgdmFsdWUuZmFtaWx5ID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmFtaWx5OiB2YWx1ZS5mYW1pbHksXG4gICAgICAgICAgICB3ZWlnaHQ6IHZhbHVlLnN1YmZhbWlseSB8fCB2YWx1ZS53ZWlnaHQgfHwgJ1JlZ3VsYXInLFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBUeXBvZ3JhcGh5OiBoYXMgLmZvbnQgYW5kIC5mb250U2l6ZVxuICAgIGlmICh2YWx1ZS5mb250IHx8IHZhbHVlLmZvbnRTaXplKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRUeXBvZ3JhcGh5KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIFNoYWRvdzogU3VwZXJub3ZhIHByb3ZpZGVzIGFycmF5IHdpdGggc2hhZG93IG9iamVjdChzKVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPiAwICYmIHZhbHVlWzBdLnggIT09IHVuZGVmaW5lZCAmJiB2YWx1ZVswXS55ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdFNoYWRvd0FycmF5KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIEdyYWRpZW50OiBTdXBlcm5vdmEgcHJvdmlkZXMgYXJyYXkgd2l0aCBncmFkaWVudCBvYmplY3QocylcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID4gMCAmJiB2YWx1ZVswXS5zdG9wcykge1xuICAgICAgICByZXR1cm4gZm9ybWF0R3JhZGllbnQodmFsdWVbMF0sIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICB9XG4gICAgLy8gQm9yZGVyOiBoYXMgLmNvbG9yIGFuZCAud2lkdGhcbiAgICBpZiAodmFsdWUuY29sb3IgJiYgdmFsdWUud2lkdGgpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdEJvcmRlcih2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIH1cbiAgICAvLyBSYWRpdXM6IGhhcyAucmFkaXVzIG9yIGNvcm5lciB2YWx1ZXNcbiAgICBpZiAodmFsdWUucmFkaXVzIHx8IHZhbHVlLnRvcExlZnQgfHwgdmFsdWUudG9wUmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdFJhZGl1cyh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIH1cbiAgICAvLyBGYWxsYmFjazogcmV0dXJuIGFzLWlzXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gQ09NUExFWCBWQUxVRSBGT1JNQVRURVJTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBmb3JtYXRUeXBvZ3JhcGh5KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGlmICh2YWx1ZS5mb250KSB7XG4gICAgICAgIGlmICh2YWx1ZS5mb250LnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbdmFsdWUuZm9udC5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQuZm9udEZhbWlseSA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiB2YWx1ZS5mb250LmZhbWlseTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5mb250RmFtaWx5ID0gdmFsdWUuZm9udC5mYW1pbHkgfHwgJyc7XG4gICAgICAgICAgICByZXN1bHQuZm9udFdlaWdodCA9IHZhbHVlLmZvbnQuc3ViZmFtaWx5IHx8ICdSZWd1bGFyJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodmFsdWUuZm9udFNpemUpIHtcbiAgICAgICAgaWYgKHZhbHVlLmZvbnRTaXplLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbdmFsdWUuZm9udFNpemUucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgcmVzdWx0LmZvbnRTaXplID0gcmVmID8gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JyA6IGZvcm1hdE1lYXN1cmUodmFsdWUuZm9udFNpemUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmZvbnRTaXplID0gZm9ybWF0TWVhc3VyZSh2YWx1ZS5mb250U2l6ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbHVlLmxpbmVIZWlnaHQpIHtcbiAgICAgICAgaWYgKHZhbHVlLmxpbmVIZWlnaHQucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5saW5lSGVpZ2h0LnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIHJlc3VsdC5saW5lSGVpZ2h0ID0gcmVmID8gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JyA6IGZvcm1hdE1lYXN1cmUodmFsdWUubGluZUhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQubGluZUhlaWdodCA9IGZvcm1hdE1lYXN1cmUodmFsdWUubGluZUhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbHVlLmxldHRlclNwYWNpbmcpIHtcbiAgICAgICAgcmVzdWx0LmxldHRlclNwYWNpbmcgPSBmb3JtYXRNZWFzdXJlKHZhbHVlLmxldHRlclNwYWNpbmcpO1xuICAgIH1cbiAgICBpZiAodmFsdWUudGV4dENhc2UpXG4gICAgICAgIHJlc3VsdC50ZXh0VHJhbnNmb3JtID0gdmFsdWUudGV4dENhc2UudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodmFsdWUudGV4dERlY29yYXRpb24pXG4gICAgICAgIHJlc3VsdC50ZXh0RGVjb3JhdGlvbiA9IHZhbHVlLnRleHREZWNvcmF0aW9uLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGZvcm1hdFNoYWRvdyh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgIG9mZnNldFg6IGZvcm1hdE1lYXN1cmUodmFsdWUueCksXG4gICAgICAgIG9mZnNldFk6IGZvcm1hdE1lYXN1cmUodmFsdWUueSksXG4gICAgICAgIGJsdXI6IGZvcm1hdE1lYXN1cmUodmFsdWUucmFkaXVzKSxcbiAgICAgICAgc3ByZWFkOiBmb3JtYXRNZWFzdXJlKHZhbHVlLnNwcmVhZCksXG4gICAgfTtcbiAgICAvLyBHZXQgYWxwaGEgZnJvbSBzaGFkb3cncyBvcGFjaXR5IHByb3BlcnR5IChTdXBlcm5vdmEgc3RvcmVzIG9wYWNpdHkgYXQgc2hhZG93IGxldmVsLCBub3QgY29sb3IgbGV2ZWwpXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2RldmVsb3BlcnMuc3VwZXJub3ZhLmlvL2xhdGVzdC9zZGstcmVmZXJlbmNlL2RhdGEtbW9kZWwvdG9rZW5zL3Rva2VuLXZhbHVlcy1IbmIzaWV1NSNzZWN0aW9uLXNoYWRvd3Rva2VudmFsdWUtNjVcbiAgICBsZXQgYWxwaGEgPSAxO1xuICAgIGlmICh2YWx1ZS5vcGFjaXR5ICYmIHR5cGVvZiB2YWx1ZS5vcGFjaXR5Lm1lYXN1cmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGFscGhhID0gdmFsdWUub3BhY2l0eS5tZWFzdXJlO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUub3BhY2l0eSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgYWxwaGEgPSB2YWx1ZS5vcGFjaXR5O1xuICAgIH1cbiAgICAvLyBIYW5kbGUgY29sb3Igd2l0aCBmdWxsIERUQ0cgZm9ybWF0XG4gICAgaWYgKHZhbHVlLmNvbG9yKSB7XG4gICAgICAgIC8vIEV4dHJhY3QgY29sb3IgZnJvbSBuZXN0ZWQgc3RydWN0dXJlIChTdXBlcm5vdmEgaGFzIGNvbG9yLmNvbG9yKVxuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IHZhbHVlLmNvbG9yO1xuICAgICAgICBpZiAoY29sb3JWYWx1ZS5jb2xvcikge1xuICAgICAgICAgICAgY29sb3JWYWx1ZSA9IGNvbG9yVmFsdWUuY29sb3I7IC8vIFVud3JhcCBuZXN0ZWQgY29sb3JcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3IgY29sb3IgcmVmZXJlbmNlXG4gICAgICAgIGlmIChjb2xvclZhbHVlLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbY29sb3JWYWx1ZS5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBGb3JtYXQgY29sb3IgdG8gZnVsbCBEVENHIGNvbG9yIG9iamVjdCAobm90IGhleCBzdHJpbmcpXG4gICAgICAgIGlmICghcmVzdWx0LmNvbG9yICYmIGNvbG9yVmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBjb2xvclZhbHVlLnIgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IGcgPSBjb2xvclZhbHVlLmcgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IGIgPSBjb2xvclZhbHVlLmIgfHwgMDtcbiAgICAgICAgICAgIC8vIERUQ0cgcmVxdWlyZXMgUkdCIGluIDAtMSByYW5nZSwgU3VwZXJub3ZhIHByb3ZpZGVzIDAtMjU1XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSB7XG4gICAgICAgICAgICAgICAgY29sb3JTcGFjZTogJ3NyZ2InLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtyIC8gMjU1LCBnIC8gMjU1LCBiIC8gMjU1XSxcbiAgICAgICAgICAgICAgICBhbHBoYTogYWxwaGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gSGFuZGxlIGluc2V0IHByb3BlcnR5IChmcm9tIFN1cGVybm92YSdzIHR5cGUgZmllbGQpXG4gICAgaWYgKHZhbHVlLnR5cGUpIHtcbiAgICAgICAgY29uc3QgdHlwZVN0ciA9IFN0cmluZyh2YWx1ZS50eXBlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAodHlwZVN0ciA9PT0gJ2lubmVyJyB8fCB0eXBlU3RyID09PSAnaW5zZXQnKSB7XG4gICAgICAgICAgICByZXN1bHQuaW5zZXQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIERlZmF1bHQgaXMgZmFsc2UgKGRyb3Agc2hhZG93KSwgc28gbm8gbmVlZCB0byBzZXQgZXhwbGljaXRseVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZm9ybWF0U2hhZG93QXJyYXkodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3Qgc2hhZG93cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc2hhZG93ID0gdmFsdWVbaV07XG4gICAgICAgIHNoYWRvd3MucHVzaChmb3JtYXRTaGFkb3coc2hhZG93LCB0b2tlbkJ5SWQsIGdyb3VwcykpO1xuICAgIH1cbiAgICAvLyBSZXR1cm4gYXJyYXkgZGlyZWN0bHkgKERUQ0cgc3VwcG9ydHMgYm90aCBzaW5nbGUgb2JqZWN0IGFuZCBhcnJheXMpXG4gICAgcmV0dXJuIHNoYWRvd3M7XG59XG5mdW5jdGlvbiBmb3JtYXRHcmFkaWVudCh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBjb25zdCBzdG9wcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUuc3RvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc3RvcCA9IHZhbHVlLnN0b3BzW2ldO1xuICAgICAgICAvLyBFeHRyYWN0IGNvbG9yIGZyb20gbmVzdGVkIHN0cnVjdHVyZSAoU3VwZXJub3ZhIGhhcyBjb2xvci5jb2xvcilcbiAgICAgICAgbGV0IGNvbG9yVmFsdWUgPSBzdG9wLmNvbG9yO1xuICAgICAgICBpZiAoY29sb3JWYWx1ZSAmJiBjb2xvclZhbHVlLmNvbG9yKSB7XG4gICAgICAgICAgICBjb2xvclZhbHVlID0gY29sb3JWYWx1ZS5jb2xvcjsgLy8gVW53cmFwIG5lc3RlZCBjb2xvclxuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGZvciBjb2xvciByZWZlcmVuY2VcbiAgICAgICAgbGV0IGZvcm1hdHRlZENvbG9yO1xuICAgICAgICBpZiAoY29sb3JWYWx1ZSAmJiBjb2xvclZhbHVlLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbY29sb3JWYWx1ZS5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICBmb3JtYXR0ZWRDb2xvciA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZvcm1hdCBjb2xvciB0byBmdWxsIERUQ0cgY29sb3Igb2JqZWN0IChub3QgaGV4IHN0cmluZylcbiAgICAgICAgaWYgKCFmb3JtYXR0ZWRDb2xvciAmJiBjb2xvclZhbHVlKSB7XG4gICAgICAgICAgICBjb25zdCByID0gY29sb3JWYWx1ZS5yIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBnID0gY29sb3JWYWx1ZS5nIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBiID0gY29sb3JWYWx1ZS5iIHx8IDA7XG4gICAgICAgICAgICAvLyBHZXQgYWxwaGEgZnJvbSBvcGFjaXR5IGlmIHByZXNlbnRcbiAgICAgICAgICAgIGxldCBhbHBoYSA9IDE7XG4gICAgICAgICAgICBpZiAoc3RvcC5jb2xvciAmJiBzdG9wLmNvbG9yLm9wYWNpdHkgJiYgdHlwZW9mIHN0b3AuY29sb3Iub3BhY2l0eS5tZWFzdXJlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGFscGhhID0gc3RvcC5jb2xvci5vcGFjaXR5Lm1lYXN1cmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEVENHIHJlcXVpcmVzIFJHQiBpbiAwLTEgcmFuZ2UsIFN1cGVybm92YSBwcm92aWRlcyAwLTI1NVxuICAgICAgICAgICAgZm9ybWF0dGVkQ29sb3IgPSB7XG4gICAgICAgICAgICAgICAgY29sb3JTcGFjZTogJ3NyZ2InLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtyIC8gMjU1LCBnIC8gMjU1LCBiIC8gMjU1XSxcbiAgICAgICAgICAgICAgICBhbHBoYTogYWxwaGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgc3RvcHMucHVzaCh7XG4gICAgICAgICAgICBjb2xvcjogZm9ybWF0dGVkQ29sb3IgfHwgeyBjb2xvclNwYWNlOiAnc3JnYicsIGNvbXBvbmVudHM6IFswLCAwLCAwXSB9LFxuICAgICAgICAgICAgcG9zaXRpb246IHN0b3AucG9zaXRpb24gfHwgMFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gUmV0dXJuIGFycmF5IGRpcmVjdGx5IChEVENHIGNvbXBsaWFudCkgLSBub3Qgd3JhcHBlZCBpbiBvYmplY3RcbiAgICByZXR1cm4gc3RvcHM7XG59XG5mdW5jdGlvbiBmb3JtYXRCb3JkZXIodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICB3aWR0aDogZm9ybWF0TWVhc3VyZSh2YWx1ZS53aWR0aCksXG4gICAgICAgIHN0eWxlOiAnc29saWQnLFxuICAgIH07XG4gICAgaWYgKHZhbHVlLmNvbG9yKSB7XG4gICAgICAgIGlmICh2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmNvbG9yLnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIHJlc3VsdC5jb2xvciA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRDb2xvclZhbHVlKHZhbHVlLmNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5jb2xvciA9IGZvcm1hdENvbG9yVmFsdWUodmFsdWUuY29sb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBmb3JtYXRSYWRpdXModmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgLy8gU2luZ2xlIHJhZGl1c1xuICAgIGlmICh2YWx1ZS5yYWRpdXMgJiYgIXZhbHVlLnRvcExlZnQpIHtcbiAgICAgICAgaWYgKHZhbHVlLnJhZGl1cy5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLnJhZGl1cy5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXR1cm4gcmVmID8gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JyA6IGZvcm1hdE1lYXN1cmUodmFsdWUucmFkaXVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm9ybWF0TWVhc3VyZSh2YWx1ZS5yYWRpdXMpO1xuICAgIH1cbiAgICAvLyBDb3JuZXIgcmFkaWlcbiAgICByZXR1cm4ge1xuICAgICAgICB0b3BMZWZ0OiBmb3JtYXRNZWFzdXJlKHZhbHVlLnRvcExlZnQpLFxuICAgICAgICB0b3BSaWdodDogZm9ybWF0TWVhc3VyZSh2YWx1ZS50b3BSaWdodCksXG4gICAgICAgIGJvdHRvbUxlZnQ6IGZvcm1hdE1lYXN1cmUodmFsdWUuYm90dG9tTGVmdCksXG4gICAgICAgIGJvdHRvbVJpZ2h0OiBmb3JtYXRNZWFzdXJlKHZhbHVlLmJvdHRvbVJpZ2h0KSxcbiAgICB9O1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUFJJTUlUSVZFIEZPUk1BVFRFUlNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGZvcm1hdE1lYXN1cmUodmFsdWUpIHtcbiAgICAvLyBJZiBpdCdzIGFscmVhZHkgYSBkaW1lbnNpb24gb2JqZWN0IHdpdGggdmFsdWUvdW5pdCwgbm9ybWFsaXplIGl0XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUudmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZS51bml0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZS52YWx1ZSxcbiAgICAgICAgICAgIHVuaXQ6IGZvcm1hdFVuaXQodmFsdWUudW5pdClcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gSWYgaXQncyBhIG51bWJlciwgY3JlYXRlIGRpbWVuc2lvbiBvYmplY3RcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgdW5pdDogJ3B4J1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBJZiBpdCBoYXMgbWVhc3VyZS91bml0IChTdXBlcm5vdmEgZm9ybWF0KSwgY29udmVydFxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLm1lYXN1cmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLm1lYXN1cmUsXG4gICAgICAgICAgICB1bml0OiBmb3JtYXRVbml0KHZhbHVlLnVuaXQpXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIEZhbGxiYWNrIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IChzdHJpbmcgdmFsdWVzKVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgLy8gRGVmYXVsdFxuICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiAwLFxuICAgICAgICB1bml0OiAncHgnXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGZvcm1hdENvbG9yVmFsdWUodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKVxuICAgICAgICByZXR1cm4gJyMwMDAwMDAnO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgaWYgKHZhbHVlLmhleClcbiAgICAgICAgcmV0dXJuICcjJyArIHZhbHVlLmhleDtcbiAgICAvLyBHZXQgUkdCIHZhbHVlc1xuICAgIGxldCByID0gMCwgZyA9IDAsIGIgPSAwO1xuICAgIGlmICh2YWx1ZS5jb2xvciAmJiB0eXBlb2YgdmFsdWUuY29sb3IuciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgciA9IHZhbHVlLmNvbG9yLnI7XG4gICAgICAgIGcgPSB2YWx1ZS5jb2xvci5nO1xuICAgICAgICBiID0gdmFsdWUuY29sb3IuYjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLnIgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHIgPSB2YWx1ZS5yO1xuICAgICAgICBnID0gdmFsdWUuZztcbiAgICAgICAgYiA9IHZhbHVlLmI7XG4gICAgfVxuICAgIC8vIEdldCBhbHBoYS9vcGFjaXR5ICgwLTEpXG4gICAgbGV0IGFscGhhID0gMTtcbiAgICBpZiAodmFsdWUub3BhY2l0eSAmJiB0eXBlb2YgdmFsdWUub3BhY2l0eS5tZWFzdXJlID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbHBoYSA9IHZhbHVlLm9wYWNpdHkubWVhc3VyZTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLmEgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGFscGhhID0gdmFsdWUuYTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLmFscGhhID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbHBoYSA9IHZhbHVlLmFscGhhO1xuICAgIH1cbiAgICAvLyBPdXRwdXQgd2l0aCBhbHBoYSBpZiBub3QgZnVsbHkgb3BhcXVlXG4gICAgaWYgKGFscGhhIDwgMSkge1xuICAgICAgICByZXR1cm4gdG9IZXhXaXRoQWxwaGEociwgZywgYiwgYWxwaGEpO1xuICAgIH1cbiAgICByZXR1cm4gdG9IZXgociwgZywgYik7XG59XG5mdW5jdGlvbiB0b0hleChyLCBnLCBiKSB7XG4gICAgY29uc3QgcmggPSBNYXRoLnJvdW5kKHIpLnRvU3RyaW5nKDE2KTtcbiAgICBjb25zdCBnaCA9IE1hdGgucm91bmQoZykudG9TdHJpbmcoMTYpO1xuICAgIGNvbnN0IGJoID0gTWF0aC5yb3VuZChiKS50b1N0cmluZygxNik7XG4gICAgcmV0dXJuICcjJyArIHBhZDIocmgpICsgcGFkMihnaCkgKyBwYWQyKGJoKTtcbn1cbmZ1bmN0aW9uIHRvSGV4V2l0aEFscGhhKHIsIGcsIGIsIGEpIHtcbiAgICBjb25zdCByaCA9IE1hdGgucm91bmQocikudG9TdHJpbmcoMTYpO1xuICAgIGNvbnN0IGdoID0gTWF0aC5yb3VuZChnKS50b1N0cmluZygxNik7XG4gICAgY29uc3QgYmggPSBNYXRoLnJvdW5kKGIpLnRvU3RyaW5nKDE2KTtcbiAgICBjb25zdCBhaCA9IE1hdGgucm91bmQoYSAqIDI1NSkudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiAnIycgKyBwYWQyKHJoKSArIHBhZDIoZ2gpICsgcGFkMihiaCkgKyBwYWQyKGFoKTtcbn1cbmZ1bmN0aW9uIHBhZDIocykge1xuICAgIHJldHVybiBzLmxlbmd0aCA9PT0gMSA/ICcwJyArIHMgOiBzO1xufVxuZnVuY3Rpb24gZm9ybWF0VW5pdCh1bml0KSB7XG4gICAgaWYgKCF1bml0KVxuICAgICAgICByZXR1cm4gJ3B4JztcbiAgICBjb25zdCB1ID0gU3RyaW5nKHVuaXQpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHUgPT09ICdwaXhlbHMnIHx8IHUgPT09ICdweCcpXG4gICAgICAgIHJldHVybiAncHgnO1xuICAgIGlmICh1ID09PSAncGVyY2VudCcgfHwgdSA9PT0gJyUnKVxuICAgICAgICByZXR1cm4gJyUnO1xuICAgIGlmICh1ID09PSAnZW1zJyB8fCB1ID09PSAnZW0nKVxuICAgICAgICByZXR1cm4gJ2VtJztcbiAgICBpZiAodSA9PT0gJ3BvaW50cycgfHwgdSA9PT0gJ3B0JylcbiAgICAgICAgcmV0dXJuICdwdCc7XG4gICAgaWYgKHUgPT09ICdyYXcnKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgcmV0dXJuIHU7XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBSRUZFUkVOQ0UgUEFUSCBCVUlMRElOR1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gYnVpbGRSZWZQYXRoKHRva2VuLCBncm91cHMpIHtcbiAgICBjb25zdCBncm91cCA9IGZpbmRHcm91cEZvclRva2VuKHRva2VuLCBncm91cHMpO1xuICAgIGNvbnN0IGdyb3VwUGF0aCA9IGdyb3VwID8gZ3JvdXAucGF0aCA6IFtdO1xuICAgIGNvbnN0IGdyb3VwTmFtZSA9IGdyb3VwID8gZ3JvdXAubmFtZSA6ICcnO1xuICAgIC8vIEJ1aWxkIGZ1bGwgZ3JvdXAgcGF0aDogZ3JvdXAucGF0aCArIGdyb3VwLm5hbWVcbiAgICBjb25zdCBmdWxsR3JvdXBQYXRoID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cFBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZnVsbEdyb3VwUGF0aC5wdXNoKGdyb3VwUGF0aFtpXSk7XG4gICAgfVxuICAgIGlmIChncm91cE5hbWUgJiYgIShncm91cCA9PT0gbnVsbCB8fCBncm91cCA9PT0gdm9pZCAwID8gdm9pZCAwIDogZ3JvdXAuaXNSb290KSkge1xuICAgICAgICBmdWxsR3JvdXBQYXRoLnB1c2goZ3JvdXBOYW1lKTtcbiAgICB9XG4gICAgLy8gQnVpbGQgcGF0aDogdXNlIGZ1bGwgcGF0aCAoY29sbGVjdGlvbiBoYW5kbGVzIHBsYXRmb3JtIHJvdXRpbmcpXG4gICAgLy8gUmVzdWx0OiBcImNvbG9yLjUwMFwiIG9yIFwic2VtYW50aWMuY29sb3IucHJpbWFyeVwiXG4gICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZ1bGxHcm91cFBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFydHMucHVzaChzYWZlTmFtZShmdWxsR3JvdXBQYXRoW2ldKSk7XG4gICAgfVxuICAgIHBhcnRzLnB1c2goc2FmZU5hbWUodG9rZW4ubmFtZSkpO1xuICAgIHJldHVybiBwYXJ0cy5qb2luKCcuJyk7XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBUWVBFIE1BUFBJTkdcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIG1hcFR5cGUodG9rZW5UeXBlKSB7XG4gICAgY29uc3QgdCA9IFN0cmluZyh0b2tlblR5cGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHQgPT09ICdjb2xvcicpXG4gICAgICAgIHJldHVybiAnY29sb3InO1xuICAgIGlmICh0ID09PSAnZGltZW5zaW9uJyB8fCB0ID09PSAnbWVhc3VyZScpXG4gICAgICAgIHJldHVybiAnZGltZW5zaW9uJztcbiAgICBpZiAodCA9PT0gJ3R5cG9ncmFwaHknKVxuICAgICAgICByZXR1cm4gJ3R5cG9ncmFwaHknO1xuICAgIGlmICh0ID09PSAnc2hhZG93JylcbiAgICAgICAgcmV0dXJuICdzaGFkb3cnO1xuICAgIGlmICh0ID09PSAnYm9yZGVyJylcbiAgICAgICAgcmV0dXJuICdib3JkZXInO1xuICAgIGlmICh0ID09PSAncmFkaXVzJylcbiAgICAgICAgcmV0dXJuICdib3JkZXJSYWRpdXMnO1xuICAgIGlmICh0ID09PSAnZ3JhZGllbnQnKVxuICAgICAgICByZXR1cm4gJ2dyYWRpZW50JztcbiAgICBpZiAodCA9PT0gJ2ZvbnQnKVxuICAgICAgICByZXR1cm4gJ2ZvbnRGYW1pbHknO1xuICAgIGlmICh0ID09PSAndGV4dCcgfHwgdCA9PT0gJ3N0cmluZycpXG4gICAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICByZXR1cm4gdDtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFVUSUxJVElFU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gc2FmZU5hbWUobmFtZSkge1xuICAgIHJldHVybiBTdHJpbmcobmFtZSB8fCAnJykucmVwbGFjZSgvXFxXKy9nLCAnLScpLnRvTG93ZXJDYXNlKCk7XG59XG5mdW5jdGlvbiBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZyA9IGdyb3Vwc1tpXTtcbiAgICAgICAgaWYgKGcudG9rZW5JZHMgJiYgZy50b2tlbklkcy5pbmRleE9mKHRva2VuLmlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gZmluZFRoZW1lQnlJZChhcnIsIGlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFycltpXS5pZCA9PT0gaWQpXG4gICAgICAgICAgICByZXR1cm4gYXJyW2ldO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIHRvQXJyYXkoaW5wdXQpIHtcbiAgICBpZiAoIWlucHV0KVxuICAgICAgICByZXR1cm4gW107XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKVxuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGlucHV0Lmxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGlucHV0W2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBGSUxFIE9VVFBVVFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gY3JlYXRlRmlsZShmaWxlUGF0aCwgY29udGVudCkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBmaWxlUGF0aC5yZXBsYWNlKC9eXFwvKy8sICcnKTtcbiAgICBjb25zdCBwYXJ0cyA9IG5vcm1hbGl6ZWQuc3BsaXQoJy8nKTtcbiAgICBjb25zdCBmaWxlTmFtZSA9IHBhcnRzLnBvcCgpIHx8ICdvdXRwdXQuanNvbic7XG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGFydHMuam9pbignLycpO1xuICAgIGNvbnN0IGpzb25Db250ZW50ID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCwgbnVsbCwgMik7XG4gICAgLy8gVHJ5IEZpbGVIZWxwZXIgZmlyc3QsIGZhbGxiYWNrIHRvIHBsYWluIG9iamVjdFxuICAgIGlmICh0eXBlb2YgRmlsZUhlbHBlciAhPT0gJ3VuZGVmaW5lZCcgJiYgRmlsZUhlbHBlci5jcmVhdGVUZXh0RmlsZSkge1xuICAgICAgICByZXR1cm4gRmlsZUhlbHBlci5jcmVhdGVUZXh0RmlsZSh7IHJlbGF0aXZlUGF0aCwgZmlsZU5hbWUsIGNvbnRlbnQ6IGpzb25Db250ZW50IH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBwYXRoOiByZWxhdGl2ZVBhdGgubGVuZ3RoID4gMCA/IHJlbGF0aXZlUGF0aCA6ICcuJyxcbiAgICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgY29udGVudDoganNvbkNvbnRlbnQsXG4gICAgfTtcbn1cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0ge307XG5fX3dlYnBhY2tfbW9kdWxlc19fW1wiLi9zcmMvaW5kZXgudHNcIl0uY2FsbChfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==