import React from 'react';

// css
import styles from './index.module.css';

// sections
import PostHeaderAuthor from '../../subsections/feeds/PostHeaderAuthor';
import ExpandableText from '../../common/ExpandableText';


const MediaModalSmallScreen = ({ media, onClose, post }) => {
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
                    {post?.content && <ExpandableText maxLength={100} text={post?.content} className={styles.sharedText} />}
                </div>
                <div className={styles.mediaContainer}>
                    {media?.map((item, index) => (
                        <div key={index} className={styles.mediaItem}>
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
    )
}

export default React.memo(MediaModalSmallScreen);