// Simple Token Exporter - Clean Implementation
// Uses group.path for token location, tokenById map for references

// ============================================================================
// MAIN EXPORT
// ============================================================================

Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  const remote: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // 1. Fetch all data
  const baseTokens: Array<Token> = toArray<Token>(await sdk.tokens.getTokens(remote))
  const groups: Array<TokenGroup> = toArray<TokenGroup>(await sdk.tokens.getTokenGroups(remote))
  const themes: Array<TokenTheme> = toArray<TokenTheme>(await sdk.tokens.getTokenThemes(remote))

  // 2. Build base token lookup map (for core tokens - they don't change with themes)
  const baseTokenById: Record<string, Token> = {}
  for (let i = 0; i < baseTokens.length; i++) {
    baseTokenById[baseTokens[i].id] = baseTokens[i]
  }

  // 3. Group base tokens by collection
  const baseGrouped = groupByPlatform(baseTokens, groups)

  // 4. Build output files
  const outputs: Array<AnyOutputFile> = []
  
  // Debug: show collection detection results
  const debugCollections: any = {
    counts: {
      core: baseGrouped.core.length,
      web: baseGrouped.web.length,
      mobile: baseGrouped.mobile.length,
      unknown: baseGrouped.unknown.length,
    },
    allCollectionValues: {} as Record<string, number>,
    unknownTokenDetails: [],
    sampleTokens: [],
    shadowTokens: [],
  }
  
  // Count all unique collection values
  for (let i = 0; i < baseTokens.length; i++) {
    const col = getTokenCollection(baseTokens[i])
    debugCollections.allCollectionValues[col] = (debugCollections.allCollectionValues[col] || 0) + 1
  }
  
  // Show details of unknown tokens (what collection do they have?)
  for (let i = 0; i < Math.min(baseGrouped.unknown.length, 10); i++) {
    const t = baseGrouped.unknown[i]
    const props = (t as any).properties || []
    const propValues = (t as any).propertyValues || {}
    const group = findGroupForToken(t, groups)
    
    // Find collection property info
    let collectionPropInfo: any = null
    for (let j = 0; j < props.length; j++) {
      const p = props[j]
      if ((p.name || '').toLowerCase() === 'collection' || (p.codeName || '').toLowerCase() === 'collection') {
        collectionPropInfo = {
          name: p.name,
          codeName: p.codeName,
          id: p.id,
          options: (p.options || []).map((o: any) => ({ id: o.id, name: o.name })),
        }
        break
      }
    }
    
    debugCollections.unknownTokenDetails.push({
      name: t.name,
      groupPath: group ? group.path : null,
      hasCollectionProp: !!collectionPropInfo,
      collectionPropInfo: collectionPropInfo,
      propertyValueKeys: Object.keys(propValues),
      rawPropertyValues: JSON.stringify(propValues).substring(0, 300),
    })
  }
  
  // Sample a few tokens from each group
  const allSamples = [...baseGrouped.core.slice(0, 2), ...baseGrouped.web.slice(0, 2), ...baseGrouped.mobile.slice(0, 2)]
  for (let i = 0; i < allSamples.length; i++) {
    const t = allSamples[i]
    const group = findGroupForToken(t, groups)
    debugCollections.sampleTokens.push({
      name: t.name,
      collection: getTokenCollection(t),
      groupPath: group ? group.path : null,
      groupName: group ? group.name : null,
    })
  }
  
  // Find and capture shadow tokens, especially secondary button box-shadow
  for (let i = 0; i < baseTokens.length; i++) {
    const t = baseTokens[i]
    if (t.tokenType === 'Shadow' && (t as any).isVirtual !== true) {
      const group = findGroupForToken(t, groups)
      const value = (t as any).value
      
      // Look for secondary button shadow or capture first few shadows
      const isSecondaryButton = t.name.toLowerCase().includes('secondary') || 
                                (group && group.path.join('/').toLowerCase().includes('secondary'))
      const isBoxShadow = t.name.toLowerCase().includes('box-shadow') ||
                         t.name.toLowerCase().includes('box') ||
                         (group && group.name.toLowerCase().includes('button'))
      
      if (isSecondaryButton || isBoxShadow || debugCollections.shadowTokens.length < 3) {
        debugCollections.shadowTokens.push({
          name: t.name,
          tokenType: t.tokenType,
          groupPath: group ? group.path : null,
          groupName: group ? group.name : null,
          fullPath: group ? [...group.path, group.name, t.name].join('.') : t.name,
          valueStructure: JSON.parse(JSON.stringify(value)), // Deep clone
        })
      }
    }
  }
  
  outputs.push(createFile('_debug_collections.json', debugCollections))

  // Core tokens (always exported once, shared across all themes)
  if (baseGrouped.core.length > 0) {
    const tree = buildTree(baseGrouped.core, groups, baseTokenById, 0)  // 0 = use full path
    outputs.push(createFile('core/core.json', tree))
  }

  // 4. Export ALL themes
  for (let t = 0; t < themes.length; t++) {
    const theme = themes[t]
    const themeName = theme.name  // e.g., "customer/light" or "patient/dark"
    
    // Build themed tokens by merging overriddenTokens with base tokens
    // The theme.overriddenTokens contains the actual themed values
    const overriddenTokens: Array<Token> = toArray<Token>((theme as any).overriddenTokens || [])
    
    // Create a map of overridden tokens by ID
    const overriddenById: Record<string, Token> = {}
    for (let i = 0; i < overriddenTokens.length; i++) {
      overriddenById[overriddenTokens[i].id] = overriddenTokens[i]
    }
    
    // Merge: use overridden token if exists, otherwise use base token
    const themedTokens: Array<Token> = []
    for (let i = 0; i < baseTokens.length; i++) {
      const baseToken = baseTokens[i]
      const overridden = overriddenById[baseToken.id]
      themedTokens.push(overridden || baseToken)
    }
    
    // Build token lookup for this theme
    const tokenById: Record<string, Token> = {}
    for (let i = 0; i < themedTokens.length; i++) {
      tokenById[themedTokens[i].id] = themedTokens[i]
    }
    
    // Group themed tokens by platform
    const grouped = groupByPlatform(themedTokens, groups)
    
    // Export platform-specific tokens for this theme
    const platforms = ['web', 'mobile']
    for (let p = 0; p < platforms.length; p++) {
      const platform = platforms[p]
      const platformTokens = (grouped as any)[platform] || []
      if (platformTokens.length > 0) {
        const tree = buildTree(platformTokens, groups, tokenById, 0)  // 0 = use full path
        outputs.push(createFile(platform + '/' + themeName + '.json', tree))
      }
    }
  }

  return outputs
})

// ============================================================================
// GROUPING (by Collection property)
// ============================================================================

function getTokenCollection(token: Token): string {
  const properties = (token as any).properties || []
  const propertyValues = (token as any).propertyValues || {}
  
  // Find the Collection property definition
  let collectionProp: any = null
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i]
    const name = (prop.name || '').toLowerCase()
    const codeName = (prop.codeName || '').toLowerCase()
    if (name === 'collection' || codeName === 'collection') {
      collectionProp = prop
      break
    }
  }
  
  if (!collectionProp) return 'unknown'
  
  // Get the value - could be keyed by id or codeName
  let rawValue = propertyValues[collectionProp.id] || propertyValues[collectionProp.codeName] || propertyValues['collection']
  if (!rawValue) return 'unknown'
  
  // If it's an object with id, resolve from options
  const valueId = typeof rawValue === 'string' ? rawValue : (rawValue.id || rawValue.value)
  
  // Find matching option
  const options = collectionProp.options || []
  for (let i = 0; i < options.length; i++) {
    const opt = options[i]
    if (opt.id === valueId || opt.value === valueId || opt.name === valueId) {
      return (opt.name || opt.value || opt.id || 'unknown').toLowerCase()
    }
  }
  
  // Fallback: return the value itself if it's a string
  if (typeof valueId === 'string') {
    return valueId.toLowerCase()
  }
  
  return 'unknown'
}

function groupByPlatform(
  tokens: Array<Token>,
  groups: Array<TokenGroup>
): { core: Array<Token>; web: Array<Token>; mobile: Array<Token>; unknown: Array<Token> } {
  const result: { core: Array<Token>; web: Array<Token>; mobile: Array<Token>; unknown: Array<Token> } = {
    core: [],
    web: [],
    mobile: [],
    unknown: [],
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const collection = getTokenCollection(token)

    if (collection === 'core') {
      result.core.push(token)
    } else if (collection === 'web') {
      result.web.push(token)
    } else if (collection === 'mobile') {
      result.mobile.push(token)
    } else {
      result.unknown.push(token)
    }
  }

  return result
}

// ============================================================================
// TREE BUILDING
// ============================================================================

function buildTree(
  tokens: Array<Token>,
  groups: Array<TokenGroup>,
  tokenById: Record<string, Token>,
  skipLevels: number
): any {
  const tree: any = {}

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    
    // Skip virtual shadow tokens
    if ((token as any).isVirtual === true && token.tokenType === 'Shadow') {
      continue
    }
    
    // Skip tokens with underscore in name (internal/private tokens)
    if (token.name.indexOf('_') !==-1) {
      continue
    }

    const group = findGroupForToken(token, groups)
    
    // Skip tokens in groups with underscore in name or path
    if (group) {
      // Check group name
      if (group.name.indexOf('_') !== -1) {
        continue
      }
      // Check group path
      let hasUnderscoreInPath = false
      for (let p = 0; p < group.path.length; p++) {
        if (group.path[p].indexOf('_') !== -1) {
          hasUnderscoreInPath = true
          break
        }
      }
      if (hasUnderscoreInPath) {
        continue
      }
    }
    
    // Build full group path: group.path + group.name
    // e.g., path=["core"], name="border-radius" -> ["core", "border-radius"]
    const groupPath = group ? group.path : []
    const groupName = group ? group.name : ''
    const fullGroupPath: Array<string> = []
    for (let j = 0; j < groupPath.length; j++) {
      fullGroupPath.push(groupPath[j])
    }
    if (groupName && !group?.isRoot) {
      fullGroupPath.push(groupName)
    }
    
    // Build the nested path: skip platform (and optionally more levels)
    const pathParts = fullGroupPath.slice(skipLevels)
    const fullPath: Array<string> = []
    for (let j = 0; j < pathParts.length; j++) {
      fullPath.push(safeName(pathParts[j]))
    }
    fullPath.push(safeName(token.name))

    if (fullPath.length === 0) continue

    // Format and set the token value
    const formatted = formatToken(token, tokenById, groups)
    setNested(tree, fullPath, formatted)
  }

  return tree
}

function setNested(obj: any, path: Array<string>, value: any): void {
  let current = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  current[path[path.length - 1]] = value
}

// ============================================================================
// TOKEN FORMATTING (DTCG)
// ============================================================================

function formatToken(
  token: Token,
  tokenById: Record<string, Token>,
  groups: Array<TokenGroup>
): any {
  const value = (token as any).value
  
  // Check for font-weight token (Figma imports these incorrectly as dimensions)
  const isFontWeight = isFontWeightToken(token, groups)
  
  // Check for line-height token (Figma imports these incorrectly as dimensions)
  const isLineHeight = isLineHeightToken(token, groups)
  
  // Check for top-level reference FIRST
  if (value && value.referencedTokenId) {
    const refToken = tokenById[value.referencedTokenId]
    if (refToken) {
      return {
        $value: '{' + buildRefPath(refToken, groups) + '}',
        $type: isFontWeight ? 'fontWeight' : isLineHeight ? 'number' : mapType(token.tokenType),
      }
    }
  }

  // Format raw value - handle font-weight and line-height specially
  const formatted = isFontWeight 
    ? formatFontWeightValue(value)
    : isLineHeight
    ? formatLineHeightValue(value)
    : formatValue(value, token.tokenType, tokenById, groups)
  
  const result: any = {
    $value: formatted,
    $type: isFontWeight ? 'fontWeight' : isLineHeight ? 'number' : mapType(token.tokenType),
  }

  if (token.description && token.description.length > 0) {
    result.$description = token.description
  }

  return result
}

function formatValue(
  value: any,
  tokenType: string,
  tokenById: Record<string, Token>,
  groups: Array<TokenGroup>
): any {
  if (!value) return null

  // Color: check for nested .color object or direct r/g/b
  if (value.color && typeof value.color.r === 'number') {
    // Check if color itself is a reference
    if (value.color.referencedTokenId) {
      const ref = tokenById[value.color.referencedTokenId]
      if (ref) return '{' + buildRefPath(ref, groups) + '}'
    }
    // Use formatColorValue to handle alpha properly
    return formatColorValue(value)
  }
  if (typeof value.r === 'number' && typeof value.g === 'number') {
    // Direct r/g/b (check for alpha too)
    const alpha = typeof value.a === 'number' ? value.a : 1
    if (alpha < 1) {
      return toHexWithAlpha(value.r, value.g, value.b, alpha)
    }
    return toHex(value.r, value.g, value.b)
  }
  if (value.hex) {
    return '#' + value.hex
  }

  // Dimension/Measure: has .measure and .unit
  if (typeof value.measure === 'number') {
    return {
      value: value.measure,
      unit: formatUnit(value.unit)
    }
  }

  // Text/String: has .text
  if (typeof value.text === 'string') {
    return value.text
  }

  // Font: has .family (legacy combined font+weight token)
  // Maps to custom 'font' type to preserve both family and weight
  if (typeof value.family === 'string') {
    return {
      family: value.family,
      weight: value.subfamily || value.weight || 'Regular',
    }
  }

  // Typography: has .font and .fontSize
  if (value.font || value.fontSize) {
    return formatTypography(value, tokenById, groups)
  }

  // Shadow: Supernova provides array with shadow object(s)
  if (Array.isArray(value) && value.length > 0 && value[0].x !== undefined && value[0].y !== undefined) {
    return formatShadowArray(value, tokenById, groups)
  }

  // Gradient: Supernova provides array with gradient object(s)
  if (Array.isArray(value) && value.length > 0 && value[0].stops) {
    return formatGradient(value[0], tokenById, groups)
  }

  // Border: has .color and .width
  if (value.color && value.width) {
    return formatBorder(value, tokenById, groups)
  }

  // Radius: has .radius or corner values
  if (value.radius || value.topLeft || value.topRight) {
    return formatRadius(value, tokenById, groups)
  }

  // Fallback: return as-is
  return value
}

function formatFontWeightValue(value: any): number {
  // Extract numeric value from dimension object
  if (value && typeof value === 'object') {
    const measure = value.measure ?? value.value
    if (typeof measure === 'number') {
      return measure  // Return plain number, no unit
    }
  }
  
  // Fallback to direct number
  if (typeof value === 'number') {
    return value
  }
  
  // Default fallback
  return 400
}

function formatLineHeightValue(value: any): number {
  // Extract numeric value from dimension object
  if (value && typeof value === 'object') {
    const measure = value.measure ?? value.value
    if (typeof measure === 'number') {
      return measure  // Return plain number, no unit (e.g., 1.15, not "1.15px")
    }
  }
  
  // Fallback to direct number
  if (typeof value === 'number') {
    return value
  }
  
  // Default fallback (normal line-height)
  return 1.5
}

// ============================================================================
// COMPLEX VALUE FORMATTERS
// ============================================================================

function formatTypography(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  const result: any = {}

  if (value.font) {
    if (value.font.referencedTokenId) {
      const ref = tokenById[value.font.referencedTokenId]
      result.fontFamily = ref ? '{' + buildRefPath(ref, groups) + '}' : value.font.family
    } else {
      result.fontFamily = value.font.family || ''
      result.fontWeight = value.font.subfamily || 'Regular'
    }
  }

  if (value.fontSize) {
    if (value.fontSize.referencedTokenId) {
      const ref = tokenById[value.fontSize.referencedTokenId]
      result.fontSize = ref ? '{' + buildRefPath(ref, groups) + '}' : formatMeasure(value.fontSize)
    } else {
      result.fontSize = formatMeasure(value.fontSize)
    }
  }

  if (value.lineHeight) {
    if (value.lineHeight.referencedTokenId) {
      const ref = tokenById[value.lineHeight.referencedTokenId]
      result.lineHeight = ref ? '{' + buildRefPath(ref, groups) + '}' : formatMeasure(value.lineHeight)
    } else {
      result.lineHeight = formatMeasure(value.lineHeight)
    }
  }

  if (value.letterSpacing) {
    result.letterSpacing = formatMeasure(value.letterSpacing)
  }

  if (value.textCase) result.textTransform = value.textCase.toLowerCase()
  if (value.textDecoration) result.textDecoration = value.textDecoration.toLowerCase()

  return result
}

function formatShadow(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  const result: any = {
    offsetX: formatMeasure(value.x),
    offsetY: formatMeasure(value.y),
    blur: formatMeasure(value.radius),
    spread: formatMeasure(value.spread),
  }

  // Get alpha from shadow's opacity property (Supernova stores opacity at shadow level, not color level)
  // Reference: https://developers.supernova.io/latest/sdk-reference/data-model/tokens/token-values-Hnb3ieu5#section-shadowtokenvalue-65
  let alpha = 1
  if (value.opacity && typeof value.opacity.measure === 'number') {
    alpha = value.opacity.measure
  } else if (typeof value.opacity === 'number') {
    alpha = value.opacity
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

function formatShadowArray(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  const shadows: Array<any> = []
  
  for (let i = 0; i < value.length; i++) {
    const shadow = value[i]
    shadows.push(formatShadow(shadow, tokenById, groups))
  }
  
  // Return array directly (DTCG supports both single object and arrays)
  return shadows
}

function formatGradient(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  const stops: Array<any> = []
  
  for (let i = 0; i < value.stops.length; i++) {
    const stop = value.stops[i]
    
    // Extract color from nested structure (Supernova has color.color)
    let colorValue = stop.color
    if (colorValue && colorValue.color) {
      colorValue = colorValue.color  // Unwrap nested color
    }
    
    // Check for color reference
    let formattedColor
    if (colorValue && colorValue.referencedTokenId) {
      const ref = tokenById[colorValue.referencedTokenId]
      formattedColor = ref ? '{' + buildRefPath(ref, groups) + '}' : null
    }
    
    // Format color to full DTCG color object (not hex string)
    if (!formattedColor && colorValue) {
      const r = colorValue.r || 0
      const g = colorValue.g || 0
      const b = colorValue.b || 0
      
      // Get alpha from opacity if present
      let alpha = 1
      if (stop.color && stop.color.opacity && typeof stop.color.opacity.measure === 'number') {
        alpha = stop.color.opacity.measure
      }
      
      // DTCG requires RGB in 0-1 range, Supernova provides 0-255
      formattedColor = {
        colorSpace: 'srgb',
        components: [r / 255, g / 255, b / 255],
        alpha: alpha
      }
    }
    
    stops.push({
      color: formattedColor || { colorSpace: 'srgb', components: [0, 0, 0] },
      position: stop.position || 0
    })
  }
  
  // Return array directly (DTCG compliant) - not wrapped in object
  return stops
}

function formatBorder(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  const result: any = {
    width: formatMeasure(value.width),
    style: 'solid',
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

function formatRadius(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  // Single radius
  if (value.radius && !value.topLeft) {
    if (value.radius.referencedTokenId) {
      const ref = tokenById[value.radius.referencedTokenId]
      return ref ? '{' + buildRefPath(ref, groups) + '}' : formatMeasure(value.radius)
    }
    return formatMeasure(value.radius)
  }

  // Corner radii
  return {
    topLeft: formatMeasure(value.topLeft),
    topRight: formatMeasure(value.topRight),
    bottomLeft: formatMeasure(value.bottomLeft),
    bottomRight: formatMeasure(value.bottomRight),
  }
}

// ============================================================================
// PRIMITIVE FORMATTERS
// ============================================================================

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

function formatColorValue(value: any): string {
  if (!value) return '#000000'
  if (typeof value === 'string') return value
  if (value.hex) return '#' + value.hex
  
  // Get RGB values
  let r = 0, g = 0, b = 0
  if (value.color && typeof value.color.r === 'number') {
    r = value.color.r
    g = value.color.g
    b = value.color.b
  } else if (typeof value.r === 'number') {
    r = value.r
    g = value.g
    b = value.b
  }
  
  // Get alpha/opacity (0-1)
  let alpha = 1
  if (value.opacity && typeof value.opacity.measure === 'number') {
    alpha = value.opacity.measure
  } else if (typeof value.a === 'number') {
    alpha = value.a
  } else if (typeof value.alpha === 'number') {
    alpha = value.alpha
  }
  
  // Output with alpha if not fully opaque
  if (alpha < 1) {
    return toHexWithAlpha(r, g, b, alpha)
  }
  return toHex(r, g, b)
}

function toHex(r: number, g: number, b: number): string {
  const rh = Math.round(r).toString(16)
  const gh = Math.round(g).toString(16)
  const bh = Math.round(b).toString(16)
  return '#' + pad2(rh) + pad2(gh) + pad2(bh)
}

function toHexWithAlpha(r: number, g: number, b: number, a: number): string {
  const rh = Math.round(r).toString(16)
  const gh = Math.round(g).toString(16)
  const bh = Math.round(b).toString(16)
  const ah = Math.round(a * 255).toString(16)
  return '#' + pad2(rh) + pad2(gh) + pad2(bh) + pad2(ah)
}

function pad2(s: string): string {
  return s.length === 1 ? '0' + s : s
}

function formatUnit(unit: any): string {
  if (!unit) return 'px'
  const u = String(unit).toLowerCase()
  if (u === 'pixels' || u === 'px') return 'px'
  if (u === 'percent' || u === '%') return '%'
  if (u === 'ems' || u === 'em') return 'em'
  if (u === 'points' || u === 'pt') return 'pt'
  if (u === 'raw') return ''
  return u
}

// ============================================================================
// REFERENCE PATH BUILDING
// ============================================================================

function buildRefPath(token: Token, groups: Array<TokenGroup>): string {
  const group = findGroupForToken(token, groups)
  const groupPath = group ? group.path : []
  const groupName = group ? group.name : ''
  
  // Build full group path: group.path + group.name
  const fullGroupPath: Array<string> = []
  for (let i = 0; i < groupPath.length; i++) {
    fullGroupPath.push(groupPath[i])
  }
  if (groupName && !group?.isRoot) {
    fullGroupPath.push(groupName)
  }
  
  // Build path: use full path (collection handles platform routing)
  // Result: "color.500" or "semantic.color.primary"
  const parts: Array<string> = []
  for (let i = 0; i < fullGroupPath.length; i++) {
    parts.push(safeName(fullGroupPath[i]))
  }
  parts.push(safeName(token.name))
  
  return parts.join('.')
}

// ============================================================================
// TYPE MAPPING
// ============================================================================

function mapType(tokenType: string): string {
  const t = String(tokenType).toLowerCase()
  
  // DTCG standard types
  if (t === 'color') return 'color'
  if (t === 'typography') return 'typography'
  if (t === 'fontfamily') return 'fontFamily'
  if (t === 'fontweight') return 'fontWeight'
  if (t === 'shadow') return 'shadow'
  if (t === 'border') return 'border'
  if (t === 'gradient') return 'gradient'
  if (t === 'duration') return 'duration'
  
  // All dimension-like types → DTCG dimension
  if (t === 'dimension' || t === 'measure') return 'dimension'
  if (t === 'size') return 'dimension'
  if (t === 'space') return 'dimension'
  if (t === 'fontsize') return 'dimension'
  if (t === 'lineheight') return 'dimension'
  if (t === 'letterspacing') return 'dimension'
  if (t === 'paragraphspacing') return 'dimension'
  if (t === 'borderwidth') return 'dimension'
  if (t === 'radius') return 'dimension'
  if (t === 'borderradius') return 'dimension'
  if (t === 'blur') return 'dimension'
  
  // Numeric types → DTCG number
  if (t === 'opacity') return 'number'
  if (t === 'zindex') return 'number'
  
  // String types → DTCG string
  if (t === 'string' || t === 'text') return 'string'
  if (t === 'productcopy') return 'string'
  if (t === 'textcase') return 'string'
  if (t === 'textdecoration') return 'string'
  if (t === 'visibility') return 'string'
 
  // Legacy: 'Font' (combined family+weight) → custom type to preserve data
  if (t === 'font') return 'font'
  
  // Fallback: return as-is (allows custom types to pass through)
  return t
}

// ============================================================================
// UTILITIES
// ============================================================================

function safeName(name: string): string {
  return String(name || '').replace(/\W+/g, '-').toLowerCase()
}

function findGroupForToken(token: Token, groups: Array<TokenGroup>): TokenGroup | null {
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]
    if (g.tokenIds && g.tokenIds.indexOf(token.id) !== -1) {
      return g
    }
  }
  return null
}

function isFontWeightToken(token: Token, groups: Array<TokenGroup>): boolean {
  // Only check dimension-type tokens (performance optimization)
  const type = String(token.tokenType).toLowerCase()
  if (type !== 'dimension' && type !== 'measure') {
    return false
  }
  
  // Check group path for 'font-weight'
  const group = findGroupForToken(token, groups)
  const fullPath = group ? [...group.path, group.name].join('.').toLowerCase() : ''
  const tokenName = token.name.toLowerCase()
  
  const hasFontWeightInPath = fullPath.includes('font-weight') || 
                               fullPath.includes('fontweight')
  const hasFontWeightInName = tokenName.includes('font-weight') || 
                               tokenName.includes('fontweight')
  
  // Must have font-weight in path or name
  if (!hasFontWeightInPath && !hasFontWeightInName) {
    return false
  }
  
  // Validate value is in valid font-weight range (100-900)
  const value = (token as any).value
  const measure = value?.measure ?? value?.value
  if (typeof measure === 'number' && measure >= 100 && measure <= 900) {
    return true
  }
  
  return false
}

function isLineHeightToken(token: Token, groups: Array<TokenGroup>): boolean {
  // Check dimension-type tokens AND LineHeight type
  const type = String(token.tokenType).toLowerCase()
  if (type !== 'dimension' && type !== 'measure' && type !== 'lineheight') {
    return false
  }
  
  // Check group path for 'line-height'
  const group = findGroupForToken(token, groups)
  const fullPath = group ? [...group.path, group.name].join('.').toLowerCase() : ''
  const tokenName = token.name.toLowerCase()
  
  const hasLineHeightInPath = fullPath.includes('line-height') || 
                               fullPath.includes('lineheight')
  const hasLineHeightInName = tokenName.includes('line-height') || 
                               tokenName.includes('lineheight')
  
  // Must have line-height in path or name
  if (!hasLineHeightInPath && !hasLineHeightInName) {
    return false
  }
  
  // Validate value is in valid line-height range (typically 0-3)
  const value = (token as any).value
  const measure = value?.measure ?? value?.value
  if (typeof measure === 'number' && measure >= 0 && measure <= 10) {
    return true
  }
  
  return false
}

function findThemeById(arr: Array<TokenTheme>, id: string): TokenTheme | null {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) return arr[i]
  }
  return null
}

function toArray<T>(input: any): Array<T> {
  if (!input) return []
  if (Array.isArray(input)) return input
  if (typeof input === 'object' && typeof input.length === 'number') {
    const arr: Array<T> = []
    for (let i = 0; i < input.length; i++) {
      arr.push(input[i])
    }
    return arr
  }
  return []
}

// ============================================================================
// FILE OUTPUT
// ============================================================================

function createFile(filePath: string, content: any): AnyOutputFile {
  const normalized = filePath.replace(/^\/+/, '')
  const parts = normalized.split('/')
  const fileName = parts.pop() || 'output.json'
  const relativePath = parts.join('/')

  const jsonContent = JSON.stringify(content, null, 2)

  // Try FileHelper first, fallback to plain object
  if (typeof FileHelper !== 'undefined' && FileHelper.createTextFile) {
    return FileHelper.createTextFile({ relativePath, fileName, content: jsonContent })
  }

  return {
    path: relativePath.length > 0 ? relativePath : '.',
    name: fileName,
    type: 'text',
    content: jsonContent,
  } as any
}
