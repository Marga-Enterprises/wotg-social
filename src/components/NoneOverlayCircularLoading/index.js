import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';

const NoneOverlayCircularLoading = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    setProgress(0);
    setVisible(true);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 200);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setVisible(false), 300);
    }
  }, [progress]);

  if (!visible) return null;

  return (
    <div className={styles.smallSpinnerWrapper}>
      <div className={styles.smallSpinner}></div>
    </div>
  );
};

export default React.memo(NoneOverlayCircularLoading);
