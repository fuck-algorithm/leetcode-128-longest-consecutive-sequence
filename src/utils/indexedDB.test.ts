/**
 * IndexedDB 缓存属性测试
 * **Feature: algorithm-visualizer, Property 8: 缓存有效期**
 * **Validates: Requirements 2.5**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  saveStarCache,
  getStarCache,
  isStarCacheValid,
  saveUserSettings,
  getUserSettings,
  saveLanguage,
  getLanguage,
  savePlaySpeed,
  getPlaySpeed,
  resetDBInstance,
} from './indexedDB';

// 清理 IndexedDB
beforeEach(async () => {
  // 重置数据库实例
  resetDBInstance();
  // 删除数据库以确保每个测试都是干净的状态
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase('algorithm-visualizer-db');
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
  // 等待一小段时间确保数据库完全删除
  await new Promise(resolve => setTimeout(resolve, 10));
});

describe('IndexedDB Cache', () => {
  /**
   * **Feature: github-badge-algorithm-idea, Property 4: Cache data round-trip consistency**
   * 
   * For any valid StarCache object { stars: number, timestamp: number },
   * serializing to IndexedDB and then deserializing SHALL produce an equivalent object
   * with identical stars and timestamp values.
   * 
   * **Validates: Requirements 4.3, 4.4**
   */
  describe('Property 4: Cache data round-trip consistency', () => {
    it('should preserve star count through save and retrieve cycle', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1000000 }), // any valid star count
          async (stars) => {
            // Save to IndexedDB
            await saveStarCache(stars);
            
            // Retrieve from IndexedDB
            const retrieved = await getStarCache();
            
            // Verify round-trip consistency
            expect(retrieved).toBe(stars);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve cache validity state through save and check cycle', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1000000 }),
          async (stars) => {
            // Save fresh cache
            await saveStarCache(stars);
            
            // Check validity immediately after save
            const isValid = await isStarCacheValid();
            
            // Fresh cache should always be valid
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: algorithm-visualizer, Property 8: 缓存有效期**
   * *For any* 缓存的Star数据，如果当前时间与缓存时间戳的差值小于1小时，
   * 则应返回缓存值而不发起新的API请求。
   * **Validates: Requirements 2.5**
   */
  describe('Property 8: 缓存有效期', () => {
    it('should return cached star count when cache is valid', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100000 }),
          async (starCount) => {
            // 保存 star 数
            await saveStarCache(starCount);
            
            // 立即获取应该返回缓存值
            const cached = await getStarCache();
            expect(cached).toBe(starCount);
            
            // 缓存应该有效
            const isValid = await isStarCacheValid();
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist star cache across multiple reads', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100000 }),
          async (starCount) => {
            await saveStarCache(starCount);
            
            // 多次读取应该返回相同值
            const read1 = await getStarCache();
            const read2 = await getStarCache();
            const read3 = await getStarCache();
            
            expect(read1).toBe(starCount);
            expect(read2).toBe(starCount);
            expect(read3).toBe(starCount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('User Settings Cache', () => {
    it('should persist language selection', async () => {
      const languages = ['java', 'python', 'golang', 'javascript'] as const;
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...languages),
          async (language) => {
            await saveLanguage(language);
            const saved = await getLanguage();
            expect(saved).toBe(language);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist play speed', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 0.25, max: 4, noNaN: true }),
          async (speed) => {
            await savePlaySpeed(speed);
            const saved = await getPlaySpeed();
            expect(saved).toBeCloseTo(speed, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return default settings when no settings saved', async () => {
      const settings = await getUserSettings();
      expect(settings.language).toBe('javascript');
      expect(settings.playSpeed).toBe(1);
    });

    it('should merge partial settings updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('java', 'python', 'golang', 'javascript' as const),
          fc.float({ min: 0.25, max: 4, noNaN: true }),
          async (language, speed) => {
            // 先保存语言
            await saveUserSettings({ language });
            let settings = await getUserSettings();
            expect(settings.language).toBe(language);
            
            // 再保存速度，语言应该保持不变
            await saveUserSettings({ playSpeed: speed });
            settings = await getUserSettings();
            expect(settings.language).toBe(language);
            expect(settings.playSpeed).toBeCloseTo(speed, 5);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
