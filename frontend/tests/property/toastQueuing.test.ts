import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../../src/context/ToastContext';
import fc from 'fast-check';
import React from 'react';

/**
 * Feature: llamaindex-rag-frontend, Property 14: Error Notification Queuing
 * Validates: Requirements 8.4
 */
describe('Property 14: Error Notification Queuing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('queues multiple error notifications without overwhelming the user', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 2, maxLength: 10 }),
        (errorMessages) => {
          const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(ToastProvider, null, children);

          const { result } = renderHook(() => useToast(), { wrapper });

          // Simulate rapid succession of errors (all within a short time window)
          act(() => {
            errorMessages.forEach((message) => {
              result.current.showToast(message, 'error');
            });
          });

          // All toasts should be queued (added to the list)
          expect(result.current.toasts.length).toBe(errorMessages.length);

          // Verify all error messages are present in the queue
          const toastMessages = result.current.toasts.map((t) => t.message);
          errorMessages.forEach((message) => {
            expect(toastMessages).toContain(message);
          });

          // Verify all toasts are of type 'error'
          result.current.toasts.forEach((toast) => {
            expect(toast.type).toBe('error');
          });

          // Verify each toast has a unique ID
          const ids = result.current.toasts.map((t) => t.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(errorMessages.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('auto-dismisses toasts after the specified duration', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 1000, max: 10000 }),
        (messages, duration) => {
          const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(ToastProvider, null, children);

          const { result } = renderHook(() => useToast(), { wrapper });

          // Add toasts with custom duration
          act(() => {
            messages.forEach((message) => {
              result.current.showToast(message, 'error', duration);
            });
          });

          // Initially, all toasts should be present
          expect(result.current.toasts.length).toBe(messages.length);

          // Fast-forward time by the duration
          act(() => {
            vi.advanceTimersByTime(duration);
          });

          // All toasts should be auto-dismissed
          expect(result.current.toasts.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('maintains toast order when queuing multiple notifications', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 3, maxLength: 8 }),
        (messages) => {
          const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(ToastProvider, null, children);

          const { result } = renderHook(() => useToast(), { wrapper });

          // Add toasts in sequence
          act(() => {
            messages.forEach((message) => {
              result.current.showToast(message, 'error');
            });
          });

          // Verify the order is maintained (FIFO)
          const toastMessages = result.current.toasts.map((t) => t.message);
          expect(toastMessages).toEqual(messages);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('allows manual dismissal of queued toasts', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 6 }),
        fc.integer({ min: 0, max: 5 }),
        (messages, indexToRemove) => {
          // Only test if the index is valid
          if (indexToRemove >= messages.length) {
            return true;
          }

          const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(ToastProvider, null, children);

          const { result } = renderHook(() => useToast(), { wrapper });

          // Add toasts
          act(() => {
            messages.forEach((message) => {
              result.current.showToast(message, 'error');
            });
          });

          const initialCount = result.current.toasts.length;
          const toastToRemove = result.current.toasts[indexToRemove];

          // Manually remove a toast
          act(() => {
            result.current.removeToast(toastToRemove.id);
          });

          // Verify the toast was removed
          expect(result.current.toasts.length).toBe(initialCount - 1);
          expect(result.current.toasts.find((t) => t.id === toastToRemove.id)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('handles different toast types in the queue', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            message: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.constantFrom('success', 'error', 'info'),
          }),
          { minLength: 2, maxLength: 8 }
        ),
        (toastData) => {
          const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(ToastProvider, null, children);

          const { result } = renderHook(() => useToast(), { wrapper });

          // Add toasts of different types
          act(() => {
            toastData.forEach(({ message, type }) => {
              result.current.showToast(message, type as 'success' | 'error' | 'info');
            });
          });

          // Verify all toasts are queued
          expect(result.current.toasts.length).toBe(toastData.length);

          // Verify each toast has the correct type
          result.current.toasts.forEach((toast, index) => {
            expect(toast.type).toBe(toastData[index].type);
            expect(toast.message).toBe(toastData[index].message);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
