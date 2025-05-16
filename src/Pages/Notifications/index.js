import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import { wotgsocial } from '../../redux/combineActions';
import { convertMomentWithFormat } from '../../utils/methods';

const Page = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notifList = useSelector((state) => state.wotgsocial.notification.notifications || []);

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
            onClick={() => navigate(n.redirectTo || '/')}
          >
            <img
              src={n.sender?.profilePic || '/default-profile.png'}
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
    </div>
  );
};

export default Page;
