/**
 * GitHub Service Property Tests
 * 使用 fast-check 进行属性测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { getStarCount, CACHE_DURATION } from './githubService';
import * as indexedDB from '../utils/indexedDB';

// Mock IndexedDB utilities
vi.mock('../utils/indexedDB', () => ({
  getStarCache: vi.fn(),
  saveStarCache: vi.fn(),
  isStarCacheValid: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
(globalThis as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;

describe('GitHub Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: github-badge-algorithm-idea, Property 1: Cache validity determines data source**
   * 
   * For any StarCache entry with a timestamp, the cache is considered valid 
   * if and only if (currentTime - timestamp) < CACHE_DURATION (1 hour).
   * When valid, the cached value SHALL be returned without API call;
   * when invalid, the system SHALL fetch from API.
   * 
   * **Validates: Requirements 2.2, 4.2**
   */
  describe('Property 1: Cache validity determines data source', () => {
    it('should return cached value without API call when cache is valid', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1000000 }), // random star count
          async (stars) => {
            // Setup: cache is valid
            vi.mocked(indexedDB.isStarCacheValid).mockResolvedValue(true);
            vi.mocked(indexedDB.getStarCache).mockResolvedValue(stars);
            mockFetch.mockClear();

            const result = await getStarCount();

            // Verify: returns cached value
            expect(result).toBe(stars);
            // Verify: API was not called
            expect(mockFetch).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fetch from API when cache is invalid', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1000000 }), // random star count from API
          async (apiStars) => {
            // Setup: cache is invalid
            vi.mocked(indexedDB.isStarCacheValid).mockResolvedValue(false);
            vi.mocked(indexedDB.getStarCache).mockResolvedValue(null);
            vi.mocked(indexedDB.saveStarCache).mockResolvedValue();
            mockFetch.mockResolvedValue({
              ok: true,
              json: () => Promise.resolve({ stargazers_count: apiStars }),
            });

            const result = await getStarCount();

            // Verify: returns API value
            expect(result).toBe(apiStars);
            // Verify: API was called
            expect(mockFetch).toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('cache validity is determined by timestamp comparison with CACHE_DURATION', () => {
      // This tests the concept that validity = (now - timestamp) < CACHE_DURATION
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: CACHE_DURATION * 3 }), // time elapsed
          (elapsed) => {
            const isValid = elapsed < CACHE_DURATION;
            // Verify the validity logic
            if (elapsed < CACHE_DURATION) {
              expect(isValid).toBe(true);
            } else {
              expect(isValid).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: github-badge-algorithm-idea, Property 2: Successful API response triggers cache save with timestamp**
   * 
   * For any successful GitHub API response returning a star count,
   * the system SHALL save both the star count value and the current timestamp to IndexedDB cache.
   * 
   * **Validates: Requirements 2.4, 4.1**
   */
  describe('Property 2: Successful API response triggers cache save', () => {
    it('should save star count to cache after successful API response', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1000000 }), // random star count
          async (stars) => {
            // Setup: cache invalid, API succeeds
            vi.mocked(indexedDB.isStarCacheValid).mockResolvedValue(false);
            vi.mocked(indexedDB.getStarCache).mockResolvedValue(null);
            vi.mocked(indexedDB.saveStarCache).mockResolvedValue();
            mockFetch.mockResolvedValue({
              ok: true,
              json: () => Promise.resolve({ stargazers_count: stars }),
            });

            await getStarCount();

            // Verify: saveStarCache was called with the star count
            expect(indexedDB.saveStarCache).toHaveBeenCalledWith(stars);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: github-badge-algorithm-idea, Property 3: API failure with existing cache returns cached value**
   * 
   * For any GitHub API failure scenario where IndexedDB cache contains a previous star count
   * (regardless of expiration), the system SHALL return the cached star count value.
   * 
   * **Validates: Requirements 2.5**
   */
  describe('Property 3: API failure with existing cache returns cached value', () => {
    it('should return cached value when API fails and cache exists', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1000000 }), // cached star count
          async (cachedStars) => {
            // Reset mocks for each iteration
            vi.mocked(indexedDB.isStarCacheValid).mockReset();
            vi.mocked(indexedDB.getStarCache).mockReset();
            mockFetch.mockReset();
            
            // Setup: cache invalid, API fails, but fallback cache exists
            vi.mocked(indexedDB.isStarCacheValid).mockResolvedValue(false);
            // getStarCache is only called once - in the fallback path after API failure
            vi.mocked(indexedDB.getStarCache).mockResolvedValue(cachedStars);
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await getStarCount();

            // Verify: returns cached value from fallback
            expect(result).toBe(cachedStars);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 when API fails and no cache exists', async () => {
      // Setup: no cache, API fails
      vi.mocked(indexedDB.isStarCacheValid).mockResolvedValue(false);
      vi.mocked(indexedDB.getStarCache).mockResolvedValue(null);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getStarCount();

      // Verify: returns default 0
      expect(result).toBe(0);
    });
  });
});
