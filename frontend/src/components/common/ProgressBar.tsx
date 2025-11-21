/**
 * ProgressBar Component
 * 
 * A progress bar component with accessibility support.
 * Requirements: 9.2
 */

import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  'aria-label'?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  'aria-label': ariaLabel,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={styles.container}>
      {showLabel && <div className={styles.label}>{displayLabel}</div>}
      <div
        className={`${styles.progressBar} ${styles[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || `Progress: ${Math.round(percentage)}%`}
        aria-live="polite"
      >
        <div
          className={`${styles.fill} ${styles[variant]}`}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && (
            <span className={styles.fillLabel} aria-hidden="true">
              {displayLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
