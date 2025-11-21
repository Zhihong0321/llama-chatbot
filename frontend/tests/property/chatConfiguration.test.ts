/**
 * Property-Based Tests for Chat Configuration
 * Feature: llamaindex-rag-frontend, Property 13: Chat Configuration Inclusion
 * Validates: Requirements 4.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { sendChatMessage } from '../../src/api/chat';
import type { ChatRequest } from '../../src/api/types';

describe('Property 13: Chat Configuration Inclusion', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  /**
   * Property: For any chat request with configuration specified, the request payload
   * should include the config object with top_k and temperature parameters
   */
  it('includes config object in chat request when specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          session_id: fc.uuid(),
          message: fc.string({ minLength: 1, maxLength: 500 }),
          vault_id: fc.option(fc.uuid(), { nil: undefined }),
          agent_id: fc.option(fc.uuid(), { nil: undefined }),
          config: fc.record({
            top_k: fc.option(fc.integer({ min: 1, max: 20 }), { nil: undefined }),
            temperature: fc.option(fc.float({ min: Math.fround(0.001), max: 2, noNaN: true }), { nil: undefined }),
          }),
        }),
        async (chatRequest: ChatRequest) => {
          // Skip if both config values are undefined
          if (chatRequest.config.top_k === undefined && chatRequest.config.temperature === undefined) {
            return true;
          }

          // Mock successful response
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              session_id: chatRequest.session_id,
              answer: 'Test response',
              sources: [],
            }),
          });

          await sendChatMessage(chatRequest);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [, options] = mockFetch.mock.calls[0];

          const body = JSON.parse(options.body);
          
          // Verify config object is included
          expect(body.config).toBeDefined();
          expect(typeof body.config).toBe('object');
          
          // Verify top_k is included if specified
          if (chatRequest.config.top_k !== undefined) {
            expect(body.config.top_k).toBe(chatRequest.config.top_k);
            expect(typeof body.config.top_k).toBe('number');
            expect(body.config.top_k).toBeGreaterThanOrEqual(1);
            expect(body.config.top_k).toBeLessThanOrEqual(20);
          }
          
          // Verify temperature is included if specified
          if (chatRequest.config.temperature !== undefined) {
            expect(body.config.temperature).toBeDefined();
            expect(typeof body.config.temperature).toBe('number');
            expect(body.config.temperature).toBeGreaterThanOrEqual(0);
            expect(body.config.temperature).toBeLessThanOrEqual(2);
          }

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any chat request with both top_k and temperature specified,
   * both parameters should be present in the config object
   */
  it('includes both top_k and temperature when both are specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          session_id: fc.uuid(),
          message: fc.string({ minLength: 1, maxLength: 500 }),
          vault_id: fc.option(fc.uuid(), { nil: undefined }),
          agent_id: fc.option(fc.uuid(), { nil: undefined }),
          config: fc.record({
            top_k: fc.integer({ min: 1, max: 20 }),
            temperature: fc.float({ min: Math.fround(0.001), max: 2, noNaN: true }),
          }),
        }),
        async (chatRequest: ChatRequest) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              session_id: chatRequest.session_id,
              answer: 'Test response',
              sources: [],
            }),
          });

          await sendChatMessage(chatRequest);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [, options] = mockFetch.mock.calls[0];
          const body = JSON.parse(options.body);
          
          // Both parameters should be present
          expect(body.config).toBeDefined();
          expect(body.config.top_k).toBe(chatRequest.config.top_k);
          expect(body.config.temperature).toBeDefined();
          expect(typeof body.config.temperature).toBe('number');
          // Use tolerance for floating point comparison
          expect(Math.abs(body.config.temperature - chatRequest.config.temperature)).toBeLessThan(0.01);

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any chat request without config specified, the request
   * should still be valid (config is optional)
   */
  it('handles chat requests without config object', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          session_id: fc.uuid(),
          message: fc.string({ minLength: 1, maxLength: 500 }),
          vault_id: fc.option(fc.uuid(), { nil: undefined }),
          agent_id: fc.option(fc.uuid(), { nil: undefined }),
        }),
        async (chatRequest: Omit<ChatRequest, 'config'>) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              session_id: chatRequest.session_id,
              answer: 'Test response',
              sources: [],
            }),
          });

          await sendChatMessage(chatRequest as ChatRequest);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [, options] = mockFetch.mock.calls[0];

          const body = JSON.parse(options.body);
          
          // Request should be valid without config
          expect(body.session_id).toBe(chatRequest.session_id);
          expect(body.message).toBe(chatRequest.message);

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any chat request with partial config (only top_k or only temperature),
   * the specified parameter should be included while the other may be omitted
   */
  it('handles partial config with only top_k specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          session_id: fc.uuid(),
          message: fc.string({ minLength: 1, maxLength: 500 }),
          vault_id: fc.option(fc.uuid(), { nil: undefined }),
          agent_id: fc.option(fc.uuid(), { nil: undefined }),
          config: fc.record({
            top_k: fc.integer({ min: 1, max: 20 }),
          }),
        }),
        async (chatRequest: ChatRequest) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              session_id: chatRequest.session_id,
              answer: 'Test response',
              sources: [],
            }),
          });

          await sendChatMessage(chatRequest);

          const [, options] = mockFetch.mock.calls[0];
          const body = JSON.parse(options.body);
          
          // top_k should be present
          expect(body.config).toBeDefined();
          expect(body.config.top_k).toBe(chatRequest.config.top_k);

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any chat request with partial config (only temperature),
   * the specified parameter should be included
   */
  it('handles partial config with only temperature specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          session_id: fc.uuid(),
          message: fc.string({ minLength: 1, maxLength: 500 }),
          vault_id: fc.option(fc.uuid(), { nil: undefined }),
          agent_id: fc.option(fc.uuid(), { nil: undefined }),
          config: fc.record({
            // Exclude very small values and NaN to avoid edge cases with JSON serialization
            temperature: fc.float({ min: Math.fround(0.001), max: 2, noNaN: true }),
          }),
        }),
        async (chatRequest: ChatRequest) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              session_id: chatRequest.session_id,
              answer: 'Test response',
              sources: [],
            }),
          });

          await sendChatMessage(chatRequest);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [, options] = mockFetch.mock.calls[0];
          const body = JSON.parse(options.body);
          
          // temperature should be present
          expect(body.config).toBeDefined();
          expect(body.config.temperature).toBeDefined();
          expect(typeof body.config.temperature).toBe('number');
          
          // Use closeTo for floating point comparison
          expect(Math.abs(body.config.temperature - chatRequest.config.temperature)).toBeLessThan(0.01);

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });
});
