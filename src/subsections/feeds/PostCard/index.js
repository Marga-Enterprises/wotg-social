import React from 'react';
import styles from './index.module.css'; // You can create a dedicated CSS module if needed

import ExpandableText from '../../../common/ExpandableText';
import PostHeaderAuthor from '../PostHeaderAuthor';
import PostMediaGrid from '../PostMediaGrid';
import SharedPostPreview from '../SharedPostPreview';
import PostFooterSummary from '../PostFooterSummary';
import PostActions from '../PostActions';

const PostCard = ({ post, userId, triggerRefresh, socket }) => {
  return (
    <div className={styles.cardPost}>
      <PostHeaderAuthor 
        author={post.author} 
        createdAt={post.created_at} 
        postId={post.id}
        userId={userId}
        onRefresh={triggerRefresh} // Pass the triggerRefresh function to the header
      />

      {post.original_post && <SharedPostPreview post={post.original_post} />}
      {post.content && <ExpandableText text={post.content} className={styles.sharedText} />}
      {post.media?.length > 0 && <PostMediaGrid media={post.media} />}

      <PostFooterSummary
        reactionCount={post.reaction_count}
        commentsCount={post.comments_count}
        sharesCount={post.shares_count}
        reactions={post.reactions}
        socket={socket}
        postId={post.id}
      />

      <PostActions
        onLike={() => console.log('Liked Post ID:', post.id)}
        onComment={() => console.log('Comment on Post ID:', post.id)}
        onShare={() => console.log('Shared Post ID:', post.id)}
        reactions={post.reactions}
        userId={userId}
        postId={post.id}
      />
    </div>
  );
};

export default React.memo(PostCard);
