/**
 * Property-Based Tests for Ingestion Polling Mechanism
 * Feature: llamaindex-rag-frontend, Property 6: Ingestion Polling Mechanism
 * Validates: Requirements 2.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { renderHook, waitFor } from '@testing-library/react';
import { useIngest, POLLING_INTERVAL } from '../../src/hooks/useIngest';
import type { IngestStatusResponse, IngestStatusType } from '../../src/api/types';

describe('Property 6: Ingestion Polling Mechanism', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  /**
   * Property: For any task_id, when polling starts, the frontend should
   * poll the status endpoint at 2-second intervals
   */
  it('polls status endpoint at 2-second intervals', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.integer({ min: 2, max: 5 }), // number of polls before completion
        async (taskId, pollCount) => {
          // Setup fresh mocks and timers for this iteration
          vi.useFakeTimers();
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          // Setup: Create mock responses for polling
          const mockResponses: IngestStatusResponse[] = [];
          
          // Create 'processing' responses
          for (let i = 0; i < pollCount; i++) {
            mockResponses.push({
              task_id: taskId,
              status: 'processing',
              progress: Math.floor((i / pollCount) * 100),
            });
          }
          
          // Final 'done' response
          mockResponses.push({
            task_id: taskId,
            status: 'done',
            progress: 100,
          });

          // Mock fetch to return responses in sequence
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

          const onProgress = vi.fn();
          const { result, unmount } = renderHook(() => useIngest());

          // Start polling
          result.current.pollStatus(taskId, onProgress);

          // Verify immediate first call
          await vi.runOnlyPendingTimersAsync();
          expect(mockFetch).toHaveBeenCalledTimes(1);

          // Advance time and verify polling at 2-second intervals
          // Note: pollCount represents the number of 'processing' responses before 'done'
          // The hook makes: 1 initial call + pollCount interval calls
          for (let i = 0; i < pollCount; i++) {
            await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
            expect(mockFetch).toHaveBeenCalledTimes(i + 2); // +2 because of initial call

            // Verify the endpoint being called
            const [url] = mockFetch.mock.calls[i + 1];
            expect(url).toContain(`/ingest/status/${taskId}`);
          }

          // Verify onProgress was called for each status update (initial + intervals)
          expect(onProgress).toHaveBeenCalledTimes(pollCount + 1);

          // Cleanup
          result.current.stopPolling();
          unmount();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any task that completes with 'done' status, polling should stop
   */
  it('stops polling when status becomes done', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.integer({ min: 0, max: 3 }), // number of polls before done
        async (taskId, pollsBeforeDone) => {
          // Setup fresh mocks and timers for this iteration
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

          const onProgress = vi.fn();
          const { result, unmount } = renderHook(() => useIngest());

          result.current.pollStatus(taskId, onProgress);

          // Wait for initial call
          await vi.runOnlyPendingTimersAsync();
          expect(mockFetch).toHaveBeenCalled();

          // Advance through all polling intervals
          // pollsBeforeDone = number of 'processing' responses
          // Total calls = 1 initial + pollsBeforeDone intervals + 1 final 'done'
          for (let i = 0; i < pollsBeforeDone; i++) {
            await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
            expect(mockFetch).toHaveBeenCalledTimes(i + 2);
          }

          // One more interval to get the 'done' response
          await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
          const totalCalls = pollsBeforeDone + 2; // initial + pollsBeforeDone + done
          expect(mockFetch).toHaveBeenCalledTimes(totalCalls);

          // Advance time further and verify no more calls are made (polling stopped)
          await vi.advanceTimersByTimeAsync(POLLING_INTERVAL * 3);
          expect(mockFetch).toHaveBeenCalledTimes(totalCalls);

          result.current.stopPolling();
          unmount();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any task that fails with 'failed' status, polling should stop
   */
  it('stops polling when status becomes failed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.integer({ min: 0, max: 3 }), // number of polls before failure
        fc.string({ minLength: 1, maxLength: 200 }), // error message
        async (taskId, pollsBeforeFailure, errorMessage) => {
          // Setup fresh mocks and timers for this iteration
          vi.useFakeTimers();
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          const mockResponses: IngestStatusResponse[] = [];

          // Create 'processing' responses
          for (let i = 0; i < pollsBeforeFailure; i++) {
            mockResponses.push({
              task_id: taskId,
              status: 'processing',
              progress: Math.floor((i / (pollsBeforeFailure + 1)) * 100),
            });
          }

          // Final 'failed' response
          mockResponses.push({
            task_id: taskId,
            status: 'failed',
            progress: 0,
            error: errorMessage,
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

          const onProgress = vi.fn();
          const { result, unmount } = renderHook(() => useIngest());

          result.current.pollStatus(taskId, onProgress);

          // Wait for initial call
          await vi.runOnlyPendingTimersAsync();
          expect(mockFetch).toHaveBeenCalled();

          // Advance through all polling intervals
          // pollsBeforeFailure = number of 'processing' responses
          // Total calls = 1 initial + pollsBeforeFailure intervals + 1 final 'failed'
          for (let i = 0; i < pollsBeforeFailure; i++) {
            await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
            expect(mockFetch).toHaveBeenCalledTimes(i + 2);
          }

          // One more interval to get the 'failed' response
          await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
          const totalCalls = pollsBeforeFailure + 2; // initial + pollsBeforeFailure + failed
          expect(mockFetch).toHaveBeenCalledTimes(totalCalls);

          // Advance time further and verify no more calls are made (polling stopped)
          await vi.advanceTimersByTimeAsync(POLLING_INTERVAL * 3);
          expect(mockFetch).toHaveBeenCalledTimes(totalCalls);

          // Verify error was captured
          expect(result.current.error).toBe(errorMessage);

          result.current.stopPolling();
          unmount();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any task_id, the onProgress callback should be called
   * with the status response for each poll
   */
  it('calls onProgress callback with status for each poll', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.array(
          fc.record({
            status: fc.constantFrom<IngestStatusType>('queued', 'processing'),
            progress: fc.integer({ min: 0, max: 99 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (taskId, intermediateStatuses) => {
          // Setup fresh mocks and timers for this iteration
          vi.useFakeTimers();
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          const mockResponses: IngestStatusResponse[] = intermediateStatuses.map(
            (status) => ({
              task_id: taskId,
              ...status,
            })
          );

          // Add final 'done' status
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

          const onProgress = vi.fn();
          const { result, unmount } = renderHook(() => useIngest());

          result.current.pollStatus(taskId, onProgress);

          // Wait for initial call
          await vi.runOnlyPendingTimersAsync();
          expect(onProgress).toHaveBeenCalledTimes(1);

          // Advance through all polling intervals
          // intermediateStatuses.length = number of intermediate responses
          // We need to advance enough times to get all intermediate + final 'done'
          for (let i = 0; i < intermediateStatuses.length; i++) {
            await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
            expect(onProgress).toHaveBeenCalledTimes(i + 2);
          }

          // One more interval to get the 'done' response
          await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
          
          // Verify onProgress was called with correct status objects
          // Total: 1 initial + intermediateStatuses.length + 1 done = mockResponses.length
          expect(onProgress).toHaveBeenCalledTimes(mockResponses.length);
          
          mockResponses.forEach((expectedStatus, index) => {
            const actualCall = onProgress.mock.calls[index][0];
            expect(actualCall.task_id).toBe(expectedStatus.task_id);
            expect(actualCall.status).toBe(expectedStatus.status);
            expect(actualCall.progress).toBe(expectedStatus.progress);
          });

          result.current.stopPolling();
          unmount();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any task_id, calling stopPolling should immediately
   * stop all polling activity
   */
  it('stops polling immediately when stopPolling is called', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.integer({ min: 1, max: 3 }), // polls before stopping
        async (taskId, pollsBeforeStop) => {
          // Setup fresh mocks and timers for this iteration
          vi.useFakeTimers();
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          mockFetch.mockImplementation(() =>
            Promise.resolve({
              ok: true,
              status: 200,
              json: async () => ({
                task_id: taskId,
                status: 'processing',
                progress: 50,
              }),
            })
          );

          const onProgress = vi.fn();
          const { result, unmount } = renderHook(() => useIngest());

          result.current.pollStatus(taskId, onProgress);

          // Wait for initial call
          await vi.runOnlyPendingTimersAsync();
          expect(mockFetch).toHaveBeenCalled();

          // Advance through some polling intervals
          // pollsBeforeStop = number of interval polls before stopping
          // Total calls = 1 initial + pollsBeforeStop intervals
          for (let i = 0; i < pollsBeforeStop; i++) {
            await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
            expect(mockFetch).toHaveBeenCalledTimes(i + 2);
          }

          const callsBeforeStop = pollsBeforeStop + 1; // initial + intervals

          // Stop polling
          result.current.stopPolling();

          // Advance time and verify no more calls
          await vi.advanceTimersByTimeAsync(POLLING_INTERVAL * 5);
          expect(mockFetch).toHaveBeenCalledTimes(callsBeforeStop);

          unmount();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
