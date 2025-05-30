import React, { useState } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

import { convertMomentWithFormatWhole } from '../../../utils/methods';

import PostMenu from '../../../components/PostMenu';

const PostAuthorHeader = ({ author, createdAt, postId, userId, onRefresh, color }) => {
  const avatar = author?.user_profile_picture || 'profile_place_holder.webp';
  const fullName = `${author?.user_fname || ''} ${author?.user_lname || ''}`;
  const formattedDate = convertMomentWithFormatWhole(createdAt);

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={styles.postHeader}>
      <img
        src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${avatar}`}
        alt="avatar"
        className={styles.avatar}
      />
      <div className={styles.authorInfo}>
        <div 
          className={styles.authorName}
          style={{ color: color || '#1c1e21' }}
        >
          {fullName}
        </div>
        <div 
          className={styles.timestamp}
          style={{ color: color || '#606770' }}  
        >
          {formattedDate}
        </div>
      </div>

      { userId === author?.id && (
        <div className={styles.menuIcon} onClick={() => setShowMenu(!showMenu)}>
          <FontAwesomeIcon icon={faEllipsisH} />
        </div>
      )}

      { showMenu && (
        <div className={styles.menuWrapper}>
          <PostMenu 
            postId={postId} 
            onRefresh={onRefresh}
            postAuthor={author}
            onClose={() => setShowMenu(false)}
            onClickOutside={() => setShowMenu(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(PostAuthorHeader);
