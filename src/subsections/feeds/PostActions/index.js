import React from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShare } from '@fortawesome/free-solid-svg-icons';

const PostActions = ({ onLike, onComment, onShare }) => {
  return (
    <div className={styles.footerActions}>
      <div className={styles.actionButton} onClick={onLike}>
        <FontAwesomeIcon icon={faHeart} />
        <span>Heart</span>
      </div>
      <div className={styles.actionButton} onClick={onComment}>
        <FontAwesomeIcon icon={faComment} />
        <span>Comment</span>
      </div>
      <div className={styles.actionButton} onClick={onShare}>
        <FontAwesomeIcon icon={faShare} />
        <span>Share</span>
      </div>
    </div>
  );
};

export default React.memo(PostActions);
