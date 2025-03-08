import React from 'react';
import { useSelector } from 'react-redux';

//STYLE
import styles from './index.module.css';

const LoadingSpinner = () => {
  const loading = useSelector((state) => state.common.ui.loading);

  /*
    if (!loading) {
      return null; // If loading is false, do not render anything
    }
  */

  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingSpinner;
