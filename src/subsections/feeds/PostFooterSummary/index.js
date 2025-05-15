import React, { useState, useEffect } from 'react';
import styles from './index.module.css';

// components
import ReactorsModal from '../../../components/ReactorsModal';

const reactionTypeToImage = {
  haha: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/haha.webp',
  pray: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/pray.webp',
  heart: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/heart.webp',
  clap: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/clap.webp',
  praise: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/praise.webp',
};

const reactionPriority = ['haha', 'pray', 'heart', 'clap', 'praise'];

const PostFooterSummary = ({ 
  postId, 
  reactionCount, 
  commentsCount, 
  sharesCount, 
  reactions, 
  socket 
}) => {
  const [reactionList, setReactionList] = useState(reactions);
  const [reactionsCount, setReactionsCount] = useState(reactionCount);
  const [isReactorModalOpen, setReactorModalOpen] = useState(false);

  useEffect(() => {
    if (!socket || !postId) return;

    const handleNew = (newReaction) => {
      const parsedPostId = parseInt(newReaction.post_id);
      
      if (parsedPostId!== postId) return;

      setReactionsCount((prev) => prev + 1);
      setReactionList((prev) => [...prev, newReaction]);
    };

    const handleDelete = (removedReaction) => {
      const parsedPostId = parseInt(removedReaction.post_id);

      if (parsedPostId !== postId) return;

      setReactionsCount((prev) => prev - 1);
      setReactionList((prev) => prev.filter((r) => r.id !== removedReaction.id));
    };

    const handleUpdate = (updatedReaction) => {
      const parsedPostId = parseInt(updatedReaction.post_id);
      if (parsedPostId !== postId) return;
    
      setReactionList((prev) => {
        const alreadyExists = prev.some((r) => r.id === updatedReaction.id);
    
        const updatedList = prev.map((r) =>
          r.id === updatedReaction.id ? { ...r, type: updatedReaction.type } : r
        );
    
        return alreadyExists ? updatedList : [...updatedList, updatedReaction];
      });
    };      

    socket.on('new_post_react', handleNew);
    socket.on('delete_post_react', handleDelete);
    socket.on('update_post_react', handleUpdate);

    return () => {
      socket.off('new_post_react', handleNew);
      socket.off('delete_post_react', handleDelete);
      socket.off('update_post_react', handleUpdate);
    };
  }, [socket, postId]);

  // Count types
  const reactionMap = {};
  reactionList.forEach((r) => {
    if (reactionMap[r.type]) {
      reactionMap[r.type]++;
    } else {
      reactionMap[r.type] = 1;
    }
  });

  const topReactions = Object.entries(reactionMap)
    .sort((a, b) => {
      const [typeA, countA] = a;
      const [typeB, countB] = b;
      if (countB !== countA) return countB - countA;
      return reactionPriority.indexOf(typeA) - reactionPriority.indexOf(typeB);
    })
    .slice(0, 3);

  if (reactionsCount === 0 && commentsCount === 0 && sharesCount === 0) {
    return null;
  }

  return (
    <div className={styles.footerSummary}>
      <div className={styles.reactions} onClick={() => setReactorModalOpen(true)}>
        {topReactions.length > 0 && (
          <>
            {topReactions.map(([type], idx) => (
              <img
                key={idx}
                src={reactionTypeToImage[type]}
                alt={type}
                className={styles.reactionEmoji}
              />
            ))}
            <span className={styles.reactionCount}>{reactionsCount}</span>
          </>
        )}
      </div>

      <div className={styles.counters}>
        {commentsCount > 0 && (
          <span>{commentsCount} comment{commentsCount > 1 ? 's' : ''}</span>
        )}
        {sharesCount > 0 && (
          <span>{sharesCount} share{sharesCount > 1 ? 's' : ''}</span>
        )}
      </div>

      {isReactorModalOpen && (
        <ReactorsModal
          onClose={() => setReactorModalOpen(false)}
          postId={postId}
          socket={socket}
          reactions={reactionList}
          reactionsCount={reactionsCount}
        />
      )}
    </div>
  );
};

export default React.memo(PostFooterSummary);
