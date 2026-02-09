#!/usr/bin/env ts-node

import * as fs from 'fs'
import * as path from 'path'
import {
  DTCGToken,
  FlatToken,
  TokenMap,
  ValidationResult,
  ValidationOptions,
  ValidationConfig,
  BreakingChange,
  ValueChange,
  NewToken
} from './types'

const minimist = require('minimist')
const chalk = require('chalk')

// ============================================================================
// TOKEN FLATTENING
// ============================================================================

function isToken(obj: any): boolean {
  return obj && typeof obj === 'object' && '$value' in obj && '$type' in obj
}

function flattenTokens(obj: any, prefix: string = '', filePath: string = ''): FlatToken[] {
  const tokens: FlatToken[] = []

  if (!obj || typeof obj !== 'object') {
    return tokens
  }

  for (const [key, value] of Object.entries(obj)) {
    const tokenPath = prefix ? `${prefix}.${key}` : key

    if (isToken(value)) {
      tokens.push({
        path: tokenPath,
        value: (value as DTCGToken).$value,
        type: (value as DTCGToken).$type,
        description: (value as DTCGToken).$description,
        file: filePath
      })
    } else if (typeof value === 'object' && value !== null) {
      // Recurse into nested groups
      const nested = flattenTokens(value, tokenPath, filePath)
      tokens.push(...nested)
    }
  }

  return tokens
}

// ============================================================================
// FILE LOADING
// ============================================================================

function loadJsonFilesRecursively(dir: string, baseDir: string = ''): TokenMap {
  const tokens: FlatToken[] = []
  let fileCount = 0

  if (!fs.existsSync(dir)) {
    throw new Error(`Directory not found: ${dir}`)
  }

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      const subTokens = loadJsonFilesRecursively(fullPath, baseDir || dir)
      tokens.push(...Array.from(subTokens.tokens.values()))
      fileCount += subTokens.fileCount
    } else if (file.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      const json = JSON.parse(content)
      const relativePath = path.relative(baseDir || dir, fullPath)
      const flattened = flattenTokens(json, '', relativePath)
      tokens.push(...flattened)
      fileCount++
    }
  }

  const tokenMap = new Map<string, FlatToken>()
  for (const token of tokens) {
    tokenMap.set(token.path, token)
  }

  return {
    tokens: tokenMap,
    fileCount,
    totalCount: tokenMap.size
  }
}

// ============================================================================
// VALUE COMPARISON
// ============================================================================

function normalizeValue(value: any): any {
  // Normalize dimension strings to objects
  // e.g., "10px" -> {value: 10, unit: "px"}
  if (typeof value === 'string') {
    const match = value.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%|pt|ms|s)?$/)
    if (match) {
      const numValue = parseFloat(match[1])
      const unit = match[2] || ''
      if (unit) {
        return { value: numValue, unit }
      }
      // Unitless number as string (like font-weight "600")
      return numValue
    }
  }
  
  // Normalize dimension objects
  // {value: 10, unit: "px"} stays as is
  if (value && typeof value === 'object' && 'value' in value && 'unit' in value) {
    return { value: value.value, unit: value.unit }
  }
  
  // Normalize hex colors to lowercase
  if (typeof value === 'string' && value.startsWith('#')) {
    return value.toLowerCase()
  }
  
  return value
}

function areValuesSemanticallySame(a: any, b: any, tolerance: number = 0): boolean {
  const normalizedA = normalizeValue(a)
  const normalizedB = normalizeValue(b)
  
  return deepEqual(normalizedA, normalizedB, tolerance)
}

function deepEqual(a: any, b: any, tolerance: number = 0): boolean {
  // Handle primitives
  if (a === b) return true

  // Handle null/undefined
  if (a == null || b == null) return false

  // Handle numbers with tolerance
  if (typeof a === 'number' && typeof b === 'number') {
    if (tolerance > 0) {
      return Math.abs(a - b) <= tolerance
    }
    return a === b
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], tolerance)) return false
    }
    return true
  }

  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!deepEqual(a[key], b[key], tolerance)) return false
    }

    return true
  }

  return false
}

// ============================================================================
// FUZZY MATCHING (Levenshtein Distance)
// ============================================================================

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

function calculateSimilarity(a: string, b: string): number {
  const distance = levenshteinDistance(a, b)
  const maxLength = Math.max(a.length, b.length)
  return maxLength === 0 ? 1 : 1 - distance / maxLength
}

function findPossibleRenames(
  removed: string[],
  added: string[],
  threshold: number = 0.8
): Array<{ removed: string; possibleMatch: string; similarity: number }> {
  const renames: Array<{ removed: string; possibleMatch: string; similarity: number }> = []

  for (const removedToken of removed) {
    let bestMatch = ''
    let bestSimilarity = 0

    for (const addedToken of added) {
      const similarity = calculateSimilarity(removedToken, addedToken)
      if (similarity > bestSimilarity && similarity >= threshold) {
        bestSimilarity = similarity
        bestMatch = addedToken
      }
    }

    if (bestMatch) {
      renames.push({
        removed: removedToken,
        possibleMatch: bestMatch,
        similarity: bestSimilarity
      })
    }
  }

  return renames
}

// ============================================================================
// PATTERN MATCHING
// ============================================================================

function matchesPattern(tokenPath: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    // Simple glob-like matching
    const regex = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^.]*')
    
    if (new RegExp(`^${regex}$`).test(tokenPath)) {
      return true
    }
  }
  return false
}

// ============================================================================
// STRUCTURAL RENAME DETECTION
// ============================================================================

function normalizeTokenPath(path: string): string {
  // Convert dashes to dots for comparison
  // e.g., "color-background" -> "color.background"
  return path.replace(/-/g, '.')
}

function isStructuralRename(oldPath: string, newPath: string): boolean {
  // Check if paths are identical after normalizing dashes to dots
  const normalizedOld = normalizeTokenPath(oldPath)
  const normalizedNew = normalizeTokenPath(newPath)
  return normalizedOld === normalizedNew && oldPath !== newPath
}

function findStructuralRenames(
  removed: string[],
  added: string[]
): Array<{ removed: string; renamed: string }> {
  const structuralRenames: Array<{ removed: string; renamed: string }> = []
  const matchedAdded = new Set<string>()
  
  for (const removedPath of removed) {
    for (const addedPath of added) {
      if (!matchedAdded.has(addedPath) && isStructuralRename(removedPath, addedPath)) {
        structuralRenames.push({
          removed: removedPath,
          renamed: addedPath
        })
        matchedAdded.add(addedPath)
        break // Found exact match, move to next removed token
      }
    }
  }
  
  return structuralRenames
}

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

function getPlatformFromFile(filePath: string): string {
  // Extract platform from file path: core/core.json -> core, web/patient/light.json -> web/patient
  const parts = filePath.split('/')
  if (parts.length === 0) return 'unknown'
  
  if (parts[0] === 'core') {
    return 'core'
  } else if (parts.length >= 2) {
    // web/patient or mobile/customer
    return `${parts[0]}/${parts[1]}`
  }
  return parts[0]
}

// ============================================================================
// VALIDATION LOGIC
// ============================================================================

function validateTokens(
  sourceMap: TokenMap,
  targetMap: TokenMap,
  options: ValidationOptions
): ValidationResult {
  let breaking: BreakingChange[] = []
  const valueChanges: ValueChange[] = []
  const formatChanges: ValueChange[] = []
  let newTokens: NewToken[] = []
  let unchanged = 0
  const structuralRenames: Array<{ removed: string; renamed: string }> = []

  const sourceTokens = sourceMap.tokens
  const targetTokens = targetMap.tokens
  
  // Track which source tokens have been matched to structural renames
  const structurallyRenamedSourceTokens = new Set<string>()

  // Find removed and type-changed tokens (breaking)
  for (const [path, targetToken] of targetTokens) {
    // Skip ignored patterns
    if (matchesPattern(path, options.ignorePatterns)) {
      continue
    }
    
    // Skip tokens with underscores (internal/private tokens)
    if (path.includes('_')) {
      continue
    }

    const sourceToken = sourceTokens.get(path)

    if (!sourceToken) {
      // Token was removed - but check if it's a structural rename first
      const normalizedTargetPath = normalizeTokenPath(path)
      let foundStructuralRename = false
      
      // Check if a structurally renamed version exists in source
      for (const [sourcePath, srcToken] of sourceTokens) {
        // Skip tokens with underscores
        if (sourcePath.includes('_')) {
          continue
        }
        
        const normalizedSourcePath = normalizeTokenPath(sourcePath)
        
        if (normalizedSourcePath === normalizedTargetPath && sourcePath !== path && 
            !structurallyRenamedSourceTokens.has(sourcePath)) {
          // Found a structural rename!
          structuralRenames.push({
            removed: path,
            renamed: sourcePath
          })
          structurallyRenamedSourceTokens.add(sourcePath)
          foundStructuralRename = true
          break
        }
      }
      
      if (!foundStructuralRename) {
        // Actual removal
        breaking.push({
          path,
          reason: 'removed',
          oldValue: targetToken.value,
          oldType: targetToken.type,
          file: targetToken.file
        })
      }
    } else if (sourceToken.type !== targetToken.type) {
      // Type changed
      breaking.push({
        path,
        reason: 'type-changed',
        oldValue: targetToken.value,
        newValue: sourceToken.value,
        oldType: targetToken.type,
        newType: sourceToken.type,
        file: targetToken.file
      })
    } else if (!deepEqual(sourceToken.value, targetToken.value, options.tolerance)) {
      // Value changed - check if it's semantic or just format
      if (areValuesSemanticallySame(sourceToken.value, targetToken.value, options.tolerance)) {
        // Format change only (e.g., "10px" -> {value: 10, unit: "px"})
        formatChanges.push({
          path,
          oldValue: targetToken.value,
          newValue: sourceToken.value,
          type: sourceToken.type,
          file: sourceToken.file
        })
      } else {
        // Actual value change
        valueChanges.push({
          path,
          oldValue: targetToken.value,
          newValue: sourceToken.value,
          type: sourceToken.type,
          file: sourceToken.file
        })
      }
    } else {
      unchanged++
    }
  }

  // Find new tokens (excluding structurally renamed ones)
  for (const [path, sourceToken] of sourceTokens) {
    // Skip ignored patterns
    if (matchesPattern(path, options.ignorePatterns)) {
      continue
    }
    
    // Skip tokens with underscores (internal/private tokens)
    if (path.includes('_')) {
      continue
    }

    // Skip if this token was matched as a structural rename
    if (structurallyRenamedSourceTokens.has(path)) {
      continue
    }

    if (!targetTokens.has(path)) {
      newTokens.push({
        path,
        value: sourceToken.value,
        type: sourceToken.type,
        file: sourceToken.file
      })
    }
  }
  
  // Keep original breaking list for platform distribution
  const originalBreaking = [...breaking]
  
  // Skip fuzzy rename detection
  const possibleRenames: Array<{ removed: string; possibleMatch: string; similarity: number }> = []

  // Categorize by platform
  const byPlatform: Record<string, {
    breaking: BreakingChange[]
    valueChanges: ValueChange[]
    formatChanges: ValueChange[]
    newTokens: NewToken[]
    structuralRenames: Array<{ removed: string; renamed: string }>
    possibleRenames: Array<{ removed: string; possibleMatch: string; similarity: number }>
  }> = {}

  const platformStats: Record<string, { breaking: number; valueChanges: number; newTokens: number; unchanged: number }> = {}

  // Group breaking changes by platform
  for (const change of breaking) {
    const platform = getPlatformFromFile(change.file)
    if (!byPlatform[platform]) {
      byPlatform[platform] = { breaking: [], valueChanges: [], formatChanges: [], newTokens: [], structuralRenames: [], possibleRenames: [] }
      platformStats[platform] = { breaking: 0, valueChanges: 0, newTokens: 0, unchanged: 0 }
    }
    byPlatform[platform].breaking.push(change)
    platformStats[platform].breaking++
  }
  
  // Distribute structural renames to platforms based on removed token from original breaking
  for (const rename of structuralRenames) {
    // Find the file of the removed token
    const removedToken = targetTokens.get(rename.removed)
    if (removedToken) {
      const platform = getPlatformFromFile(removedToken.file)
      if (!byPlatform[platform]) {
        byPlatform[platform] = { breaking: [], valueChanges: [], formatChanges: [], newTokens: [], structuralRenames: [], possibleRenames: [] }
      }
      byPlatform[platform].structuralRenames.push(rename)
    }
  }

  // Group value changes by platform
  for (const change of valueChanges) {
    const platform = getPlatformFromFile(change.file)
    if (!byPlatform[platform]) {
      byPlatform[platform] = { breaking: [], valueChanges: [], formatChanges: [], newTokens: [], structuralRenames: [], possibleRenames: [] }
      platformStats[platform] = { breaking: 0, valueChanges: 0, newTokens: 0, unchanged: 0 }
    }
    byPlatform[platform].valueChanges.push(change)
    platformStats[platform].valueChanges++
  }
  
  // Group format changes by platform
  for (const change of formatChanges) {
    const platform = getPlatformFromFile(change.file)
    if (!byPlatform[platform]) {
      byPlatform[platform] = { breaking: [], valueChanges: [], formatChanges: [], newTokens: [], structuralRenames: [], possibleRenames: [] }
    }
    byPlatform[platform].formatChanges.push(change)
  }

  // Group new tokens by platform
  for (const token of newTokens) {
    const platform = getPlatformFromFile(token.file)
    if (!byPlatform[platform]) {
      byPlatform[platform] = { breaking: [], valueChanges: [], formatChanges: [], newTokens: [], structuralRenames: [], possibleRenames: [] }
      platformStats[platform] = { breaking: 0, valueChanges: 0, newTokens: 0, unchanged: 0 }
    }
    byPlatform[platform].newTokens.push(token)
    platformStats[platform].newTokens++
  }
  

  // Count unchanged per platform
  for (const [path, targetToken] of targetTokens) {
    if (matchesPattern(path, options.ignorePatterns)) continue
    
    // Skip tokens with underscores
    if (path.includes('_')) continue
    
    const sourceToken = sourceTokens.get(path)
    if (sourceToken && sourceToken.type === targetToken.type && 
        deepEqual(sourceToken.value, targetToken.value, options.tolerance)) {
      const platform = getPlatformFromFile(targetToken.file)
      if (!platformStats[platform]) {
        platformStats[platform] = { breaking: 0, valueChanges: 0, newTokens: 0, unchanged: 0 }
      }
      platformStats[platform].unchanged++
    }
  }

  return {
    summary: {
      source: {
        path: options.source,
        fileCount: sourceMap.fileCount,
        tokenCount: sourceMap.totalCount
      },
      target: {
        path: options.target,
        fileCount: targetMap.fileCount,
        tokenCount: targetMap.totalCount
      },
      breaking: breaking.length,
      valueChanges: valueChanges.length,
      formatChanges: formatChanges.length,
      newTokens: newTokens.length,
      unchanged,
      structuralRenames: structuralRenames.length,
      byPlatform: platformStats
    },
    breaking,
    valueChanges,
    formatChanges,
    newTokens,
    structuralRenames,
    possibleRenames,
    byPlatform
  }
}

// ============================================================================
// REPORTING - CONSOLE
// ============================================================================

function reportConsole(result: ValidationResult): void {
  const { summary, breaking, valueChanges, newTokens, possibleRenames, byPlatform } = result

  console.log('\n' + chalk.cyan('═'.repeat(60)))
  console.log(chalk.cyan.bold('        TOKEN VALIDATION REPORT'))
  console.log(chalk.cyan('═'.repeat(60)) + '\n')

  console.log(chalk.bold('📁 Comparing:'))
  console.log(
    `  Source: ${summary.source.path} (${summary.source.fileCount} files, ${summary.source.tokenCount} tokens)`
  )
  console.log(
    `  Target: ${summary.target.path} (${summary.target.fileCount} files, ${summary.target.tokenCount} tokens)`
  )
  console.log()

  // Platform summary
  console.log(chalk.bold('📊 By Platform:'))
  const platforms = Object.keys(summary.byPlatform).sort()
  for (const platform of platforms) {
    const stats = summary.byPlatform[platform]
    const total = stats.breaking + stats.valueChanges + stats.newTokens + stats.unchanged
    console.log(
      `  ${platform}: ${chalk.red(`${stats.breaking} breaking`)}, ${chalk.yellow(`${stats.valueChanges} changes`)}, ${chalk.blue(`${stats.newTokens} new`)}, ${chalk.green(`${stats.unchanged} unchanged`)} (${total} total)`
    )
  }
  console.log()

  // Show changes by platform
  for (const platform of platforms) {
    const platformData = byPlatform[platform]
    const stats = summary.byPlatform[platform]
    
    if (!platformData || (platformData.breaking.length === 0 && platformData.valueChanges.length === 0 && 
        platformData.newTokens.length === 0)) {
      continue
    }

    console.log(chalk.cyan.bold(`\n━━━ ${platform.toUpperCase()} ━━━\n`))

    // Breaking changes for this platform
    if (platformData.breaking.length > 0) {
      console.log(chalk.red.bold(`🚨 BREAKING CHANGES (${platformData.breaking.length})`))
      const limit = 5
      for (let i = 0; i < Math.min(platformData.breaking.length, limit); i++) {
        const change = platformData.breaking[i]
        if (change.reason === 'removed') {
          console.log(chalk.red(`  ✗ ${change.path} - REMOVED`))
        } else if (change.reason === 'type-changed') {
          console.log(
            chalk.red(`  ✗ ${change.path} - TYPE CHANGED (${change.oldType} → ${change.newType})`)
          )
        }
      }
      if (platformData.breaking.length > limit) {
        console.log(chalk.gray(`  ... (${platformData.breaking.length - limit} more)`))
      }
      console.log()
    }

    // Value changes for this platform
    if (platformData.valueChanges.length > 0) {
      console.log(chalk.yellow.bold(`⚠️  VALUE CHANGES (${platformData.valueChanges.length})`))
      const limit = 5
      for (let i = 0; i < Math.min(platformData.valueChanges.length, limit); i++) {
        const change = platformData.valueChanges[i]
        const oldStr = JSON.stringify(change.oldValue)
        const newStr = JSON.stringify(change.newValue)
        console.log(chalk.yellow(`  ⚬ ${change.path}: ${oldStr} → ${newStr}`))
      }
      if (platformData.valueChanges.length > limit) {
        console.log(chalk.gray(`  ... (${platformData.valueChanges.length - limit} more)`))
      }
      console.log()
    }

    // New tokens for this platform
    if (platformData.newTokens.length > 0) {
      console.log(chalk.blue.bold(`ℹ️  NEW TOKENS (${platformData.newTokens.length})`))
      const limit = 5
      for (let i = 0; i < Math.min(platformData.newTokens.length, limit); i++) {
        const token = platformData.newTokens[i]
        console.log(chalk.blue(`  + ${token.path}`))
      }
      if (platformData.newTokens.length > limit) {
        console.log(chalk.gray(`  ... (${platformData.newTokens.length - limit} more)`))
      }
      console.log()
    }

    // Unchanged for this platform
    console.log(chalk.green(`✓ UNCHANGED: ${stats.unchanged} tokens`))
  }

  console.log()

  console.log(chalk.cyan('═'.repeat(60)))
  if (breaking.length > 0) {
    console.log(chalk.red.bold('Summary: 🚨 VALIDATION FAILED - Breaking changes detected'))
    console.log(chalk.red('Exit Code: 1'))
  } else if (valueChanges.length > 0) {
    console.log(chalk.yellow.bold('Summary: ⚠️  VALUE CHANGES DETECTED'))
    console.log(chalk.yellow('Exit Code: 0'))
  } else {
    console.log(chalk.green.bold('Summary: ✅ VALIDATION PASSED - No breaking changes'))
    console.log(chalk.green('Exit Code: 0'))
  }
  console.log(chalk.cyan('═'.repeat(60)) + '\n')
}

// ============================================================================
// REPORTING - JSON
// ============================================================================

function reportJson(result: ValidationResult): string {
  const exitCode =
    result.breaking.length > 0 ? 1 : 0

  return JSON.stringify(
    {
      ...result,
      exitCode
    },
    null,
    2
  )
}

// ============================================================================
// REPORTING - MARKDOWN
// ============================================================================

function getTokenCategory(tokenPath: string): string {
  const parts = tokenPath.split('.')
  
  // For core tokens: core.color.gray.50 -> "color"
  if (parts[0] === 'core' && parts.length > 1) {
    return parts[1]
  }
  
  // For semantic tokens: semantic.spacing.m -> "spacing"
  if (parts[0] === 'semantic' && parts.length > 1) {
    return parts[1]
  }
  
  // For component tokens: components.button.primary.background -> "button"
  if (parts[0] === 'components' && parts.length > 1) {
    return parts[1]
  }
  
  // Fallback to first part
  return parts[0] || 'other'
}

function groupByCategory<T extends { path: string }>(items: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {}
  
  for (const item of items) {
    const category = getTokenCategory(item.path)
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(item)
  }
  
  return grouped
}

function isIntentionalTypeCorrection(oldType: string, newType: string): boolean {
  // Filter out intentional DTCG type corrections
  const intentionalCorrections = [
    ['text', 'string'],
    ['dimension', 'fontWeight'],
    ['text', 'fontFamily'],
    ['number', 'dimension']
  ]
  
  return intentionalCorrections.some(([old, newT]) => oldType === old && newType === newT)
}

function reportMarkdown(result: ValidationResult): string {
  const { summary, breaking, valueChanges, newTokens, byPlatform } = result

  let md = '# Token Validation Report\n\n'

  md += '_This report shows only breaking changes (removed tokens, type changes), semantic value changes, and new tokens. Structural renames (dash-to-dot notation), format improvements, and intentional DTCG type corrections are automatically filtered out._\n\n'

  // Filter out intentional type corrections for summary
  const actualTypeChanges = breaking.filter(b => 
    b.reason === 'type-changed' && 
    !isIntentionalTypeCorrection(b.oldType || '', b.newType || '')
  )

  md += '## Summary\n\n'
  md += `- 🚨 **Removed Tokens**: ${breaking.filter(b => b.reason === 'removed').length}\n`
  md += `- 🔄 **Type Changes**: ${actualTypeChanges.length}\n`
  md += `- ⚠️ **Value Changes**: ${summary.valueChanges} (semantic differences only)\n`
  md += `- ℹ️ **New Tokens**: ${summary.newTokens}\n`
  md += `- ✓ **Unchanged**: ${summary.unchanged}\n\n`

  md += '## Comparison Details\n\n'
  md += `**Source**: \`${summary.source.path}\` (${summary.source.fileCount} files, ${summary.source.tokenCount} tokens)\n\n`
  md += `**Target**: \`${summary.target.path}\` (${summary.target.fileCount} files, ${summary.target.tokenCount} tokens)\n\n`

  // Platform breakdown
  md += '## By Platform\n\n'
  md += '| Platform | Removed | Type Changes | Value Changes | New | Unchanged | Total |\n'
  md += '|----------|---------|--------------|---------------|-----|-----------|-------|\n'
  
  const platforms = Object.keys(summary.byPlatform).sort()
  for (const platform of platforms) {
    const stats = summary.byPlatform[platform]
    const platformData = byPlatform[platform]
    const removed = platformData?.breaking.filter(b => b.reason === 'removed').length || 0
    const typeChanged = platformData?.breaking.filter(b => 
      b.reason === 'type-changed' && 
      !isIntentionalTypeCorrection(b.oldType || '', b.newType || '')
    ).length || 0
    const total = stats.breaking + stats.valueChanges + stats.newTokens + stats.unchanged
    md += `| **${platform}** | ${removed} | ${typeChanged} | ${stats.valueChanges} | ${stats.newTokens} | ${stats.unchanged} | ${total} |\n`
  }
  md += '\n'

  // ========================================================================
  // ORGANIZED BY PLATFORM → CHANGE TYPE → CATEGORY
  // ========================================================================
  
  for (const platform of platforms) {
    const platformData = byPlatform[platform]
    if (!platformData) continue
    
    const removed = platformData.breaking.filter(b => b.reason === 'removed')
    const typeChanges = platformData.breaking.filter(b => 
      b.reason === 'type-changed' && 
      !isIntentionalTypeCorrection(b.oldType || '', b.newType || '')
    )
    const valueChangesPlatform = platformData.valueChanges
    const newTokensPlatform = platformData.newTokens
    
    // Skip platform if no changes
    if (removed.length === 0 && typeChanges.length === 0 && 
        valueChangesPlatform.length === 0 && newTokensPlatform.length === 0) {
      continue
    }
    
    md += `## ${platform.toUpperCase()}\n\n`
    
    // REMOVED TOKENS
    if (removed.length > 0) {
      md += `### 🚨 Removed Tokens (${removed.length})\n\n`
      
      const grouped = groupByCategory(removed)
      const categories = Object.keys(grouped).sort()
      
      for (const category of categories) {
        const tokens = grouped[category]
        md += `#### ${category} (${tokens.length})\n\n`
        
        for (const token of tokens) {
          md += `- \`${token.path}\` (${token.oldType})\n`
        }
        md += '\n'
      }
    }
    
    // TYPE CHANGES
    if (typeChanges.length > 0) {
      md += `### 🔄 Type Changes (${typeChanges.length})\n\n`
      
      const grouped = groupByCategory(typeChanges)
      const categories = Object.keys(grouped).sort()
      
      for (const category of categories) {
        const tokens = grouped[category]
        md += `#### ${category} (${tokens.length})\n\n`
        
        md += '| Token Path | Old Type | New Type |\n'
        md += '|------------|----------|----------|\n'
        
        for (const token of tokens) {
          md += `| \`${token.path}\` | ${token.oldType} | ${token.newType} |\n`
        }
        md += '\n'
      }
    }
    
    // VALUE CHANGES
    if (valueChangesPlatform.length > 0) {
      md += `### ⚠️ Value Changes (${valueChangesPlatform.length})\n\n`
      
      const grouped = groupByCategory(valueChangesPlatform)
      const categories = Object.keys(grouped).sort()
      
      for (const category of categories) {
        const tokens = grouped[category]
        md += `#### ${category} (${tokens.length})\n\n`
        
        md += '| Token Path | Old Value | New Value | Type |\n'
        md += '|------------|-----------|-----------|------|\n'
        
        for (const token of tokens) {
          const oldStr = JSON.stringify(token.oldValue).substring(0, 50)
          const newStr = JSON.stringify(token.newValue).substring(0, 50)
          md += `| \`${token.path}\` | \`${oldStr}\` | \`${newStr}\` | ${token.type} |\n`
        }
        md += '\n'
      }
    }
    
    // NEW TOKENS
    if (newTokensPlatform.length > 0) {
      md += `### ℹ️ New Tokens (${newTokensPlatform.length})\n\n`
      
      const grouped = groupByCategory(newTokensPlatform)
      const categories = Object.keys(grouped).sort()
      
      for (const category of categories) {
        const tokens = grouped[category]
        md += `#### ${category} (${tokens.length})\n\n`
        
        for (const token of tokens) {
          md += `- \`${token.path}\` (${token.type})\n`
        }
        md += '\n'
      }
    }
  }

  md += '---\n\n'
  if (breaking.length > 0) {
    md += '**Result**: 🚨 VALIDATION FAILED - Breaking changes detected\n'
  } else if (valueChanges.length > 0) {
    md += '**Result**: ⚠️ VALUE CHANGES DETECTED\n'
  } else {
    md += '**Result**: ✅ VALIDATION PASSED\n'
  }

  return md
}

// ============================================================================
// CONFIGURATION LOADING
// ============================================================================

function loadConfig(configPath?: string): ValidationConfig {
  const defaultConfig: ValidationConfig = {
    tolerance: 0,
    ignorePatterns: [],
    strictTypes: true,
    failOn: {
      breaking: true,
      valueChanges: false,
      typeChanges: true
    },
    fuzzyMatching: {
      enabled: true,
      threshold: 0.8
    }
  }

  if (!configPath) {
    const defaultPath = path.join(process.cwd(), 'tools', 'validate-tokens.config.json')
    if (fs.existsSync(defaultPath)) {
      configPath = defaultPath
    } else {
      return defaultConfig
    }
  }

  if (!fs.existsSync(configPath)) {
    return defaultConfig
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(content)
    return { ...defaultConfig, ...config }
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not load config from ${configPath}, using defaults`))
    return defaultConfig
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

function parseArgs(): ValidationOptions {
  const argv = minimist(process.argv.slice(2), {
    string: ['source', 'target', 'output', 'format', 'config', 'ignore'],
    boolean: ['fail-on-breaking', 'fail-on-value-changes', 'ci', 'help'],
    alias: {
      s: 'source',
      t: 'target',
      o: 'output',
      f: 'format',
      c: 'config',
      h: 'help'
    },
    default: {
      source: '.build',
      format: 'console',
      tolerance: 0
    }
  })

  if (argv.help) {
    console.log(`
Token Validator - Compare DTCG token exports

Usage:
  npm run validate-tokens -- --target <path> [options]

Options:
  -s, --source <path>           Path to new token exports (default: .build)
  -t, --target <path>           Path to existing tokens (required)
  --fail-on-breaking            Exit with code 1 if breaking changes detected
  --fail-on-value-changes       Exit with code 1 if any values changed
  -o, --output <file>           Save report to file
  -f, --format <type>           Report format: console|json|markdown (default: console)
  --ci                          CI mode (machine-readable output, exit codes)
  --tolerance <number>          Numeric value tolerance (e.g., 0.01)
  --ignore <pattern>            Ignore token paths matching pattern
  -c, --config <path>           Path to config file
  -h, --help                    Show this help

Examples:
  npm run validate-tokens -- --target ../other-repo/tokens
  npm run validate-tokens -- -t /path/to/tokens --fail-on-breaking -o report.json
  npm run validate-tokens -- -t ../tokens --format markdown --output REPORT.md
    `)
    process.exit(0)
  }

  if (!argv.target) {
    console.error(chalk.red('Error: --target is required'))
    console.log('Use --help for usage information')
    process.exit(1)
  }

  const config = loadConfig(argv.config)

  const ignorePatterns: string[] = []
  if (config.ignorePatterns) {
    ignorePatterns.push(...config.ignorePatterns)
  }
  if (argv.ignore) {
    if (Array.isArray(argv.ignore)) {
      ignorePatterns.push(...argv.ignore)
    } else {
      ignorePatterns.push(argv.ignore)
    }
  }

  return {
    source: path.resolve(argv.source),
    target: path.resolve(argv.target),
    failOnBreaking: argv['fail-on-breaking'] || (argv.ci && config.failOn?.breaking),
    failOnValueChanges: argv['fail-on-value-changes'] || config.failOn?.valueChanges || false,
    output: argv.output,
    format: argv.ci ? 'json' : argv.format,
    ci: argv.ci || false,
    tolerance: argv.tolerance || config.tolerance || 0,
    ignorePatterns
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    const options = parseArgs()

    // Load tokens
    console.log(chalk.gray('Loading source tokens...'))
    const sourceMap = loadJsonFilesRecursively(options.source, options.source)

    console.log(chalk.gray('Loading target tokens...'))
    const targetMap = loadJsonFilesRecursively(options.target, options.target)

    // Validate
    console.log(chalk.gray('Comparing tokens...'))
    const result = validateTokens(sourceMap, targetMap, options)

    // Generate report
    let reportOutput = ''
    if (options.format === 'json') {
      reportOutput = reportJson(result)
    } else if (options.format === 'markdown') {
      reportOutput = reportMarkdown(result)
    }

    // Output report
    if (options.output) {
      if (options.format === 'console') {
        console.warn(chalk.yellow('Warning: --output specified but format is console. Use --format json or --format markdown'))
      } else {
        fs.writeFileSync(options.output, reportOutput, 'utf-8')
        console.log(chalk.green(`Report saved to: ${options.output}`))
      }
    }

    if (options.format === 'console') {
      reportConsole(result)
    } else if (!options.output) {
      console.log(reportOutput)
    }

    // Determine exit code
    let exitCode = 0
    if (result.breaking.length > 0 && options.failOnBreaking) {
      exitCode = 1
    } else if (result.valueChanges.length > 0 && options.failOnValueChanges) {
      exitCode = 1
    }

    process.exit(exitCode)
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { validateTokens, loadJsonFilesRecursively, flattenTokens }
