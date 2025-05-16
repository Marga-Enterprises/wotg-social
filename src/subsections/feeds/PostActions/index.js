import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShare } from '@fortawesome/free-solid-svg-icons';

// redux
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../../redux/combineActions';

// components
import ReactionPopup from '../../../components/PostReactionsOption';
import PostCommentsModal from '../../../components/PostCommentsModal';

const REACTIONS = [
  { label: 'Haha', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/haha.webp' },
  { label: 'Pray', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/pray.webp' },
  { label: 'Heart', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/heart.webp' },
  { label: 'Clap', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/clap.webp' },
  { label: 'Praise', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/praise.webp' },
];

const PostActions = ({ onShare, reactions, userId, postId, post, socket, author }) => {
  const dispatch = useDispatch();

  const showTimeout = useRef(null);
  const hideTimeout = useRef(null);
  const touchStartTimeRef = useRef(null);
  const longPressTimeoutRef = useRef(null);

  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localReactions, setLocalReactions] = useState(reactions);

  const handleReactToPost = useCallback((reaction, option) => {
    clearTimeout(showTimeout.current);

    // Optionally clear hide timeout too (for safety)
    clearTimeout(hideTimeout.current);

    const reactionType = typeof reaction === 'string'
      ? reaction.toLowerCase()
      : reaction?.label?.toLowerCase();

    const existingReaction = localReactions.find(
      (r) => r.user_id === userId && r.post_id === postId
    );

    if (existingReaction && existingReaction.type === reactionType) {
      if (option === 2) {
        // If the user long-pressed and the reaction is the same, remove it
        setShowReactions(false);
        return;
      };

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

  const handleTouchStart = (e) => {
    e.preventDefault();
    touchStartTimeRef.current = Date.now();
  
    longPressTimeoutRef.current = setTimeout(() => {
      setShowReactions(true);
    }, 800);
  };
  
  const handleTouchEnd = (e) => {
    e.preventDefault();
    clearTimeout(longPressTimeoutRef.current);
  
    const wasLongPressed = showReactions;
  
    if (!wasLongPressed) {
      userReaction && reactionMeta
        ? handleReactToPost(reactionMeta, 1)
        : handleReactToPost('Heart', 1);
    }
  
    touchStartTimeRef.current = null;
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
        onTouchMove={() => {
          clearTimeout(longPressTimeoutRef.current);
          touchStartTimeRef.current = null;
        }}               
        onClick={() =>
          userReaction && reactionMeta
            ? handleReactToPost(reactionMeta, 1)
            : handleReactToPost('Heart', 1)
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
      <div className={styles.actionButton} onClick={() => setShowComments(true)}>
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

      {/* Comments Modal */}
      {showComments && (
        <PostCommentsModal
          post={post}
          socket={socket}
          onClose={() => setShowComments(false)}
          author={author}
        />
      )}
    </div>
  );
};

export default React.memo(PostActions);
