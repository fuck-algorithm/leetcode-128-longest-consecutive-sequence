import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import { algorithmCode } from '../../algorithm/longestConsecutive';
import { VariableState } from '../../types';
import './CodePanel.css';

interface CodePanelProps {
  currentLine: number;
  variables: VariableState;
}

// 代码行与变量的映射关系
const lineVariableMapping: Record<number, (keyof VariableState)[]> = {
  3: ['num_set'],
  5: ['num', 'num_set'],
  8: ['longestStreak'],
  10: ['num'],
  11: ['num'],
  12: ['currentNum'],
  13: ['currentStreak'],
  15: ['currentNum'],
  16: ['currentNum'],
  17: ['currentStreak'],
  20: ['longestStreak', 'currentStreak'],
  24: ['longestStreak'],
};

export function CodePanel({ currentLine, variables }: CodePanelProps) {
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, []);

  // 格式化变量值
  const formatVariableValue = (key: keyof VariableState, value: unknown): string => {
    if (value === undefined) return '';
    if (key === 'num_set' && Array.isArray(value)) {
      return `{${value.join(', ')}}`;
    }
    return String(value);
  };

  // 获取当前行的变量显示
  const getLineVariables = (lineNum: number): string => {
    const varKeys = lineVariableMapping[lineNum];
    if (!varKeys) return '';
    
    const parts: string[] = [];
    for (const key of varKeys) {
      const value = variables[key];
      if (value !== undefined) {
        parts.push(`${key} = ${formatVariableValue(key, value)}`);
      }
    }
    return parts.join(', ');
  };

  const codeLines = algorithmCode.split('\n');

  return (
    <div className="code-panel">
      <div className="code-header">
        <span className="code-title">Java 代码</span>
        <span className="code-badge">Debug 模式</span>
      </div>
      <div className="code-container">
        {codeLines.map((line, index) => {
          const lineNum = index + 1;
          const isHighlighted = lineNum === currentLine;
          const lineVars = isHighlighted ? getLineVariables(lineNum) : '';
          
          return (
            <div 
              key={index} 
              className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
            >
              <span className="line-number">{lineNum}</span>
              <pre 
                ref={index === 0 ? codeRef : undefined}
                className="line-content"
              >
                <code className="language-java">{line || ' '}</code>
              </pre>
              {lineVars && (
                <span className="line-variables">{lineVars}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
