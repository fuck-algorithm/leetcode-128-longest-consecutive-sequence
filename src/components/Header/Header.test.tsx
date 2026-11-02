import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from './Header';

// Mock GitHub Service
vi.mock('../../services/githubService', () => ({
  getStarCount: vi.fn().mockResolvedValue(42),
  GITHUB_REPO_URL: 'https://github.com/fuck-algorithm/leetcode-128-longest-consecutive-sequence',
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render GitHub badge with correct link', async () => {
    render(<Header />);
    
    const githubLink = screen.getByTitle('点击去GitHub仓库Star支持一下');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/fuck-algorithm/leetcode-128-longest-consecutive-sequence');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('should display tooltip text on GitHub badge', () => {
    render(<Header />);
    
    const githubLink = screen.getByTitle('点击去GitHub仓库Star支持一下');
    expect(githubLink).toHaveAttribute('title', '点击去GitHub仓库Star支持一下');
  });

  it('should render a button for the problem description', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: '题目描述' })).toBeInTheDocument();
  });

  it('should open the problem description from the header button', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: '题目描述' }));
    expect(screen.getByText(/你必须设计并实现时间复杂度为 O\(n\) 的算法/)).toBeInTheDocument();
  });

  it('should render algorithm idea button', () => {
    render(<Header />);

    const button = screen.getByRole('button', { name: /算法思路/i });
    expect(button).toBeInTheDocument();
  });

  it('should open modal when algorithm idea button is clicked', async () => {
    render(<Header />);
    
    // Modal should not be visible initially
    expect(screen.queryByText('问题描述')).not.toBeInTheDocument();
    
    // Click the button
    const button = screen.getByRole('button', { name: /算法思路/i });
    fireEvent.click(button);
    
    // Modal should now be visible
    await waitFor(() => {
      expect(screen.getByText('问题描述')).toBeInTheDocument();
    });
  });

  it('should display star count', async () => {
    render(<Header />);
    
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  it('should render LeetCode link with correct URL', () => {
    render(<Header />);
    
    const leetcodeLink = screen.getByText('128. 最长连续序列');
    expect(leetcodeLink).toHaveAttribute('href', 'https://leetcode.cn/problems/longest-consecutive-sequence/');
  });

  it('should render LeetCode Hot 100 back link with correct URL', () => {
    render(<Header />);
    
    const backLink = screen.getByText('LeetCode Hot 100');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', 'https://fuck-algorithm.github.io/leetcode-hot-100/');
    expect(backLink).toHaveAttribute('target', '_blank');
  });
});
