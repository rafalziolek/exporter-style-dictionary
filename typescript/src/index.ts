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

  // 3. Group base tokens by platform (core tokens are theme-independent)
  const baseGrouped = groupByPlatform(baseTokens, groups)

  // 4. Build output files
  const outputs: Array<AnyOutputFile> = []

  // Core tokens (always exported once, shared across all themes)
  if (baseGrouped.core.length > 0) {
    const tree = buildTree(baseGrouped.core, groups, baseTokenById, 1)
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
        const tree = buildTree(platformTokens, groups, tokenById, 1)
        outputs.push(createFile(platform + '/' + themeName + '.json', tree))
      }
    }
  }

  return outputs
})

// ============================================================================
// GROUPING
// ============================================================================

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
    const group = findGroupForToken(token, groups)
    const path = group ? group.path : []
    const platform = path.length > 0 ? path[0].toLowerCase() : 'unknown'

    if (platform === 'core') {
      result.core.push(token)
    } else if (platform === 'web') {
      result.web.push(token)
    } else if (platform === 'mobile') {
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

    const group = findGroupForToken(token, groups)
    
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

  // Check for top-level reference FIRST
  if (value && value.referencedTokenId) {
    const refToken = tokenById[value.referencedTokenId]
    if (refToken) {
      return {
        $value: '{' + buildRefPath(refToken, groups) + '}',
        $type: mapType(token.tokenType),
      }
    }
  }

  // Format raw value
  const formatted = formatValue(value, token.tokenType, tokenById, groups)
  
  const result: any = {
    $value: formatted,
    $type: mapType(token.tokenType),
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
    return toHex(value.color.r, value.color.g, value.color.b)
  }
  if (typeof value.r === 'number' && typeof value.g === 'number') {
    return toHex(value.r, value.g, value.b)
  }
  if (value.hex) {
    return '#' + value.hex
  }

  // Dimension/Measure: has .measure and .unit
  if (typeof value.measure === 'number') {
    return value.measure + formatUnit(value.unit)
  }

  // Text/String: has .text
  if (typeof value.text === 'string') {
    return value.text
  }

  // Font: has .family
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

  // Shadow: has .x, .y, .radius, .spread
  if (value.x !== undefined && value.y !== undefined) {
    return formatShadow(value, tokenById, groups)
  }

  // Gradient: has .stops
  if (value.stops && Array.isArray(value.stops)) {
    return formatGradient(value, tokenById, groups)
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

function formatGradient(value: any, tokenById: Record<string, Token>, groups: Array<TokenGroup>): any {
  const stops: Array<any> = []
  for (let i = 0; i < value.stops.length; i++) {
    const stop = value.stops[i]
    stops.push({
      position: stop.position || 0,
      color: stop.color ? formatColorValue(stop.color) : '#000000',
    })
  }

  return {
    type: (value.type || 'linear').toLowerCase(),
    stops: stops,
  }
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

function formatMeasure(value: any): string {
  if (!value) return '0px'
  if (typeof value === 'number') return value + 'px'
  if (typeof value === 'string') return value
  const measure = value.measure !== undefined ? value.measure : 0
  const unit = formatUnit(value.unit)
  return measure + unit
}

function formatColorValue(value: any): string {
  if (!value) return '#000000'
  if (typeof value === 'string') return value
  if (value.hex) return '#' + value.hex
  if (value.color && typeof value.color.r === 'number') {
    return toHex(value.color.r, value.color.g, value.color.b)
  }
  if (typeof value.r === 'number') {
    return toHex(value.r, value.g, value.b)
  }
  return '#000000'
}

function toHex(r: number, g: number, b: number): string {
  const rh = Math.round(r).toString(16)
  const gh = Math.round(g).toString(16)
  const bh = Math.round(b).toString(16)
  return '#' + pad2(rh) + pad2(gh) + pad2(bh)
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
  
  // Build path: skip platform (index 0), include everything else + token name
  // Result: "border-radius.1" or "semantic.color.primary"
  const parts: Array<string> = []
  for (let i = 1; i < fullGroupPath.length; i++) {
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
  if (t === 'color') return 'color'
  if (t === 'dimension' || t === 'measure') return 'dimension'
  if (t === 'typography') return 'typography'
  if (t === 'shadow') return 'shadow'
  if (t === 'border') return 'border'
  if (t === 'radius') return 'borderRadius'
  if (t === 'gradient') return 'gradient'
  if (t === 'font') return 'fontFamily'
  if (t === 'text' || t === 'string') return 'string'
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
