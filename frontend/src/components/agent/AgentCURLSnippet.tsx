/**
 * AgentCURLSnippet Component
 * 
 * Displays and copies cURL command for agent chat.
 * Requirements: 3.5, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import React, { useState } from 'react';
import { generateAgentChatCurl } from '../../utils/curlGenerator';
import { useToast } from '../../hooks/useToast';
import styles from './AgentCURLSnippet.module.css';

export interface AgentCURLSnippetProps {
  agentId: string;
  agentName?: string;
}

export const AgentCURLSnippet: React.FC<AgentCURLSnippetProps> = ({
  agentId,
  agentName,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const curlCommand = generateAgentChatCurl(agentId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopied(true);
      showToast('cURL command copied to clipboard!', 'success');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <div className={styles.container}>
      {agentName && (
        <div className={styles.header}>
          <h4 className={styles.title}>cURL Command for {agentName}</h4>
        </div>
      )}
      
      <div className={styles.snippetContainer}>
        <pre className={styles.snippet}>
          <code>{curlCommand}</code>
        </pre>
        
        <button
          type="button"
          onClick={handleCopy}
          className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          aria-label={`Copy cURL command${agentName ? ` for ${agentName}` : ''}`}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      
      <p className={styles.description}>
        Use this command to chat with the agent from your terminal or scripts.
      </p>
    </div>
  );
};
