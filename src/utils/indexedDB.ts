/**
 * IndexedDB 缓存工具模块
 * 用于缓存 GitHub Star 数、用户语言选择、播放速度等设置
 */

const DB_NAME = 'algorithm-visualizer-db';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

// 缓存有效期：1小时（毫秒）
const CACHE_DURATION = 60 * 60 * 1000;

export interface CacheData {
  key: string;
  value: unknown;
  timestamp: number;
}

export interface StarCache {
  stars: number;
  timestamp: number;
}

export interface UserSettings {
  language: 'java' | 'python' | 'golang' | 'javascript';
  playSpeed: number;
}

let dbInstance: IDBDatabase | null = null;

/**
 * 重置数据库实例（用于测试）
 */
export function resetDBInstance(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * 打开或创建 IndexedDB 数据库
 */
function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}


/**
 * 从 IndexedDB 获取缓存数据
 */
async function getFromDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const data = request.result as CacheData | undefined;
        resolve(data ? (data.value as T) : null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * 将数据保存到 IndexedDB
 */
async function saveToDB<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const data: CacheData = {
        key,
        value,
        timestamp: Date.now(),
      };
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save to IndexedDB'));
    });
  } catch {
    // 静默失败，不影响用户体验
  }
}

/**
 * 获取 GitHub Star 数缓存
 * 如果缓存有效（1小时内），返回缓存值
 * 否则返回 null，表示需要重新获取
 */
export async function getStarCache(): Promise<number | null> {
  const cache = await getFromDB<StarCache>('github-stars');
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.stars;
  }
  // 缓存过期，但仍返回旧值作为备用
  return cache?.stars ?? null;
}

/**
 * 检查 Star 缓存是否有效（未过期）
 */
export async function isStarCacheValid(): Promise<boolean> {
  const cache = await getFromDB<StarCache>('github-stars');
  return cache !== null && Date.now() - cache.timestamp < CACHE_DURATION;
}

/**
 * 保存 GitHub Star 数到缓存
 */
export async function saveStarCache(stars: number): Promise<void> {
  const cache: StarCache = {
    stars,
    timestamp: Date.now(),
  };
  await saveToDB('github-stars', cache);
}

/**
 * 获取用户设置
 */
export async function getUserSettings(): Promise<UserSettings> {
  const settings = await getFromDB<UserSettings>('user-settings');
  return settings ?? {
    language: 'javascript',
    playSpeed: 1,
  };
}

/**
 * 保存用户设置
 */
export async function saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
  const current = await getUserSettings();
  const updated = { ...current, ...settings };
  await saveToDB('user-settings', updated);
}

/**
 * 获取用户选择的编程语言
 */
export async function getLanguage(): Promise<UserSettings['language']> {
  const settings = await getUserSettings();
  return settings.language;
}

/**
 * 保存用户选择的编程语言
 */
export async function saveLanguage(language: UserSettings['language']): Promise<void> {
  await saveUserSettings({ language });
}

/**
 * 获取播放速度
 */
export async function getPlaySpeed(): Promise<number> {
  const settings = await getUserSettings();
  return settings.playSpeed;
}

/**
 * 保存播放速度
 */
export async function savePlaySpeed(speed: number): Promise<void> {
  await saveUserSettings({ playSpeed: speed });
}
