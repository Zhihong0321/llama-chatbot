// Ingestion API functions

import { get, post } from './client';
import type { IngestRequest, IngestResponse, IngestStatusResponse } from './types';

// ============================================================================
// Ingestion API Functions
// ============================================================================

/**
 * Ingest a document into a vault
 * POST /ingest
 */
export async function ingestDocument(data: IngestRequest): Promise<IngestResponse> {
  return post<IngestResponse>('/ingest', data);
}

/**
 * Get the status of an ingestion task
 * GET /ingest/status/{task_id}
 */
export async function getIngestStatus(taskId: string): Promise<IngestStatusResponse> {
  return get<IngestStatusResponse>(`/ingest/status/${taskId}`);
}
