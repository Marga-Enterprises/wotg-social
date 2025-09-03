import React from 'react';
import styles from './index.module.css'; // Create this CSS file

const ActiveUsersInChatModal = ({ participants = [], onlineUsers = [], onClose }) => {
  const onlineParticipants = participants.filter(p =>
    onlineUsers.some(u => u.id === p.user.id)
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Active Users in Chat</h2>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        {onlineParticipants.length > 0 ? (
          <ul className={styles.userList}>
            {onlineParticipants.map((p, idx) => (
              <li key={idx} className={styles.userItem}>
                <img
                  src={
                    p.user.user_profile_picture
                      ? `https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${p.user.user_profile_picture}`
                      : `https://www.gravatar.com/avatar/${p.user.email}?d=identicon`
                  }
                  alt={`${p.user.user_fname} ${p.user.user_lname}`}
                  className={styles.avatar}
                />
                <span className={styles.name}>{`${p.user.user_fname} ${p.user.user_lname}`}</span>
                <span className={styles.status}>Active Now</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyState}>No one is currently online.</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ActiveUsersInChatModal);
