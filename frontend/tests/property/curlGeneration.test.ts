/**
 * Property-Based Tests for cURL Generation
 * Feature: llamaindex-rag-frontend, Property 10: cURL Generation
 * Validates: Requirements 3.5, 7.1, 7.2, 7.4, 7.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  generateVaultCreateCurl,
  generateIngestCurl,
  generateAgentCreateCurl,
  generateAgentChatCurl,
  generateVaultChatCurl,
  generateGetAgentsCurl,
  generateDeleteAgentCurl,
} from '../../src/utils/curlGenerator';
import type {
  VaultCreateRequest,
  AgentCreateRequest,
  IngestRequest,
} from '../../src/api/types';

describe('Property 10: cURL Generation', () => {
  /**
   * Property: For any vault creation data, the generated cURL command should
   * include the correct HTTP method (POST), endpoint (/vaults), headers, and
   * properly formatted JSON payload with actual values
   */
  it('generates valid cURL commands for vault creation', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
        }),
        (vaultData: VaultCreateRequest) => {
          const curlCommand = generateVaultCreateCurl(vaultData);

          // Check it's a curl command
          expect(curlCommand).toContain('curl');

          // Check HTTP method
          expect(curlCommand).toContain('-X POST');

          // Check endpoint
          expect(curlCommand).toContain('/vaults');

          // Check headers
          expect(curlCommand).toContain('-H "Content-Type: application/json"');

          // Check payload flag
          expect(curlCommand).toContain("-d '");

          // Check actual data is included (accounting for JSON escaping)
          const jsonPayload = JSON.stringify(vaultData);
          // The curl command should contain the JSON-escaped versions of the data
          expect(curlCommand).toContain(JSON.stringify(vaultData.name).slice(1, -1));
          expect(curlCommand).toContain(JSON.stringify(vaultData.description).slice(1, -1));

          // Check proper formatting with line breaks
          expect(curlCommand).toContain('\\');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any agent creation data, the generated cURL command should
   * include the correct HTTP method (POST), endpoint (/agents), headers, and
   * properly formatted JSON payload with actual resource IDs
   */
  it('generates valid cURL commands for agent creation', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          vault_id: fc.uuid(),
          system_prompt: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        (agentData: AgentCreateRequest) => {
          const curlCommand = generateAgentCreateCurl(agentData);

          // Check it's a curl command
          expect(curlCommand).toContain('curl');

          // Check HTTP method
          expect(curlCommand).toContain('-X POST');

          // Check endpoint
          expect(curlCommand).toContain('/agents');

          // Check headers
          expect(curlCommand).toContain('-H "Content-Type: application/json"');

          // Check payload flag
          expect(curlCommand).toContain("-d '");

          // Check actual data is included (validates requirement 7.4)
          // Account for JSON escaping
          expect(curlCommand).toContain(JSON.stringify(agentData.name).slice(1, -1));
          expect(curlCommand).toContain(agentData.vault_id);
          expect(curlCommand).toContain(JSON.stringify(agentData.system_prompt).slice(1, -1));

          // Check proper formatting with line breaks (validates requirement 7.5)
          expect(curlCommand).toContain('\\');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any document ingestion data, the generated cURL command should
   * include the correct HTTP method (POST), endpoint (/ingest), headers, and
   * properly formatted JSON payload with actual vault_id
   */
  it('generates valid cURL commands for document ingestion', () => {
    fc.assert(
      fc.property(
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
        (ingestData: IngestRequest) => {
          const curlCommand = generateIngestCurl(ingestData);

          // Check it's a curl command
          expect(curlCommand).toContain('curl');

          // Check HTTP method
          expect(curlCommand).toContain('-X POST');

          // Check endpoint
          expect(curlCommand).toContain('/ingest');

          // Check headers
          expect(curlCommand).toContain('-H "Content-Type: application/json"');

          // Check payload flag
          expect(curlCommand).toContain("-d '");

          // Check actual data is included (accounting for JSON escaping)
          expect(curlCommand).toContain(ingestData.vault_id);
          expect(curlCommand).toContain(JSON.stringify(ingestData.title).slice(1, -1));
          expect(curlCommand).toContain(JSON.stringify(ingestData.source).slice(1, -1));

          // Check proper formatting with line breaks
          expect(curlCommand).toContain('\\');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any agent ID, the generated cURL command for chatting should
   * include the correct HTTP method (POST), endpoint (/chat), headers, and
   * properly formatted JSON payload with the actual agent_id
   * (validates requirements 7.1, 7.2, 7.4)
   */
  it('generates valid cURL commands for agent chat with actual agent_id', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        (agentId: string, message: string) => {
          const curlCommand = generateAgentChatCurl(agentId, message);

          // Check it's a curl command (validates requirement 7.1)
          expect(curlCommand).toContain('curl');

          // Check HTTP method
          expect(curlCommand).toContain('-X POST');

          // Check endpoint
          expect(curlCommand).toContain('/chat');

          // Check headers
          expect(curlCommand).toContain('-H "Content-Type: application/json"');

          // Check payload flag
          expect(curlCommand).toContain("-d '");

          // Check actual agent_id is included (validates requirements 7.2, 7.4)
          expect(curlCommand).toContain(agentId);
          expect(curlCommand).toContain('agent_id');

          // Check message is included (accounting for JSON escaping)
          expect(curlCommand).toContain(JSON.stringify(message).slice(1, -1));

          // Check session_id is included
          expect(curlCommand).toContain('session_id');

          // Check proper formatting with line breaks and indentation (validates requirement 7.5)
          expect(curlCommand).toContain('\\');
          expect(curlCommand).toMatch(/\n\s+/); // Check for indentation
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any vault ID, the generated cURL command for chatting should
   * include the correct HTTP method (POST), endpoint (/chat), headers, and
   * properly formatted JSON payload with the actual vault_id
   */
  it('generates valid cURL commands for vault chat with actual vault_id', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        (vaultId: string, message: string) => {
          const curlCommand = generateVaultChatCurl(vaultId, message);

          // Check it's a curl command
          expect(curlCommand).toContain('curl');

          // Check HTTP method
          expect(curlCommand).toContain('-X POST');

          // Check endpoint
          expect(curlCommand).toContain('/chat');

          // Check headers
          expect(curlCommand).toContain('-H "Content-Type: application/json"');

          // Check payload flag
          expect(curlCommand).toContain("-d '");

          // Check actual vault_id is included (validates requirement 7.4)
          expect(curlCommand).toContain(vaultId);
          expect(curlCommand).toContain('vault_id');

          // Check message is included (accounting for JSON escaping)
          expect(curlCommand).toContain(JSON.stringify(message).slice(1, -1));

          // Check session_id is included
          expect(curlCommand).toContain('session_id');

          // Check proper formatting with line breaks and indentation (validates requirement 7.5)
          expect(curlCommand).toContain('\\');
          expect(curlCommand).toMatch(/\n\s+/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any optional vault_id filter, the generated cURL command for
   * getting agents should include the correct HTTP method (GET), endpoint (/agents),
   * and properly formatted query parameters when vault_id is provided
   */
  it('generates valid cURL commands for getting agents', () => {
    fc.assert(
      fc.property(
        fc.option(fc.uuid(), { nil: undefined }),
        (vaultId: string | undefined) => {
          const curlCommand = generateGetAgentsCurl(vaultId);

          // Check it's a curl command
          expect(curlCommand).toContain('curl');

          // Check HTTP method
          expect(curlCommand).toContain('-X GET');

          // Check endpoint
          expect(curlCommand).toContain('/agents');

          // Check headers
          expect(curlCommand).toContain('-H "Content-Type: application/json"');

          // If vault_id is provided, check it's in the URL
          if (vaultId !== undefined) {
            expect(curlCommand).toContain(`vault_id=${vaultId}`);
          }

          // Check proper formatting with line breaks
          expect(curlCommand).toContain('\\');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any agent ID, the generated cURL command for deleting should
   * include the correct HTTP method (DELETE), endpoint with actual agent_id,
   * and proper headers
   */
  it('generates valid cURL commands for deleting agents', () => {
    fc.assert(
      fc.property(fc.uuid(), (agentId: string) => {
        const curlCommand = generateDeleteAgentCurl(agentId);

        // Check it's a curl command
        expect(curlCommand).toContain('curl');

        // Check HTTP method
        expect(curlCommand).toContain('-X DELETE');

        // Check endpoint with actual agent_id (validates requirement 7.4)
        expect(curlCommand).toContain('/agents/');
        expect(curlCommand).toContain(agentId);

        // Check headers
        expect(curlCommand).toContain('-H "Content-Type: application/json"');

        // Check proper formatting with line breaks
        expect(curlCommand).toContain('\\');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All generated cURL commands should be properly formatted with
   * line breaks and indentation for readability (validates requirement 7.5)
   */
  it('formats all cURL commands with proper line breaks and indentation', () => {
    fc.assert(
      fc.property(
        fc.record({
          agentId: fc.uuid(),
          vaultId: fc.uuid(),
          message: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        ({ agentId, vaultId, message }) => {
          const commands = [
            generateAgentChatCurl(agentId, message),
            generateVaultChatCurl(vaultId, message),
            generateGetAgentsCurl(vaultId),
            generateDeleteAgentCurl(agentId),
          ];

          commands.forEach((command) => {
            // Check for line continuation characters
            expect(command).toContain('\\');

            // Check for multiple lines
            const lines = command.split('\n');
            expect(lines.length).toBeGreaterThan(1);

            // Check for proper indentation (spaces at start of continuation lines)
            // Skip the first line (curl command) and last line (closing quote)
            const continuationLines = lines.slice(1, -1);
            continuationLines.forEach((line) => {
              if (line.trim().length > 0 && !line.trim().startsWith("}'")) {
                expect(line).toMatch(/^\s+/); // Should start with whitespace
              }
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
