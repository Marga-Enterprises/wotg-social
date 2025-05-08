import React from 'react';
import styles from './index.module.css';

// utils
import { convertMomentWithFormat } from '../../../utils/methods';

const PostAuthorHeader = ({ author, createdAt }) => {
  const avatar = author?.user_profile_picture || 'default.png';
  const fullName = `${author?.user_fname || ''} ${author?.user_lname || ''}`;
  const formattedDate = convertMomentWithFormat(createdAt);

  return (
    <div className={styles.postHeader}>
      <img
        src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${avatar}`}
        alt="avatar"
        className={styles.avatar}
      />
      <div className={styles.authorInfo}>
        <div className={styles.authorName}>{fullName}</div>
        <div className={styles.timestamp}>{formattedDate}</div>
      </div>
    </div>
  );
};

export default React.memo(PostAuthorHeader);
