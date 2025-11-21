// Document API functions

import { get, del } from './client';
import type { Document, DeleteResponse } from './types';

// ============================================================================
// Document API Functions
// ============================================================================

/**
 * Get all documents, optionally filtered by vault_id
 * GET /documents?vault_id={vault_id}
 */
export async function getDocuments(vaultId?: string): Promise<Document[]> {
  const params = vaultId ? { vault_id: vaultId } : undefined;
  return get<Document[]>('/documents', params);
}

/**
 * Delete a document by ID
 * DELETE /documents/{document_id}
 */
export async function deleteDocument(documentId: string): Promise<DeleteResponse> {
  return del<DeleteResponse>(`/documents/${documentId}`);
}
