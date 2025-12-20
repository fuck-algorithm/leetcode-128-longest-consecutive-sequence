import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { CodePanel } from './components/CodePanel';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { ProgressBar } from './components/ProgressBar';
import { WechatFloat } from './components/WechatFloat';
import { generateAlgorithmSteps, sampleData } from './algorithm/longestConsecutive';
import { AlgorithmStep, PlayState } from './types';
import './App.css';

const PLAY_INTERVAL = 1000; // 播放间隔（毫秒）

function App() {
  const [inputData, setInputData] = useState<number[]>(sampleData[0].data);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playState, setPlayState] = useState<PlayState>('stopped');
  const playIntervalRef = useRef<number | null>(null);

  // 生成算法步骤
  useEffect(() => {
    const newSteps = generateAlgorithmSteps(inputData);
    setSteps(newSteps);
    setCurrentStep(0);
    setPlayState('stopped');
  }, [inputData]);

  // 播放控制
  useEffect(() => {
    if (playState === 'playing') {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setPlayState('paused');
            return prev;
          }
          return prev + 1;
        });
      }, PLAY_INTERVAL);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [playState, steps.length]);

  const handleDataChange = useCallback((data: number[]) => {
    setInputData(data);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const handlePlayPause = useCallback(() => {
    setPlayState(prev => {
      if (prev === 'playing') return 'paused';
      // 如果已经到最后一步，从头开始
      if (currentStep >= steps.length - 1) {
        setCurrentStep(0);
      }
      return 'playing';
    });
  }, [currentStep, steps.length]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setPlayState('stopped');
  }, []);

  const handleSeek = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const currentStepData = steps[currentStep] || {
    lineNumber: 0,
    variables: {},
    visualization: {
      highlightedNumbers: [],
      currentSequence: [],
      longestSequence: [],
      isSequenceStart: false,
      hashSetNumbers: [],
      originalArray: inputData,
    },
    description: '准备开始...',
  };

  return (
    <div className="app">
      <Header />
      <InputPanel onDataChange={handleDataChange} currentData={inputData} />
      
      <div className="main-content">
        <div className="code-section">
          <CodePanel 
            currentLine={currentStepData.lineNumber} 
            variables={currentStepData.variables}
          />
        </div>
        <div className="canvas-section">
          <Canvas 
            visualization={currentStepData.visualization}
            stepDescription={currentStepData.description}
          />
        </div>
      </div>
      
      <ControlPanel
        currentStep={currentStep}
        totalSteps={steps.length}
        playState={playState}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
      />
      
      <ProgressBar
        currentStep={currentStep}
        totalSteps={steps.length}
        onSeek={handleSeek}
      />
      
      <WechatFloat />
    </div>
  );
}

export default App;
