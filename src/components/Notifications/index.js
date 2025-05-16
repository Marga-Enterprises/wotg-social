// components/Notifications.jsx
import React from 'react';
import styles from './index.module.css';
import NoneOverlayCircularLoading from '../NoneOverlayCircularLoading';
import { convertMomentWithFormat } from '../../utils/methods';

const Notifications = ({ notifList, unreadCount, onNavigate, loading }) => {
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
            onClick={() => onNavigate(n.redirectTo || '/')}
          >
            <img
              src={n.sender?.profilePic || '/default-profile.png'}
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
    </div>
  );
};

export default React.memo(Notifications);
