import { useState } from 'react';
import { sampleData, validateInput, generateRandomData } from '../../algorithm/longestConsecutive';
import './InputPanel.css';

interface InputPanelProps {
  onDataChange: (data: number[]) => void;
  currentData: number[];
}

export function InputPanel({ onDataChange, currentData }: InputPanelProps) {
  const [inputValue, setInputValue] = useState(JSON.stringify(currentData));
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  const handleSubmit = () => {
    const result = validateInput(inputValue);
    if (result.valid && result.data) {
      onDataChange(result.data);
      setError(null);
    } else {
      setError(result.error || '输入无效');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSampleClick = (data: number[]) => {
    setInputValue(JSON.stringify(data));
    onDataChange(data);
    setError(null);
  };

  const handleRandomClick = () => {
    const data = generateRandomData();
    setInputValue(JSON.stringify(data));
    onDataChange(data);
    setError(null);
  };

  return (
    <div className="input-panel">
      <div className="input-row">
        <label className="input-label">输入数据:</label>
        <input
          type="text"
          className={`input-field ${error ? 'input-error' : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入数组，如: [100,4,200,1,3,2]"
        />
        <button className="input-btn submit-btn" onClick={handleSubmit}>
          确定
        </button>
        <div className="sample-buttons">
          {sampleData.map((sample, index) => (
            <button
              key={index}
              className="input-btn sample-btn"
              onClick={() => handleSampleClick(sample.data)}
            >
              {sample.name}
            </button>
          ))}
          <button className="input-btn random-btn" onClick={handleRandomClick}>
            随机生成
          </button>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
