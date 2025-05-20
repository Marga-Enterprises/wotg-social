// components/Notifications.jsx
import React, { useState } from 'react';
import styles from './index.module.css';
import NoneOverlayCircularLoading from '../NoneOverlayCircularLoading';
import { convertMomentWithFormat } from '../../utils/methods';

// sub sections
import PostCommentsModal from '../PostCommentsModal';

const Notifications = ({ notifList, unreadCount, onNavigate, loading, socket, user }) => {
  const backendUrl = 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images';

  const [showPostComments, setShowPostComments] = useState(false);
  const [targetPost, setTargetPost] = useState({});
  const [targetComment, setTargetComment] = useState({});
  const [targetReply, setTargetReply] = useState({});

  const handleNotificationClick = (notification) => {
    if (notification.targetPost) {
      if (notification.targetComment) {
        console.log('Target Comment:', notification.targetComment);
        setTargetComment(notification.targetComment);
      }

      setTargetPost(notification.targetPost);
      setShowPostComments(true);
    }
  }

  return (
    <div className={styles.notificationPanel}>
      <div className={styles.header}>
        <span>Notifications</span>
        <span className={styles.unreadCount}>{unreadCount}</span>
      </div>

      <div className={styles.notificationsList}>
        {notifList?.map((n, index) => (
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
                <span className={styles.sender}>{n.sender?.name}</span>{" "}
                <span>{n.message}</span>
              </div>
              <div className={styles.meta}>
                {n.icon && <span className={styles.icon}>{n.icon}</span>}
                <span className={styles.time}>{convertMomentWithFormat(n.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <NoneOverlayCircularLoading />}

      <div className={styles.footer}>
        <button onClick={() => onNavigate('/notifications')}>See previous notifications</button>
      </div>

      {showPostComments && targetPost && (
        <PostCommentsModal
          post={targetPost}
          socket={socket}
          comment={targetComment}
          onClose={() => setShowPostComments(false)}
          author={targetPost.author}
          user={user}
        />
      )}
    </div>
  );
};

export default React.memo(Notifications);
