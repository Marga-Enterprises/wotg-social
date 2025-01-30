import React, { useState, useEffect } from 'react';
import styles from './index.module.css';

const ChatSidebar = ({ chatrooms, onSelectChatroom, onOpenCreateChatroomModal, currentUserId, onSearchChange }) => {

  const [maxLength, setMaxLength] = useState(100);

  // Detect screen size (mobile or not)
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
  
      // Calculate maxLength based on screen width and decrease proportionally
      const calculatedMaxLength = Math.max(10, Math.floor(screenWidth / 100));
      setMaxLength(calculatedMaxLength);  
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize); // Listen for resize
  
    return () => window.removeEventListener("resize", handleResize); // Cleanup listener
  }, []);

  console.log("ChatSidebar -> maxLength", maxLength);

  return (
    <>
      <div className={styles.chatContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div header className={styles.headerContentLeft}>
            <h2 className={styles.title}>Chats</h2>
          </div>
          {/*<button onClick={onOpenCreateChatroomModal} className={styles.newChatButton}>
            + New Chat
          </button>*/}
          <svg 
            onClick={onOpenCreateChatroomModal} 
            xmlns="http://www.w3.org/2000/svg" 
            className={styles.newChatButton}
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor" 
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search Name"
          className={styles.searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        {/* Chatrooms List */}
        <div className={styles.chatList}>
          {chatrooms?.length > 0 ? (
            chatrooms.map(chat => (
              <li
                key={chat.id}
                className={`${styles.chatItem} ${chat.hasUnread ? styles.unreadChat : ''}`}
                onClick={() => onSelectChatroom(chat.id)}
              >
                <div className={styles.chatDetails}>
                  <div className={styles.chatAvatarContainer}>
                    <div
                      className={styles.chatAvatar}
                      style={{
                        backgroundColor: chat.avatar ? 'transparent' : '#c0392b',
                      }}
                    >
                      {chat.avatar ? (
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className={styles.avatarImage}
                        />
                      ) : (
                        <span className={styles.avatarText}>
                          {chat.Participants?.length <= 2
                            ? chat.Participants.filter(participant => participant.user.id !== currentUserId)
                                .map((participant, index) => (
                                  <span key={index}>
                                    {participant.user.user_fname.charAt(0).toUpperCase()}
                                  </span>
                                ))
                            : chat.name
                            ? chat.name.charAt(0).toUpperCase()
                            : 'A'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className={styles.chatName}>
                      {chat.Participants?.length <= 2
                        ? chat.Participants.filter(
                            (participant) => participant.user.id !== currentUserId
                          ).map((participant, index) => (
                            <span key={index} className={styles.chatParticipant}>
                              {`${participant.user.user_fname} ${participant.user.user_lname}`.length > maxLength
                                ? `${participant.user.user_fname} ${participant.user.user_lname}`.substring(0, maxLength) + "..."
                                : `${participant.user.user_fname} ${participant.user.user_lname}`}
                            </span>
                          ))
                        : chat.name?.length > maxLength
                        ? `${chat.name.substring(0, maxLength)}...`
                        : chat.name || "Unnamed Chat"}
                    </p>
                    <p className={styles.chatMessage}>
                      {chat.RecentMessage?.content?.length > maxLength
                        ? `${chat.RecentMessage.content.substring(0, maxLength)}...`
                        : chat.RecentMessage?.content}
                    </p>
                  </div>
                </div>
                {chat.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </span>
                )}
              </li>
            ))
          ) : (
            <p className={styles.noChatrooms}>No chatrooms available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
