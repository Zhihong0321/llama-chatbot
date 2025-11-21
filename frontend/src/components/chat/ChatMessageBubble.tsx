/**
 * ChatMessageBubble Component
 * 
 * Displays individual chat messages with appropriate styling for user/assistant roles.
 * Requirements: 4.2
 */

import React from 'react';
import type { ChatMessage } from '../../hooks/useChat';
import styles from './ChatMessageBubble.module.css';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`${styles.messageBubble} ${
        isUser ? styles.userMessage : styles.assistantMessage
      }`}
      role="article"
      aria-label={`${isUser ? 'User' : 'Assistant'} message`}
    >
      <div
        className={`${styles.bubbleContent} ${
          isUser ? styles.userBubble : styles.assistantBubble
        }`}
      >
        <div className={styles.messageContent}>{message.content}</div>
      </div>
      <div className={styles.timestamp}>
        {formatTimestamp(message.timestamp)}
      </div>
    </div>
  );
};
