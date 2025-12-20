import { useEffect, useCallback } from 'react';
import { PlayState } from '../../types';
import './ControlPanel.css';

interface ControlPanelProps {
  currentStep: number;
  totalSteps: number;
  playState: PlayState;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
}

export function ControlPanel({
  currentStep,
  totalSteps,
  playState,
  onPrevious,
  onNext,
  onPlayPause,
  onReset,
}: ControlPanelProps) {
  // 键盘快捷键处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 忽略输入框中的按键
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNext();
        break;
      case ' ':
        e.preventDefault();
        onPlayPause();
        break;
    }
  }, [onPrevious, onNext, onPlayPause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isPlaying = playState === 'playing';
  const canGoPrevious = currentStep > 0;
  const canGoNext = currentStep < totalSteps - 1;

  return (
    <div className="control-panel">
      <div className="control-buttons">
        <button 
          className="control-btn reset-btn" 
          onClick={onReset}
          title="重置"
        >
          <span className="btn-icon">⟲</span>
          <span className="btn-text">重置</span>
        </button>
        
        <button 
          className="control-btn prev-btn" 
          onClick={onPrevious}
          disabled={!canGoPrevious}
          title="上一步 (←)"
        >
          <span className="btn-icon">◀</span>
          <span className="btn-text">上一步</span>
          <span className="btn-shortcut">←</span>
        </button>
        
        <button 
          className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={onPlayPause}
          title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
        >
          <span className="btn-icon">{isPlaying ? '⏸' : '▶'}</span>
          <span className="btn-text">{isPlaying ? '暂停' : '播放'}</span>
          <span className="btn-shortcut">空格</span>
        </button>
        
        <button 
          className="control-btn next-btn" 
          onClick={onNext}
          disabled={!canGoNext}
          title="下一步 (→)"
        >
          <span className="btn-icon">▶</span>
          <span className="btn-text">下一步</span>
          <span className="btn-shortcut">→</span>
        </button>
      </div>
      
      <div className="step-info">
        步骤 {currentStep + 1} / {totalSteps}
      </div>
    </div>
  );
}
