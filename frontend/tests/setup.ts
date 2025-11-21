import { afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create mock functions that we can reference
const mockWriteText = vi.fn();
const mockReadText = vi.fn();

// Mock clipboard API globally
beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
      readText: mockReadText,
    },
    writable: true,
    configurable: true,
  });
});

// Reset mock implementations before each test
beforeEach(() => {
  mockWriteText.mockReset().mockResolvedValue(undefined);
  mockReadText.mockReset().mockResolvedValue('');
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
