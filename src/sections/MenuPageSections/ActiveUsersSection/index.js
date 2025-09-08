import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import { useSocket } from '../../../contexts/SocketContext';

const ActiveUsersSection = () => {
  const socket = useSocket();

  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [activeUsersDetails, setActiveUsersDetails] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users) => {
      setActiveUsersDetails(Object.values(users));
      setActiveUsersCount(Object.keys(users).length);
    };

    socket.on('online_users', handleOnlineUsers);

    // Request current online users when re-entering the page
    socket.emit('get_online_users'); // Ensure your backend supports this

    return () => {
      socket.off('online_users', handleOnlineUsers); // Cleanup on unmount
    };
  }, [socket]);

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>
          <span className={styles.dot}></span> Live Community
        </span>
        <span className={styles.status}>● Live</span>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <div className={styles.statHoverWrapper}>
            <div className={styles.statValue}>{activeUsersCount}</div>
            <div className={styles.hoverDetails}>
              {activeUsersDetails.length > 0 ? (
                activeUsersDetails.map((user, index) => (
                  <div key={index} className={styles.userLine}>
                    {user.fullName}
                  </div>
                ))
              ) : (
                <div className={styles.userLine}>No active users</div>
              )}
            </div>
          </div>
          <div className={styles.statLabel}>Active Users Now</div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ActiveUsersSection);
