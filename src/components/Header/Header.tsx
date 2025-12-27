import { useState, useEffect } from 'react';
import './Header.css';
import { getStarCount, GITHUB_REPO_URL } from '../../services/githubService';
import { AlgorithmIdeaModal } from '../AlgorithmIdeaModal';

const LEETCODE_URL = 'https://leetcode.cn/problems/longest-consecutive-sequence/';
const LEETCODE_HOT_100_URL = 'https://fuck-algorithm.github.io/leetcode-hot-100/';

export function Header() {
  const [starCount, setStarCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    getStarCount().then(setStarCount);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <a 
          href={LEETCODE_HOT_100_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="back-link"
          title="返回 LeetCode Hot 100"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          LeetCode Hot 100
        </a>
      </div>
      <a 
        href={LEETCODE_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="header-title"
      >
        128. 最长连续序列
      </a>
      <div className="header-actions">
        <button 
          className="algorithm-idea-btn"
          onClick={handleOpenModal}
          title="查看算法思路"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          算法思路
        </button>
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
      </div>
      <AlgorithmIdeaModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </header>
  );
}
