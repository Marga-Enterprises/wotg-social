import React, { useEffect } from 'react';
import styles from './index.module.css'; // Create this CSS file

const ActiveUsersInChatModal = ({ participants = [], onlineUsers = [], onClose }) => {
  // Log props on every render
  console.log('%c[ActiveUsersInChatModal] Rendered', 'color: #22c55e; font-weight: bold;');
  console.log('%cParticipants:', 'color: #3b82f6;', participants);
  console.log('%cOnline Users:', 'color: #3b82f6;', onlineUsers);

  // Compute who’s online
  const onlineParticipants = participants.filter((p) =>
    onlineUsers.some((u) => u.id === p.user.id)
  );

  // Log computed data
  console.log('%cFiltered Online Participants:', 'color: #facc15;', onlineParticipants);
  console.log('%cCount:', 'color: #facc15;', onlineParticipants.length);

  useEffect(() => {
    console.log('%c[ActiveUsersInChatModal] Mounted', 'color: #10b981;');
    return () => console.log('%c[ActiveUsersInChatModal] Unmounted', 'color: #ef4444;');
  }, []);

  const handleOverlayClick = () => {
    console.log('%cOverlay clicked → Closing modal...', 'color: #ef4444;');
    onClose();
  };

  const handleModalClick = (e) => {
    console.log('%cModal content clicked → Event stopped', 'color: #f97316;');
    e.stopPropagation();
  };

  const handleCloseClick = () => {
    console.log('%cClose button clicked → Closing modal...', 'color: #ef4444;');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={handleModalClick}>
        <div className={styles.header}>
          <h2>Active Users in Chat</h2>
          <button onClick={handleCloseClick} className={styles.closeBtn}>
            ×
          </button>
        </div>

        {onlineParticipants.length > 0 ? (
          <ul className={styles.userList}>
            {onlineParticipants.map((p, idx) => {
              const profileUrl = p.user.user_profile_picture
                ? `https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${p.user.user_profile_picture}`
                : `https://www.gravatar.com/avatar/${p.user.email}?d=identicon`;

              console.log(
                `%c[User ${idx + 1}] ${p.user.user_fname} ${p.user.user_lname} → Active`,
                'color: #60a5fa;'
              );

              return (
                <li key={idx} className={styles.userItem}>
                  <img
                    src={profileUrl}
                    alt={`${p.user.user_fname} ${p.user.user_lname}`}
                    className={styles.avatar}
                  />
                  <span className={styles.name}>
                    {`${p.user.user_fname} ${p.user.user_lname}`}
                  </span>
                  <span className={styles.status}>Active Now</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <>
            {console.log('%cNo one is currently online.', 'color: #9ca3af;')}
            <div className={styles.emptyState}>No one is currently online.</div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ActiveUsersInChatModal);
