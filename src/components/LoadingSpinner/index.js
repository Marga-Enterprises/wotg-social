import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';

const LoadingSpinner = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      setProgress(0); // Reset progress on new loading
      intervalRef.current = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev)); // Increase progress
      }, 500);
    } else {
      clearInterval(intervalRef.current);
      setProgress(100); // Instantly fill when loading is done
      setTimeout(() => setProgress(0), 500); // Reset after animation
    }

    return () => clearInterval(intervalRef.current); // Cleanup
  }, [isLoading]);

  if (!isLoading) return null; // Prevent unnecessary renders

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
