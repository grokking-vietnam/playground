/**
 * Enhanced SchemaCache - Performance optimization with intelligent caching and invalidation
 */

import type { DatabaseIntrospectionResult } from '../types/schema-tree'

export interface SchemaCacheOptions {
  maxSize: number
  ttl: number // Time to live in milliseconds
  enableLRU: boolean
}

export interface CacheEntry {
  data: DatabaseIntrospectionResult
  timestamp: number
  expires: number
  accessCount: number
  lastAccessed: number
}

export interface CacheStats {
  totalEntries: number
  hitRate: number
  missRate: number
  evictedCount: number
  totalHits: number
  totalMisses: number
  memoryUsage: number
}

export class SchemaCache {
  private cache = new Map<string, CacheEntry>()
  private options: SchemaCacheOptions
  private stats = {
    hits: 0,
    misses: 0,
    evicted: 0
  }

  constructor(options: Partial<SchemaCacheOptions> = {}) {
    this.options = {
      maxSize: options.maxSize || 50,
      ttl: options.ttl || 300000, // 5 minutes default
      enableLRU: options.enableLRU !== false
    }

    // Set up periodic cleanup
    this.setupPeriodicCleanup()
  }

  /**
   * Get cached schema data
   */
  get(connectionId: string): DatabaseIntrospectionResult | null {
    const entry = this.cache.get(connectionId)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(connectionId)
      this.stats.misses++
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++

    return entry.data
  }

  /**
   * Set cache entry
   */
  set(connectionId: string, data: DatabaseIntrospectionResult): void {
    const now = Date.now()

    // Check if we need to evict entries
    if (this.cache.size >= this.options.maxSize) {
      this.evictLeastUsed()
    }

    const entry: CacheEntry = {
      data,
      timestamp: now,
      expires: now + this.options.ttl,
      accessCount: 1,
      lastAccessed: now
    }

    this.cache.set(connectionId, entry)
  }

  /**
   * Delete specific cache entry
   */
  delete(connectionId: string): boolean {
    return this.cache.delete(connectionId)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.resetStats()
  }

  /**
   * Check if connection is cached
   */
  has(connectionId: string): boolean {
    const entry = this.cache.get(connectionId)
    if (!entry) return false

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(connectionId)
      return false
    }

    return true
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const memoryUsage = this.estimateMemoryUsage()
    const totalRequests = this.stats.hits + this.stats.misses

    return {
      totalEntries: this.cache.size,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      evictedCount: this.stats.evicted,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage
    }
  }

  /**
   * Get cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Invalidate expired entries
   */
  invalidateExpired(): number {
    const now = Date.now()
    let invalidatedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
        invalidatedCount++
      }
    }

    return invalidatedCount
  }

  /**
   * Invalidate entries matching pattern
   */
  invalidateByPattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let invalidatedCount = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        invalidatedCount++
      }
    }

    return invalidatedCount
  }

  /**
   * Preload cache with data
   */
  preload(entries: Array<{ connectionId: string; data: DatabaseIntrospectionResult }>): void {
    for (const { connectionId, data } of entries) {
      this.set(connectionId, data)
    }
  }

  /**
   * Export cache data for persistence
   */
  export(): Array<{ connectionId: string; entry: CacheEntry }> {
    return Array.from(this.cache.entries()).map(([connectionId, entry]) => ({
      connectionId,
      entry
    }))
  }

  /**
   * Import cache data from persistence
   */
  import(data: Array<{ connectionId: string; entry: CacheEntry }>): void {
    const now = Date.now()
    
    for (const { connectionId, entry } of data) {
      // Only import non-expired entries
      if (now <= entry.expires) {
        this.cache.set(connectionId, entry)
      }
    }
  }

  /**
   * Update TTL for existing entry
   */
  updateTTL(connectionId: string, newTTL: number): boolean {
    const entry = this.cache.get(connectionId)
    if (!entry) return false

    entry.expires = Date.now() + newTTL
    return true
  }

  /**
   * Get entry metadata without accessing the data
   */
  getMetadata(connectionId: string): Omit<CacheEntry, 'data'> | null {
    const entry = this.cache.get(connectionId)
    if (!entry) return null

    return {
      timestamp: entry.timestamp,
      expires: entry.expires,
      accessCount: entry.accessCount,
      lastAccessed: entry.lastAccessed
    }
  }

  /**
   * Private helper methods
   */

  private evictLeastUsed(): void {
    if (!this.options.enableLRU || this.cache.size === 0) {
      return
    }

    let leastUsedKey = ''
    let leastUsedScore = Number.MAX_SAFE_INTEGER

    // Calculate eviction score based on access frequency and recency
    for (const [key, entry] of this.cache.entries()) {
      const now = Date.now()
      const timeSinceAccess = now - entry.lastAccessed
      const accessFrequency = entry.accessCount
      
      // Lower score = higher priority for eviction
      // Consider both frequency and recency
      const score = accessFrequency / Math.log(timeSinceAccess + 1)
      
      if (score < leastUsedScore) {
        leastUsedScore = score
        leastUsedKey = key
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
      this.stats.evicted++
    }
  }

  private setupPeriodicCleanup(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.invalidateExpired()
    }, 300000)
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0

    for (const entry of this.cache.values()) {
      // Rough estimation of memory usage
      totalSize += this.estimateObjectSize(entry.data)
    }

    return totalSize
  }

  private estimateObjectSize(obj: any): number {
    // Very rough estimation - in production you might use more sophisticated methods
    try {
      return JSON.stringify(obj).length * 2 // Rough estimate including object overhead
    } catch {
      return 1000 // Fallback estimate
    }
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evicted: 0
    }
  }
}