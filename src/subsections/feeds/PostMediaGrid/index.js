import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './index.module.css';

// components
import MediaModalSmallScreen from '../../../components/MediaModalSmallScreen';
import MediaModalBigScreen from '../../../components/MediaModalBigScreen';

const PostMediaGrid = ({ post, user, socket }) => {
  const navigate = useNavigate();
  const location = useLocation();

  let touchStartY = 0;

  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const urlParams = new URLSearchParams(location.search);
  const modalPostId = urlParams.get('post');
  const isOpen = modalPostId === String(post.id);

  const media = post?.media || [];
  const displayedMedia = media.slice(0, 4);
  const remainingCount = media.length - 4;

  const handleTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e, index) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = Math.abs(touchEndY - touchStartY);

    if (deltaY < 10) {
      handleMediaClick(index);
    }
  };

  const handleMediaClick = (index) => {
    setActiveIndex(index);
    navigate(`/feeds?post=${post.id}`, { replace: false });
  };

  const handleCloseModal = () => {
    navigate('/feeds', { replace: false });
  };

  useEffect(() => {
    // flutter check
    if (window.flutter_inappwebview) {
      setIsMobile(true);
      return;
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 780);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div className={`${styles.mediaGrid} ${gridClass}`}>
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
          post={post}
          activeIndex={activeIndex}
          onClose={handleCloseModal}
        />
      )}

      {isOpen && !isMobile && (
        <MediaModalBigScreen
          post={post}
          activeIndex={activeIndex}
          onClose={handleCloseModal}
          user={user}
          socket={socket}
        />
      )}
    </>
  );
};

export default React.memo(PostMediaGrid);
