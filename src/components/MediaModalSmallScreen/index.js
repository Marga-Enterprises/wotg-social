import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

// css
import styles from './index.module.css';

// sections
import PostHeaderAuthor from '../../subsections/feeds/PostHeaderAuthor';
import ExpandableText from '../../common/ExpandableText';

// redux
import { wotgsocial } from '../../redux/combineActions';

const MediaModalSmallScreen = ({ post, onClose, activeIndex }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [fetchedPost, setFetchedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const mediaRefs = useRef([]);
  const containerRef = useRef(null);

  const urlParams = new URLSearchParams(location.search);
  const modalPostId = urlParams.get('post');

  useEffect(() => {
    if (modalPostId === String(post?.id)) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [modalPostId, post?.id]);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        const response = await dispatch(wotgsocial.post.getPostByIdAction({ id: post.id }));
        if (isMounted) {
          setFetchedPost(response?.data || null);
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
      }
    };

    if (post?.id) {
      fetchPost();
    }

    if (showModal) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      isMounted = false;
      document.body.style.overflow = 'auto';
    };
  }, [dispatch, post?.id, showModal]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach((video) => {
        if (!containerRef.current?.contains(video)) {
          video.pause();
        }
      });

      const target = mediaRefs.current[activeIndex];
      if (target && containerRef.current) {
        target.scrollIntoView({
          behavior: 'auto',
          block: 'center',
        });
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [activeIndex]);

  const handleClose = () => {
    setShowModal(false);
    navigate('/feeds', { replace: true });
    if (onClose) onClose();
  };

  const media = fetchedPost?.media || [];
  if (!showModal || !fetchedPost || !media.length) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={handleClose}>
          <span className={styles.closeIcon}>×</span>
        </button>

        <div className={styles.mediaContainer} ref={containerRef}>
          {media.map((item, index) => (
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
            author={fetchedPost?.author}
            createdAt={fetchedPost?.created_at}
            postId={fetchedPost?.id}
            className={styles.postHeaderAuthor}
            color="#fff"
          />
          {fetchedPost?.content && (
            <ExpandableText maxLength={100} text={fetchedPost.content} />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaModalSmallScreen);
