/**
 * 输入验证属性测试
 * **Feature: algorithm-visualizer, Property 1: 输入验证一致性**
 * **Validates: Requirements 3.6, 3.7**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateInput, generateRandomData } from './validation';

describe('Input Validation', () => {
  /**
   * **Feature: algorithm-visualizer, Property 1: 输入验证一致性**
   * *For any* 输入字符串，如果validateInput返回valid=true，则返回的data数组必须满足：
   * 长度不超过100，所有元素在-10^9到10^9之间；
   * 如果返回valid=false，则必须包含非空的error信息。
   * **Validates: Requirements 3.6, 3.7**
   */
  describe('Property 1: 输入验证一致性', () => {
    it('valid results should have data within constraints', async () => {
      await fc.assert(
        fc.property(
          fc.array(fc.integer({ min: -1e9, max: 1e9 }), { minLength: 1, maxLength: 100 }),
          (numbers) => {
            // 测试数组格式 [1,2,3]
            const inputBrackets = `[${numbers.join(',')}]`;
            const result1 = validateInput(inputBrackets);
            
            expect(result1.valid).toBe(true);
            expect(result1.data).toBeDefined();
            expect(result1.data!.length).toBeLessThanOrEqual(100);
            result1.data!.forEach(n => {
              expect(n).toBeGreaterThanOrEqual(-1e9);
              expect(n).toBeLessThanOrEqual(1e9);
            });

            // 测试无括号格式 1,2,3
            const inputNoBrackets = numbers.join(',');
            const result2 = validateInput(inputNoBrackets);
            
            expect(result2.valid).toBe(true);
            expect(result2.data).toEqual(numbers);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('invalid results should have non-empty error message', async () => {
      const invalidInputs = [
        '',           // 空输入
        '   ',        // 只有空格
        '[]',         // 空数组
        'abc',        // 非数字
        '1,2,abc',    // 包含非数字
        '1,,2',       // 连续逗号
        '1.5,2',      // 小数
      ];

      for (const input of invalidInputs) {
        const result = validateInput(input);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.length).toBeGreaterThan(0);
      }
    });

    it('should reject arrays exceeding max length', async () => {
      await fc.assert(
        fc.property(
          fc.array(fc.integer({ min: -100, max: 100 }), { minLength: 101, maxLength: 150 }),
          (numbers) => {
            const input = numbers.join(',');
            const result = validateInput(input);
            
            expect(result.valid).toBe(false);
            expect(result.error).toContain('100');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject numbers outside valid range', async () => {
      // 测试超出范围的数字
      const tooLarge = `1,2,${1e9 + 1}`;
      const result1 = validateInput(tooLarge);
      expect(result1.valid).toBe(false);
      expect(result1.error).toBeDefined();

      const tooSmall = `1,2,${-1e9 - 1}`;
      const result2 = validateInput(tooSmall);
      expect(result2.valid).toBe(false);
      expect(result2.error).toBeDefined();
    });
  });
});

describe('Random Data Generation', () => {
  /**
   * **Feature: algorithm-visualizer, Property 2: 随机数据合法性**
   * *For any* 调用generateRandomData生成的数组，其长度必须在5-20之间，
   * 所有元素必须在-50到50之间。
   * **Validates: Requirements 3.5**
   */
  describe('Property 2: 随机数据合法性', () => {
    it('generated data should have valid length and values', async () => {
      // 运行100次生成测试
      for (let i = 0; i < 100; i++) {
        const data = generateRandomData();
        
        // 检查长度在5-20之间
        expect(data.length).toBeGreaterThanOrEqual(5);
        expect(data.length).toBeLessThanOrEqual(20);
        
        // 检查所有元素在-50到50之间
        data.forEach(n => {
          expect(n).toBeGreaterThanOrEqual(-50);
          expect(n).toBeLessThanOrEqual(50);
        });
      }
    });

    it('generated data should pass validation', async () => {
      for (let i = 0; i < 100; i++) {
        const data = generateRandomData();
        const input = data.join(',');
        const result = validateInput(input);
        
        expect(result.valid).toBe(true);
        expect(result.data).toEqual(data);
      }
    });
  });
});
