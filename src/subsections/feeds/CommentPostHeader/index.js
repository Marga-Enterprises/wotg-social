import React from 'react';
import styles from './index.module.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CommentPostHeader = ({ user, createdAt }) => {
  if (!user) return null;

  const fullName = `${user.user_fname} ${user.user_lname}`;
  const profileUrl = `https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${user.user_profile_picture || 'profile_place_holder.webp'}`;

  return (
    <div className={styles.postHeader}>
      <img
        src={profileUrl}
        alt={fullName}
        className={styles.avatar}
      />

      <div className={styles.meta}>
        <span className={styles.name}>{fullName}</span>
        <span className={styles.time}>{dayjs(createdAt).fromNow()}</span>
      </div>
    </div>
  );
};

export default React.memo(CommentPostHeader);
