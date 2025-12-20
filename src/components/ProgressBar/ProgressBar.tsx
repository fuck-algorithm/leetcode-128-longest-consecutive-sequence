import { useRef, useCallback } from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onSeek: (step: number) => void;
}

export function ProgressBar({ currentStep, totalSteps, onSeek }: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  const calculateStep = useCallback((clientX: number): number => {
    if (!progressRef.current) return 0;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return Math.round(percentage * (totalSteps - 1));
  }, [totalSteps]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const step = calculateStep(e.clientX);
    onSeek(step);
  }, [calculateStep, onSeek]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const step = calculateStep(moveEvent.clientX);
      onSeek(step);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [calculateStep, onSeek]);

  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="progress-bar-container">
      <div 
        ref={progressRef}
        className="progress-bar"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
        <div 
          className="progress-thumb"
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
}
