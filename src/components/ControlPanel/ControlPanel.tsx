import { useEffect, useCallback, useState, useRef } from 'react';
import { PlayState } from '../../types';
import './ControlPanel.css';

interface ControlPanelProps {
  currentStep: number;
  totalSteps: number;
  playState: PlayState;
  playSpeed: number;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

export function ControlPanel({
  currentStep,
  totalSteps,
  playState,
  playSpeed,
  onPrevious,
  onNext,
  onPlayPause,
  onReset,
  onSpeedChange,
}: ControlPanelProps) {
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
      case 'r':
      case 'R':
        e.preventDefault();
        onReset();
        break;
    }
  }, [onPrevious, onNext, onPlayPause, onReset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setIsSpeedMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPlaying = playState === 'playing';
  const canGoPrevious = currentStep > 0;
  const canGoNext = currentStep < totalSteps - 1;

  return (
    <div className="control-panel">
      <div className="control-buttons">
        <button 
          className="control-btn reset-btn" 
          onClick={onReset}
          title="重置 (R)"
        >
          <span className="btn-icon">⟲</span>
          <span className="btn-text">重置</span>
          <span className="btn-shortcut">R</span>
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

        <div className="speed-control" ref={speedMenuRef}>
          <button 
            className="control-btn speed-btn"
            onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
            title="播放速度"
          >
            <span className="btn-text">{playSpeed}x</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          {isSpeedMenuOpen && (
            <div className="speed-menu">
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  className={`speed-option ${speed === playSpeed ? 'active' : ''}`}
                  onClick={() => {
                    onSpeedChange(speed);
                    setIsSpeedMenuOpen(false);
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="step-info">
        步骤 {currentStep + 1} / {totalSteps}
      </div>
    </div>
  );
}
