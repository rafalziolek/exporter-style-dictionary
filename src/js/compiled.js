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
    // 3. Group base tokens by platform (core tokens are theme-independent)
    const baseGrouped = groupByPlatform(baseTokens, groups);
    // 4. Build output files
    const outputs = [];
    // Core tokens (always exported once, shared across all themes)
    if (baseGrouped.core.length > 0) {
        const tree = buildTree(baseGrouped.core, groups, baseTokenById, 1);
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
                const tree = buildTree(platformTokens, groups, tokenById, 1);
                outputs.push(createFile(platform + '/' + themeName + '.json', tree));
            }
        }
    }
    return outputs;
}));
// ============================================================================
// GROUPING
// ============================================================================
function groupByPlatform(tokens, groups) {
    const result = {
        core: [],
        web: [],
        mobile: [],
        unknown: [],
    };
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const group = findGroupForToken(token, groups);
        const path = group ? group.path : [];
        const platform = path.length > 0 ? path[0].toLowerCase() : 'unknown';
        if (platform === 'core') {
            result.core.push(token);
        }
        else if (platform === 'web') {
            result.web.push(token);
        }
        else if (platform === 'mobile') {
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
        const group = findGroupForToken(token, groups);
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
        return toHex(value.color.r, value.color.g, value.color.b);
    }
    if (typeof value.r === 'number' && typeof value.g === 'number') {
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
    if (value.color && typeof value.color.r === 'number') {
        return toHex(value.color.r, value.color.g, value.color.b);
    }
    if (typeof value.r === 'number') {
        return toHex(value.r, value.g, value.b);
    }
    return '#000000';
}
function toHex(r, g, b) {
    const rh = Math.round(r).toString(16);
    const gh = Math.round(g).toString(16);
    const bh = Math.round(b).toString(16);
    return '#' + pad2(rh) + pad2(gh) + pad2(bh);
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
    // Build path: skip platform (index 0), include everything else + token name
    // Result: "border-radius.1" or "semantic.color.primary"
    const parts = [];
    for (let i = 1; i < fullGroupPath.length; i++) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsK0RBQStELGdCQUFnQixFQUFFLEVBQUU7QUFDOUc7QUFDQSxtQ0FBbUMsTUFBTSw2QkFBNkIsRUFBRSxZQUFZLFdBQVcsRUFBRTtBQUNqRyxrQ0FBa0MsTUFBTSxpQ0FBaUMsRUFBRSxZQUFZLFdBQVcsRUFBRTtBQUNwRywrQkFBK0IscUZBQXFGO0FBQ3BIO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix1QkFBdUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QSwyQkFBMkIsa0NBQWtDO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsc0JBQXNCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsMEJBQTBCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLG1CQUFtQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGdCQUFnQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsa0JBQWtCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsK0NBQStDO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIi8vIFNpbXBsZSBUb2tlbiBFeHBvcnRlciAtIENsZWFuIEltcGxlbWVudGF0aW9uXG4vLyBVc2VzIGdyb3VwLnBhdGggZm9yIHRva2VuIGxvY2F0aW9uLCB0b2tlbkJ5SWQgbWFwIGZvciByZWZlcmVuY2VzXG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIE1BSU4gRVhQT1JUXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5QdWxzYXIuZXhwb3J0KChzZGssIGNvbnRleHQpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICBjb25zdCByZW1vdGUgPSB7XG4gICAgICAgIGRlc2lnblN5c3RlbUlkOiBjb250ZXh0LmRzSWQsXG4gICAgICAgIHZlcnNpb25JZDogY29udGV4dC52ZXJzaW9uSWQsXG4gICAgfTtcbiAgICAvLyAxLiBGZXRjaCBhbGwgZGF0YVxuICAgIGNvbnN0IGJhc2VUb2tlbnMgPSB0b0FycmF5KHlpZWxkIHNkay50b2tlbnMuZ2V0VG9rZW5zKHJlbW90ZSkpO1xuICAgIGNvbnN0IGdyb3VwcyA9IHRvQXJyYXkoeWllbGQgc2RrLnRva2Vucy5nZXRUb2tlbkdyb3VwcyhyZW1vdGUpKTtcbiAgICBjb25zdCB0aGVtZXMgPSB0b0FycmF5KHlpZWxkIHNkay50b2tlbnMuZ2V0VG9rZW5UaGVtZXMocmVtb3RlKSk7XG4gICAgLy8gMi4gQnVpbGQgYmFzZSB0b2tlbiBsb29rdXAgbWFwIChmb3IgY29yZSB0b2tlbnMgLSB0aGV5IGRvbid0IGNoYW5nZSB3aXRoIHRoZW1lcylcbiAgICBjb25zdCBiYXNlVG9rZW5CeUlkID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYXNlVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJhc2VUb2tlbkJ5SWRbYmFzZVRva2Vuc1tpXS5pZF0gPSBiYXNlVG9rZW5zW2ldO1xuICAgIH1cbiAgICAvLyAzLiBHcm91cCBiYXNlIHRva2VucyBieSBwbGF0Zm9ybSAoY29yZSB0b2tlbnMgYXJlIHRoZW1lLWluZGVwZW5kZW50KVxuICAgIGNvbnN0IGJhc2VHcm91cGVkID0gZ3JvdXBCeVBsYXRmb3JtKGJhc2VUb2tlbnMsIGdyb3Vwcyk7XG4gICAgLy8gNC4gQnVpbGQgb3V0cHV0IGZpbGVzXG4gICAgY29uc3Qgb3V0cHV0cyA9IFtdO1xuICAgIC8vIENvcmUgdG9rZW5zIChhbHdheXMgZXhwb3J0ZWQgb25jZSwgc2hhcmVkIGFjcm9zcyBhbGwgdGhlbWVzKVxuICAgIGlmIChiYXNlR3JvdXBlZC5jb3JlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdHJlZSA9IGJ1aWxkVHJlZShiYXNlR3JvdXBlZC5jb3JlLCBncm91cHMsIGJhc2VUb2tlbkJ5SWQsIDEpO1xuICAgICAgICBvdXRwdXRzLnB1c2goY3JlYXRlRmlsZSgnY29yZS9jb3JlLmpzb24nLCB0cmVlKSk7XG4gICAgfVxuICAgIC8vIDQuIEV4cG9ydCBBTEwgdGhlbWVzXG4gICAgZm9yIChsZXQgdCA9IDA7IHQgPCB0aGVtZXMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgY29uc3QgdGhlbWUgPSB0aGVtZXNbdF07XG4gICAgICAgIGNvbnN0IHRoZW1lTmFtZSA9IHRoZW1lLm5hbWU7IC8vIGUuZy4sIFwiY3VzdG9tZXIvbGlnaHRcIiBvciBcInBhdGllbnQvZGFya1wiXG4gICAgICAgIC8vIEJ1aWxkIHRoZW1lZCB0b2tlbnMgYnkgbWVyZ2luZyBvdmVycmlkZGVuVG9rZW5zIHdpdGggYmFzZSB0b2tlbnNcbiAgICAgICAgLy8gVGhlIHRoZW1lLm92ZXJyaWRkZW5Ub2tlbnMgY29udGFpbnMgdGhlIGFjdHVhbCB0aGVtZWQgdmFsdWVzXG4gICAgICAgIGNvbnN0IG92ZXJyaWRkZW5Ub2tlbnMgPSB0b0FycmF5KHRoZW1lLm92ZXJyaWRkZW5Ub2tlbnMgfHwgW10pO1xuICAgICAgICAvLyBDcmVhdGUgYSBtYXAgb2Ygb3ZlcnJpZGRlbiB0b2tlbnMgYnkgSURcbiAgICAgICAgY29uc3Qgb3ZlcnJpZGRlbkJ5SWQgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdmVycmlkZGVuVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBvdmVycmlkZGVuQnlJZFtvdmVycmlkZGVuVG9rZW5zW2ldLmlkXSA9IG92ZXJyaWRkZW5Ub2tlbnNbaV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWVyZ2U6IHVzZSBvdmVycmlkZGVuIHRva2VuIGlmIGV4aXN0cywgb3RoZXJ3aXNlIHVzZSBiYXNlIHRva2VuXG4gICAgICAgIGNvbnN0IHRoZW1lZFRva2VucyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJhc2VUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJhc2VUb2tlbiA9IGJhc2VUb2tlbnNbaV07XG4gICAgICAgICAgICBjb25zdCBvdmVycmlkZGVuID0gb3ZlcnJpZGRlbkJ5SWRbYmFzZVRva2VuLmlkXTtcbiAgICAgICAgICAgIHRoZW1lZFRva2Vucy5wdXNoKG92ZXJyaWRkZW4gfHwgYmFzZVRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBCdWlsZCB0b2tlbiBsb29rdXAgZm9yIHRoaXMgdGhlbWVcbiAgICAgICAgY29uc3QgdG9rZW5CeUlkID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhlbWVkVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0b2tlbkJ5SWRbdGhlbWVkVG9rZW5zW2ldLmlkXSA9IHRoZW1lZFRva2Vuc1tpXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBHcm91cCB0aGVtZWQgdG9rZW5zIGJ5IHBsYXRmb3JtXG4gICAgICAgIGNvbnN0IGdyb3VwZWQgPSBncm91cEJ5UGxhdGZvcm0odGhlbWVkVG9rZW5zLCBncm91cHMpO1xuICAgICAgICAvLyBFeHBvcnQgcGxhdGZvcm0tc3BlY2lmaWMgdG9rZW5zIGZvciB0aGlzIHRoZW1lXG4gICAgICAgIGNvbnN0IHBsYXRmb3JtcyA9IFsnd2ViJywgJ21vYmlsZSddO1xuICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHBsYXRmb3Jtcy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgY29uc3QgcGxhdGZvcm0gPSBwbGF0Zm9ybXNbcF07XG4gICAgICAgICAgICBjb25zdCBwbGF0Zm9ybVRva2VucyA9IGdyb3VwZWRbcGxhdGZvcm1dIHx8IFtdO1xuICAgICAgICAgICAgaWYgKHBsYXRmb3JtVG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmVlID0gYnVpbGRUcmVlKHBsYXRmb3JtVG9rZW5zLCBncm91cHMsIHRva2VuQnlJZCwgMSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0cy5wdXNoKGNyZWF0ZUZpbGUocGxhdGZvcm0gKyAnLycgKyB0aGVtZU5hbWUgKyAnLmpzb24nLCB0cmVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dHM7XG59KSk7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBHUk9VUElOR1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gZ3JvdXBCeVBsYXRmb3JtKHRva2VucywgZ3JvdXBzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICBjb3JlOiBbXSxcbiAgICAgICAgd2ViOiBbXSxcbiAgICAgICAgbW9iaWxlOiBbXSxcbiAgICAgICAgdW5rbm93bjogW10sXG4gICAgfTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKTtcbiAgICAgICAgY29uc3QgcGF0aCA9IGdyb3VwID8gZ3JvdXAucGF0aCA6IFtdO1xuICAgICAgICBjb25zdCBwbGF0Zm9ybSA9IHBhdGgubGVuZ3RoID4gMCA/IHBhdGhbMF0udG9Mb3dlckNhc2UoKSA6ICd1bmtub3duJztcbiAgICAgICAgaWYgKHBsYXRmb3JtID09PSAnY29yZScpIHtcbiAgICAgICAgICAgIHJlc3VsdC5jb3JlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBsYXRmb3JtID09PSAnd2ViJykge1xuICAgICAgICAgICAgcmVzdWx0LndlYi5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwbGF0Zm9ybSA9PT0gJ21vYmlsZScpIHtcbiAgICAgICAgICAgIHJlc3VsdC5tb2JpbGUucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQudW5rbm93bi5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVFJFRSBCVUlMRElOR1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gYnVpbGRUcmVlKHRva2VucywgZ3JvdXBzLCB0b2tlbkJ5SWQsIHNraXBMZXZlbHMpIHtcbiAgICBjb25zdCB0cmVlID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICAgIC8vIFNraXAgdmlydHVhbCBzaGFkb3cgdG9rZW5zXG4gICAgICAgIGlmICh0b2tlbi5pc1ZpcnR1YWwgPT09IHRydWUgJiYgdG9rZW4udG9rZW5UeXBlID09PSAnU2hhZG93Jykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZ3JvdXAgPSBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKTtcbiAgICAgICAgLy8gQnVpbGQgZnVsbCBncm91cCBwYXRoOiBncm91cC5wYXRoICsgZ3JvdXAubmFtZVxuICAgICAgICAvLyBlLmcuLCBwYXRoPVtcImNvcmVcIl0sIG5hbWU9XCJib3JkZXItcmFkaXVzXCIgLT4gW1wiY29yZVwiLCBcImJvcmRlci1yYWRpdXNcIl1cbiAgICAgICAgY29uc3QgZ3JvdXBQYXRoID0gZ3JvdXAgPyBncm91cC5wYXRoIDogW107XG4gICAgICAgIGNvbnN0IGdyb3VwTmFtZSA9IGdyb3VwID8gZ3JvdXAubmFtZSA6ICcnO1xuICAgICAgICBjb25zdCBmdWxsR3JvdXBQYXRoID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZ3JvdXBQYXRoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBmdWxsR3JvdXBQYXRoLnB1c2goZ3JvdXBQYXRoW2pdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ3JvdXBOYW1lICYmICEoZ3JvdXAgPT09IG51bGwgfHwgZ3JvdXAgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGdyb3VwLmlzUm9vdCkpIHtcbiAgICAgICAgICAgIGZ1bGxHcm91cFBhdGgucHVzaChncm91cE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEJ1aWxkIHRoZSBuZXN0ZWQgcGF0aDogc2tpcCBwbGF0Zm9ybSAoYW5kIG9wdGlvbmFsbHkgbW9yZSBsZXZlbHMpXG4gICAgICAgIGNvbnN0IHBhdGhQYXJ0cyA9IGZ1bGxHcm91cFBhdGguc2xpY2Uoc2tpcExldmVscyk7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGF0aFBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBmdWxsUGF0aC5wdXNoKHNhZmVOYW1lKHBhdGhQYXJ0c1tqXSkpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bGxQYXRoLnB1c2goc2FmZU5hbWUodG9rZW4ubmFtZSkpO1xuICAgICAgICBpZiAoZnVsbFBhdGgubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIC8vIEZvcm1hdCBhbmQgc2V0IHRoZSB0b2tlbiB2YWx1ZVxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRUb2tlbih0b2tlbiwgdG9rZW5CeUlkLCBncm91cHMpO1xuICAgICAgICBzZXROZXN0ZWQodHJlZSwgZnVsbFBhdGgsIGZvcm1hdHRlZCk7XG4gICAgfVxuICAgIHJldHVybiB0cmVlO1xufVxuZnVuY3Rpb24gc2V0TmVzdGVkKG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgICBsZXQgY3VycmVudCA9IG9iajtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGgubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHBhdGhbaV07XG4gICAgICAgIGlmICghY3VycmVudFtrZXldIHx8IHR5cGVvZiBjdXJyZW50W2tleV0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjdXJyZW50W2tleV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY3VycmVudFtrZXldO1xuICAgIH1cbiAgICBjdXJyZW50W3BhdGhbcGF0aC5sZW5ndGggLSAxXV0gPSB2YWx1ZTtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRPS0VOIEZPUk1BVFRJTkcgKERUQ0cpXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBmb3JtYXRUb2tlbih0b2tlbiwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRva2VuLnZhbHVlO1xuICAgIC8vIENoZWNrIGZvciB0b3AtbGV2ZWwgcmVmZXJlbmNlIEZJUlNUXG4gICAgaWYgKHZhbHVlICYmIHZhbHVlLnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgIGNvbnN0IHJlZlRva2VuID0gdG9rZW5CeUlkW3ZhbHVlLnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgaWYgKHJlZlRva2VuKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICR2YWx1ZTogJ3snICsgYnVpbGRSZWZQYXRoKHJlZlRva2VuLCBncm91cHMpICsgJ30nLFxuICAgICAgICAgICAgICAgICR0eXBlOiBtYXBUeXBlKHRva2VuLnRva2VuVHlwZSksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZvcm1hdCByYXcgdmFsdWVcbiAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRWYWx1ZSh2YWx1ZSwgdG9rZW4udG9rZW5UeXBlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAkdmFsdWU6IGZvcm1hdHRlZCxcbiAgICAgICAgJHR5cGU6IG1hcFR5cGUodG9rZW4udG9rZW5UeXBlKSxcbiAgICB9O1xuICAgIGlmICh0b2tlbi5kZXNjcmlwdGlvbiAmJiB0b2tlbi5kZXNjcmlwdGlvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlc3VsdC4kZGVzY3JpcHRpb24gPSB0b2tlbi5kZXNjcmlwdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKHZhbHVlLCB0b2tlblR5cGUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgLy8gQ29sb3I6IGNoZWNrIGZvciBuZXN0ZWQgLmNvbG9yIG9iamVjdCBvciBkaXJlY3Qgci9nL2JcbiAgICBpZiAodmFsdWUuY29sb3IgJiYgdHlwZW9mIHZhbHVlLmNvbG9yLnIgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIGNvbG9yIGl0c2VsZiBpcyBhIHJlZmVyZW5jZVxuICAgICAgICBpZiAodmFsdWUuY29sb3IucmVmZXJlbmNlZFRva2VuSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRva2VuQnlJZFt2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICBpZiAocmVmKVxuICAgICAgICAgICAgICAgIHJldHVybiAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b0hleCh2YWx1ZS5jb2xvci5yLCB2YWx1ZS5jb2xvci5nLCB2YWx1ZS5jb2xvci5iKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZS5yID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdmFsdWUuZyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIHRvSGV4KHZhbHVlLnIsIHZhbHVlLmcsIHZhbHVlLmIpO1xuICAgIH1cbiAgICBpZiAodmFsdWUuaGV4KSB7XG4gICAgICAgIHJldHVybiAnIycgKyB2YWx1ZS5oZXg7XG4gICAgfVxuICAgIC8vIERpbWVuc2lvbi9NZWFzdXJlOiBoYXMgLm1lYXN1cmUgYW5kIC51bml0XG4gICAgaWYgKHR5cGVvZiB2YWx1ZS5tZWFzdXJlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gdmFsdWUubWVhc3VyZSArIGZvcm1hdFVuaXQodmFsdWUudW5pdCk7XG4gICAgfVxuICAgIC8vIFRleHQvU3RyaW5nOiBoYXMgLnRleHRcbiAgICBpZiAodHlwZW9mIHZhbHVlLnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS50ZXh0O1xuICAgIH1cbiAgICAvLyBGb250OiBoYXMgLmZhbWlseVxuICAgIGlmICh0eXBlb2YgdmFsdWUuZmFtaWx5ID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmFtaWx5OiB2YWx1ZS5mYW1pbHksXG4gICAgICAgICAgICB3ZWlnaHQ6IHZhbHVlLnN1YmZhbWlseSB8fCB2YWx1ZS53ZWlnaHQgfHwgJ1JlZ3VsYXInLFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBUeXBvZ3JhcGh5OiBoYXMgLmZvbnQgYW5kIC5mb250U2l6ZVxuICAgIGlmICh2YWx1ZS5mb250IHx8IHZhbHVlLmZvbnRTaXplKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRUeXBvZ3JhcGh5KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIFNoYWRvdzogaGFzIC54LCAueSwgLnJhZGl1cywgLnNwcmVhZFxuICAgIGlmICh2YWx1ZS54ICE9PSB1bmRlZmluZWQgJiYgdmFsdWUueSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRTaGFkb3codmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICB9XG4gICAgLy8gR3JhZGllbnQ6IGhhcyAuc3RvcHNcbiAgICBpZiAodmFsdWUuc3RvcHMgJiYgQXJyYXkuaXNBcnJheSh2YWx1ZS5zdG9wcykpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdEdyYWRpZW50KHZhbHVlLCB0b2tlbkJ5SWQsIGdyb3Vwcyk7XG4gICAgfVxuICAgIC8vIEJvcmRlcjogaGFzIC5jb2xvciBhbmQgLndpZHRoXG4gICAgaWYgKHZhbHVlLmNvbG9yICYmIHZhbHVlLndpZHRoKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRCb3JkZXIodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICB9XG4gICAgLy8gUmFkaXVzOiBoYXMgLnJhZGl1cyBvciBjb3JuZXIgdmFsdWVzXG4gICAgaWYgKHZhbHVlLnJhZGl1cyB8fCB2YWx1ZS50b3BMZWZ0IHx8IHZhbHVlLnRvcFJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRSYWRpdXModmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKTtcbiAgICB9XG4gICAgLy8gRmFsbGJhY2s6IHJldHVybiBhcy1pc1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIENPTVBMRVggVkFMVUUgRk9STUFUVEVSU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gZm9ybWF0VHlwb2dyYXBoeSh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBpZiAodmFsdWUuZm9udCkge1xuICAgICAgICBpZiAodmFsdWUuZm9udC5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmZvbnQucmVmZXJlbmNlZFRva2VuSWRdO1xuICAgICAgICAgICAgcmVzdWx0LmZvbnRGYW1pbHkgPSByZWYgPyAneycgKyBidWlsZFJlZlBhdGgocmVmLCBncm91cHMpICsgJ30nIDogdmFsdWUuZm9udC5mYW1pbHk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQuZm9udEZhbWlseSA9IHZhbHVlLmZvbnQuZmFtaWx5IHx8ICcnO1xuICAgICAgICAgICAgcmVzdWx0LmZvbnRXZWlnaHQgPSB2YWx1ZS5mb250LnN1YmZhbWlseSB8fCAnUmVndWxhcic7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbHVlLmZvbnRTaXplKSB7XG4gICAgICAgIGlmICh2YWx1ZS5mb250U2l6ZS5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmZvbnRTaXplLnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIHJlc3VsdC5mb250U2l6ZSA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRNZWFzdXJlKHZhbHVlLmZvbnRTaXplKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5mb250U2l6ZSA9IGZvcm1hdE1lYXN1cmUodmFsdWUuZm9udFNpemUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh2YWx1ZS5saW5lSGVpZ2h0KSB7XG4gICAgICAgIGlmICh2YWx1ZS5saW5lSGVpZ2h0LnJlZmVyZW5jZWRUb2tlbklkKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0b2tlbkJ5SWRbdmFsdWUubGluZUhlaWdodC5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXN1bHQubGluZUhlaWdodCA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRNZWFzdXJlKHZhbHVlLmxpbmVIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmxpbmVIZWlnaHQgPSBmb3JtYXRNZWFzdXJlKHZhbHVlLmxpbmVIZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh2YWx1ZS5sZXR0ZXJTcGFjaW5nKSB7XG4gICAgICAgIHJlc3VsdC5sZXR0ZXJTcGFjaW5nID0gZm9ybWF0TWVhc3VyZSh2YWx1ZS5sZXR0ZXJTcGFjaW5nKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlLnRleHRDYXNlKVxuICAgICAgICByZXN1bHQudGV4dFRyYW5zZm9ybSA9IHZhbHVlLnRleHRDYXNlLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHZhbHVlLnRleHREZWNvcmF0aW9uKVxuICAgICAgICByZXN1bHQudGV4dERlY29yYXRpb24gPSB2YWx1ZS50ZXh0RGVjb3JhdGlvbi50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBmb3JtYXRTaGFkb3codmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICBvZmZzZXRYOiBmb3JtYXRNZWFzdXJlKHZhbHVlLngpLFxuICAgICAgICBvZmZzZXRZOiBmb3JtYXRNZWFzdXJlKHZhbHVlLnkpLFxuICAgICAgICBibHVyOiBmb3JtYXRNZWFzdXJlKHZhbHVlLnJhZGl1cyksXG4gICAgICAgIHNwcmVhZDogZm9ybWF0TWVhc3VyZSh2YWx1ZS5zcHJlYWQpLFxuICAgIH07XG4gICAgaWYgKHZhbHVlLmNvbG9yKSB7XG4gICAgICAgIGlmICh2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmNvbG9yLnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIHJlc3VsdC5jb2xvciA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRDb2xvclZhbHVlKHZhbHVlLmNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5jb2xvciA9IGZvcm1hdENvbG9yVmFsdWUodmFsdWUuY29sb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBmb3JtYXRHcmFkaWVudCh2YWx1ZSwgdG9rZW5CeUlkLCBncm91cHMpIHtcbiAgICBjb25zdCBzdG9wcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUuc3RvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc3RvcCA9IHZhbHVlLnN0b3BzW2ldO1xuICAgICAgICBzdG9wcy5wdXNoKHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBzdG9wLnBvc2l0aW9uIHx8IDAsXG4gICAgICAgICAgICBjb2xvcjogc3RvcC5jb2xvciA/IGZvcm1hdENvbG9yVmFsdWUoc3RvcC5jb2xvcikgOiAnIzAwMDAwMCcsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAodmFsdWUudHlwZSB8fCAnbGluZWFyJykudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgc3RvcHM6IHN0b3BzLFxuICAgIH07XG59XG5mdW5jdGlvbiBmb3JtYXRCb3JkZXIodmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICB3aWR0aDogZm9ybWF0TWVhc3VyZSh2YWx1ZS53aWR0aCksXG4gICAgICAgIHN0eWxlOiAnc29saWQnLFxuICAgIH07XG4gICAgaWYgKHZhbHVlLmNvbG9yKSB7XG4gICAgICAgIGlmICh2YWx1ZS5jb2xvci5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLmNvbG9yLnJlZmVyZW5jZWRUb2tlbklkXTtcbiAgICAgICAgICAgIHJlc3VsdC5jb2xvciA9IHJlZiA/ICd7JyArIGJ1aWxkUmVmUGF0aChyZWYsIGdyb3VwcykgKyAnfScgOiBmb3JtYXRDb2xvclZhbHVlKHZhbHVlLmNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5jb2xvciA9IGZvcm1hdENvbG9yVmFsdWUodmFsdWUuY29sb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBmb3JtYXRSYWRpdXModmFsdWUsIHRva2VuQnlJZCwgZ3JvdXBzKSB7XG4gICAgLy8gU2luZ2xlIHJhZGl1c1xuICAgIGlmICh2YWx1ZS5yYWRpdXMgJiYgIXZhbHVlLnRvcExlZnQpIHtcbiAgICAgICAgaWYgKHZhbHVlLnJhZGl1cy5yZWZlcmVuY2VkVG9rZW5JZCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdG9rZW5CeUlkW3ZhbHVlLnJhZGl1cy5yZWZlcmVuY2VkVG9rZW5JZF07XG4gICAgICAgICAgICByZXR1cm4gcmVmID8gJ3snICsgYnVpbGRSZWZQYXRoKHJlZiwgZ3JvdXBzKSArICd9JyA6IGZvcm1hdE1lYXN1cmUodmFsdWUucmFkaXVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm9ybWF0TWVhc3VyZSh2YWx1ZS5yYWRpdXMpO1xuICAgIH1cbiAgICAvLyBDb3JuZXIgcmFkaWlcbiAgICByZXR1cm4ge1xuICAgICAgICB0b3BMZWZ0OiBmb3JtYXRNZWFzdXJlKHZhbHVlLnRvcExlZnQpLFxuICAgICAgICB0b3BSaWdodDogZm9ybWF0TWVhc3VyZSh2YWx1ZS50b3BSaWdodCksXG4gICAgICAgIGJvdHRvbUxlZnQ6IGZvcm1hdE1lYXN1cmUodmFsdWUuYm90dG9tTGVmdCksXG4gICAgICAgIGJvdHRvbVJpZ2h0OiBmb3JtYXRNZWFzdXJlKHZhbHVlLmJvdHRvbVJpZ2h0KSxcbiAgICB9O1xufVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUFJJTUlUSVZFIEZPUk1BVFRFUlNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIGZvcm1hdE1lYXN1cmUodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKVxuICAgICAgICByZXR1cm4gJzBweCc7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpXG4gICAgICAgIHJldHVybiB2YWx1ZSArICdweCc7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICBjb25zdCBtZWFzdXJlID0gdmFsdWUubWVhc3VyZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUubWVhc3VyZSA6IDA7XG4gICAgY29uc3QgdW5pdCA9IGZvcm1hdFVuaXQodmFsdWUudW5pdCk7XG4gICAgcmV0dXJuIG1lYXN1cmUgKyB1bml0O1xufVxuZnVuY3Rpb24gZm9ybWF0Q29sb3JWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpXG4gICAgICAgIHJldHVybiAnIzAwMDAwMCc7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICBpZiAodmFsdWUuaGV4KVxuICAgICAgICByZXR1cm4gJyMnICsgdmFsdWUuaGV4O1xuICAgIGlmICh2YWx1ZS5jb2xvciAmJiB0eXBlb2YgdmFsdWUuY29sb3IuciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIHRvSGV4KHZhbHVlLmNvbG9yLnIsIHZhbHVlLmNvbG9yLmcsIHZhbHVlLmNvbG9yLmIpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlLnIgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiB0b0hleCh2YWx1ZS5yLCB2YWx1ZS5nLCB2YWx1ZS5iKTtcbiAgICB9XG4gICAgcmV0dXJuICcjMDAwMDAwJztcbn1cbmZ1bmN0aW9uIHRvSGV4KHIsIGcsIGIpIHtcbiAgICBjb25zdCByaCA9IE1hdGgucm91bmQocikudG9TdHJpbmcoMTYpO1xuICAgIGNvbnN0IGdoID0gTWF0aC5yb3VuZChnKS50b1N0cmluZygxNik7XG4gICAgY29uc3QgYmggPSBNYXRoLnJvdW5kKGIpLnRvU3RyaW5nKDE2KTtcbiAgICByZXR1cm4gJyMnICsgcGFkMihyaCkgKyBwYWQyKGdoKSArIHBhZDIoYmgpO1xufVxuZnVuY3Rpb24gcGFkMihzKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoID09PSAxID8gJzAnICsgcyA6IHM7XG59XG5mdW5jdGlvbiBmb3JtYXRVbml0KHVuaXQpIHtcbiAgICBpZiAoIXVuaXQpXG4gICAgICAgIHJldHVybiAncHgnO1xuICAgIGNvbnN0IHUgPSBTdHJpbmcodW5pdCkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodSA9PT0gJ3BpeGVscycgfHwgdSA9PT0gJ3B4JylcbiAgICAgICAgcmV0dXJuICdweCc7XG4gICAgaWYgKHUgPT09ICdwZXJjZW50JyB8fCB1ID09PSAnJScpXG4gICAgICAgIHJldHVybiAnJSc7XG4gICAgaWYgKHUgPT09ICdlbXMnIHx8IHUgPT09ICdlbScpXG4gICAgICAgIHJldHVybiAnZW0nO1xuICAgIGlmICh1ID09PSAncG9pbnRzJyB8fCB1ID09PSAncHQnKVxuICAgICAgICByZXR1cm4gJ3B0JztcbiAgICBpZiAodSA9PT0gJ3JhdycpXG4gICAgICAgIHJldHVybiAnJztcbiAgICByZXR1cm4gdTtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFJFRkVSRU5DRSBQQVRIIEJVSUxESU5HXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mdW5jdGlvbiBidWlsZFJlZlBhdGgodG9rZW4sIGdyb3Vwcykge1xuICAgIGNvbnN0IGdyb3VwID0gZmluZEdyb3VwRm9yVG9rZW4odG9rZW4sIGdyb3Vwcyk7XG4gICAgY29uc3QgZ3JvdXBQYXRoID0gZ3JvdXAgPyBncm91cC5wYXRoIDogW107XG4gICAgY29uc3QgZ3JvdXBOYW1lID0gZ3JvdXAgPyBncm91cC5uYW1lIDogJyc7XG4gICAgLy8gQnVpbGQgZnVsbCBncm91cCBwYXRoOiBncm91cC5wYXRoICsgZ3JvdXAubmFtZVxuICAgIGNvbnN0IGZ1bGxHcm91cFBhdGggPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdyb3VwUGF0aC5sZW5ndGg7IGkrKykge1xuICAgICAgICBmdWxsR3JvdXBQYXRoLnB1c2goZ3JvdXBQYXRoW2ldKTtcbiAgICB9XG4gICAgaWYgKGdyb3VwTmFtZSAmJiAhKGdyb3VwID09PSBudWxsIHx8IGdyb3VwID09PSB2b2lkIDAgPyB2b2lkIDAgOiBncm91cC5pc1Jvb3QpKSB7XG4gICAgICAgIGZ1bGxHcm91cFBhdGgucHVzaChncm91cE5hbWUpO1xuICAgIH1cbiAgICAvLyBCdWlsZCBwYXRoOiBza2lwIHBsYXRmb3JtIChpbmRleCAwKSwgaW5jbHVkZSBldmVyeXRoaW5nIGVsc2UgKyB0b2tlbiBuYW1lXG4gICAgLy8gUmVzdWx0OiBcImJvcmRlci1yYWRpdXMuMVwiIG9yIFwic2VtYW50aWMuY29sb3IucHJpbWFyeVwiXG4gICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IGZ1bGxHcm91cFBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFydHMucHVzaChzYWZlTmFtZShmdWxsR3JvdXBQYXRoW2ldKSk7XG4gICAgfVxuICAgIHBhcnRzLnB1c2goc2FmZU5hbWUodG9rZW4ubmFtZSkpO1xuICAgIHJldHVybiBwYXJ0cy5qb2luKCcuJyk7XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBUWVBFIE1BUFBJTkdcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZ1bmN0aW9uIG1hcFR5cGUodG9rZW5UeXBlKSB7XG4gICAgY29uc3QgdCA9IFN0cmluZyh0b2tlblR5cGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHQgPT09ICdjb2xvcicpXG4gICAgICAgIHJldHVybiAnY29sb3InO1xuICAgIGlmICh0ID09PSAnZGltZW5zaW9uJyB8fCB0ID09PSAnbWVhc3VyZScpXG4gICAgICAgIHJldHVybiAnZGltZW5zaW9uJztcbiAgICBpZiAodCA9PT0gJ3R5cG9ncmFwaHknKVxuICAgICAgICByZXR1cm4gJ3R5cG9ncmFwaHknO1xuICAgIGlmICh0ID09PSAnc2hhZG93JylcbiAgICAgICAgcmV0dXJuICdzaGFkb3cnO1xuICAgIGlmICh0ID09PSAnYm9yZGVyJylcbiAgICAgICAgcmV0dXJuICdib3JkZXInO1xuICAgIGlmICh0ID09PSAncmFkaXVzJylcbiAgICAgICAgcmV0dXJuICdib3JkZXJSYWRpdXMnO1xuICAgIGlmICh0ID09PSAnZ3JhZGllbnQnKVxuICAgICAgICByZXR1cm4gJ2dyYWRpZW50JztcbiAgICBpZiAodCA9PT0gJ2ZvbnQnKVxuICAgICAgICByZXR1cm4gJ2ZvbnRGYW1pbHknO1xuICAgIGlmICh0ID09PSAndGV4dCcgfHwgdCA9PT0gJ3N0cmluZycpXG4gICAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICByZXR1cm4gdDtcbn1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFVUSUxJVElFU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gc2FmZU5hbWUobmFtZSkge1xuICAgIHJldHVybiBTdHJpbmcobmFtZSB8fCAnJykucmVwbGFjZSgvXFxXKy9nLCAnLScpLnRvTG93ZXJDYXNlKCk7XG59XG5mdW5jdGlvbiBmaW5kR3JvdXBGb3JUb2tlbih0b2tlbiwgZ3JvdXBzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZyA9IGdyb3Vwc1tpXTtcbiAgICAgICAgaWYgKGcudG9rZW5JZHMgJiYgZy50b2tlbklkcy5pbmRleE9mKHRva2VuLmlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gZmluZFRoZW1lQnlJZChhcnIsIGlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFycltpXS5pZCA9PT0gaWQpXG4gICAgICAgICAgICByZXR1cm4gYXJyW2ldO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIHRvQXJyYXkoaW5wdXQpIHtcbiAgICBpZiAoIWlucHV0KVxuICAgICAgICByZXR1cm4gW107XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKVxuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGlucHV0Lmxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGlucHV0W2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBGSUxFIE9VVFBVVFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnVuY3Rpb24gY3JlYXRlRmlsZShmaWxlUGF0aCwgY29udGVudCkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBmaWxlUGF0aC5yZXBsYWNlKC9eXFwvKy8sICcnKTtcbiAgICBjb25zdCBwYXJ0cyA9IG5vcm1hbGl6ZWQuc3BsaXQoJy8nKTtcbiAgICBjb25zdCBmaWxlTmFtZSA9IHBhcnRzLnBvcCgpIHx8ICdvdXRwdXQuanNvbic7XG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGFydHMuam9pbignLycpO1xuICAgIGNvbnN0IGpzb25Db250ZW50ID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCwgbnVsbCwgMik7XG4gICAgLy8gVHJ5IEZpbGVIZWxwZXIgZmlyc3QsIGZhbGxiYWNrIHRvIHBsYWluIG9iamVjdFxuICAgIGlmICh0eXBlb2YgRmlsZUhlbHBlciAhPT0gJ3VuZGVmaW5lZCcgJiYgRmlsZUhlbHBlci5jcmVhdGVUZXh0RmlsZSkge1xuICAgICAgICByZXR1cm4gRmlsZUhlbHBlci5jcmVhdGVUZXh0RmlsZSh7IHJlbGF0aXZlUGF0aCwgZmlsZU5hbWUsIGNvbnRlbnQ6IGpzb25Db250ZW50IH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBwYXRoOiByZWxhdGl2ZVBhdGgubGVuZ3RoID4gMCA/IHJlbGF0aXZlUGF0aCA6ICcuJyxcbiAgICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgY29udGVudDoganNvbkNvbnRlbnQsXG4gICAgfTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=