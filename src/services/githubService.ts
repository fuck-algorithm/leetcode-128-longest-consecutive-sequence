/**
 * GitHub Service Module
 * 用于获取 GitHub 仓库 Star 数，支持 IndexedDB 缓存
 */

import { getStarCache, saveStarCache, isStarCacheValid } from '../utils/indexedDB';

// GitHub 仓库配置
export const GITHUB_REPO_URL = 'https://github.com/fuck-algorithm/leetcode-128-longest-consecutive-sequence';
export const GITHUB_API_URL = 'https://api.github.com/repos/fuck-algorithm/leetcode-128-longest-consecutive-sequence';

// 缓存有效期：1小时（毫秒）
export const CACHE_DURATION = 60 * 60 * 1000;

// Star 缓存数据接口
export interface StarCache {
  stars: number;
  timestamp: number;
}

/**
 * 获取 GitHub 仓库 Star 数
 * 优先使用缓存，缓存过期或不存在时从 API 获取
 * API 失败时返回缓存值或默认值 0
 */
export async function getStarCount(): Promise<number> {
  // 检查缓存是否有效
  const cacheValid = await isStarCacheValid();
  
  if (cacheValid) {
    const cachedStars = await getStarCache();
    if (cachedStars !== null) {
      return cachedStars;
    }
  }

  // 缓存无效或不存在，从 API 获取
  try {
    const response = await fetch(GITHUB_API_URL);
    
    if (response.ok) {
      const data = await response.json();
      const stars = data.stargazers_count || 0;
      
      // 保存到缓存
      await saveStarCache(stars);
      
      return stars;
    }
  } catch {
    // API 请求失败，静默处理
  }

  // API 失败，尝试返回缓存值（即使过期）
  const fallbackCache = await getStarCache();
  if (fallbackCache !== null) {
    return fallbackCache;
  }

  // 无缓存，返回默认值
  return 0;
}
