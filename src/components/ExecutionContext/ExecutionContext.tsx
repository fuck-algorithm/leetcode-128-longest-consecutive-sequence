/**
 * 执行上下文面板
 * 显示调用栈、变量监控
 */

import { useMemo } from 'react';
import { StackFrame, WatchedVariable, VariableState } from '../../types';
import './ExecutionContext.css';

interface ExecutionContextProps {
  variables: VariableState;
  currentStepId: string;
  stepType: string;
}

export function ExecutionContext({ variables, currentStepId, stepType }: ExecutionContextProps) {
  // 从变量状态生成监控变量列表
  const watchedVariables = useMemo<WatchedVariable[]>(() => {
    const result: WatchedVariable[] = [];
    
    if (variables.num_set !== undefined) {
      result.push({
        name: 'num_set',
        value: variables.num_set,
        previousValue: undefined,
        hasChanged: false,
        type: 'set'
      });
    }
    
    if (variables.longestStreak !== undefined) {
      result.push({
        name: 'longestStreak',
        value: variables.longestStreak,
        previousValue: undefined,
        hasChanged: variables.changes?.some(c => c.variable === 'longestStreak') || false,
        type: 'primitive'
      });
    }
    
    if (variables.currentNum !== undefined) {
      result.push({
        name: 'currentNum',
        value: variables.currentNum,
        previousValue: undefined,
        hasChanged: variables.changes?.some(c => c.variable === 'currentNum') || false,
        type: 'primitive'
      });
    }
    
    if (variables.currentStreak !== undefined) {
      result.push({
        name: 'currentStreak',
        value: variables.currentStreak,
        previousValue: undefined,
        hasChanged: variables.changes?.some(c => c.variable === 'currentStreak') || false,
        type: 'primitive'
      });
    }
    
    if (variables.num !== undefined) {
      result.push({
        name: 'num',
        value: variables.num,
        previousValue: undefined,
        hasChanged: false,
        type: 'primitive'
      });
    }
    
    return result;
  }, [variables]);

  // 生成简化的调用栈
  const callStack = useMemo<StackFrame[]>(() => {
    const stack: StackFrame[] = [];
    
    // 主函数帧
    stack.push({
      id: 'main',
      functionName: 'longestConsecutive',
      parameters: { nums: '...' },
      localVariables: {},
      depth: 0,
      isActive: true
    });

    // 根据步骤类型添加额外的栈帧
    if (stepType === 'loop_iteration' || stepType === 'condition_check') {
      if (variables.num !== undefined) {
        stack.push({
          id: 'loop',
          functionName: 'for (num in num_set)',
          parameters: { num: variables.num },
          localVariables: {},
          depth: 1,
          isActive: true
        });
      }
    }

    return stack;
  }, [stepType, variables.num]);

  const formatValue = (value: unknown, type: string): string => {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    
    if (type === 'set' || type === 'array') {
      if (Array.isArray(value)) {
        if (value.length > 8) {
          return `{${value.slice(0, 8).join(', ')}, ...} (${value.length})`;
        }
        return `{${value.join(', ')}}`;
      }
    }
    
    return String(value);
  };

  const getStepTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'variable_init': '变量初始化',
      'loop_start': '循环开始',
      'loop_iteration': '循环迭代',
      'condition_check': '条件判断',
      'data_operation': '数据操作',
      'variable_update': '变量更新',
      'algorithm_end': '算法结束'
    };
    return labels[type] || type;
  };

  return (
    <div className="execution-context">
      <div className="context-section">
        <div className="section-header">
          <span className="section-icon">📚</span>
          <span className="section-title">调用栈</span>
        </div>
        <div className="call-stack">
          {callStack.map((frame, index) => (
            <div 
              key={frame.id} 
              className={`stack-frame ${frame.isActive ? 'active' : ''}`}
              style={{ marginLeft: frame.depth * 12 }}
            >
              <div className="frame-header">
                <span className="frame-depth">{index}</span>
                <span className="frame-name">{frame.functionName}</span>
              </div>
              {Object.keys(frame.parameters).length > 0 && (
                <div className="frame-params">
                  {Object.entries(frame.parameters).map(([key, val]) => (
                    <span key={key} className="param">
                      {key}: <span className="param-value">{String(val)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="context-section">
        <div className="section-header">
          <span className="section-icon">👁️</span>
          <span className="section-title">变量监控</span>
        </div>
        <div className="variables-watch">
          {watchedVariables.map(variable => (
            <div 
              key={variable.name} 
              className={`watch-item ${variable.hasChanged ? 'changed' : ''}`}
            >
              <span className="var-name">{variable.name}</span>
              <span className="var-type">{variable.type}</span>
              <span className="var-value">
                {formatValue(variable.value, variable.type)}
              </span>
              {variable.hasChanged && (
                <span className="change-indicator">●</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="context-section">
        <div className="section-header">
          <span className="section-icon">⚡</span>
          <span className="section-title">当前操作</span>
        </div>
        <div className="current-operation">
          <span className="operation-type">{getStepTypeLabel(stepType)}</span>
          <span className="step-id">{currentStepId}</span>
        </div>
      </div>
    </div>
  );
}
