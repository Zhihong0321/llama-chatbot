/**
 * Property-Based Tests for Clipboard Copy with Notification
 * Feature: llamaindex-rag-frontend, Property 11: Clipboard Copy with Notification
 * Validates: Requirements 7.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fc from 'fast-check';
import { AgentCURLSnippet } from '../../src/components/agent/AgentCURLSnippet';
import { ToastProvider } from '../../src/context/ToastContext';
import React from 'react';

describe('Property 11: Clipboard Copy with Notification', () => {
  // Mock is set up in tests/setup.ts and reset before each test

  /**
   * Property: For any agent ID, when the user clicks the copy button,
   * the cURL command should be copied to the clipboard and a success
   * toast notification should be displayed
   * 
   * Note: Reduced to 10 iterations to avoid DOM accumulation issues with React Testing Library
   */
  it('copies cURL command to clipboard and shows toast notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          agentId: fc.uuid(),
          agentName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        }),
        async ({ agentId, agentName }) => {
          cleanup(); // Clean up before each iteration
          const user = userEvent.setup();

          // Render component with ToastProvider
          const { container, unmount } = render(
            <ToastProvider>
              <AgentCURLSnippet agentId={agentId} agentName={agentName} />
            </ToastProvider>
          );

          // Find and click the copy button within this specific container
          const copyButton = within(container).getByRole('button', {
            name: /copy curl command/i,
          });
          expect(copyButton).toBeInTheDocument();

          await user.click(copyButton);

          // Verify clipboard.writeText was called
          await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
          }, { timeout: 3000 });

          // Verify the copied text contains the agent ID
          const mockWriteText = navigator.clipboard.writeText as any;
          const copiedText = mockWriteText.mock.calls[0][0];
          expect(copiedText).toContain(agentId);
          expect(copiedText).toContain('curl');
          expect(copiedText).toContain('/chat');

          // Verify toast notification appears
          await waitFor(() => {
            const toast = screen.getByRole('alert');
            expect(toast).toBeInTheDocument();
            expect(toast).toHaveTextContent(/copied/i);
          }, { timeout: 3000 });

          // Verify button shows "Copied!" state
          await waitFor(() => {
            expect(copyButton).toHaveTextContent(/copied/i);
          }, { timeout: 3000 });

          unmount();
          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: For any copyable content, when the copy operation succeeds,
   * the system clipboard should contain the exact text that was requested
   * to be copied
   * 
   * Note: Reduced to 10 iterations to avoid DOM accumulation issues with React Testing Library
   */
  it('copies exact text to clipboard without modification', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (agentId: string) => {
        cleanup(); // Clean up before each iteration
        const user = userEvent.setup();

        const { container, unmount } = render(
          <ToastProvider>
            <AgentCURLSnippet agentId={agentId} />
          </ToastProvider>
        );

        const copyButton = within(container).getByRole('button', { name: /copy curl command/i });
        await user.click(copyButton);

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
        }, { timeout: 3000 });

        // Get the copied text
        const mockWriteText = navigator.clipboard.writeText as any;
        const copiedText = mockWriteText.mock.calls[0][0];

        // Verify it's a valid cURL command
        expect(copiedText).toContain('curl');
        expect(copiedText).toContain('-X POST');
        expect(copiedText).toContain('/chat');
        expect(copiedText).toContain(agentId);

        // Verify it contains proper JSON structure
        expect(copiedText).toContain('session_id');
        expect(copiedText).toContain('message');
        expect(copiedText).toContain('agent_id');

        unmount();
        cleanup();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: For any copy operation, when clipboard API fails,
   * an error toast notification should be displayed
   * 
   * Note: Reduced to 10 iterations to avoid DOM accumulation issues with React Testing Library
   */
  it('shows error toast when clipboard copy fails', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (agentId: string) => {
        cleanup(); // Clean up before each iteration
        const user = userEvent.setup();

        // Mock clipboard failure
        (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error('Clipboard access denied'));

        const { container, unmount } = render(
          <ToastProvider>
            <AgentCURLSnippet agentId={agentId} />
          </ToastProvider>
        );

        const copyButton = within(container).getByRole('button', { name: /copy curl command/i });
        await user.click(copyButton);

        // Verify error toast appears
        await waitFor(() => {
          const toast = screen.getByRole('alert');
          expect(toast).toBeInTheDocument();
          expect(toast).toHaveTextContent(/failed/i);
        }, { timeout: 3000 });

        unmount();
        cleanup();
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: For any successful copy operation, the toast notification
   * should appear and be accessible to screen readers via role="alert"
   * 
   * Note: Reduced to 10 iterations to avoid DOM accumulation issues with React Testing Library
   */
  it('displays accessible toast notification for successful copy', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          agentId: fc.uuid(),
          agentName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        }),
        async ({ agentId, agentName }) => {
          cleanup(); // Clean up before each iteration
          const user = userEvent.setup();

          const { container, unmount } = render(
            <ToastProvider>
              <AgentCURLSnippet agentId={agentId} agentName={agentName} />
            </ToastProvider>
          );

          const copyButton = within(container).getByRole('button', { name: /copy curl command/i });
          await user.click(copyButton);

          // Wait for toast to appear
          await waitFor(() => {
            const alerts = screen.getAllByRole('alert');
            expect(alerts.length).toBeGreaterThan(0);

            // Find the success toast
            const successToast = alerts.find((alert) =>
              alert.textContent?.toLowerCase().includes('copied')
            );
            expect(successToast).toBeDefined();
          }, { timeout: 3000 });

          unmount();
          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: For any copy button, clicking it multiple times in succession
   * should copy to clipboard each time and show notification each time
   * 
   * Note: Reduced to 5 iterations to avoid DOM accumulation issues with React Testing Library
   */
  it('handles multiple copy operations correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 2, max: 3 }),
        async (agentId: string, clickCount: number) => {
          cleanup(); // Clean up before each iteration
          const user = userEvent.setup();

          const { container, unmount } = render(
            <ToastProvider>
              <AgentCURLSnippet agentId={agentId} />
            </ToastProvider>
          );

          const copyButton = within(container).getByRole('button', { name: /copy curl command/i });

          // Click multiple times
          for (let i = 0; i < clickCount; i++) {
            await user.click(copyButton);

            // Wait for clipboard to be called
            await waitFor(() => {
              expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(i + 1);
            }, { timeout: 3000 });

            // Small delay between clicks
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Verify clipboard was called the correct number of times
          expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(clickCount);

          // Verify all calls had the same content
          const mockWriteText = navigator.clipboard.writeText as any;
          const calls = mockWriteText.mock.calls;
          const firstCall = calls[0][0];
          calls.forEach((call) => {
            expect(call[0]).toBe(firstCall);
          });

          unmount();
          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  });
});
