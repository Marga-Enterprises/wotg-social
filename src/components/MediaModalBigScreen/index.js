import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

// css
import styles from './index.module.css';

// sections
import PostCommentSection from '../../sections/PostCommentSection';

// redux
import { wotgsocial } from '../../redux/combineActions';

const MediaModalBigScreen = ({ post, user, socket, onClose }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [fetchedPost, setFetchedPost] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Get query param ?post=...
  const urlParams = new URLSearchParams(location.search);
  const modalPostId = urlParams.get('post');

  // Open modal only if URL matches this post
  useEffect(() => {
    if (modalPostId === String(post?.id)) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [modalPostId, post?.id]);

  // Fetch post details
  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        const response = await dispatch(wotgsocial.post.getPostByIdAction({ id: post.id }));
        if (isMounted) {
          setFetchedPost(response?.data || null);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
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

  const media = fetchedPost?.media || [];
  const currentMedia = media[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < media.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleClose = () => {
    setShowModal(false);
    navigate('/feeds', { replace: true });
    if (onClose) onClose(); // Optional: still call parent onClose if needed
  };

  if (!showModal || !fetchedPost || !media.length) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={handleClose}>×</button>

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

        {/* Comments Section */}
        <div className={styles.commentSection}>
          <PostCommentSection
            post={fetchedPost}
            socket={socket}
            author={fetchedPost.author}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaModalBigScreen);
