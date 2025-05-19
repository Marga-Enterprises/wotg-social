import React, { useState, useEffect, useCallback, useRef } from 'react';

// css
import styles from './index.module.css';

// redux
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../../redux/combineActions';

// components
import NoneOverlayCircularLoading from '../../../components/NoneOverlayCircularLoading';
import ReplyToCommentInput from '../../../components/ReplyToCommentInput';

// utils
import { convertMomentWithFormatWhole } from '../../../utils/methods';

const RepliesList = ({ post, socket, focusReply, parentComment }) => {
  const backendUrl = 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images';

  const dispatch = useDispatch();
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const focusRef = useRef(null);

  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize] = useState(10);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [pageDetails, setPageDetails] = useState({
    pageIndex: 1,
    totalPages: 0,
    totalRecords: 0,
  });

  const fetchComments = useCallback((pageIndex = 1) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    dispatch(wotgsocial.post.getRepliesByCommentIdAction({ commentId: parentComment.id, pageIndex, pageSize }))
      .then((res) => {
        const { replies = [], totalPages, totalRecords } = res.data || {};

        if (focusReply) {
          // scroll to the focused comment
          const focusedCommentIndex = replies.findIndex(c => c.id === focusReply.id);
          if (focusedCommentIndex !== -1) {
            const focusedComment = replies[focusedCommentIndex];
            replies.splice(focusedCommentIndex, 1); // Remove the focused comment from its original position
            replies.unshift(focusedComment); // Add it to the top
          }

          setReplies(() => {
            const remainingReplies = replies.filter(c => c.id !== focusReply.id);
            return [focusReply, ...remainingReplies];
          });

        } else {
          // If no focused comment, normal pagination behavior
          setReplies(prev => (pageIndex === 1 ? replies : [...prev, ...replies]));
        }

        setPageDetails({
          pageIndex,
          totalPages,
          totalRecords,
        });
      })
      .catch((err) => console.error('Failed to fetch replies:', err))
      .finally(() => {
        loadingRef.current = false;
        setLoading(false);
      });
  }, [dispatch, post.id, pageSize, focusReply]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (comment) => {
      if (parseInt(comment.post_id) === post.id) {
        setReplies(prev => [...prev, comment]);
      }
    };

    socket.on('new_reply', handleNewComment);
    return () => {
      socket.off('new_reply', handleNewComment);
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
  }, [replies, focusReply]);  

  return (
    <div className={styles.commentsList}>
      {replies?.map((comment, index) => (
        <React.Fragment key={index}>
          <div
            className={styles.commentItem}
            ref={comment.id === focusReply?.id ? focusRef : null}
          >
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
              <div className={styles.commentFooter}>
                <span className={styles.time}>{convertMomentWithFormatWhole(comment.created_at)}</span>
                <button
                  className={styles.replyButton}
                  onClick={() => setActiveReplyId(prev => (prev === comment.id ? null : comment.id))}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>

          {/* ✅ REPLY INPUT OUTSIDE COMMENT CARD */}
          {activeReplyId === comment.id && (
            <div className={styles.replyInputWrapper}>
              <ReplyToCommentInput
                parentComment={comment}
                postId={post.id}
                onClose={() => setActiveReplyId(null)}
              />
            </div>
          )}
        </React.Fragment>
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

export default React.memo(RepliesList);
