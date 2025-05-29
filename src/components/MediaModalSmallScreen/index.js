import React, { useRef, useEffect } from 'react';

// css
import styles from './index.module.css';

// sections
import PostHeaderAuthor from '../../subsections/feeds/PostHeaderAuthor';
import ExpandableText from '../../common/ExpandableText';

const MediaModalSmallScreen = ({ media, onClose, post, activeIndex }) => {
    const mediaRefs = useRef([]);   
    const containerRef = useRef(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
        const target = mediaRefs.current[activeIndex];

        if (target && containerRef.current) {
            target.scrollIntoView({
                behavior: 'auto',
            });
        }
        }, 200); // slight delay ensures refs are mounted

        return () => clearTimeout(timeout);
    }, [activeIndex]);

    return (
        <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={onClose}>
            <span className={styles.closeIcon}>×</span>
            </button>

            <div className={styles.modalHeader}>
            <PostHeaderAuthor 
                author={post?.author} 
                createdAt={post?.created_at} 
                postId={post?.id}
            />
            {post?.content && (
                <ExpandableText
                maxLength={100}
                text={post?.content}
                className={styles.sharedText}
                />
            )}
            </div>

            <div className={styles.mediaContainer} ref={containerRef}>
            {media?.map((item, index) => (
                <div
                key={index}
                ref={(el) => (mediaRefs.current[index] = el)}
                className={styles.mediaItem}
                >
                {item.type === 'image' && (
                    <img
                    src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${item.url}`}
                    alt={`media-${index}`}
                    className={styles.mediaImage}
                    />
                )}
                {item.type === 'video' && (
                    <video
                    src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/videos/${item.url}`}
                    controls
                    className={styles.mediaVideo}
                    />
                )}
                </div>
            ))}
            </div>
        </div>
        </div>
    );
}

export default React.memo(MediaModalSmallScreen);