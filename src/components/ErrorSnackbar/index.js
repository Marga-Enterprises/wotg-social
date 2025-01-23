import React from 'react';
import styles from './index.module.css';

const ErrorSnackbar = ({ message, onClose }) => {
  if (!message) return null; // Don't render if there's no message

  return (
    <div className={styles.snackbar}>
      <span className={styles.message}>{message}</span>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default ErrorSnackbar;
