import React, { useState, useEffect } from 'react';
import styles from './index.module.css';

// components
import MediaModalSmallScreen from '../../../components/MediaModalSmallScreen';

const PostMediaGrid = ({ media = [], post }) => {
  let touchStartY = 0;

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = Math.abs(touchEndY - touchStartY);

    if (deltaY < 10) {
      handleMediaClick(); // open modal
    }
  };

  const handleMediaClick = () => {
    setIsOpen(true);
  }

  useEffect(() => {
      // flutter check
      if (window.flutter_inappwebview) {
          setIsMobile(true);
          return;
      }

      const handleResize = () => {
          setIsMobile(window.innerWidth <= 780); // Check if window width is <= 780px
      };

      handleResize(); // Initial check on mount
      window.addEventListener('resize', handleResize); // Listen for screen resizing

      return () => {
          window.removeEventListener('resize', handleResize); // Cleanup on unmount
      };
  }, []);

  const displayedMedia = media.slice(0, 4);
  const remainingCount = media.length - 4;

  const gridClass =
    media.length === 1
      ? styles.one
      : media.length === 2
      ? styles.two
      : media.length === 3
      ? styles.three
      : styles.four;

  if (!media.length) return null;

  return (
    <>
        <div 
          className={`${styles.mediaGrid} ${gridClass}`} 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleMediaClick}
        >
          {displayedMedia.map((item, index) => {
            const isLast = index === 3;

            return (
              <div key={item.id || index} className={styles.mediaItem}>
                {item.type === 'image' && (
                  <>
                    <img
                      src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${item.url}`}
                      alt="media"
                      className={styles.mediaImage}
                    />
                    {isLast && remainingCount > 0 && (
                      <div className={styles.mediaOverlay}>+{remainingCount}</div>
                    )}
                  </>
                )}
                {item.type === 'video' && (
                  <video
                    src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/videos/${item.url}`}
                    controls
                    className={styles.mediaVideo}
                  />
                )}
              </div>
            );
          })}
        </div>

        {isOpen && isMobile && (
          <MediaModalSmallScreen
            media={media}
            post={post}
            onClose={() => setIsOpen(false)}
          />
        )}
    </>
  );
};

export default React.memo(PostMediaGrid);
