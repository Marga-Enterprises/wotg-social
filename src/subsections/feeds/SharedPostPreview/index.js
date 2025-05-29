import React from 'react';
import styles from './index.module.css';
import ExpandableText from '../../../common/ExpandableText';
import PostMediaGrid from '../PostMediaGrid';

// utils
import { convertMomentWithFormatWhole } from '../../../utils/methods';

const SharedPostPreview = ({ post }) => {
  if (!post) return null;

  const fullName = `${post.author?.user_fname || ''} ${post.author?.user_lname || ''}`;
  const avatar = post.author?.user_profile_picture || 'profile_place_holder.webp';
  const formattedDate = convertMomentWithFormatWhole(post.createdAt);

  return (
    <div className={styles.sharedContainer}>
      {/* Shared Author Info */}
      <div className={styles.sharedHeader}>
        <img
          src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${avatar}`}
          alt="avatar"
          className={styles.avatarSmall}
        />
        <div>
          <div className={styles.sharedAuthorName}>{fullName}</div>
          <div className={styles.timestamp}>{formattedDate}</div>
        </div>
      </div>

      {/* Shared Content */}
      {post.content && (
        <ExpandableText text={post.content} className={styles.sharedText} />
      )}

      {/* Shared Media */}
      {post.media?.length > 0 && (
        <PostMediaGrid media={post.media} post={post} className={styles.sharedMediaGrid} />
      )}
    </div>
  );
};

export default React.memo(SharedPostPreview);
