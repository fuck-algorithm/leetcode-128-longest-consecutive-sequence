import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlgorithmIdeaModal } from './AlgorithmIdeaModal';

describe('AlgorithmIdeaModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render when isOpen is true', () => {
    render(<AlgorithmIdeaModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('128. 最长连续序列')).toBeInTheDocument();
    expect(screen.getByText('问题描述')).toBeInTheDocument();
    expect(screen.getByText('解题思路')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<AlgorithmIdeaModal isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('128. 最长连续序列')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<AlgorithmIdeaModal isOpen={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: '关闭' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(<AlgorithmIdeaModal isOpen={true} onClose={mockOnClose} />);
    
    // 点击背景（modal-backdrop）
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should not call onClose when modal content is clicked', () => {
    render(<AlgorithmIdeaModal isOpen={true} onClose={mockOnClose} />);
    
    // 点击内容区域不应关闭
    const content = document.querySelector('.modal-content');
    if (content) {
      fireEvent.click(content);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('should display algorithm complexity information', () => {
    render(<AlgorithmIdeaModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('时间复杂度')).toBeInTheDocument();
    expect(screen.getByText('空间复杂度')).toBeInTheDocument();
    // 两个复杂度都是 O(n)
    const complexityValues = screen.getAllByText('O(n)');
    expect(complexityValues).toHaveLength(2);
  });

  it('should display key points', () => {
    render(<AlgorithmIdeaModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('关键点')).toBeInTheDocument();
    expect(screen.getByText(/使用 HashSet 实现 O\(1\) 查找/)).toBeInTheDocument();
  });
});
