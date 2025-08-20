import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShare, faLink, faCopy } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../../redux/combineActions';

import ReactionPopup from '../../../components/PostReactionsOption';
import PostCommentsModal from '../../../components/PostCommentsModal';
import SharePostModal from '../../../components/SharePostModal';

const REACTIONS = [
  { label: 'Haha', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/haha.webp' },
  { label: 'Pray', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/pray.webp' },
  { label: 'Heart', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/heart.webp' },
  { label: 'Clap', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/clap.webp' },
  { label: 'Praise', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/praise.webp' },
];

const PostActions = ({ onRefresh, reactions, postId, post, socket, author, user }) => {
  const dispatch = useDispatch();

  const showTimeout = useRef(null);
  const hideTimeout = useRef(null);
  const shareDropdownRef = useRef(null);
  const touchStartTimeRef = useRef(null);
  const longPressTimeoutRef = useRef(null);

  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [localReactions, setLocalReactions] = useState(reactions);
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  const handleReactToPost = useCallback((reaction, option) => {
    clearTimeout(showTimeout.current);
    clearTimeout(hideTimeout.current);

    const reactionType = typeof reaction === 'string' ? reaction.toLowerCase() : reaction?.label?.toLowerCase();
    const existingReaction = localReactions.find(r => r.user_id === user.id && r.post_id === postId);

    if (existingReaction && existingReaction.type === reactionType) {
      if (option === 2) {
        setShowReactions(false);
        return;
      }
      setLocalReactions(prev => prev.filter(r => !(r.user_id === user.id && r.post_id === postId)));
    } else {
      setLocalReactions(prev => {
        const withoutUser = prev.filter(r => r.user_id !== user.id);
        return [...withoutUser, { id: Date.now(), user_id: user.id, post_id: postId, type: reactionType }];
      });
    }

    dispatch(wotgsocial.post.reactToPostByIdAction({ postId, type: reactionType }));
    setShowReactions(false);
  }, [dispatch, postId, user.id, localReactions]);

  useEffect(() => {
    setLocalReactions(reactions);
  }, [reactions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareDropdownRef.current &&
        !shareDropdownRef.current.contains(event.target)
      ) {
        setShowShareDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userReaction = localReactions.find(r => r.user_id === user.id && r.post_id === postId);
  const reactionMeta = userReaction ? REACTIONS.find(r => r.label.toLowerCase() === userReaction.type.toLowerCase()) : null;

  const handleTouchStart = (e) => {
    e.preventDefault();
    touchStartTimeRef.current = Date.now();
    longPressTimeoutRef.current = setTimeout(() => setShowReactions(true), 800);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    clearTimeout(longPressTimeoutRef.current);

    if (!showReactions) {
      handleReactToPost(userReaction && reactionMeta ? reactionMeta : 'Heart', 1);
    }

    touchStartTimeRef.current = null;
  };

  const handleMouseEnter = () => {
    clearTimeout(hideTimeout.current);
    showTimeout.current = setTimeout(() => setShowReactions(true), 800);
  };

  const handleMouseLeave = () => {
    clearTimeout(showTimeout.current);
    hideTimeout.current = setTimeout(() => setShowReactions(false), 800);
  };

  const copyLink = async (selectedPostId) => {  
    const url = `${window.location.origin}/feeds?post=${selectedPostId}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
    setShowShareDropdown(false);
  };

  return (
    <div className={styles.footerActions}>
      {/* React Button */}
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
        onClick={() => handleReactToPost(userReaction && reactionMeta ? reactionMeta : 'Heart', 1)}
      >
        {userReaction && reactionMeta ? (
          <>
            <img src={reactionMeta.src} alt={userReaction.type} className={styles.reactionEmoji} />
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

      {/* Share Dropdown */}
      <div className={styles.actionButton} style={{ position: 'relative' }} ref={shareDropdownRef}>
        <div onClick={() => setShowShareDropdown(post.id)}>
          <FontAwesomeIcon icon={faShare} />
          <span>Share</span>
        </div>

        {showShareDropdown && (
          <div className={styles.shareDropdown}>
            <div className={styles.shareDropdownItem} onClick={() => setShowShareModal(true)}>
              <FontAwesomeIcon icon={faShare} />
              Share to Feed
            </div>
            <div className={styles.shareDropdownItem} onClick={() => copyLink(post.id)}>
              <FontAwesomeIcon icon={faLink} />
              Copy Link
            </div>
          </div>
        )}
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
          user={user}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <SharePostModal
          post={post}
          socket={socket}
          onClose={() => setShowShareModal(false)}
          author={author}
          user={user}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

export default React.memo(PostActions);
