import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../../redux/combineActions';
import NoneOverlayCircularLoading from '../../../components/NoneOverlayCircularLoading';
import { convertMomentWithFormatWhole } from '../../../utils/methods';

const CommentsList = ({ post, socket, focusComment }) => {
  const backendUrl = 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images';

  const dispatch = useDispatch();
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const focusRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize] = useState(10);
  const [pageDetails, setPageDetails] = useState({
    pageIndex: 1,
    totalPages: 0,
    totalRecords: 0,
  });

  const fetchComments = useCallback((pageIndex = 1) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    dispatch(wotgsocial.post.getCommentsByPostIdAction({ postId: post.id, pageIndex, pageSize }))
      .then((res) => {
        const { comments = [], totalPages, totalRecords } = res.data || {};

        if (focusComment) {
          // scroll to the focused comment
          const focusedCommentIndex = comments.findIndex(c => c.id === focusComment.id);
          if (focusedCommentIndex !== -1) {
            const focusedComment = comments[focusedCommentIndex];
            comments.splice(focusedCommentIndex, 1); // Remove the focused comment from its original position
            comments.unshift(focusedComment); // Add it to the top
          }

          setComments(() => {
            const remainingComments = comments.filter(c => c.id !== focusComment.id);
            return [focusComment, ...remainingComments];
          });

        } else {
          // If no focused comment, normal pagination behavior
          setComments(prev => (pageIndex === 1 ? comments : [...prev, ...comments]));
        }

        setPageDetails({
          pageIndex,
          totalPages,
          totalRecords,
        });
      })
      .catch((err) => console.error('Failed to fetch comments:', err))
      .finally(() => {
        loadingRef.current = false;
        setLoading(false);
      });
  }, [dispatch, post.id, pageSize, focusComment]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (comment) => {
      if (parseInt(comment.post_id) === post.id) {
        setComments(prev => [...prev, comment]);
      }
    };

    socket.on('new_comment', handleNewComment);
    return () => {
      socket.off('new_comment', handleNewComment);
    };
  }, [socket, post.id]);

  // 🔁 Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        !loading &&
        pageDetails.pageIndex < pageDetails.totalPages
      ) {
        fetchComments(pageDetails.pageIndex + 1);
      }
    }, {
      threshold: 1,
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loading, pageDetails.pageIndex, pageDetails.totalPages, fetchComments]);

  useEffect(() => {
    if (focusRef.current) {
      setTimeout(() => {
        focusRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 100); // Ensure the DOM has rendered
    }
  }, [comments, focusComment]);  

  return (
    <div className={styles.commentsList}>
      {comments?.map((comment, index) => (
        <div className={styles.commentItem} key={index} ref={comment.id === focusComment?.id ? focusRef : null}>
          <img
            className={styles.avatar}
            src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${comment.author?.user_profile_picture || 'profile_place_holder.webp'}`}
            alt={comment.author?.user_fname}
          />
          <div className={styles.commentBody}>
            <div className={styles.name}>
              {comment.author?.user_fname} {comment.author?.user_lname}
            </div>
            <div className={styles.text}>{comment.content}</div>
            <div className={styles.media}>
              {comment?.media?.map((media, idx) => (
                <img
                  key={idx}
                  src={`${backendUrl}/${media.url}`}
                  alt="media"
                  className={styles.mediaImage}
                />
              ))}
            </div>
            <div className={styles.time}>{convertMomentWithFormatWhole(comment.created_at)}</div>
          </div>
        </div>
      ))}

      {/* 👇 Invisible element to detect scroll */}
      <div ref={observerRef} style={{ height: '1px' }} />

      {/* 👇 Loader at the bottom if more data available */}
      {loading && (
        <div style={{ marginTop: '1rem' }}>
          <NoneOverlayCircularLoading />
        </div>
      )}
    </div>
  );
};

export default React.memo(CommentsList);
