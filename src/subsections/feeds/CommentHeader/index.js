import React from 'react';
import styles from './index.module.css';

const CommentHeader = ({ onClose, post }) => {
  const fullName = `${post?.author?.user_fname || ''} ${post?.author?.user_lname || ''}`.trim();

  return (
    <div className={styles.header}>
      <span className={styles.title}>{fullName}’s Post</span>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

export default React.memo(CommentHeader);
