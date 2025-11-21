import React from 'react';
import { useToast } from '../../context/ToastContext';
import styles from './Toast.module.css';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className={styles.toastContent}>
            <span className={styles.toastMessage}>{toast.message}</span>
            <button
              className={styles.toastClose}
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
