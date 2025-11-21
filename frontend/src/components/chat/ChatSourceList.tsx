/**
 * ChatSourceList Component
 * 
 * Displays source cards showing document information for chat responses.
 * Requirements: 4.3
 */

import React from 'react';
import type { ChatSource } from '../../api/types';
import styles from './ChatSourceList.module.css';

export interface ChatSourceListProps {
  sources: ChatSource[];
}

export const ChatSourceList: React.FC<ChatSourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={styles.sourceList} role="region" aria-label="Source documents">
      <h4 className={styles.sourceListTitle}>Sources</h4>
      <div className={styles.sources}>
        {sources.map((source, index) => (
          <div
            key={`${source.document_id}-${index}`}
            className={styles.sourceCard}
            role="article"
            aria-label={`Source: ${source.title}`}
          >
            <div className={styles.sourceHeader}>
              <h5 className={styles.sourceTitle}>{source.title}</h5>
              <span className={styles.sourceScore} aria-label={`Relevance score: ${source.score.toFixed(2)}`}>
                {source.score.toFixed(2)}
              </span>
            </div>
            <p className={styles.sourceSnippet}>{source.snippet}</p>
            <div className={styles.sourceDocId} aria-label={`Document ID: ${source.document_id}`}>
              {source.document_id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
