import { useState, useEffect } from 'react';
import './Header.css';

const LEETCODE_URL = 'https://leetcode.cn/problems/longest-consecutive-sequence/';
const GITHUB_REPO_URL = 'https://github.com/fuck-algorithm/leetcode-128-longest-consecutive-sequence';
const GITHUB_API_URL = 'https://api.github.com/repos/fuck-algorithm/leetcode-128-longest-consecutive-sequence';

// IndexedDB 操作
const DB_NAME = 'algorithm-visualizer';
const STORE_NAME = 'github-cache';
const CACHE_KEY = 'star-count';
const CACHE_DURATION = 60 * 60 * 1000; // 1小时
const DB_VERSION = 2;

interface CacheData {
  stars: number;
  timestamp: number;
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    };
  });
}

async function getCachedStars(): Promise<CacheData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(CACHE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCachedStars(stars: number): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put({ stars, timestamp: Date.now() }, CACHE_KEY);
  } catch {
    // 忽略缓存写入错误
  }
}

async function fetchStarCount(): Promise<number> {
  // 检查缓存
  const cached = await getCachedStars();
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.stars;
  }

  // 从GitHub API获取
  try {
    const response = await fetch(GITHUB_API_URL);
    if (response.ok) {
      const data = await response.json();
      const stars = data.stargazers_count || 0;
      await setCachedStars(stars);
      return stars;
    }
  } catch {
    // API请求失败，使用缓存
  }

  // 返回缓存值或默认值
  return cached?.stars ?? 0;
}

export function Header() {
  const [starCount, setStarCount] = useState<number>(0);

  useEffect(() => {
    fetchStarCount().then(setStarCount);
  }, []);

  return (
    <header className="header">
      <a 
        href={LEETCODE_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="header-title"
      >
        128. 最长连续序列
      </a>
      <div className="github-section">
        <a 
          href={GITHUB_REPO_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
          title="点击去GitHub仓库Star支持一下"
        >
          <svg 
            height="28" 
            width="28" 
            viewBox="0 0 16 16" 
            fill="currentColor"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
        <span className="star-count" title="GitHub Stars">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
          </svg>
          {starCount}
        </span>
      </div>
    </header>
  );
}
