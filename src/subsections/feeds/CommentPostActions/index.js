import React, { useState, useRef, useEffect } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import ReactionPopup from '../../../components/PostReactionsOption';

const REACTIONS = [
  { label: 'Haha', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/haha.webp' },
  { label: 'Pray', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/pray.webp' },
  { label: 'Heart', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/heart.webp' },
  { label: 'Clap', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/clap.webp' },
  { label: 'Praise', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/praise.webp' },
];

const CommentPostActions = ({
  reactions = [],
  postId,
  userId,
  onComment,
  onShare
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [localReactions, setLocalReactions] = useState(reactions);
  const showTimeout = useRef(null);
  const hideTimeout = useRef(null);

  const userReaction = localReactions.find(r => r.user_id === userId && r.post_id === postId);
  const reactionMeta = userReaction
    ? REACTIONS.find(r => r.label.toLowerCase() === userReaction.type.toLowerCase())
    : null;

  const handleReact = (reaction) => {
    const reactionType = reaction.label.toLowerCase();

    if (userReaction?.type === reactionType) {
      // remove
      setLocalReactions(prev => prev.filter(r => r.user_id !== userId));
    } else {
      // add/update
      setLocalReactions(prev => {
        const filtered = prev.filter(r => r.user_id !== userId);
        return [...filtered, {
          id: Date.now(),
          user_id: userId,
          post_id: postId,
          type: reactionType
        }];
      });
    }

    setShowReactions(false);
    // Dispatch should happen outside — integrate if needed
  };

  const handleMouseEnter = () => {
    clearTimeout(hideTimeout.current);
    showTimeout.current = setTimeout(() => {
      setShowReactions(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    clearTimeout(showTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setShowReactions(false);
    }, 600);
  };

  useEffect(() => {
    setLocalReactions(reactions);
  }, [reactions]);

  return (
    <div className={styles.footerActions}>
      {/* React */}
      <div
        className={styles.actionButton}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() =>
          reactionMeta ? handleReact(reactionMeta) : handleReact({ label: 'Heart' })
        }
      >
        {reactionMeta ? (
          <>
            <img src={reactionMeta.src} alt={reactionMeta.label} className={styles.reactionEmoji} />
            <span>{reactionMeta.label}</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faHeart} />
            <span>Heart</span>
          </>
        )}

        {showReactions && (
          <ReactionPopup
            onReact={handleReact}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </div>

      {/* Comment */}
      <div className={styles.actionButton} onClick={onComment}>
        <FontAwesomeIcon icon={faComment} />
        <span>Comment</span>
      </div>

      {/* Share */}
      <div className={styles.actionButton} onClick={onShare}>
        <FontAwesomeIcon icon={faShare} />
        <span>Share</span>
      </div>
    </div>
  );
};

export default React.memo(CommentPostActions);
