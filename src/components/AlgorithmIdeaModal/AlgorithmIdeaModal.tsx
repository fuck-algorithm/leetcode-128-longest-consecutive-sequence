import { useEffect, useCallback } from 'react';
import './AlgorithmIdeaModal.css';

interface AlgorithmIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 最长连续序列算法思路
const algorithmIdea = {
  title: '128. 最长连续序列',
  problemDescription: '给定一个未排序的整数数组 nums，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。',
  approach: [
    '使用 HashSet 存储所有数字，实现 O(1) 时间复杂度的查找',
    '遍历 HashSet 中的每个数字',
    '对于每个数字 num，检查它是否是序列的起点（即 num-1 不在集合中）',
    '如果是起点，向后连续查找 num+1, num+2, ... 直到找不到为止',
    '记录并更新最长序列的长度',
  ],
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  keyPoints: [
    '使用 HashSet 实现 O(1) 查找，避免排序的 O(n log n)',
    '只从序列起点开始计数，避免重复计算',
    '每个数字最多被访问两次（一次遍历，一次序列扩展）',
    '空间换时间的经典策略',
  ],
};

export function AlgorithmIdeaModal({ isOpen, onClose }: AlgorithmIdeaModalProps) {
  // 处理 ESC 键关闭
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="关闭">
          ×
        </button>
        
        <h2 className="modal-title">{algorithmIdea.title}</h2>
        
        <section className="modal-section">
          <h3>问题描述</h3>
          <p>{algorithmIdea.problemDescription}</p>
        </section>

        <section className="modal-section">
          <h3>解题思路</h3>
          <ol className="approach-list">
            {algorithmIdea.approach.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="modal-section complexity-section">
          <div className="complexity-item">
            <h3>时间复杂度</h3>
            <span className="complexity-value">{algorithmIdea.timeComplexity}</span>
          </div>
          <div className="complexity-item">
            <h3>空间复杂度</h3>
            <span className="complexity-value">{algorithmIdea.spaceComplexity}</span>
          </div>
        </section>

        <section className="modal-section">
          <h3>关键点</h3>
          <ul className="key-points-list">
            {algorithmIdea.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
