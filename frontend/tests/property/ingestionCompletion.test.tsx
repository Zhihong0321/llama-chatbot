/**
 * Property-Based Tests for Ingestion Completion Handling
 * Feature: llamaindex-rag-frontend, Property 8: Ingestion Completion Handling
 * Validates: Requirements 2.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, waitFor, cleanup } from '@testing-library/react';
import { IngestProgressBar } from '../../src/components/document/IngestProgressBar';
import type { IngestStatusResponse } from '../../src/api/types';

describe('Property 8: Ingestion Completion Handling', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  /**
   * Property: For any ingestion task, when the status becomes "done",
   * the Frontend should display a success notification and refresh the document list
   */
  it('calls onComplete callback when status becomes done', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.integer({ min: 0, max: 3 }), // number of polls before done
        async (taskId, pollsBeforeDone) => {
          vi.useFakeTimers();
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          const mockResponses: IngestStatusResponse[] = [];

          // Create 'processing' responses
          for (let i = 0; i < pollsBeforeDone; i++) {
            mockResponses.push({
              task_id: taskId,
              status: 'processing',
              progress: Math.floor((i / (pollsBeforeDone + 1)) * 100),
            });
          }

          // Final 'done' response
          mockResponses.push({
            task_id: taskId,
            status: 'done',
            progress: 100,
          });

          let callIndex = 0;
          mockFetch.mockImplementation(() => {
            const response = mockResponses[callIndex];
            callIndex++;
            return Promise.resolve({
              ok: true,
              status: 200,
              json: async () => response,
            });
          });

          const onComplete = vi.fn();
          const onError = vi.fn();

          render(
            <IngestProgressBar
              taskId={taskId}
              onComplete={onComplete}
              onError={onError}
            />
          );

          // Wait for initial call
          await vi.runOnlyPendingTimersAsync();

          // Advance through all polling intervals until done
          for (let i = 0; i < pollsBeforeDone; i++) {
            await vi.advanceTimersByTimeAsync(2000); // POLLING_INTERVAL
            await vi.runOnlyPendingTimersAsync();
          }

          // Advance time to allow completion to be processed
          await vi.runOnlyPendingTimersAsync();

          // Verify onComplete was called
          expect(onComplete).toHaveBeenCalledTimes(1);
          
          // Verify onError was not called
          expect(onError).not.toHaveBeenCalled();

          cleanup();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any ingestion task that completes successfully,
   * onComplete should be called exactly once
   */
  it('calls onComplete exactly once per successful ingestion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        async (taskId) => {
          vi.useFakeTimers();
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          // Return 'done' status immediately
          mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
              task_id: taskId,
              status: 'done',
              progress: 100,
            }),
          });

          const onComplete = vi.fn();
          const onError = vi.fn();

          render(
            <IngestProgressBar
              taskId={taskId}
              onComplete={onComplete}
              onError={onError}
            />
          );

          // Wait for initial call
          await vi.runOnlyPendingTimersAsync();

          // Advance time further to ensure no additional calls
          await vi.advanceTimersByTimeAsync(10000);
          await vi.runOnlyPendingTimersAsync();

          // Verify onComplete was called exactly once
          expect(onComplete).toHaveBeenCalledTimes(1);
          expect(onError).not.toHaveBeenCalled();

          cleanup();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any ingestion task, when status becomes "done",
   * the component should display completion status
   */
  it('displays completion status when ingestion is done', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        async (taskId) => {
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
              task_id: taskId,
              status: 'done',
              progress: 100,
            }),
          });

          const onComplete = vi.fn();
          const onError = vi.fn();

          const { container } = render(
            <IngestProgressBar
              taskId={taskId}
              onComplete={onComplete}
              onError={onError}
            />
          );

          // Wait for status to be fetched and displayed
          await waitFor(() => {
            const statusText = container.querySelector('[class*="statusText"]');
            expect(statusText?.textContent).toContain('complete');
          });

          // Verify progress is at 100%
          const progressBar = container.querySelector('[role="progressbar"]');
          expect(progressBar?.getAttribute('aria-valuenow')).toBe('100');

          cleanup();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any ingestion task sequence ending in "done",
   * onComplete should be called after the final status update
   */
  it('calls onComplete after final done status update', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.array(fc.integer({ min: 0, max: 99 }), { minLength: 1, maxLength: 5 }).map(arr =>
          arr.sort((a, b) => a - b) // Ensure ascending order
        ),
        async (taskId, progressSequence) => {
          vi.useFakeTimers();
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          const mockResponses: IngestStatusResponse[] = progressSequence.map(progress => ({
            task_id: taskId,
            status: 'processing',
            progress,
          }));

          // Add final 'done' status
          mockResponses.push({
            task_id: taskId,
            status: 'done',
            progress: 100,
          });

          let callIndex = 0;
          mockFetch.mockImplementation(() => {
            const response = mockResponses[callIndex];
            callIndex = Math.min(callIndex + 1, mockResponses.length - 1);
            return Promise.resolve({
              ok: true,
              status: 200,
              json: async () => response,
            });
          });

          const onComplete = vi.fn();
          const onError = vi.fn();

          render(
            <IngestProgressBar
              taskId={taskId}
              onComplete={onComplete}
              onError={onError}
            />
          );

          // Wait for initial call
          await vi.runOnlyPendingTimersAsync();

          // Advance through all polling intervals
          for (let i = 0; i < progressSequence.length; i++) {
            await vi.advanceTimersByTimeAsync(2000);
            await vi.runOnlyPendingTimersAsync();
          }

          // Advance time to allow completion to be processed
          await vi.runOnlyPendingTimersAsync();

          // Verify onComplete was called exactly once
          expect(onComplete).toHaveBeenCalledTimes(1);
          expect(onError).not.toHaveBeenCalled();

          cleanup();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any ingestion task, completion should stop polling
   */
  it('stops polling after completion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        async (taskId) => {
          vi.useFakeTimers();
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
              task_id: taskId,
              status: 'done',
              progress: 100,
            }),
          });

          const onComplete = vi.fn();
          const onError = vi.fn();

          render(
            <IngestProgressBar
              taskId={taskId}
              onComplete={onComplete}
              onError={onError}
            />
          );

          // Wait for initial call
          await vi.runOnlyPendingTimersAsync();

          // Verify completion was called
          expect(onComplete).toHaveBeenCalled();

          const callsAfterCompletion = mockFetch.mock.calls.length;

          // Advance time significantly
          await vi.advanceTimersByTimeAsync(10000);
          await vi.runOnlyPendingTimersAsync();

          // Verify no additional API calls were made
          expect(mockFetch).toHaveBeenCalledTimes(callsAfterCompletion);

          cleanup();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
