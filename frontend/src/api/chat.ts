import { post } from './client';
import type { ChatRequest, ChatResponse } from './types';

/**
 * Sends a chat message to the backend
 * @param request - Chat request containing session_id, message, and optional vault_id/agent_id
 * @returns Promise resolving to ChatResponse with answer and sources
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return post<ChatResponse>('/chat', request);
}
