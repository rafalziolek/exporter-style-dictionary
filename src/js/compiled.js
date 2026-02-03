/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

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
        return value.measure + formatUnit(value.unit);
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
    // Shadow: has .x, .y, .radius, .spread
    if (value.x !== undefined && value.y !== undefined) {
        return formatShadow(value, tokenById, groups);
    }
    // Gradient: has .stops
    if (value.stops && Array.isArray(value.stops)) {
        return formatGradient(value, tokenById, groups);
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
function formatGradient(value, tokenById, groups) {
    const stops = [];
    for (let i = 0; i < value.stops.length; i++) {
        const stop = value.stops[i];
        stops.push({
            position: stop.position || 0,
            color: stop.color ? formatColorValue(stop.color) : '#000000',
        });
    }
    return {
        type: (value.type || 'linear').toLowerCase(),
        stops: stops,
    };
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
    if (!value)
        return '0px';
    if (typeof value === 'number')
        return value + 'px';
    if (typeof value === 'string')
        return value;
    const measure = value.measure !== undefined ? value.measure : 0;
    const unit = formatUnit(value.unit);
    return measure + unit;
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


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsK0RBQStELGdCQUFnQixFQUFFLEVBQUU7QUFDOUc7QUFDQSxtQ0FBbUMsTUFBTSw2QkFBNkIsRUFBRSxZQUFZLFdBQVcsRUFBRTtBQUNqRyxrQ0FBa0MsTUFBTSxpQ0FBaUMsRUFBRSxZQUFZLFdBQVcsRUFBRTtBQUNwRywrQkFBK0IscUZBQXFGO0FBQ3BIO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix1QkFBdUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHVCQUF1QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQiw4Q0FBOEM7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGtCQUFrQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0REFBNEQseUJBQXlCO0FBQ3JGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHVCQUF1QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJFQUEyRTtBQUMzRTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsbUJBQW1CO0FBQ3RDO0FBQ0EscUNBQXFDO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsNkJBQTZCO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVCQUF1QjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIseUJBQXlCO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixzQkFBc0I7QUFDN0M7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix1QkFBdUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLG9CQUFvQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsbUJBQW1CO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLG1CQUFtQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsdUJBQXVCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHFCQUFxQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsdUNBQXVDO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixrQ0FBa0M7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0Msa0NBQWtDO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxrQ0FBa0M7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxrQ0FBa0M7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLGtDQUFrQztBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsd0JBQXdCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsa0NBQWtDO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixrQ0FBa0M7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHNCQUFzQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDBCQUEwQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixtQkFBbUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixnQkFBZ0I7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGtCQUFrQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLCtDQUErQztBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXgudHNcIik7XG4iLCIvLyBTaW1wbGUgVG9rZW4gRXhwb3J0ZXIgLSBDbGVhbiBJbXBsZW1lbnRhdGlvblxuLy8gVXNlcyBncm91cC5wYXRoIGZvciB0b2tlbiBsb2NhdGlvbiwgdG9rZW5CeUlkIG1hcCBmb3IgcmVmZXJlbmNlc1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBNQUlOIEVYUE9SVFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuUHVsc2FyLmV4cG9ydCgoc2RrLCBjb250ZXh0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgY29uc3QgcmVtb3RlID0ge1xuICAgICAgICBkZXNpZ25TeXN0ZW1JZDogY29udGV4dC5kc0lkLFxuICAgICAgICB2ZXJzaW9uSWQ6IGNvbnRleHQudmVyc2lvbklkLFxuICAgIH07XG4gICAgLy8gMS4gRmV0Y2ggYWxsIGRhdGFcbiAgICBjb25zdCBiYXNlVG9rZW5zID0gdG9BcnJheSh5aWVsZCBzZGsudG9rZW5zLmdldFRva2VucyhyZW1vdGUpKTtcbiAgICBjb25zdCBncm91cHMgPSB0b0FycmF5KHlpZWxkIHNkay50b2tlbnMuZ2V0VG9rZW5Hcm91cHMocmVtb3RlKSk7XG4gICAgY29uc3QgdGhlbWVzID0gdG9BcnJheSh5aWVsZCBzZGsudG9rZW5zLmdldFRva2VuVGhlbWVzKHJlbW90ZSkpO1xuICAgIC8vIDIuIEJ1aWxkIGJhc2UgdG9rZW4gbG9va3VwIG1hcCAoZm9yIGNvcmUgdG9rZW5zIC0gdGhleSBkb24ndCBjaGFuZ2Ugd2l0aCB0aGVtZXMpXG4gICAgY29uc3QgYmFzZVRva2VuQnlJZCA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFzZVRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiYXNlVG9rZW5CeUlkW2Jhc2VUb2tlbnNbaV0uaWRdID0gYmFzZVRva2Vuc1tpXTtcbiAgICB9XG4gICAgLy8gMy4gR3JvdXAgYmFzZSB0b2tlbnMgYnkgY29sbGVjdGlvblxuICAgIGNvbnN0IGJhc2VHcm91cGVkID0gZ3JvdXBCeVBsYXRmb3JtKGJhc2VUb2tlbnMsIGdyb3Vwcyk7XG4gICAgLy8gNC4gQnVpbGQgb3V0cHV0IGZpbGVzXG4gICAgY29uc3Qgb3V0cHV0cyA9IFtdO1xuICAgIC8vIERlYnVnOiBzaG93IGNvbGxlY3Rpb24gZGV0ZWN0aW9uIHJlc3VsdHNcbiAgICBjb25zdCBkZWJ1Z0NvbGxlY3Rpb25zID0ge1xuICAgICAgICBjb3VudHM6IHtcbiAgICAgICAgICAgIGNvcmU6IGJhc2VHcm91cGVkLmNvcmUubGVuZ3RoLFxuICAgICAgICAgICAgd2ViOiBiYXNlR3JvdXBlZC53ZWIubGVuZ3RoLFxuICAgICAgICAgICAgbW9iaWxlOiBiYXNlR3JvdXBlZC5tb2JpbGUubGVuZ3RoLFxuICAgICAgICAgICAgdW5rbm93bjogYmFzZUdyb3VwZWQudW5rbm93bi5sZW5ndGgsXG4gICAgICAgIH0sXG4gICAgICAgIGFsbENvbGxlY3Rpb25WYWx1ZXM6IHt9LFxuICAgICAgICB1bmtub3duVG9rZW5EZXRhaWxzOiBbXSxcbiAgICAgICAgc2FtcGxlVG9rZW5zOiBbXSxcbiAgICB9O1xuICAgIC8vIENvdW50IGFsbCB1bmlxdWUgY29sbGVjdGlvbiB2YWx1ZXNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJhc2VUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY29sID0gZ2V0VG9rZW5Db2xsZWN0aW9uKGJhc2VUb2tlbnNbaV0pO1xuICAgICAgICBkZWJ1Z0NvbGxlY3Rpb25zLmFsbENvbGxlY3Rpb25WYWx1ZXNbY29sXSA9IChkZWJ1Z0NvbGxlY3Rpb25zLmFsbENvbGxlY3Rpb25WYWx1ZXNbY29sXSB8fCAwKSArIDE7XG4gICAgfVxuICAgIC8vIFNob3cgZGV0YWlscyBvZiB1bmtub3duIHRva2VucyAod2hhdCBjb2xsZWN0aW9uIGRvIHRoZXkgaGF2ZT8pXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLm1pbihiYXNlR3JvdXBlZC51bmtub3duLmxlbmd0aCwgMTApOyBpKyspIHtcbiAgICAgICAgY29uc3QgdCA9IGJhc2VHcm91cGVkLnVua25vd25baV07XG4gICAgICAgIGNvbnN0IHByb3BzID0gdC5wcm9wZXJ0aWVzIHx8IFtdO1xuICAgICAgICBjb25zdCBwcm9wVmFsdWVzID0gdC5wcm9wZXJ0eVZhbHVlcyB8fCB7fTtcbiAgICAgICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0LCBncm91cHMpO1xuICAgICAgICAvLyBGaW5kIGNvbGxlY3Rpb24gcHJvcGVydHkgaW5mb1xuICAgICAgICBsZXQgY29sbGVjdGlvblByb3BJbmZvID0gbnVsbDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwcm9wcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY29uc3QgcCA9IHByb3BzW2pdO1xuICAgICAgICAgICAgaWYgKChwLm5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT09ICdjb2xsZWN0aW9uJyB8fCAocC5jb2RlTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbGxlY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvblByb3BJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvZGVOYW1lOiBwLmNvZGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICBpZDogcC5pZCxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogKHAub3B0aW9ucyB8fCBbXSkubWFwKChvKSA9PiAoeyBpZDogby5pZCwgbmFtZTogby5uYW1lIH0pKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRlYnVnQ29sbGVjdGlvbnMudW5rbm93blRva2VuRGV0YWlscy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IHQubmFtZSxcbiAgICAgICAgICAgIGdyb3VwUGF0aDogZ3JvdXAgPyBncm91cC5wYXRoIDogbnVsbCxcbiAgICAgICAgICAgIGhhc0NvbGxlY3Rpb25Qcm9wOiAhIWNvbGxlY3Rpb25Qcm9wSW5mbyxcbiAgICAgICAgICAgIGNvbGxlY3Rpb25Qcm9wSW5mbzogY29sbGVjdGlvblByb3BJbmZvLFxuICAgICAgICAgICAgcHJvcGVydHlWYWx1ZUtleXM6IE9iamVjdC5rZXlzKHByb3BWYWx1ZXMpLFxuICAgICAgICAgICAgcmF3UHJvcGVydHlWYWx1ZXM6IEpTT04uc3RyaW5naWZ5KHByb3BWYWx1ZXMpLnN1YnN0cmluZygwLCAzMDApLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gU2FtcGxlIGEgZmV3IHRva2VucyBmcm9tIGVhY2ggZ3JvdXBcbiAgICBjb25zdCBhbGxTYW1wbGVzID0gWy4uLmJhc2VHcm91cGVkLmNvcmUuc2xpY2UoMCwgMiksIC4uLmJhc2VHcm91cGVkLndlYi5zbGljZSgwLCAyKSwgLi4uYmFzZUdyb3VwZWQubW9iaWxlLnNsaWNlKDAsIDIpXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbFNhbXBsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgdCA9IGFsbFNhbXBsZXNbaV07XG4gICAgICAgIGNvbnN0IGdyb3VwID0gZmluZEdyb3VwRm9yVG9rZW4odCwgZ3JvdXBzKTtcbiAgICAgICAgZGVidWdDb2xsZWN0aW9ucy5zYW1wbGVUb2tlbnMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiB0Lm5hbWUsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBnZXRUb2tlbkNvbGxlY3Rpb24odCksXG4gICAgICAgICAgICBncm91cFBhdGg6IGdyb3VwID8gZ3JvdXAucGF0aCA6IG51bGwsXG4gICAgICAgICAgICBncm91cE5hbWU6IGdyb3VwID8gZ3JvdXAubmFtZSA6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvdXRwdXRzLnB1c2goY3JlYXRlRmlsZSgnX2RlYnVnX2NvbGxlY3Rpb25zLmpzb24nLCBkZWJ1Z0NvbGxlY3Rpb25zKSk7XG4gICAgLy8gQ29yZSB0b2tlbnMgKGFsd2F5cyBleHBvcnRlZCBvbmNlLCBzaGFyZWQgYWNyb3NzIGFsbCB0aGVtZXMpXG4gICAgaWYgKGJhc2VHcm91cGVkLmNvcmUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB0cmVlID0gYnVpbGRUcmVlKGJhc2VHcm91cGVkLmNvcmUsIGdyb3VwcywgYmFzZVRva2VuQnlJZCwgMCk7IC8vIDAgPSB1c2UgZnVsbCBwYXRoXG4gICAgICAgIG91dHB1dHMucHVzaChjcmVhdGVGaWxlKCdjb3JlL2NvcmUuanNvbicsIHRyZWUpKTtcbiAgICB9XG4gICAgLy8gNC4gRXhwb3J0IEFMTCB0aGVtZXNcbiAgICBmb3IgKGxldCB0ID0gMDsgdCA8IHRoZW1lcy5sZW5ndGg7IHQrKykge1xuICAgICAgICBjb25zdCB0aGVtZSA9IHRoZW1lc1t0XTtcbiAgICAgICAgY29uc3QgdGhlbWVOYW1lID0gdGhlbWUubmFtZTsgLy8gZS5nLiwgXCJjdXN0b21lci9saWdodFwiIG9yIFwicGF0aWVudC9kYXJrXCJcbiAgICAgICAgLy8gQnVpbGQgdGhlbWVkIHRva2VucyBieSBtZXJnaW5nIG92ZXJyaWRkZW5Ub2tlbnMgd2l0aCBiYXNlIHRva2Vuc1xuICAgICAgICAvLyBUaGUgdGhlbWUub3ZlcnJpZGRlblRva2VucyBjb250YWlucyB0aGUgYWN0dWFsIHRoZW1lZCB2YWx1ZXNcbiAgICAgICAgY29uc3Qgb3ZlcnJpZGRlblRva2VucyA9IHRvQXJyYXkodGhlbWUub3ZlcnJpZGRlblRva2VucyB8fCBbXSk7XG4gICAgICAgIC8vIENyZWF0ZSBhIG1hcCBvZiBvdmVycmlkZGVuIHRva2VucyBieSBJRFxuICAgICAgICBjb25zdCBvdmVycmlkZGVuQnlJZCA9IHt9O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG92ZXJyaWRkZW5Ub2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG92ZXJyaWRkZW5CeUlkW292ZXJyaWRkZW5Ub2tlbnNbaV0uaWRdID0gb3ZlcnJpZGRlblRva2Vuc1tpXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNZXJnZTogdXNlIG92ZXJyaWRkZW4gdG9rZW4gaWYgZXhpc3RzLCBvdGhlcndpc2UgdXNlIGJhc2UgdG9rZW5cbiAgICAgICAgY29uc3QgdGhlbWVkVG9rZW5zID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFzZVRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYmFzZVRva2VuID0gYmFzZVRva2Vuc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IG92ZXJyaWRkZW4gPSBvdmVycmlkZGVuQnlJZFtiYXNlVG9rZW4uaWRdO1xuICAgICAgICAgICAgdGhlbWVkVG9rZW5zLnB1c2gob3ZlcnJpZGRlbiB8fCBiYXNlVG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIHRva2VuIGxvb2t1cCBmb3IgdGhpcyB0aGVtZVxuICAgICAgICBjb25zdCB0b2tlbkJ5SWQgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGVtZWRUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRva2VuQnlJZFt0aGVtZWRUb2tlbnNbaV0uaWRdID0gdGhlbWVkVG9rZW5zW2ldO1xuICAgICAgICB9XG4gICAgICAgIC8vIEdyb3VwIHRoZW1lZCB0b2tlbnMgYnkgcGxhdGZvcm1cbiAgICAgICAgY29uc3QgZ3JvdXBlZCA9IGdyb3VwQnlQbGF0Zm9ybSh0aGVtZWRUb2tlbnMsIGdyb3Vwcyk7XG4gICAgICAgIC8vIEV4cG9ydCBwbGF0Zm9ybS1zcGVjaWZpYyB0b2tlbnMgZm9yIHRoaXMgdGhlbWVcbiAgICAgICAgY29uc3QgcGxhdGZvcm1zID0gWyd3ZWInLCAnbW9iaWxlJ107XG4gICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgcGxhdGZvcm1zLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF0Zm9ybSA9IHBsYXRmb3Jtc1twXTtcbiAgICAgICAgICAgIGNvbnN0IHBsYXRmb3JtVG9rZW5zID0gZ3JvdXBlZFtwbGF0Zm9ybV0gfHwgW107XG4gICAgICAgICAgICBpZiAocGxhdGZvcm1Ub2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyZWUgPSBidWlsZFRyZWUocGxhdGZvcm1Ub2tlbnMsIGdyb3VwcywgdG9rZW5CeUlkLCAwKTsgLy8gMCA9IHVzZSBmdWxsIHBhdGhcbiAgICAgICAgICAgICAgICBvdXRwdXRzLnB1c2goY3JlYXRlRmlsZShwbGF0Zm9ybSArICcvJyArIHRoZW1lTmFtZSArICcuanNvbicsIHRyZWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0cztcbn0pKTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEdST1VQSU5HIChieSBDb2xsZWN0aW9uIHByb3BlcnR5KVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gZ2V0VG9rZW5Db2xsZWN0aW9uKHRva2VuKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRva2VuLnByb3BlcnRpZXMgfHwgW107XG4gICAgY29uc3QgcHJvcGVydHlWYWx1ZXMgPSB0b2tlbi5wcm9wZXJ0eVZhbHVlcyB8fCB7fTtcbiAgICAvLyBGaW5kIHRoZSBDb2xsZWN0aW9uIHByb3BlcnR5IGRlZmluaXRpb25cbiAgICBsZXQgY29sbGVjdGlvblByb3AgPSBudWxsO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwcm9wID0gcHJvcGVydGllc1tpXTtcbiAgICAgICAgY29uc3QgbmFtZSA9IChwcm9wLm5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGNvZGVOYW1lID0gKHByb3AuY29kZU5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChuYW1lID09PSAnY29sbGVjdGlvbicgfHwgY29kZU5hbWUgPT09ICdjb2xsZWN0aW9uJykge1xuICAgICAgICAgICAgY29sbGVjdGlvblByb3AgPSBwcm9wO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFjb2xsZWN0aW9uUHJvcClcbiAgICAgICAgcmV0dXJuICd1bmtub3duJztcbiAgICAvLyBHZXQgdGhlIHZhbHVlIC0gY291bGQgYmUga2V5ZWQgYnkgaWQgb3IgY29kZU5hbWVcbiAgICBsZXQgcmF3VmFsdWUgPSBwcm9wZXJ0eVZhbHVlc1tjb2xsZWN0aW9uUHJvcC5pZF0gfHwgcHJvcGVydHlWYWx1ZXNbY29sbGVjdGlvblByb3AuY29kZU5hbWVdIHx8IHByb3BlcnR5VmFsdWVzWydjb2xsZWN0aW9uJ107XG4gICAgaWYgKCFyYXdWYWx1ZSlcbiAgICAgICAgcmV0dXJuICd1bmtub3duJztcbiAgICAvLyBJZiBpdCdzIGFuIG9iamVjdCB3aXRoIGlkLCByZXNvbHZlIGZyb20gb3B0aW9uc1xuICAgIGNvbnN0IHZhbHVlSWQgPSB0eXBlb2YgcmF3VmFsdWUgPT09ICdzdHJpbmcnID8gcmF3VmFsdWUgOiAocmF3VmFsdWUuaWQgfHwgcmF3VmFsdWUudmFsdWUpO1xuICAgIC8vIEZpbmQgbWF0Y2hpbmcgb3B0aW9uXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbGxlY3Rpb25Qcm9wLm9wdGlvbnMgfHwgW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG9wdCA9IG9wdGlvbnNbaV07XG4gICAgICAgIGlmIChvcHQuaWQgPT09IHZhbHVlSWQgfHwgb3B0LnZhbHVlID09PSB2YWx1ZUlkIHx8IG9wdC5uYW1lID09PSB2YWx1ZUlkKSB7XG4gICAgICAgICAgICByZXR1cm4gKG9wdC5uYW1lIHx8IG9wdC52YWx1ZSB8fCBvcHQuaWQgfHwgJ3Vua25vd24nKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZhbGxiYWNrOiByZXR1cm4gdGhlIHZhbHVlIGl0c2VsZiBpZiBpdCdzIGEgc3RyaW5nXG4gICAgaWYgKHR5cGVvZiB2YWx1ZUlkID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gdmFsdWVJZC50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICByZXR1cm4gJ3Vua25vd24nO1xufVxuZnVuY3Rpb24gZ3JvdXBCeVBsYXRmb3JtKHRva2VucywgZ3JvdXBzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICBjb3JlOiBbXSxcbiAgICAgICAgd2ViOiBbXSxcbiAgICAgICAgbW9iaWxlOiBbXSxcbiAgICAgICAgdW5rbm93bjogW10sXG4gICAgfTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IGdldFRva2VuQ29sbGVjdGlvbih0b2tlbik7XG4gICAgICAgIGlmIChjb2xsZWN0aW9uID09PSAnY29yZScpIHtcbiAgICAgICAgICAgIHJlc3VsdC5jb3JlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbGxlY3Rpb24gPT09ICd3ZWInKSB7XG4gICAgICAgICAgICByZXN1bHQud2ViLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbGxlY3Rpb24gPT09ICdtb2JpbGUnKSB7XG4gICAgICAgICAgICByZXN1bHQubW9iaWxlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnVua25vd24ucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRSRUUgQlVJTERJTkdcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGJ1aWxkVHJlZSh0b2tlbnMsIGdyb3VwcywgdG9rZW5CeUlkLCBza2lwTGV2ZWxzKSB7XG4gICAgY29uc3QgdHJlZSA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgICAvLyBTa2lwIHZpcnR1YWwgc2hhZG93IHRva2Vuc1xuICAgICAgICBpZiAodG9rZW4uaXNWaXJ0dWFsID09PSB0cnVlICYmIHRva2VuLnRva2VuVHlwZSA9PT0gJ1NoYWRvdycpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNraXAgdG9rZW5zIHdpdGggdW5kZXJzY29yZSBpbiBuYW1lIChpbnRlcm5hbC9wcml2YXRlIHRva2VucylcbiAgICAgICAgaWYgKHRva2VuLm5hbWUuaW5kZXhPZignXycpICE9PSAtMSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKTtcbiAgICAgICAgLy8gU2tpcCB0b2tlbnMgaW4gZ3JvdXBzIHdpdGggdW5kZXJzY29yZSBpbiBuYW1lIG9yIHBhdGhcbiAgICAgICAgaWYgKGdyb3VwKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBncm91cCBuYW1lXG4gICAgICAgICAgICBpZiAoZ3JvdXAubmFtZS5pbmRleE9mKCdfJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBncm91cCBwYXRoXG4gICAgICAgICAgICBsZXQgaGFzVW5kZXJzY29yZUluUGF0aCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBncm91cC5wYXRoLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwLnBhdGhbcF0uaW5kZXhPZignXycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBoYXNVbmRlcnNjb3JlSW5QYXRoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc1VuZGVyc2NvcmVJblBhdGgpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCBmdWxsIGdyb3VwIHBhdGg6IGdyb3VwLnBhdGggKyBncm91cC5uYW1lXG4gICAgICAgIC8vIGUuZy4sIHBhdGg9W1wiY29yZVwiXSwgbmFtZT1cImJvcmRlci1yYWRpdXNcIiAtPiBbXCJjb3JlXCIsIFwiYm9yZGVyLXJhZGl1c1wiXVxuICAgICAgICBjb25zdCBncm91cFBhdGggPSBncm91cCA/IGdyb3VwLnBhdGggOiBbXTtcbiAgICAgICAgY29uc3QgZ3JvdXBOYW1lID0gZ3JvdXAgPyBncm91cC5uYW1lIDogJyc7XG4gICAgICAgIGNvbnN0IGZ1bGxHcm91cFBhdGggPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBncm91cFBhdGgubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGZ1bGxHcm91cFBhdGgucHVzaChncm91cFBhdGhbal0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChncm91cE5hbWUgJiYgIShncm91cCA9PT0gbnVsbCB8fCBncm91cCA9PT0gdm9pZCAwID8gdm9pZCAwIDogZ3JvdXAuaXNSb290KSkge1xuICAgICAgICAgICAgZnVsbEdyb3VwUGF0aC5wdXNoKGdyb3VwTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnVpbGQgdGhlIG5lc3RlZCBwYXRoOiBza2lwIHBsYXRmb3JtIChhbmQgb3B0aW9uYWxseSBtb3JlIGxldmVscylcbiAgICAgICAgY29uc3QgcGF0aFBhcnRzID0gZnVsbEdyb3VwUGF0aC5zbGljZShza2lwTGV2ZWxzKTtcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwYXRoUGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGZ1bGxQYXRoLnB1c2goc2FmZU5hbWUocGF0aFBhcnRzW2pdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVsbFBhdGgucHVzaChzYWZlTmFtZSh0b2tlbi5uYW1lKSk7XG4gICAgICAgIGlmIChmdWxsUGF0aC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgLy8gRm9ybWF0IGFuZCBzZXQgdGhlIHRva2VuIHZhbHVlXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdFRva2VuKHRva2VuLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgICAgIHNldE5lc3RlZCh0cmVlLCBmdWxsUGF0aCwgZm9ybWF0dGVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHRyZWU7XG59XG5mdW5jdGlvbiBzZXROZXN0ZWQob2JqLCBwYXRoLCB2YWx1ZSkge1xuICAgIGxldCBjdXJyZW50ID0gb2JqO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0gcGF0aFtpXTtcbiAgICAgICAgaWYgKCFjdXJyZW50W2tleV0gfHwgdHlwZW9mIGN1cnJlbnRba2V5XSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGN1cnJlbnRba2V5XSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tleV07XG4gICAgfVxuICAgIGN1cnJlbnRbcGF0aFtwYXRoLmxlbmd0aCAtIDFdXSA9IHZhbHVlO1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVE9LRU4gRk9STUFUVElORyAoRFRDRylcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGZvcm1hdFRva2VuKHRva2VuLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIGNvbnN0IHZhbHVlID0gdG9rZW4udmFsdWU7XG4gICAgLy8gQ2hlY2sgZm9yIHRvcC1sZXZlbCByZWZlcmVuY2UgRklSU1RcbiAgICBpZiAodmFsdWUgJiYgdmFsdWUucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgY29uc3QgcmVmVG9rZW4gPSB0b2tlbkJ5SWRbdmFsdWUucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICBpZiAocmVmVG9rZW4pIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJHZhbHVlOiAneycgKyBidWlsZFJlZlBhdGgocmVmVG9rZW4sIGdyb3VwcykgKyAnfScsXG4gICAgICAgICAgICAgICAgJHR5cGU6IG1hcFR5cGUodG9rZW4udG9rZW5UeXBlKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRm9ybWF0IHJhdyB2YWx1ZVxuICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdFZhbHVlKHZhbHVlLCB0b2tlbi50b2tlblR5cGUsIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICR2YWx1ZTogZm9ybWF0dGVkLFxuICAgICAgICAkdHlwZTogbWFwVHlwZSh0b2tlbi50b2tlblR5cGUpLFxuICAgIH07XG4gICAgaWYgKHRva2VuLmRlc2NyaXB0aW9uICYmIHRva2VuLmRlc2NyaXB0aW9uLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmVzdWx0LiRkZXNjcmlwdGlvbiA9IHRva2VuLmRlc2NyaXB0aW9uO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZm9ybWF0VmFsdWUodmFsdWUsIHRva2VuVHlwZSwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBpZiAoIXZhbHVlKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyBDb2xvcjogY2hlY2sgZm9yIG5lc3RlZCAuY29sb3Igb2JqZWN0IG9yIGRpcmVjdCByL2cvYlxuICAgIGlmICh2YWx1ZS5jb2xvciAmJiB0eXBlb2YgdmFsdWUuY29sb3IuciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgY29sb3IgaXRzZWxmIGlzIGEgcmVmZXJlbmNlXG4gICAgICAgIGlmICh2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmNvbG9yLnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIGlmIChyZWYpXG4gICAgICAgICAgICAgICAgcmV0dXJuICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfSc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVXNlIGZvcm1hdENvbG9yVmFsdWUgdG8gaGFuZGxlIGFscGhhIHByb3Blcmx5XG4gICAgICAgIHJldHVybiBmb3JtYXRDb2xvclZhbHVlKHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZS5yID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdmFsdWUuZyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgLy8gRGlyZWN0IHIvZy9iIChjaGVjayBmb3IgYWxwaGEgdG9vKVxuICAgICAgICBjb25zdCBhbHBoYSA9IHR5cGVvZiB2YWx1ZS5hID09PSAnbnVtYmVyJyA/IHZhbHVlLmEgOiAxO1xuICAgICAgICBpZiAoYWxwaGEgPCAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9IZXhXaXRoQWxwaGEodmFsdWUuciwgdmFsdWUuZywgdmFsdWUuYiwgYWxwaGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b0hleCh2YWx1ZS5yLCB2YWx1ZS5nLCB2YWx1ZS5iKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlLmhleCkge1xuICAgICAgICByZXR1cm4gJyMnICsgdmFsdWUuaGV4O1xuICAgIH1cbiAgICAvLyBEaW1lbnNpb24vTWVhc3VyZTogaGFzIC5tZWFzdXJlIGFuZCAudW5pdFxuICAgIGlmICh0eXBlb2YgdmFsdWUubWVhc3VyZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLm1lYXN1cmUgKyBmb3JtYXRVbml0KHZhbHVlLnVuaXQpO1xuICAgIH1cbiAgICAvLyBUZXh0L1N0cmluZzogaGFzIC50ZXh0XG4gICAgaWYgKHR5cGVvZiB2YWx1ZS50ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gdmFsdWUudGV4dDtcbiAgICB9XG4gICAgLy8gRm9udDogaGFzIC5mYW1pbHlcbiAgICBpZiAodHlwZW9mIHZhbHVlLmZhbWlseSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZhbWlseTogdmFsdWUuZmFtaWx5LFxuICAgICAgICAgICAgd2VpZ2h0OiB2YWx1ZS5zdWJmYW1pbHkgfHwgdmFsdWUud2VpZ2h0IHx8ICdSZWd1bGFyJyxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gVHlwb2dyYXBoeTogaGFzIC5mb250IGFuZCAuZm9udFNpemVcbiAgICBpZiAodmFsdWUuZm9udCB8fCB2YWx1ZS5mb250U2l6ZSkge1xuICAgICAgICByZXR1cm4gZm9ybWF0VHlwb2dyYXBoeSh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIH1cbiAgICAvLyBTaGFkb3c6IGhhcyAueCwgLnksIC5yYWRpdXMsIC5zcHJlYWRcbiAgICBpZiAodmFsdWUueCAhPT0gdW5kZWZpbmVkICYmIHZhbHVlLnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZm9ybWF0U2hhZG93KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIEdyYWRpZW50OiBoYXMgLnN0b3BzXG4gICAgaWYgKHZhbHVlLnN0b3BzICYmIEFycmF5LmlzQXJyYXkodmFsdWUuc3RvcHMpKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRHcmFkaWVudCh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgIH1cbiAgICAvLyBCb3JkZXI6IGhhcyAuY29sb3IgYW5kIC53aWR0aFxuICAgIGlmICh2YWx1ZS5jb2xvciAmJiB2YWx1ZS53aWR0aCkge1xuICAgICAgICByZXR1cm4gZm9ybWF0Qm9yZGVyKHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIFJhZGl1czogaGFzIC5yYWRpdXMgb3IgY29ybmVyIHZhbHVlc1xuICAgIGlmICh2YWx1ZS5yYWRpdXMgfHwgdmFsdWUudG9wTGVmdCB8fCB2YWx1ZS50b3BSaWdodCkge1xuICAgICAgICByZXR1cm4gZm9ybWF0UmFkaXVzKHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIEZhbGxiYWNrOiByZXR1cm4gYXMtaXNcbiAgICByZXR1cm4gdmFsdWU7XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBDT01QTEVYIFZBTFVFIEZPUk1BVFRFUlNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGZvcm1hdFR5cG9ncmFwaHkodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgaWYgKHZhbHVlLmZvbnQpIHtcbiAgICAgICAgaWYgKHZhbHVlLmZvbnQucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5mb250LnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIHJlc3VsdC5mb250RmFtaWx5ID0gcmVmID8gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JyA6IHZhbHVlLmZvbnQuZmFtaWx5O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmZvbnRGYW1pbHkgPSB2YWx1ZS5mb250LmZhbWlseSB8fCAnJztcbiAgICAgICAgICAgIHJlc3VsdC5mb250V2VpZ2h0ID0gdmFsdWUuZm9udC5zdWJmYW1pbHkgfHwgJ1JlZ3VsYXInO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh2YWx1ZS5mb250U2l6ZSkge1xuICAgICAgICBpZiAodmFsdWUuZm9udFNpemUucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5mb250U2l6ZS5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQuZm9udFNpemUgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogZm9ybWF0TWVhc3VyZSh2YWx1ZS5mb250U2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQuZm9udFNpemUgPSBmb3JtYXRNZWFzdXJlKHZhbHVlLmZvbnRTaXplKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodmFsdWUubGluZUhlaWdodCkge1xuICAgICAgICBpZiAodmFsdWUubGluZUhlaWdodC5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmxpbmVIZWlnaHQucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgcmVzdWx0LmxpbmVIZWlnaHQgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogZm9ybWF0TWVhc3VyZSh2YWx1ZS5saW5lSGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5saW5lSGVpZ2h0ID0gZm9ybWF0TWVhc3VyZSh2YWx1ZS5saW5lSGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodmFsdWUubGV0dGVyU3BhY2luZykge1xuICAgICAgICByZXN1bHQubGV0dGVyU3BhY2luZyA9IGZvcm1hdE1lYXN1cmUodmFsdWUubGV0dGVyU3BhY2luZyk7XG4gICAgfVxuICAgIGlmICh2YWx1ZS50ZXh0Q2FzZSlcbiAgICAgICAgcmVzdWx0LnRleHRUcmFuc2Zvcm0gPSB2YWx1ZS50ZXh0Q2FzZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh2YWx1ZS50ZXh0RGVjb3JhdGlvbilcbiAgICAgICAgcmVzdWx0LnRleHREZWNvcmF0aW9uID0gdmFsdWUudGV4dERlY29yYXRpb24udG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZm9ybWF0U2hhZG93KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgb2Zmc2V0WDogZm9ybWF0TWVhc3VyZSh2YWx1ZS54KSxcbiAgICAgICAgb2Zmc2V0WTogZm9ybWF0TWVhc3VyZSh2YWx1ZS55KSxcbiAgICAgICAgYmx1cjogZm9ybWF0TWVhc3VyZSh2YWx1ZS5yYWRpdXMpLFxuICAgICAgICBzcHJlYWQ6IGZvcm1hdE1lYXN1cmUodmFsdWUuc3ByZWFkKSxcbiAgICB9O1xuICAgIGlmICh2YWx1ZS5jb2xvcikge1xuICAgICAgICBpZiAodmFsdWUuY29sb3IucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogZm9ybWF0Q29sb3JWYWx1ZSh2YWx1ZS5jb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSBmb3JtYXRDb2xvclZhbHVlKHZhbHVlLmNvbG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZm9ybWF0R3JhZGllbnQodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3Qgc3RvcHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLnN0b3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHN0b3AgPSB2YWx1ZS5zdG9wc1tpXTtcbiAgICAgICAgc3RvcHMucHVzaCh7XG4gICAgICAgICAgICBwb3NpdGlvbjogc3RvcC5wb3NpdGlvbiB8fCAwLFxuICAgICAgICAgICAgY29sb3I6IHN0b3AuY29sb3IgPyBmb3JtYXRDb2xvclZhbHVlKHN0b3AuY29sb3IpIDogJyMwMDAwMDAnLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogKHZhbHVlLnR5cGUgfHwgJ2xpbmVhcicpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgIHN0b3BzOiBzdG9wcyxcbiAgICB9O1xufVxuZnVuY3Rpb24gZm9ybWF0Qm9yZGVyKHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgd2lkdGg6IGZvcm1hdE1lYXN1cmUodmFsdWUud2lkdGgpLFxuICAgICAgICBzdHlsZTogJ3NvbGlkJyxcbiAgICB9O1xuICAgIGlmICh2YWx1ZS5jb2xvcikge1xuICAgICAgICBpZiAodmFsdWUuY29sb3IucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogZm9ybWF0Q29sb3JWYWx1ZSh2YWx1ZS5jb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQuY29sb3IgPSBmb3JtYXRDb2xvclZhbHVlKHZhbHVlLmNvbG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZm9ybWF0UmFkaXVzKHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcykge1xuICAgIC8vIFNpbmdsZSByYWRpdXNcbiAgICBpZiAodmFsdWUucmFkaXVzICYmICF2YWx1ZS50b3BMZWZ0KSB7XG4gICAgICAgIGlmICh2YWx1ZS5yYWRpdXMucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5yYWRpdXMucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgcmV0dXJuIHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRNZWFzdXJlKHZhbHVlLnJhZGl1cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvcm1hdE1lYXN1cmUodmFsdWUucmFkaXVzKTtcbiAgICB9XG4gICAgLy8gQ29ybmVyIHJhZGlpXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG9wTGVmdDogZm9ybWF0TWVhc3VyZSh2YWx1ZS50b3BMZWZ0KSxcbiAgICAgICAgdG9wUmlnaHQ6IGZvcm1hdE1lYXN1cmUodmFsdWUudG9wUmlnaHQpLFxuICAgICAgICBib3R0b21MZWZ0OiBmb3JtYXRNZWFzdXJlKHZhbHVlLmJvdHRvbUxlZnQpLFxuICAgICAgICBib3R0b21SaWdodDogZm9ybWF0TWVhc3VyZSh2YWx1ZS5ib3R0b21SaWdodCksXG4gICAgfTtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFBSSU1JVElWRSBGT1JNQVRURVJTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBmb3JtYXRNZWFzdXJlKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuICcwcHgnO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKVxuICAgICAgICByZXR1cm4gdmFsdWUgKyAncHgnO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgY29uc3QgbWVhc3VyZSA9IHZhbHVlLm1lYXN1cmUgIT09IHVuZGVmaW5lZCA/IHZhbHVlLm1lYXN1cmUgOiAwO1xuICAgIGNvbnN0IHVuaXQgPSBmb3JtYXRVbml0KHZhbHVlLnVuaXQpO1xuICAgIHJldHVybiBtZWFzdXJlICsgdW5pdDtcbn1cbmZ1bmN0aW9uIGZvcm1hdENvbG9yVmFsdWUodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKVxuICAgICAgICByZXR1cm4gJyMwMDAwMDAnO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgaWYgKHZhbHVlLmhleClcbiAgICAgICAgcmV0dXJuICcjJyArIHZhbHVlLmhleDtcbiAgICAvLyBHZXQgUkdCIHZhbHVlc1xuICAgIGxldCByID0gMCwgZyA9IDAsIGIgPSAwO1xuICAgIGlmICh2YWx1ZS5jb2xvciAmJiB0eXBlb2YgdmFsdWUuY29sb3IuciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgciA9IHZhbHVlLmNvbG9yLnI7XG4gICAgICAgIGcgPSB2YWx1ZS5jb2xvci5nO1xuICAgICAgICBiID0gdmFsdWUuY29sb3IuYjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLnIgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHIgPSB2YWx1ZS5yO1xuICAgICAgICBnID0gdmFsdWUuZztcbiAgICAgICAgYiA9IHZhbHVlLmI7XG4gICAgfVxuICAgIC8vIEdldCBhbHBoYS9vcGFjaXR5ICgwLTEpXG4gICAgbGV0IGFscGhhID0gMTtcbiAgICBpZiAodmFsdWUub3BhY2l0eSAmJiB0eXBlb2YgdmFsdWUub3BhY2l0eS5tZWFzdXJlID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbHBoYSA9IHZhbHVlLm9wYWNpdHkubWVhc3VyZTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLmEgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGFscGhhID0gdmFsdWUuYTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlLmFscGhhID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbHBoYSA9IHZhbHVlLmFscGhhO1xuICAgIH1cbiAgICAvLyBPdXRwdXQgd2l0aCBhbHBoYSBpZiBub3QgZnVsbHkgb3BhcXVlXG4gICAgaWYgKGFscGhhIDwgMSkge1xuICAgICAgICByZXR1cm4gdG9IZXhXaXRoQWxwaGEociwgZywgYiwgYWxwaGEpO1xuICAgIH1cbiAgICByZXR1cm4gdG9IZXgociwgZywgYik7XG59XG5mdW5jdGlvbiB0b0hleChyLCBnLCBiKSB7XG4gICAgY29uc3QgcmggPSBNYXRoLnJvdW5kKHIpLnRvU3RyaW5nKDE2KTtcbiAgICBjb25zdCBnaCA9IE1hdGgucm91bmQoZykudG9TdHJpbmcoMTYpO1xuICAgIGNvbnN0IGJoID0gTWF0aC5yb3VuZChiKS50b1N0cmluZygxNik7XG4gICAgcmV0dXJuICcjJyArIHBhZDIocmgpICsgcGFkMihnaCkgKyBwYWQyKGJoKTtcbn1cbmZ1bmN0aW9uIHRvSGV4V2l0aEFscGhhKHIsIGcsIGIsIGEpIHtcbiAgICBjb25zdCByaCA9IE1hdGgucm91bmQocikudG9TdHJpbmcoMTYpO1xuICAgIGNvbnN0IGdoID0gTWF0aC5yb3VuZChnKS50b1N0cmluZygxNik7XG4gICAgY29uc3QgYmggPSBNYXRoLnJvdW5kKGIpLnRvU3RyaW5nKDE2KTtcbiAgICBjb25zdCBhaCA9IE1hdGgucm91bmQoYSAqIDI1NSkudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiAnIycgKyBwYWQyKHJoKSArIHBhZDIoZ2gpICsgcGFkMihiaCkgKyBwYWQyKGFoKTtcbn1cbmZ1bmN0aW9uIHBhZDIocykge1xuICAgIHJldHVybiBzLmxlbmd0aCA9PT0gMSA/ICcwJyArIHMgOiBzO1xufVxuZnVuY3Rpb24gZm9ybWF0VW5pdCh1bml0KSB7XG4gICAgaWYgKCF1bml0KVxuICAgICAgICByZXR1cm4gJ3B4JztcbiAgICBjb25zdCB1ID0gU3RyaW5nKHVuaXQpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHUgPT09ICdwaXhlbHMnIHx8IHUgPT09ICdweCcpXG4gICAgICAgIHJldHVybiAncHgnO1xuICAgIGlmICh1ID09PSAncGVyY2VudCcgfHwgdSA9PT0gJyUnKVxuICAgICAgICByZXR1cm4gJyUnO1xuICAgIGlmICh1ID09PSAnZW1zJyB8fCB1ID09PSAnZW0nKVxuICAgICAgICByZXR1cm4gJ2VtJztcbiAgICBpZiAodSA9PT0gJ3BvaW50cycgfHwgdSA9PT0gJ3B0JylcbiAgICAgICAgcmV0dXJuICdwdCc7XG4gICAgaWYgKHUgPT09ICdyYXcnKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgcmV0dXJuIHU7XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBSRUZFUkVOQ0UgUEFUSCBCVUlMRElOR1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gYnVpbGRSZWZQYXRoKHRva2VuLCBncm91cHMpIHtcbiAgICBjb25zdCBncm91cCA9IGZpbmRHcm91cEZvclRva2VuKHRva2VuLCBncm91cHMpO1xuICAgIGNvbnN0IGdyb3VwUGF0aCA9IGdyb3VwID8gZ3JvdXAucGF0aCA6IFtdO1xuICAgIGNvbnN0IGdyb3VwTmFtZSA9IGdyb3VwID8gZ3JvdXAubmFtZSA6ICcnO1xuICAgIC8vIEJ1aWxkIGZ1bGwgZ3JvdXAgcGF0aDogZ3JvdXAucGF0aCArIGdyb3VwLm5hbWVcbiAgICBjb25zdCBmdWxsR3JvdXBQYXRoID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cFBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZnVsbEdyb3VwUGF0aC5wdXNoKGdyb3VwUGF0aFtpXSk7XG4gICAgfVxuICAgIGlmIChncm91cE5hbWUgJiYgIShncm91cCA9PT0gbnVsbCB8fCBncm91cCA9PT0gdm9pZCAwID8gdm9pZCAwIDogZ3JvdXAuaXNSb290KSkge1xuICAgICAgICBmdWxsR3JvdXBQYXRoLnB1c2goZ3JvdXBOYW1lKTtcbiAgICB9XG4gICAgLy8gQnVpbGQgcGF0aDogdXNlIGZ1bGwgcGF0aCAoY29sbGVjdGlvbiBoYW5kbGVzIHBsYXRmb3JtIHJvdXRpbmcpXG4gICAgLy8gUmVzdWx0OiBcImNvbG9yLjUwMFwiIG9yIFwic2VtYW50aWMuY29sb3IucHJpbWFyeVwiXG4gICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZ1bGxHcm91cFBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFydHMucHVzaChzYWZlTmFtZShmdWxsR3JvdXBQYXRoW2ldKSk7XG4gICAgfVxuICAgIHBhcnRzLnB1c2goc2FmZU5hbWUodG9rZW4ubmFtZSkpO1xuICAgIHJldHVybiBwYXJ0cy5qb2luKCcuJyk7XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBUWVBFIE1BUFBJTkdcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIG1hcFR5cGUodG9rZW5UeXBlKSB7XG4gICAgY29uc3QgdCA9IFN0cmluZyh0b2tlblR5cGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHQgPT09ICdjb2xvcicpXG4gICAgICAgIHJldHVybiAnY29sb3InO1xuICAgIGlmICh0ID09PSAnZGltZW5zaW9uJyB8fCB0ID09PSAnbWVhc3VyZScpXG4gICAgICAgIHJldHVybiAnZGltZW5zaW9uJztcbiAgICBpZiAodCA9PT0gJ3R5cG9ncmFwaHknKVxuICAgICAgICByZXR1cm4gJ3R5cG9ncmFwaHknO1xuICAgIGlmICh0ID09PSAnc2hhZG93JylcbiAgICAgICAgcmV0dXJuICdzaGFkb3cnO1xuICAgIGlmICh0ID09PSAnYm9yZGVyJylcbiAgICAgICAgcmV0dXJuICdib3JkZXInO1xuICAgIGlmICh0ID09PSAncmFkaXVzJylcbiAgICAgICAgcmV0dXJuICdib3JkZXJSYWRpdXMnO1xuICAgIGlmICh0ID09PSAnZ3JhZGllbnQnKVxuICAgICAgICByZXR1cm4gJ2dyYWRpZW50JztcbiAgICBpZiAodCA9PT0gJ2ZvbnQnKVxuICAgICAgICByZXR1cm4gJ2ZvbnRGYW1pbHknO1xuICAgIGlmICh0ID09PSAndGV4dCcgfHwgdCA9PT0gJ3N0cmluZycpXG4gICAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICByZXR1cm4gdDtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFVUSUxJVElFU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gc2FmZU5hbWUobmFtZSkge1xuICAgIHJldHVybiBTdHJpbmcobmFtZSB8fCAnJykucmVwbGFjZSgvXFxXKy9nLCAnLScpLnRvTG93ZXJDYXNlKCk7XG59XG5mdW5jdGlvbiBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZyA9IGdyb3Vwc1tpXTtcbiAgICAgICAgaWYgKGcudG9rZW5JZHMgJiYgZy50b2tlbklkcy5pbmRleE9mKHRva2VuLmlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gZmluZFRoZW1lQnlJZChhcnIsIGlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFycltpXS5pZCA9PT0gaWQpXG4gICAgICAgICAgICByZXR1cm4gYXJyW2ldO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIHRvQXJyYXkoaW5wdXQpIHtcbiAgICBpZiAoIWlucHV0KVxuICAgICAgICByZXR1cm4gW107XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKVxuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGlucHV0Lmxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGlucHV0W2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBGSUxFIE9VVFBVVFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gY3JlYXRlRmlsZShmaWxlUGF0aCwgY29udGVudCkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBmaWxlUGF0aC5yZXBsYWNlKC9eXFwvKy8sICcnKTtcbiAgICBjb25zdCBwYXJ0cyA9IG5vcm1hbGl6ZWQuc3BsaXQoJy8nKTtcbiAgICBjb25zdCBmaWxlTmFtZSA9IHBhcnRzLnBvcCgpIHx8ICdvdXRwdXQuanNvbic7XG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGFydHMuam9pbignLycpO1xuICAgIGNvbnN0IGpzb25Db250ZW50ID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCwgbnVsbCwgMik7XG4gICAgLy8gVHJ5IEZpbGVIZWxwZXIgZmlyc3QsIGZhbGxiYWNrIHRvIHBsYWluIG9iamVjdFxuICAgIGlmICh0eXBlb2YgRmlsZUhlbHBlciAhPT0gJ3VuZGVmaW5lZCcgJiYgRmlsZUhlbHBlci5jcmVhdGVUZXh0RmlsZSkge1xuICAgICAgICByZXR1cm4gRmlsZUhlbHBlci5jcmVhdGVUZXh0RmlsZSh7IHJlbGF0aXZlUGF0aCwgZmlsZU5hbWUsIGNvbnRlbnQ6IGpzb25Db250ZW50IH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBwYXRoOiByZWxhdGl2ZVBhdGgubGVuZ3RoID4gMCA/IHJlbGF0aXZlUGF0aCA6ICcuJyxcbiAgICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgY29udGVudDoganNvbkNvbnRlbnQsXG4gICAgfTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=