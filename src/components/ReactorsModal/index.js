import React, { useState, useMemo, useEffect } from 'react';
import styles from './index.module.css';

const reactionTypeToImage = {
  haha: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/haha.webp',
  pray: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/pray.webp',
  heart: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/heart.webp',
  clap: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/clap.webp',
  praise: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/praise.webp',
};

const ReactorsModal = ({ onClose, socket, reactions }) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [localReactions, setLocalReactions] = useState(reactions || []);

  useEffect(() => {
    setLocalReactions(reactions || []);
  }, [reactions]);

  useEffect(() => {
    if (!socket) return;

    const handleNew = (newReaction) => {
      setLocalReactions((prev) => [...prev, newReaction]);
    };

    const handleDelete = (removedReaction) => {
      setLocalReactions((prev) => prev.filter((r) => r.id !== removedReaction.id));
    };

    const handleUpdate = (updatedReaction) => {
      setLocalReactions((prev) =>
        prev.map((r) =>
          r.id === updatedReaction.id ? { ...r, type: updatedReaction.type } : r
        )
      );
    };

    socket.on('new_reaction', handleNew);
    socket.on('delete_reaction', handleDelete);
    socket.on('update_reaction', handleUpdate);

    return () => {
      socket.off('new_reaction', handleNew);
      socket.off('delete_reaction', handleDelete);
      socket.off('update_reaction', handleUpdate);
    };
  }, [socket]);

  const availableTypes = useMemo(() => {
    const types = new Set(localReactions.map((r) => r.type));
    return Array.from(types).filter((t) => reactionTypeToImage[t]);
  }, [localReactions]);

  const filteredReactions =
    selectedTab === 'all'
      ? localReactions
      : localReactions.filter((r) => r.type === selectedTab);

  if (!localReactions || localReactions.length === 0) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <span className={styles.title}>Reactor List</span>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${selectedTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setSelectedTab('all')}
          >
            All
          </button>
          {availableTypes.map((type) => (
            <button
              key={type}
              className={`${styles.tabButton} ${selectedTab === type ? styles.activeTab : ''}`}
              onClick={() => setSelectedTab(type)}
            >
              <img src={reactionTypeToImage[type]} alt={type} />
            </button>
          ))}
        </div>

        {/* Reactor List */}
        <div className={styles.reactorList}>
          {filteredReactions.map((reaction, index) => (
            <div className={styles.reactorItem} key={index}>
              <img
                className={styles.avatar}
                src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${reaction?.reactor?.user_profile_picture || 'profile_place_holder.webp'}`}
                alt={reaction?.reactor?.user_fname}
              />
              <div className={styles.userInfo}>
                <span className={styles.name}>
                  {reaction?.reactor?.user_fname} {reaction?.reactor?.user_lname}
                </span>
                <img
                  className={styles.reactionIcon}
                  src={reactionTypeToImage[reaction?.type]}
                  alt={reaction?.type}
                />
              </div>
              <button disabled className={styles.followButton}>Follow (Coming Soon)</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ReactorsModal);
