import React, { useRef } from 'react';
import styles from './index.module.css';

// subsections
import CommentHeader from '../../subsections/feeds/CommentHeader';
import CommentPostHeader from '../../subsections/feeds/CommentPostHeader';
import CommentPostContent from '../../subsections/feeds/CommentPostContent';
import CommentPostMedia from '../../subsections/feeds/CommentPostMedia';
import CommentPostFooterSummary from '../../subsections/feeds/CommentPostFooterSummary';
import CommentPostActions from '../../subsections/feeds/CommentPostActions';
import CommentsList from '../../subsections/feeds/CommentsList';
import CommentTextInput from '../../subsections/feeds/CommentTextInput';

const PostCommentsModal = ({ post, onClose, socket, user }) => {
  const scrollRef = useRef(null);

  const handleScrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 500); // Give time for content to render
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={scrollRef}>
        {/* 1. Modal Header */}
        <CommentHeader onClose={onClose} post={post} />

        {/* 2. Post Display */}
        <div className={styles.postSection}>
          <CommentPostHeader user={post.author} />
          {post.content && <CommentPostContent content={post.content} />}
          {post.media && <CommentPostMedia media={post.media} />}
          {(post.reaction_count > 0 || post.comments_count > 0 || post.shares_count > 0) && (
            <CommentPostFooterSummary 
              reactionCount={post.reaction_count}
              commentsCount={post.comments_count}
              sharesCount={post.shares_count}
              reactions={post.reactions}
              socket={socket}
              postId={post.id}
            />
          )}
          <CommentPostActions post={post} socket={socket} />

          <CommentsList post={post} socket={socket} />
        </div>

        {/* 3. Comment Thread */}
        

        {/* 4. Comment Input */}
        <CommentTextInput 
          postId={post.id} 
          user={user} 
          onScrollToBottom={handleScrollToBottom}
        />
      </div>
    </div>
  );
};

export default React.memo(PostCommentsModal);
