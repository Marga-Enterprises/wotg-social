import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import { wotgsocial } from '../../redux/combineActions';
import { convertMomentWithFormat } from '../../utils/methods';
import PostCommentsModal from '../../components/PostCommentsModal';
import { useSocket } from '../../contexts/SocketContext';
import Cookies from 'js-cookie';

const Page = () => {
  const backendUrl = 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images';

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSocket();

  const account = Cookies.get('account');
  const parsedAccount = account ? JSON.parse(account) : null;

  const notifList = useSelector((state) => state.wotgsocial.notification.notifications || []);
  const [showPostComments, setShowPostComments] = useState(false);
  const [targetPost, setTargetPost] = useState({});
  const [targetComment, setTargetComment] = useState({});

  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  const [pageDetails, setPageDetails] = useState({
    pageIndex: 1,
    totalRecords: 0,
    totalPages: 0,
  });

  const handleNotificationClick = (notification) => {
    if (notification.targetPost) {
      setTargetPost(notification.targetPost || {});
      setTargetComment(notification.targetComment || {});
      setShowPostComments(true);
    }
  };

  const fetchNotifications = useCallback((page) => {
    dispatch(wotgsocial.notification.getNotifications({ pageIndex: page, pageSize }))
      .then((res) => {
        if (res.success && res.data?.notifications) {
          if (res.data.notifications.length < pageSize) {
            setHasMore(false);
          }

          setPageDetails({
            pageIndex: res.data.pageIndex + 1, // next page for future fetch
            totalRecords: res.data.totalRecords,
            totalPages: res.data.totalPages,
          });
        }
      });
  }, [dispatch, pageSize]);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const lastNotificationRef = useCallback(
    (node) => {
      if (!hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log('📥 Loading page:', pageDetails.pageIndex);
          fetchNotifications(pageDetails.pageIndex);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [fetchNotifications, hasMore, pageDetails.pageIndex]
  );

  return (
    <div className={styles.container}>
      {notifList.length === 0 ? (
        <p className={styles.empty}>You have no notifications.</p>
      ) : (
        notifList.map((n, index) => {
          const isLast = notifList.length === index + 1;
          return (
            <div
              key={index}
              className={`${styles.notificationItem} ${!n.is_read ? styles.unread : ''}`}
              onClick={() => handleNotificationClick(n)}
              ref={isLast ? lastNotificationRef : null}
            >
              <img
                src={n.sender?.user_profile_picture ? `${backendUrl}/${n.sender.user_profile_picture}` : `${backendUrl}/profile_place_holder.webp`}
                alt="profile"
                className={styles.avatar}
              />
              <div className={styles.content}>
                <div className={styles.message}>
                  <span className={styles.sender}>{n.sender?.name}</span>{' '}
                  <span>{n.message}</span>
                </div>
                <div className={styles.time}>{convertMomentWithFormat(n.createdAt)}</div>
              </div>
            </div>
          );
        })
      )}

      {showPostComments && targetPost && (
        <PostCommentsModal
          post={targetPost}
          socket={socket}
          onClose={() => setShowPostComments(false)}
          comment={targetComment}
          author={targetPost.author}
          user={parsedAccount}
        />
      )}
    </div>
  );
};

export default Page;
