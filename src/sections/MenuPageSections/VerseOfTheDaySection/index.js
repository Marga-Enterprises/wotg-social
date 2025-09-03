import React from 'react';

// styles
import styles from './index.module.css';

const VerseOfTheDaySection = () => {
  return (
    <div className={styles.card}>
        <div className={styles.header}>Verse of the Day</div>
    </div>
    );
};

export default React.memo(VerseOfTheDaySection);