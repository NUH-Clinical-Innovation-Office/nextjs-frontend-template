import { describe, expect, it } from 'vitest';
import { add, formatName } from './utils';

describe('utils', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });

    it('should add positive and negative numbers', () => {
      expect(add(5, -3)).toBe(2);
    });

    it('should handle zero', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('formatName', () => {
    it('should capitalize the first letter', () => {
      expect(formatName('john')).toBe('John');
    });

    it('should lowercase the rest of the string', () => {
      expect(formatName('JOHN')).toBe('John');
    });

    it('should handle mixed case', () => {
      expect(formatName('jOhN')).toBe('John');
    });

    it('should handle empty string', () => {
      expect(formatName('')).toBe('');
    });

    it('should handle single character', () => {
      expect(formatName('j')).toBe('J');
    });
  });
});
