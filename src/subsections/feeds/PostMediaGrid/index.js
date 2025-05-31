import React, { useState, useEffect } from 'react';
import styles from './index.module.css';

// components
import MediaModalSmallScreen from '../../../components/MediaModalSmallScreen';
import MediaModalBigScreen from '../../../components/MediaModalBigScreen';

const PostMediaGrid = ({ media = [], post, user, socket }) => {
  let touchStartY = 0;

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null)

  const handleTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e, index) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = Math.abs(touchEndY - touchStartY);

    if (deltaY < 10) {
      handleMediaClick(index); // pass clicked index
    }
  };

  const handleMediaClick = (index) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

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
        >
          {displayedMedia.map((item, index) => {
            const isLast = index === 3;

            return (
              <div 
                key={index} 
                className={styles.mediaItem}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, index)}
                onClick={() => handleMediaClick(index)}
              >
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
            activeIndex={activeIndex}
            onClose={() => setIsOpen(false)}
          />
        )}

        {isOpen && !isMobile && (
          <MediaModalBigScreen
            media={media}
            post={post}
            activeIndex={activeIndex}
            onClose={() => setIsOpen(false)}
            user={user}
            socket={socket}
          />
        )}
    </>
  );
};

export default React.memo(PostMediaGrid);
