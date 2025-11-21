/**
 * Property-Based Tests for Progress Display
 * Feature: llamaindex-rag-frontend, Property 7: Progress Display
 * Validates: Requirements 2.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { IngestProgressBar } from '../../src/components/document/IngestProgressBar';
import type { IngestStatusResponse } from '../../src/api/types';

describe('Property 7: Progress Display', () => {
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
   * Property: For any ingestion status response with progress value between 0 and 100,
   * the Frontend should update the progress bar to reflect that percentage
   */
  it('updates progress bar to reflect percentage from status response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.integer({ min: 0, max: 100 }), // progress value
        async (taskId, progressValue) => {
          // Setup mock fetch
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          const mockStatus: IngestStatusResponse = {
            task_id: taskId,
            status: 'processing',
            progress: progressValue,
          };

          mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockStatus,
          });

          const onComplete = vi.fn();
          const onError = vi.fn();

          // Render component
          const { container } = render(
            <IngestProgressBar
              taskId={taskId}
              onComplete={onComplete}
              onError={onError}
            />
          );

          // Wait for the component to fetch and display the status
          await waitFor(
            () => {
              const progressBar = container.querySelector('[role="progressbar"]');
              expect(progressBar).toBeTruthy();
            },
            { timeout: 3000 }
          );

          // Verify progress bar has correct aria-valuenow
          const progressBar = container.querySelector('[role="progressbar"]');
          expect(progressBar).toBeTruthy();
          
          if (progressBar) {
            const ariaValueNow = progressBar.getAttribute('aria-valuenow');
            expect(ariaValueNow).toBe(String(progressValue));

            // Verify the visual representation (width of fill)
            const fill = progressBar.querySelector('[class*="fill"]');
            if (fill) {
              const style = (fill as HTMLElement).style.width;
              // Use Math.round to handle floating point precision
              const actualWidth = parseFloat(style);
              expect(Math.round(actualWidth)).toBe(progressValue);
            }
          }

          // Verify percentage is displayed in the UI
          const expectedPercentage = Math.round(progressValue);
          await waitFor(() => {
            const percentageElement = container.querySelector('[class*="percentage"]');
            const displayedText = percentageElement?.textContent?.trim() || '';
            // Extract just the number from the text (e.g., "7%" -> 7)
            const displayedPercentage = parseInt(displayedText);
            expect(displayedPercentage).toBe(expectedPercentage);
          });

          cleanup();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any sequence of progress updates, the progress bar should
   * reflect each update in order
   */
  it('reflects progress updates in sequence', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.array(fc.integer({ min: 0, max: 99 }), { minLength: 2, maxLength: 5 }).map(arr => 
          arr.sort((a, b) => a - b) // Ensure ascending order
        ),
        async (taskId, progressSequence) => {
          vi.useFakeTimers();
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          // Create mock responses for each progress value
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

          const { container } = render(
            <IngestProgressBar
              taskId={taskId}
              onComplete={onComplete}
              onError={onError}
            />
          );

          // Wait for initial render
          await vi.runOnlyPendingTimersAsync();

          // Verify each progress update
          for (let i = 0; i < progressSequence.length; i++) {
            await vi.advanceTimersByTimeAsync(2000); // POLLING_INTERVAL
            await vi.runOnlyPendingTimersAsync();

            const progressBar = container.querySelector('[role="progressbar"]');
            if (progressBar) {
              const ariaValueNow = progressBar.getAttribute('aria-valuenow');
              expect(Number(ariaValueNow)).toBeGreaterThanOrEqual(progressSequence[i]);
            }
          }

          cleanup();
          vi.useRealTimers();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any progress value, the displayed percentage should match
   * the rounded progress value
   */
  it('displays rounded percentage matching progress value', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.integer({ min: 0, max: 100 }), // progress value
        async (taskId, progressValue) => {
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          const mockStatus: IngestStatusResponse = {
            task_id: taskId,
            status: 'processing',
            progress: progressValue,
          };

          mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockStatus,
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
          await waitFor(
            () => {
              const expectedPercentage = `${Math.round(progressValue)}%`;
              const percentageElement = container.querySelector('[class*="percentage"]');
              expect(percentageElement?.textContent).toContain(expectedPercentage);
            },
            { timeout: 3000 }
          );

          cleanup();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any progress value at boundaries (0, 100), the progress bar
   * should correctly display those values
   */
  it('correctly displays boundary progress values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.constantFrom(0, 100), // boundary values
        async (taskId, progressValue) => {
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          const status = progressValue === 100 ? 'done' : 'queued';
          const mockStatus: IngestStatusResponse = {
            task_id: taskId,
            status,
            progress: progressValue,
          };

          mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockStatus,
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

          await waitFor(
            () => {
              const progressBar = container.querySelector('[role="progressbar"]');
              expect(progressBar).toBeTruthy();
            },
            { timeout: 3000 }
          );

          const progressBar = container.querySelector('[role="progressbar"]');
          if (progressBar) {
            const ariaValueNow = progressBar.getAttribute('aria-valuenow');
            expect(ariaValueNow).toBe(String(progressValue));

            const fill = progressBar.querySelector('[class*="fill"]');
            if (fill) {
              const style = (fill as HTMLElement).style.width;
              expect(style).toBe(`${progressValue}%`);
            }
          }

          // Verify percentage text
          const percentageText = `${progressValue}%`;
          await waitFor(() => {
            const percentageElement = container.querySelector('[class*="percentage"]');
            expect(percentageElement?.textContent).toContain(percentageText);
          });

          cleanup();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: For any progress value, the progress bar should have proper
   * accessibility attributes
   */
  it('maintains accessibility attributes for all progress values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // task_id
        fc.integer({ min: 0, max: 100 }), // progress value
        async (taskId, progressValue) => {
          const mockFetch = vi.fn();
          globalThis.fetch = mockFetch as any;

          const mockStatus: IngestStatusResponse = {
            task_id: taskId,
            status: 'processing',
            progress: progressValue,
          };

          mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockStatus,
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

          await waitFor(
            () => {
              const progressBar = container.querySelector('[role="progressbar"]');
              expect(progressBar).toBeTruthy();
            },
            { timeout: 3000 }
          );

          const progressBar = container.querySelector('[role="progressbar"]');
          expect(progressBar).toBeTruthy();

          if (progressBar) {
            // Verify required ARIA attributes
            expect(progressBar.getAttribute('role')).toBe('progressbar');
            expect(progressBar.getAttribute('aria-valuenow')).toBe(String(progressValue));
            expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
            expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
            expect(progressBar.getAttribute('aria-live')).toBe('polite');
            expect(progressBar.getAttribute('aria-label')).toBeTruthy();
          }

          cleanup();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
