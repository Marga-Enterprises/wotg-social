import React from 'react';
import styles from './index.module.css';

const PostFooterSummary = ({ reactionCount, commentsCount, sharesCount }) => {
  if (reactionCount === 0 && commentsCount === 0 && sharesCount === 0) return null;

  return (
    <div className={styles.footerSummary}>
      <div className={styles.reactions}>
        {reactionCount > 0 && (
          <>
            <span className={styles.emoji}>😆❤️👍</span>
            <span className={styles.reactionCount}>{reactionCount}</span>
          </>
        )}
      </div>
      <div className={styles.counters}>
        {commentsCount > 0 && (
          <span>{commentsCount} comment{commentsCount > 1 ? 's' : ''}</span>
        )}
        {sharesCount > 0 && (
          <span>{sharesCount} share{sharesCount > 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
};

export default React.memo(PostFooterSummary);
