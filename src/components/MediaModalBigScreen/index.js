import React, { useState, useEffect } from 'react';

// css
import styles from './index.module.css';

// sections
import PostCommentSection from '../../sections/PostCommentSection';

const MediaModalBigScreen = ({ media = [], post, activeIndex = 0, user, socket, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const currentMedia = media[currentIndex];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < media.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>×</button>

        {/* Media Viewer */}
        <div className={styles.mediaContainer}>
          {currentIndex > 0 && (
            <button className={styles.navButtonLeft} onClick={handlePrev}>‹</button>
          )}
          <div className={styles.mediaItem}>
            {currentMedia?.type === 'image' && (
              <img
                src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${currentMedia.url}`}
                alt={`media-${currentIndex}`}
                className={styles.media}
              />
            )}
            {currentMedia?.type === 'video' && (
              <video
                src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/videos/${currentMedia.url}`}
                controls
                className={styles.media}
              />
            )}
          </div>
          {currentIndex < media.length - 1 && (
            <button className={styles.navButtonRight} onClick={handleNext}>›</button>
          )}
        </div>

        {/* Comments Section (includes post meta) */}
        <div className={styles.commentSection}>
          <PostCommentSection
            post={post}
            socket={socket}
            author={post.author}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaModalBigScreen);
