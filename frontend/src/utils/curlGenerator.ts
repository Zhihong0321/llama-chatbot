/**
 * cURL Generation Utility
 * 
 * Generates properly formatted cURL commands for API endpoints.
 * Requirements: 7.1, 7.2, 7.4, 7.5
 */

import type { AgentCreateRequest, VaultCreateRequest, IngestRequest, ChatRequest } from '../api/types';

/**
 * Get the API base URL from environment variables
 */
function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
}

/**
 * Format JSON payload with proper indentation
 */
function formatJsonPayload(payload: any): string {
  return JSON.stringify(payload, null, 2);
}

/**
 * Generate cURL command for vault creation
 * POST /vaults
 */
export function generateVaultCreateCurl(data: VaultCreateRequest): string {
  const baseUrl = getApiBaseUrl();
  const payload = formatJsonPayload(data);
  
  return `curl -X POST "${baseUrl}/vaults" \\
  -H "Content-Type: application/json" \\
  -d '${payload}'`;
}

/**
 * Generate cURL command for document ingestion
 * POST /ingest
 */
export function generateIngestCurl(data: IngestRequest): string {
  const baseUrl = getApiBaseUrl();
  const payload = formatJsonPayload(data);
  
  return `curl -X POST "${baseUrl}/ingest" \\
  -H "Content-Type: application/json" \\
  -d '${payload}'`;
}

/**
 * Generate cURL command for agent creation
 * POST /agents
 */
export function generateAgentCreateCurl(data: AgentCreateRequest): string {
  const baseUrl = getApiBaseUrl();
  const payload = formatJsonPayload(data);
  
  return `curl -X POST "${baseUrl}/agents" \\
  -H "Content-Type: application/json" \\
  -d '${payload}'`;
}

/**
 * Generate cURL command for chatting with an agent
 * POST /chat
 */
export function generateAgentChatCurl(agentId: string, message: string = 'Hello!'): string {
  const baseUrl = getApiBaseUrl();
  const sessionId = `session-${Date.now()}`;
  
  const payload: ChatRequest = {
    session_id: sessionId,
    message: message,
    agent_id: agentId,
  };
  
  const formattedPayload = formatJsonPayload(payload);
  
  return `curl -X POST "${baseUrl}/chat" \\
  -H "Content-Type: application/json" \\
  -d '${formattedPayload}'`;
}

/**
 * Generate cURL command for chatting with a vault
 * POST /chat
 */
export function generateVaultChatCurl(vaultId: string, message: string = 'Hello!'): string {
  const baseUrl = getApiBaseUrl();
  const sessionId = `session-${Date.now()}`;
  
  const payload: ChatRequest = {
    session_id: sessionId,
    message: message,
    vault_id: vaultId,
  };
  
  const formattedPayload = formatJsonPayload(payload);
  
  return `curl -X POST "${baseUrl}/chat" \\
  -H "Content-Type: application/json" \\
  -d '${formattedPayload}'`;
}

/**
 * Generate cURL command for getting agents
 * GET /agents
 */
export function generateGetAgentsCurl(vaultId?: string): string {
  const baseUrl = getApiBaseUrl();
  const url = vaultId ? `${baseUrl}/agents?vault_id=${vaultId}` : `${baseUrl}/agents`;
  
  return `curl -X GET "${url}" \\
  -H "Content-Type: application/json"`;
}

/**
 * Generate cURL command for deleting an agent
 * DELETE /agents/{agent_id}
 */
export function generateDeleteAgentCurl(agentId: string): string {
  const baseUrl = getApiBaseUrl();
  
  return `curl -X DELETE "${baseUrl}/agents/${agentId}" \\
  -H "Content-Type: application/json"`;
}
