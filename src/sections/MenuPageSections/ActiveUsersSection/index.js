import React from 'react';
import styles from './index.module.css';

const ActiveUsersSection = () => {
    return (
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <span className={styles.title}>
                    <span className={styles.dot}></span> Live Community (Soon)
                </span>
                <span className={styles.status}>● Live</span>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                    <div className={styles.statValue}>19</div>
                    <div className={styles.statLabel}>Active Now</div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statValue}>17</div>
                    <div className={styles.statLabel}>New Posts</div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statValue}>7</div>
                    <div className={styles.statLabel}>Invites</div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statValue}>11</div>
                    <div className={styles.statLabel}>Prayer Responses</div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(ActiveUsersSection);
