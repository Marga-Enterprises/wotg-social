import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';

const LoadingSpinner = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    setProgress(0); // Reset progress on mount
    setVisible(true); // Ensure visibility

    intervalRef.current = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev)); // Increment progress
    }, 500);

    return () => clearInterval(intervalRef.current); // Cleanup interval
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setVisible(false); // Hide when fully loaded
      }, 500);
    }
  }, [progress]);

  if (!visible) return null; // Don't render when loading is complete

  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
      </div>
      <p className={styles.progressText}>{progress}%</p>
    </div>
  );
};

export default React.memo(LoadingSpinner); // Prevents unnecessary re-renders
