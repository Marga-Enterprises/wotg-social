import React from 'react';
import styles from './index.module.css';

const PostMediaGrid = ({ media = [] }) => {
  if (!media.length) return null;

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

  return (
    <div className={`${styles.mediaGrid} ${gridClass}`}>
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
                src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${item.url}`}
                controls
                className={styles.mediaVideo}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(PostMediaGrid);
