// Type definitions for token validation

export interface DTCGToken {
  $value: any
  $type: string
  $description?: string
}

export interface FlatToken {
  path: string
  value: any
  type: string
  description?: string
  file: string
}

export interface TokenMap {
  tokens: Map<string, FlatToken>
  fileCount: number
  totalCount: number
}

export interface BreakingChange {
  path: string
  reason: 'removed' | 'type-changed'
  oldValue?: any
  newValue?: any
  oldType?: string
  newType?: string
  file: string
}

export interface ValueChange {
  path: string
  oldValue: any
  newValue: any
  type: string
  file: string
}

export interface NewToken {
  path: string
  value: any
  type: string
  file: string
}

export interface PlatformStats {
  breaking: number
  valueChanges: number
  newTokens: number
  unchanged: number
}

export interface ValidationResult {
  summary: {
    source: {
      path: string
      fileCount: number
      tokenCount: number
    }
    target: {
      path: string
      fileCount: number
      tokenCount: number
    }
    breaking: number
    valueChanges: number
    formatChanges: number
    newTokens: number
    unchanged: number
    structuralRenames: number
    byPlatform: Record<string, PlatformStats>
  }
  breaking: BreakingChange[]
  valueChanges: ValueChange[]
  formatChanges: ValueChange[]
  newTokens: NewToken[]
  structuralRenames: Array<{
    removed: string
    renamed: string
  }>
  possibleRenames: Array<{
    removed: string
    possibleMatch: string
    similarity: number
  }>
  byPlatform: {
    [platform: string]: {
      breaking: BreakingChange[]
      valueChanges: ValueChange[]
      formatChanges: ValueChange[]
      newTokens: NewToken[]
      structuralRenames: Array<{
        removed: string
        renamed: string
      }>
      possibleRenames: Array<{
        removed: string
        possibleMatch: string
        similarity: number
      }>
    }
  }
}

export interface ValidationOptions {
  source: string
  target: string
  failOnBreaking: boolean
  failOnValueChanges: boolean
  output?: string
  format: 'console' | 'json' | 'markdown'
  ci: boolean
  tolerance: number
  ignorePatterns: string[]
}

export interface ValidationConfig {
  tolerance?: number
  ignorePatterns?: string[]
  strictTypes?: boolean
  failOn?: {
    breaking?: boolean
    valueChanges?: boolean
    typeChanges?: boolean
  }
  fuzzyMatching?: {
    enabled?: boolean
    threshold?: number
  }
}
