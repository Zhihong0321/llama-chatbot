/**
 * Property-Based Tests for API Client
 * Feature: llamaindex-rag-frontend, Property 1: API Request Construction
 * Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { get, post, del } from '../../src/api/client';
import type {
  VaultCreateRequest,
  AgentCreateRequest,
  IngestRequest,
  ChatRequest,
} from '../../src/api/types';

describe('Property 1: API Request Construction', () => {
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
   * Property: For any vault creation request, the API client should construct
   * a valid POST request to /vaults with correct headers and payload
   */
  it('constructs valid POST requests for vault creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
        }),
        async (vaultData: VaultCreateRequest) => {
          // Mock successful response
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              id: 'vault-123',
              ...vaultData,
              created_at: new Date().toISOString(),
            }),
          });

          await post('/vaults', vaultData);

          // Verify fetch was called with correct parameters
          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [url, options] = mockFetch.mock.calls[0];

          // Check URL contains /vaults endpoint
          expect(url).toContain('/vaults');

          // Check HTTP method
          expect(options.method).toBe('POST');

          // Check headers
          expect(options.headers).toEqual(
            expect.objectContaining({
              'Content-Type': 'application/json',
            })
          );

          // Check body is properly serialized
          const body = JSON.parse(options.body);
          expect(body).toEqual(vaultData);
          expect(body.name).toBe(vaultData.name);
          expect(body.description).toBe(vaultData.description);

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any agent creation request, the API client should construct
   * a valid POST request to /agents with correct headers and payload
   */
  it('constructs valid POST requests for agent creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          vault_id: fc.uuid(),
          system_prompt: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        async (agentData: AgentCreateRequest) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              agent_id: 'agent-123',
              ...agentData,
              created_at: new Date().toISOString(),
            }),
          });

          await post('/agents', agentData);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [url, options] = mockFetch.mock.calls[0];

          expect(url).toContain('/agents');
          expect(options.method).toBe('POST');
          expect(options.headers).toEqual(
            expect.objectContaining({
              'Content-Type': 'application/json',
            })
          );

          const body = JSON.parse(options.body);
          expect(body).toEqual(agentData);
          expect(body.name).toBe(agentData.name);
          expect(body.vault_id).toBe(agentData.vault_id);
          expect(body.system_prompt).toBe(agentData.system_prompt);

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any document ingestion request, the API client should construct
   * a valid POST request to /ingest with correct headers and payload
   */
  it('constructs valid POST requests for document ingestion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          text: fc.string({ minLength: 1, maxLength: 5000 }),
          title: fc.string({ minLength: 1, maxLength: 200 }),
          source: fc.string({ minLength: 1, maxLength: 500 }),
          vault_id: fc.uuid(),
          metadata: fc.option(
            fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.integer(), fc.boolean())),
            { nil: undefined }
          ),
        }),
        async (ingestData: IngestRequest) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              document_id: 'doc-123',
              task_id: 'task-456',
            }),
          });

          await post('/ingest', ingestData);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [url, options] = mockFetch.mock.calls[0];

          expect(url).toContain('/ingest');
          expect(options.method).toBe('POST');
          expect(options.headers).toEqual(
            expect.objectContaining({
              'Content-Type': 'application/json',
            })
          );

          const body = JSON.parse(options.body);
          expect(body.text).toBe(ingestData.text);
          expect(body.title).toBe(ingestData.title);
          expect(body.source).toBe(ingestData.source);
          expect(body.vault_id).toBe(ingestData.vault_id);
          if (ingestData.metadata !== undefined) {
            expect(body.metadata).toEqual(ingestData.metadata);
          }

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any chat request, the API client should construct
   * a valid POST request to /chat with correct headers and payload
   */
  it('constructs valid POST requests for chat messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          session_id: fc.uuid(),
          message: fc.string({ minLength: 1, maxLength: 2000 }),
          vault_id: fc.option(fc.uuid(), { nil: undefined }),
          agent_id: fc.option(fc.uuid(), { nil: undefined }),
          config: fc.option(
            fc.record({
              top_k: fc.option(fc.integer({ min: 1, max: 20 }), { nil: undefined }),
              temperature: fc.option(fc.float({ min: 0, max: 2 }), { nil: undefined }),
            }),
            { nil: undefined }
          ),
        }),
        async (chatData: ChatRequest) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              session_id: chatData.session_id,
              answer: 'Test response',
              sources: [],
            }),
          });

          await post('/chat', chatData);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [url, options] = mockFetch.mock.calls[0];

          expect(url).toContain('/chat');
          expect(options.method).toBe('POST');
          expect(options.headers).toEqual(
            expect.objectContaining({
              'Content-Type': 'application/json',
            })
          );

          const body = JSON.parse(options.body);
          expect(body.session_id).toBe(chatData.session_id);
          expect(body.message).toBe(chatData.message);

          // Check optional fields are included when present
          if (chatData.vault_id !== undefined) {
            expect(body.vault_id).toBe(chatData.vault_id);
          }
          if (chatData.agent_id !== undefined) {
            expect(body.agent_id).toBe(chatData.agent_id);
          }
          if (chatData.config !== undefined) {
            expect(body.config).toEqual(chatData.config);
          }

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any GET request with query parameters, the API client should
   * construct a valid URL with properly encoded query parameters
   */
  it('constructs valid GET requests with query parameters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          vault_id: fc.option(fc.uuid(), { nil: undefined }),
          limit: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
          offset: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
        }),
        async (params) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => [],
          });

          await get('/documents', params);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [url, options] = mockFetch.mock.calls[0];

          expect(url).toContain('/documents');
          expect(options.method).toBe('GET');
          expect(options.headers).toEqual(
            expect.objectContaining({
              'Content-Type': 'application/json',
            })
          );

          // Check query parameters are properly encoded in URL
          const urlObj = new URL(url);
          if (params.vault_id !== undefined) {
            expect(urlObj.searchParams.get('vault_id')).toBe(params.vault_id);
          }
          if (params.limit !== undefined) {
            expect(urlObj.searchParams.get('limit')).toBe(String(params.limit));
          }
          if (params.offset !== undefined) {
            expect(urlObj.searchParams.get('offset')).toBe(String(params.offset));
          }

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any DELETE request, the API client should construct
   * a valid DELETE request with correct headers
   */
  it('constructs valid DELETE requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.tuple(fc.constant('vaults'), fc.uuid()),
          fc.tuple(fc.constant('agents'), fc.uuid()),
          fc.tuple(fc.constant('documents'), fc.uuid())
        ),
        async ([resource, id]) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              message: 'Deleted successfully',
            }),
          });

          await del(`/${resource}/${id}`);

          expect(mockFetch).toHaveBeenCalledTimes(1);
          const [url, options] = mockFetch.mock.calls[0];

          expect(url).toContain(`/${resource}/${id}`);
          expect(options.method).toBe('DELETE');
          expect(options.headers).toEqual(
            expect.objectContaining({
              'Content-Type': 'application/json',
            })
          );

          mockFetch.mockClear();
        }
      ),
      { numRuns: 100 }
    );
  });
});
