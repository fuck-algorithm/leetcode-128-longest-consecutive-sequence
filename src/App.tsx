import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { CodePanel } from './components/CodePanel';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { ProgressBar } from './components/ProgressBar';
import { WechatFloat } from './components/WechatFloat';
import { ExecutionContext } from './components/ExecutionContext';
import { generateAlgorithmSteps, sampleData, CodeLanguage } from './algorithm/longestConsecutive';
import { AlgorithmStep, PlayState } from './types';
import './App.css';

const DB_NAME = 'algorithm-visualizer';
const STORE_NAME = 'settings';
const SPEED_KEY = 'play-speed';
const DEFAULT_SPEED = 1;
const DB_VERSION = 2;

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
      if (!db.objectStoreNames.contains('github-cache')) {
        db.createObjectStore('github-cache');
      }
    };
  });
}

async function getSavedSpeed(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(SPEED_KEY);
      request.onsuccess = () => resolve(request.result || DEFAULT_SPEED);
      request.onerror = () => resolve(DEFAULT_SPEED);
    });
  } catch {
    return DEFAULT_SPEED;
  }
}

async function saveSpeed(speed: number): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(speed, SPEED_KEY);
  } catch {
    // 忽略保存错误
  }
}

function App() {
  const [inputData, setInputData] = useState<number[]>(sampleData[0].data);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playState, setPlayState] = useState<PlayState>('stopped');
  const [playSpeed, setPlaySpeed] = useState(DEFAULT_SPEED);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('java');
  const playIntervalRef = useRef<number | null>(null);

  // 加载保存的播放速度
  useEffect(() => {
    getSavedSpeed().then(setPlaySpeed);
  }, []);

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
      const interval = 1000 / playSpeed;
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setPlayState('paused');
            return prev;
          }
          return prev + 1;
        });
      }, interval);
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
  }, [playState, steps.length, playSpeed]);

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

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaySpeed(speed);
    saveSpeed(speed);
  }, []);

  const handleLanguageChange = useCallback((lang: CodeLanguage) => {
    setCodeLanguage(lang);
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
            language={codeLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>
        <div className="canvas-section">
          <Canvas 
            visualization={currentStepData.visualization}
            stepDescription={currentStepData.description}
          />
        </div>
        <div className="context-section">
          <ExecutionContext
            variables={currentStepData.variables}
            currentStepId={currentStepData.stepId || ''}
            stepType={currentStepData.stepType || 'variable_init'}
          />
        </div>
      </div>
      
      <ControlPanel
        currentStep={currentStep}
        totalSteps={steps.length}
        playState={playState}
        playSpeed={playSpeed}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
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
