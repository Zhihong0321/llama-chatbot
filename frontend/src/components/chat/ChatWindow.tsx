/**
 * ChatWindow Component
 * 
 * Main chat interface for interacting with agents or vaults.
 * Displays message history, handles user input, and shows sources.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React, { useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatSourceList } from './ChatSourceList';
import { ChatInput } from './ChatInput';
import styles from './ChatWindow.module.css';

export interface ChatWindowProps {
  sessionId: string;
  agentId?: string;
  vaultId?: string;
  config?: {
    top_k?: number;
    temperature?: number;
  };
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  sessionId,
  agentId,
  vaultId,
  config,
}) => {
  const { messages, loading, error, sendMessage } = useChat(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    await sendMessage({
      message,
      agent_id: agentId,
      vault_id: vaultId,
      config,
    });
  };

  const getHeaderTitle = (): string => {
    if (agentId) {
      return 'Chat with Agent';
    }
    if (vaultId) {
      return 'Chat with Vault';
    }
    return 'Chat';
  };

  const getHeaderSubtitle = (): string => {
    if (agentId) {
      return `Agent ID: ${agentId}`;
    }
    if (vaultId) {
      return `Vault ID: ${vaultId}`;
    }
    return 'Start a conversation';
  };

  return (
    <div className={styles.chatWindow} role="region" aria-label="Chat window">
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>{getHeaderTitle()}</h2>
        <p className={styles.headerSubtitle}>{getHeaderSubtitle()}</p>
      </div>

      <div
        ref={messagesContainerRef}
        className={styles.messagesContainer}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon} aria-hidden="true">
              💬
            </div>
            <p className={styles.emptyStateText}>No messages yet</p>
            <p className={styles.emptyStateSubtext}>
              Start a conversation by typing a message below
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.sources && message.sources.length > 0
                    ? styles.messageWithSources
                    : ''
                }
              >
                <ChatMessageBubble message={message} />
                {message.sources && message.sources.length > 0 && (
                  <ChatSourceList sources={message.sources} />
                )}
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className={styles.loadingIndicator} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <span>Thinking...</span>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <ChatInput
          onSend={handleSendMessage}
          disabled={loading}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};
