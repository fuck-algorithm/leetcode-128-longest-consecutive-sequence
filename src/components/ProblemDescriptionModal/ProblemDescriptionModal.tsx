import { useCallback, useEffect } from 'react';
import './ProblemDescriptionModal.css';

interface ProblemDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
}

export function ProblemDescriptionModal({ isOpen, onClose, description }: ProblemDescriptionModalProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="problem-modal-backdrop" onClick={handleBackdropClick}>
      <section className="problem-modal" role="dialog" aria-modal="true" aria-labelledby="problem-modal-title">
        <button className="problem-modal-close" onClick={onClose} aria-label="关闭题目描述">×</button>
        <h2 id="problem-modal-title">128. 最长连续序列</h2>
        <div className="problem-modal-rule" />
        <p className="problem-modal-description">{description}</p>
        <div className="problem-example">
          <h3>示例</h3>
          <p><b>输入：</b>nums = [100,4,200,1,3,2]</p>
          <p><b>输出：</b>4</p>
          <p><b>说明：</b>最长连续序列是 [1, 2, 3, 4]，长度为 4。</p>
        </div>
        <div className="problem-example">
          <h3>约束</h3>
          <p>0 ≤ nums.length ≤ 10⁵</p>
          <p>-10⁹ ≤ nums[i] ≤ 10⁹</p>
        </div>
      </section>
    </div>
  );
}
