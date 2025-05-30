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
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            // Pause all background videos
            const allVideos = document.querySelectorAll('video');
                allVideos.forEach((video) => {
                // Only pause videos not inside the modal
                if (!containerRef.current?.contains(video)) {
                    video.pause();
                }
            });

            // Scroll to selected media
            const target = mediaRefs.current[activeIndex];
                if (target && containerRef.current) {
                target.scrollIntoView({
                    behavior: 'auto',
                    block: 'center',
                });
            }
        }, 200); // slight delay ensures refs and DOM are ready

        return () => clearTimeout(timeout); // ✅ properly clear timeout
    }, [activeIndex]);


    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                <span className={styles.closeIcon}>×</span>
                </button>

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

                <div className={styles.modalHeader}>
                    <PostHeaderAuthor 
                        author={post?.author} 
                        createdAt={post?.created_at} 
                        postId={post?.id}
                        className={styles.postHeaderAuthor}
                        color="#fff"
                    />
                    {post?.content && (
                        <ExpandableText
                            maxLength={100}
                            text={post?.content}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default React.memo(MediaModalSmallScreen);