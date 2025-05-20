import React, { useState, useEffect, useCallback, useRef } from 'react';

// css
import styles from './index.module.css';

// redux
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../../redux/combineActions';

// components
import NoneOverlayCircularLoading from '../../../components/NoneOverlayCircularLoading';
import ReplyToCommentInput from '../../../components/ReplyToCommentInput';

// subsections
import RepliesList from '../../../subsections/feeds/RepliesList';

// utils
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

  const [activeReplyId, setActiveReplyId] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [targetReply, setTargetReply] = useState(null);

  const [pageDetails, setPageDetails] = useState({
    pageIndex: 1,
    totalPages: 0,
    totalRecords: 0,
  });

  const handleShowReplies = (commentId) => {
    if (activeReplyId === commentId) {
      setShowReplies(false);
    } else {
      setShowReplies(true);
      setActiveReplyId(commentId);
    }
  };

  const handleGetTargetReply = (reply) => {
    setTargetReply(reply);
    setActiveReplyId(reply.parent_comment_id);
    setShowReplies(true);
  };

  const fetchComments = useCallback((pageIndex = 1) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    dispatch(wotgsocial.post.getCommentsByPostIdAction({ postId: post.id, pageIndex, pageSize }))
      .then((res) => {
        const { comments = [], totalPages, totalRecords } = res.data || {};

        if (focusComment && focusComment.level === 0) {
          const focusedIndex = comments.findIndex(c => c.id === focusComment.id);
          if (focusedIndex !== -1) {
            const focused = comments[focusedIndex];
            comments.splice(focusedIndex, 1);
            comments.unshift(focused);
          }

          setComments(() => {
            const others = comments.filter(c => c.id !== focusComment.id);
            return [focusComment, ...others];
          });

        } else if (focusComment && focusComment.level === 1) {
          const focusedIndex = comments.findIndex(c => c.id === focusComment.id);
          if (focusedIndex !== -1) {
            const focused = comments[focusedIndex];
            comments.splice(focusedIndex, 1);
            comments.unshift(focused);
          }

          setTargetReply(focusComment);
          setActiveReplyId(focusComment.parent_comment_id);
          setShowReplies(true);

          setComments(() => {
            const others = comments.filter(c => c.id !== focusComment.id);
            return [focusComment, ...others];
          });

        } else {
          setComments(prev => (pageIndex === 1 ? comments : [...prev, ...comments]));

          if (pageIndex === 1 && comments.length > 0) {
            setTimeout(() => {
              const first = document.querySelector(`.${styles.commentItem}`);
              if (first) first.scrollIntoView({ behavior: 'auto', block: 'center' });
            }, 100);
          }
        }

        setPageDetails({ pageIndex, totalPages, totalRecords });
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

    const handleIncrementCommentReplyCount = (reply) => {
      setComments(prev => prev.map(comment => {
        if (comment.id === reply.parent_comment_id) {
          return { ...comment, reply_count: comment.reply_count + 1 };
        }
        return comment;
      }));
    };

    socket.on('new_comment', handleNewComment);
    socket.on('new_reply', handleIncrementCommentReplyCount);

    return () => {
      socket.off('new_reply', handleIncrementCommentReplyCount);
      socket.off('new_comment', handleNewComment);
    };
  }, [socket, post.id]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        !loading &&
        pageDetails.pageIndex < pageDetails.totalPages
      ) {
        fetchComments(pageDetails.pageIndex + 1);
      }
    }, { threshold: 1 });

    if (observerRef.current) observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loading, pageDetails.pageIndex, pageDetails.totalPages, fetchComments]);

  useEffect(() => {
    if (focusRef.current) {
      setTimeout(() => {
        focusRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 100);
    }
  }, [comments, focusComment]);

  return (
    <div className={styles.commentsList}>
      {comments?.map((comment, index) => (
        <React.Fragment key={index}>
          <div
            className={styles.commentItem}
            ref={comment.id === focusComment?.id ? focusRef : null}
          >
            <img
              className={styles.avatar}
              src={`${backendUrl}/${comment.author?.user_profile_picture || 'profile_place_holder.webp'}`}
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

                {comment?.reply_count > 0 && (
                  <button
                    className={styles.replyButton}
                    onClick={() => handleShowReplies(comment.id)}
                  >
                    {comment.reply_count} {comment.reply_count > 1 ? 'Replies' : 'Reply'}
                  </button>
                )}

                <button
                  className={styles.replyButton}
                  onClick={() =>
                    setActiveReplyId(prev => (prev === comment.id ? null : comment.id))
                  }
                >
                  Reply
                </button>
              </div>
            </div>
          </div>

          {showReplies && activeReplyId === comment.id && (
            <div className={styles.repliesListWrapper}>
              <RepliesList
                post={post}
                parentComment={comment}
                socket={socket}
                focusReply={targetReply}
              />
            </div>
          )}

          {activeReplyId === comment.id && (
            <div className={styles.replyInputWrapper}>
              <ReplyToCommentInput
                parentComment={comment}
                postId={post.id}
                onClose={() => setActiveReplyId(null)}
                onGetFocusReply={handleGetTargetReply}
              />
            </div>
          )}
        </React.Fragment>
      ))}

      <div ref={observerRef} style={{ height: '1px' }} />

      {loading && (
        <div style={{ marginTop: '1rem' }}>
          <NoneOverlayCircularLoading />
        </div>
      )}
    </div>
  );
};

export default React.memo(CommentsList);
