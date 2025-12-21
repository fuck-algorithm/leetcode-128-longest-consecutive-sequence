import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
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

export function CodePanel({ currentLine, variables, language, onLanguageChange }: CodePanelProps) {
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
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

  return (
    <div className="code-panel">
      <div className="code-header">
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
        <span className="code-badge">Debug 模式</span>
      </div>
      <div className="code-container">
        {codeLines.map((line, index) => {
          const lineNum = index + 1;
          const isHighlighted = lineNum === mappedCurrentLine;
          const lineVars = isHighlighted ? getLineVariables(currentLine) : '';
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
