import React from 'react';
import styles from './index.module.css';

const VerseOfTheDaySection = () => {
  return (
    <div className={styles.card}>
      {/*<div className={styles.header}>Today's Verse</div>*/}
      <p className={styles.verseText}>
        "For God so loved the world that he gave his one and only Son, 
        that whoever believes in him shall not perish but have eternal life." 
        — <span className={styles.verseRef}>John 3:16</span>
      </p>

      {/*<div className={styles.liveStatus}>
        <span className={styles.dot}></span>
        {/*<span>Live Worship · <span className={styles.liveCount}>47 watching</span></span>}
      </div>*/}
    </div>
  );
};

export default React.memo(VerseOfTheDaySection);
