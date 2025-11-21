import { useState, useCallback } from 'react';
import { sendChatMessage } from '../api/chat';
import type { ChatRequest, ChatResponse, ChatSource } from '../api/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  timestamp: Date;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (request: Omit<ChatRequest, 'session_id'>) => Promise<void>;
  clearHistory: () => void;
}

/**
 * Custom hook for managing chat state and interactions
 * @param sessionId - Unique session identifier for the chat
 * @returns Chat state and methods
 */
export function useChat(sessionId: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (request: Omit<ChatRequest, 'session_id'>) => {
      setLoading(true);
      setError(null);

      // Add user message to history
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: request.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Send request with session_id
        const response: ChatResponse = await sendChatMessage({
          ...request,
          session_id: sessionId,
        });

        // Add assistant response to history
        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        
        // Remove the user message if the request failed
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
  };
}
