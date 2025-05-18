import React, { useState, useEffect } from 'react';
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

  const handleNotificationClick = (notification) => {
    if (notification.targetPost) {
      setTargetPost(notification.targetPost || []);
      setTargetComment(notification.targetComment || {});
      setShowPostComments(true);
    }
  }

  useEffect(() => {
    dispatch(wotgsocial.notification.getNotifications({ pageIndex: 1, pageSize: 50 }));
  }, [dispatch]);

  return (
    <div className={styles.container}>
      {notifList.length === 0 ? (
        <p className={styles.empty}>You have no notifications.</p>
      ) : (
        notifList.map((n, index) => (
          <div
            key={index}
            className={`${styles.notificationItem} ${!n.is_read ? styles.unread : ''}`}
            onClick={() => handleNotificationClick(n)}
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
        ))
      )}

      {/* ✅ Move the modal here, outside the loop */}
      {showPostComments && targetPost && (
        <PostCommentsModal
          post={targetPost}
          socket={socket}
          onClose={() => {
            console.log('PostCommentsModal closed');
            setShowPostComments(false);
          }}
          comment={targetComment}
          author={targetPost.author}
          user={parsedAccount}
        />
      )}
    </div>
  );
};

export default Page;
