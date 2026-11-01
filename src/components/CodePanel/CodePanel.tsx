import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-javascript';
import { algorithmCodes, codeLineMappings, CodeLanguage } from '../../algorithm/longestConsecutive';
import { VariableState } from '../../types';
import './CodePanel.css';

interface CodePanelProps {
  currentLine: number;
  variables: VariableState;
  language: CodeLanguage;
  stepId: string;
  stepType: string;
  stepNumber: number;
  totalSteps: number;
  onLanguageChange: (lang: CodeLanguage) => void;
}

const languageNames: Record<CodeLanguage, string> = {
  java: 'Java',
  python: 'Python',
  golang: 'Go',
  javascript: 'JavaScript'
};

const languageList: CodeLanguage[] = ['java', 'python', 'golang', 'javascript'];

const prismLanguages: Record<CodeLanguage, string> = {
  java: 'java',
  python: 'python',
  golang: 'go',
  javascript: 'javascript'
};

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

export function CodePanel({ currentLine, variables, language, stepId, stepType, stepNumber, totalSteps, onLanguageChange }: CodePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 对容器内所有的 code 元素进行语法高亮
    if (containerRef.current) {
      const codeElements = containerRef.current.querySelectorAll('code');
      codeElements.forEach((element) => {
        Prism.highlightElement(element);
      });
    }
  }, [language]);


  const formatVariableValue = (key: keyof VariableState, value: unknown): string => {
    if (value === undefined) return '';
    if (key === 'num_set' && Array.isArray(value)) {
      return `{${value.join(', ')}}`;
    }
    return String(value);
  };

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

  const codeLines = algorithmCodes[language].split('\n');
  const lineMapping = codeLineMappings[language];

  const getMappedLine = (javaLine: number): number => {
    for (const [key, value] of Object.entries(codeLineMappings.java)) {
      if (value === javaLine) {
        return lineMapping[key as keyof typeof lineMapping] || javaLine;
      }
    }
    return javaLine;
  };

  const mappedCurrentLine = getMappedLine(currentLine);

  useEffect(() => {
    const activeLine = containerRef.current?.querySelector<HTMLElement>('.code-line.highlighted');
    activeLine?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [mappedCurrentLine, language]);

  const stepLabels: Record<string, string> = {
    variable_init: '变量初始化',
    loop_start: '进入循环',
    loop_iteration: '遍历元素',
    condition_check: '条件判断',
    data_operation: '集合操作',
    variable_update: '更新变量',
    algorithm_end: '返回结果',
  };
  const watchedVariables = Object.entries(variables).filter(([, value]) => value !== undefined).slice(0, 3);

  return (
    <div className="code-panel">
      <div className="code-header">
        <div className="code-heading">
          <span className="code-file-icon">{language === 'python' ? 'Py' : language === 'java' ? 'J' : language === 'golang' ? 'Go' : 'JS'}</span>
          <span className="code-file-name">Solution.{language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'golang' ? 'go' : 'js'}</span>
        </div>
        <div className="language-tabs">
          {languageList.map((lang) => (
            <button
              key={lang}
              type="button"
              className={`language-tab ${lang === language ? 'active' : ''}`}
              onClick={() => onLanguageChange(lang)}
            >
              {languageNames[lang]}
            </button>
          ))}
        </div>
      </div>
      <div className="debug-strip">
        <span className="debug-playhead"><i /></span>
        <span className="debug-step">{stepLabels[stepType] || '执行步骤'} <b>{stepNumber + 1} / {totalSteps}</b></span>
        <span className="debug-id">{stepId}</span>
      </div>
      <div className="watch-panel" aria-label="变量监视">
        <span className="watch-title">变量</span>
        {watchedVariables.map(([name, value]) => (
          <span className="watch-item" key={name}><b>{name}</b><code>{formatVariableValue(name as keyof VariableState, value)}</code></span>
        ))}
      </div>
      <div className="code-container" ref={containerRef}>
        {codeLines.map((line, index) => {
          const lineNum = index + 1;
          const isHighlighted = lineNum === mappedCurrentLine;
          const lineVars = isHighlighted ? getLineVariables(currentLine) : '';
          return (
            <div 
              key={`${language}-${index}`} 
              className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
              data-current={isHighlighted ? 'true' : undefined}
            >
              <span className={`breakpoint ${isHighlighted ? 'breakpoint-active' : ''}`} aria-hidden="true" />
              <span className="line-number">{lineNum}</span>
              <pre className="line-content">
                <code className={`language-${prismLanguages[language]}`}>{line || ' '}</code>
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
