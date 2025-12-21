import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  lineMapping,
  getLineNumbers,
  getStepLineMapping,
  validateLineMapping,
  getAllStepIds,
  getCodeLineCount,
  isValidLineNumber,
} from './lineMapping';
import { CodeLanguage } from '../types';

/**
 * **Feature: algorithm-visualizer, Property 13: StepId唯一性**
 * *For any* 生成的算法步骤序列，所有步骤的stepId必须唯一且非空。
 * **Validates: Requirements 15.1**
 */
describe('Property 13: StepId唯一性', () => {
  it('所有预定义的stepId必须唯一', () => {
    const stepIds = getAllStepIds();
    const uniqueStepIds = new Set(stepIds);
    
    expect(stepIds.length).toBe(uniqueStepIds.size);
  });

  it('所有预定义的stepId必须非空', () => {
    const stepIds = getAllStepIds();
    
    for (const stepId of stepIds) {
      expect(stepId).toBeTruthy();
      expect(stepId.trim()).not.toBe('');
    }
  });

  it('stepId命名规范：只包含字母、数字和下划线', () => {
    const stepIds = getAllStepIds();
    const validPattern = /^[a-z][a-z0-9_]*$/;
    
    for (const stepId of stepIds) {
      expect(stepId).toMatch(validPattern);
    }
  });
});

/**
 * **Feature: algorithm-visualizer, Property 14: 多语言映射完整性**
 * *For any* stepId，LineMapping中必须包含java、python、golang、javascript四种语言的映射，且每种语言的行号数组非空。
 * **Validates: Requirements 15.2, 15.4**
 */
describe('Property 14: 多语言映射完整性', () => {
  const languages: CodeLanguage[] = ['java', 'python', 'golang', 'javascript'];

  it('每个stepId必须包含所有四种语言的映射', () => {
    const result = validateLineMapping();
    
    if (!result.valid) {
      console.error('映射验证错误:', result.errors);
    }
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('属性测试：对于任意stepId，所有语言映射都存在且非空', () => {
    const stepIds = getAllStepIds();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...stepIds),
        (stepId) => {
          const mapping = getStepLineMapping(stepId);
          
          // 映射必须存在
          expect(mapping).not.toBeNull();
          
          if (mapping) {
            // 每种语言的映射都必须存在且非空
            for (const lang of languages) {
              expect(mapping[lang]).toBeDefined();
              expect(Array.isArray(mapping[lang])).toBe(true);
              expect(mapping[lang].length).toBeGreaterThan(0);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('属性测试：对于任意stepId和语言组合，getLineNumbers返回有效行号', () => {
    const stepIds = getAllStepIds();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...stepIds),
        fc.constantFrom(...languages),
        (stepId, language) => {
          const lineNumbers = getLineNumbers(stepId, language);
          
          // 行号数组必须非空
          expect(lineNumbers.length).toBeGreaterThan(0);
          
          // 每个行号必须是有效的
          for (const lineNum of lineNumbers) {
            expect(isValidLineNumber(lineNum, language)).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: algorithm-visualizer, Property 6: 代码行号映射一致性**
 * *For any* 算法步骤的stepId和任意语言，通过LineMapping查找的代码行号必须是有效行号（1到该语言代码总行数之间），且行号数组非空。
 * **Validates: Requirements 4.3, 15.2, 15.3**
 */
describe('Property 6: 代码行号映射一致性', () => {
  const languages: CodeLanguage[] = ['java', 'python', 'golang', 'javascript'];

  it('所有映射的行号都在有效范围内', () => {
    for (const [, mapping] of Object.entries(lineMapping)) {
      for (const lang of languages) {
        const lineNumbers = mapping[lang];
        const maxLine = getCodeLineCount(lang);
        
        for (const lineNum of lineNumbers) {
          expect(lineNum).toBeGreaterThanOrEqual(1);
          expect(lineNum).toBeLessThanOrEqual(maxLine);
        }
      }
    }
  });

  it('属性测试：行号验证函数正确工作', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10, max: 50 }),
        fc.constantFrom(...languages),
        (lineNum, language) => {
          const maxLine = getCodeLineCount(language);
          const isValid = isValidLineNumber(lineNum, language);
          
          if (lineNum >= 1 && lineNum <= maxLine) {
            expect(isValid).toBe(true);
          } else {
            expect(isValid).toBe(false);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('带索引的stepId能正确解析到基础映射', () => {
    // 测试动态生成的stepId（如 add_to_hashset_0, add_to_hashset_1）
    const baseStepIds = ['add_to_hashset', 'main_loop_start', 'while_loop_check'];
    
    for (const baseId of baseStepIds) {
      for (let i = 0; i < 10; i++) {
        const dynamicId = `${baseId}_${i}`;
        const lineNumbers = getLineNumbers(dynamicId, 'java');
        const baseLineNumbers = getLineNumbers(baseId, 'java');
        
        // 动态ID应该解析到基础映射
        expect(lineNumbers).toEqual(baseLineNumbers);
      }
    }
  });
});

describe('LineMapping工具函数', () => {
  it('getCodeLineCount返回正确的行数', () => {
    expect(getCodeLineCount('java')).toBe(26);
    expect(getCodeLineCount('python')).toBe(18);
    expect(getCodeLineCount('golang')).toBe(25);
    expect(getCodeLineCount('javascript')).toBe(19);
  });

  it('getAllStepIds返回所有预定义的stepId', () => {
    const stepIds = getAllStepIds();
    
    expect(stepIds).toContain('init_hashset');
    expect(stepIds).toContain('init_longest_streak');
    expect(stepIds).toContain('return_result');
  });

  it('不存在的stepId返回空数组', () => {
    const lineNumbers = getLineNumbers('non_existent_step', 'java');
    expect(lineNumbers).toEqual([]);
  });

  it('不存在的stepId的映射返回null', () => {
    const mapping = getStepLineMapping('non_existent_step');
    expect(mapping).toBeNull();
  });
});
