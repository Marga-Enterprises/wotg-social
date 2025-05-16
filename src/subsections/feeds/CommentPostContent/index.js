import React from 'react';
import styles from './index.module.css';
import ExpandableText from '../../../common/ExpandableText';

const CommentPostContent = ({ content }) => {
  if (!content) return null;

  return (
    <div className={styles.postContent}>
      <ExpandableText text={content} maxLines={4} />
    </div>
  );
};

export default React.memo(CommentPostContent);
