import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShare } from '@fortawesome/free-solid-svg-icons';

// redux
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../../redux/combineActions';

// socket
import { useSocket } from '../../../contexts/SocketContext';

// components
import ReactionPopup from '../../../components/PostReactionsOption';

const REACTIONS = [
  { label: 'Haha', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/haha.webp' },
  { label: 'Pray', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/pray.webp' },
  { label: 'Heart', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/heart.webp' },
  { label: 'Clap', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/clap.webp' },
  { label: 'Praise', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/praise.webp' },
];

const PostActions = ({ onComment, onShare, reactions, userId, postId }) => {
  const dispatch = useDispatch();

  const showTimeout = useRef(null);
  const hideTimeout = useRef(null);

  const [showReactions, setShowReactions] = useState(false);
  const [localReactions, setLocalReactions] = useState(reactions);

  const handleReactToPost = useCallback((reaction) => {
    const reactionType = typeof reaction === 'string'
      ? reaction.toLowerCase()
      : reaction?.label?.toLowerCase();

    const existingReaction = localReactions.find(
      (r) => r.user_id === userId && r.post_id === postId
    );

    if (existingReaction && existingReaction.type === reactionType) {
      setLocalReactions(prev =>
        prev.filter(r => !(r.user_id === userId && r.post_id === postId))
      );

      dispatch(wotgsocial.post.reactToPostByIdAction({
        postId,
        type: reactionType,
      }));
    } else {
      setLocalReactions(prev => {
        const withoutUser = prev.filter(r => r.user_id !== userId);
        return [...withoutUser, {
          id: Date.now(),
          user_id: userId,
          post_id: postId,
          type: reactionType,
        }];
      });

      dispatch(wotgsocial.post.reactToPostByIdAction({
        postId,
        type: reactionType,
      }));
    }

    setShowReactions(false);
  }, [dispatch, postId, userId, localReactions]);

  const handleTouchStart = () => {
    hideTimeout.current = setTimeout(() => {
      setShowReactions(true);
    }, 800);
  };

  const handleTouchEnd = () => {
    clearTimeout(hideTimeout.current);
  };

  useEffect(() => {
    setLocalReactions(reactions);
  }, [reactions]);

  const userReaction = localReactions.find(
    (r) => r.user_id === userId && r.post_id === postId
  );

  const reactionMeta = userReaction
    ? REACTIONS.find(r => r.label.toLowerCase() === userReaction.type.toLowerCase())
    : null;

  // Shared hover handlers
  const handleMouseEnter = () => {
    clearTimeout(hideTimeout.current);
    showTimeout.current = setTimeout(() => {
      setShowReactions(true);
    }, 800);
  };

  const handleMouseLeave = () => {
    clearTimeout(showTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setShowReactions(false);
    }, 800);
  };

  return (
    <div className={styles.footerActions}>
      {/* Reaction Button */}
      <div
        className={styles.actionButton}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() =>
          userReaction && reactionMeta
            ? handleReactToPost(reactionMeta)
            : handleReactToPost('Heart')
        }
      >
        {userReaction && reactionMeta ? (
          <>
            <img
              src={reactionMeta.src}
              alt={userReaction.type}
              className={styles.reactionEmoji}
            />
            <span>{reactionMeta.label}</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faHeart} />
            <span>Heart</span>
          </>
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

      {/* Reaction Options */}
      {showReactions && (
        <ReactionPopup
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onReact={handleReactToPost}
        />
      )}
    </div>
  );
};

export default React.memo(PostActions);
