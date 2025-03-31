/**
 * Cache service for analytics data
 * Provides in-memory caching with time-based expiration
 */

// Cache storage
const cache = new Map();

// Configuration
const DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Cache service for storing computed analytics results
 */
const cacheService = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*|null} Cached value or null if not found/expired
   */
  get(key) {
    if (!cache.has(key)) return null;

    const cachedData = cache.get(key);
    const now = Date.now();

    // Check if cache is expired
    if (now > cachedData.expiresAt) {
      this.delete(key);
      return null;
    }

    return cachedData.value;
  },

  /**
   * Set value in cache with expiration
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = DEFAULT_TTL) {
    const expiresAt = Date.now() + ttl;
    cache.set(key, { value, expiresAt });
  },

  /**
   * Delete item from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    cache.delete(key);
  },

  /**
   * Clear entire cache
   */
  clear() {
    cache.clear();
  },

  /**
   * Get cache stats
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
    };
  },

  /**
   * Remove all expired items from cache
   * @returns {number} Number of items removed
   */
  prune() {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, data] of cache.entries()) {
      if (now > data.expiresAt) {
        cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  },
};

// Periodically prune expired items (every 5 minutes)
setInterval(() => {
  cacheService.prune();
}, 5 * 60 * 1000);

module.exports = cacheService;
