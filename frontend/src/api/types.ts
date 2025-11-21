// API Type Definitions for LlamaIndex RAG Frontend

// ============================================================================
// Vault Types
// ============================================================================

export interface Vault {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface VaultCreateRequest {
  name: string;
  description: string;
}

export interface VaultResponse extends Vault {}

// ============================================================================
// Agent Types
// ============================================================================

export interface Agent {
  agent_id: string;
  name: string;
  vault_id: string;
  system_prompt: string;
  created_at: string;
}

export interface AgentCreateRequest {
  name: string;
  vault_id: string;
  system_prompt: string;
}

export interface AgentResponse extends Agent {}

// ============================================================================
// Document Types
// ============================================================================

export interface Document {
  document_id: string;
  title: string;
  source: string;
  vault_id: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface IngestRequest {
  text: string;
  title: string;
  source: string;
  vault_id: string;
  metadata?: Record<string, any>;
}

export interface IngestResponse {
  document_id: string;
  task_id: string;
}

export type IngestStatusType = 'queued' | 'processing' | 'done' | 'failed';

export interface IngestStatus {
  task_id: string;
  status: IngestStatusType;
  progress: number;
  error?: string;
}

export interface IngestStatusResponse extends IngestStatus {}

// ============================================================================
// Chat Types
// ============================================================================

export interface ChatConfig {
  top_k?: number;
  temperature?: number;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  vault_id?: string;
  agent_id?: string;
  config?: ChatConfig;
}

export interface ChatSource {
  document_id: string;
  title: string;
  snippet: string;
  score: number;
}

export interface ChatResponse {
  session_id: string;
  answer: string;
  sources: ChatSource[];
}

// ============================================================================
// Common Response Types
// ============================================================================

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  detail: string;
  status?: number;
}

// ============================================================================
// API Error Type
// ============================================================================

export interface APIError {
  status: number;
  message: string;
  details?: any;
}
