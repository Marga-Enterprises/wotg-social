import React from 'react';
import styles from './index.module.css';

// subsections
import CommentHeader from '../../subsections/feeds/CommentHeader';
import CommentPostHeader from '../../subsections/feeds/CommentPostHeader';
import CommentPostContent from '../../subsections/feeds/CommentPostContent';
import CommentPostMedia from '../../subsections/feeds/CommentPostMedia';
import CommentPostFooterSummary from '../../subsections/feeds/CommentPostFooterSummary';
import CommentsList from '../../subsections/feeds/CommentsList';
import CommentTextInput from '../../subsections/feeds/CommentTextInput';

const PostCommentsSection = ({ post, socket, user }) => {
  return (
    <section className={styles.commentsSection}>
      {/* 1. Post Display */}
      <div className={styles.postSection}>
        <CommentPostHeader user={post.author} />
        {post.content && <CommentPostContent content={post.content} />}
        {/*post.media && <CommentPostMedia media={post.media} />*/}
        {(post.reaction_count > 0 || post.comments_count > 0 || post.shares_count > 0) && (
          <CommentPostFooterSummary 
            reactionCount={post.reaction_count}
            commentsCount={post.comments_count}
            sharesCount={post.shares_count}
            reactions={post.reactions}
            socket={socket}
            postId={post.id}
            post={post}
            author={post.author}
            user={user}
          />
        )}
        <CommentsList post={post} socket={socket} />
      </div>

      {/* 2. Comment Input */}
      <CommentTextInput 
        postId={post.id} 
        user={user} 
      />
    </section>
  );
};

export default React.memo(PostCommentsSection);
