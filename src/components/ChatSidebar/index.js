import React, { useState, useEffect } from 'react';
import styles from './index.module.css';

const ChatSidebar = ({ 
  chatrooms, 
  onSelectChatroom, 
  onOpenCreateChatroomModal,
  currentUserId, 
  onSearchChange,
  selectedChatroom
}) => {

  const [maxLength, setMaxLength] = useState(100);

  const backendUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://community.wotgonline.com/api';

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

  const handleChatSelection = (chatId) => {
    onSelectChatroom(chatId);
  };
  

  return (
    <>
      <div className={styles.chatContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div header className={styles.headerContentLeft}>
            <h2 className={styles.title}>MESSAGES</h2>
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
                className={`${styles.chatItem} 
                            ${chat.hasUnread ? styles.unreadChat : ''} 
                            ${selectedChatroom === chat.id ? styles.selectedChat : ''}`}
                onClick={() => handleChatSelection(chat.id)}
              >
                <div className={styles.chatDetails}>
                  <div className={styles.chatAvatarContainer}>
                    <div
                      className={styles.chatAvatar}
                      style={{
                        backgroundColor: chat.avatar ? 'transparent' : '#c0392b',
                      }}
                    >
                      {chat.Participants?.length === 2 ? (
                        // Find the receiver (the participant who is NOT the current user)
                        chat.Participants.filter(participant => participant.user.id !== currentUserId)
                          .map((participant, index) => {
                            if (participant.user.user_profile_picture) {
                              return (
                                <img
                                  loading="lazy"
                                  key={index}
                                  src={`${backendUrl}/uploads/${participant.user.user_profile_picture}`}
                                  alt={participant.user.user_fname}
                                  className={styles.avatarImage}
                                />
                              );
                            } else {
                              return (
                                <img
                                  loading="lazy"
                                  key={index}
                                  src={`https://www.gravatar.com/avatar/07be68f96fb33752c739563919f3d694?s=200&d=identicon&quot`}
                                  alt={participant.user.user_fname}
                                  className={styles.avatarImage}
                                />
                              );
                            }
                          })
                      ) : (
                        // If it's a group chat (more than 2 participants), show the chat name's first letter
                        <span className={styles.avatarText}>
                          {chat.name ? chat.name.charAt(0).toUpperCase() : 'A'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p 
                      className={`${styles.chatName} ${
                        selectedChatroom === chat.id ? styles.selectedChatName : ''
                      }`}
                    >
                      {chat.Participants?.length <= 2
                        ? chat.Participants.filter(
                            (participant) => participant.user.id !== currentUserId
                          ).map((participant, index) => (
                            <span key={index}>
                              {`${participant.user.user_fname} ${participant.user.user_lname}`}
                            </span>
                          ))
                        : chat.name || "Unnamed Chat"}
                    </p>
                    <p className={styles.chatMessage}>
                      {chat.RecentMessage
                        ? chat.RecentMessage.senderId === currentUserId
                          ? `You: ${
                              chat.RecentMessage.content.length > maxLength
                                ? `${chat.RecentMessage.content.substring(0, maxLength)}...`
                                : chat.RecentMessage.content
                            }`
                          : chat.RecentMessage.content.length > maxLength
                          ? `${chat.RecentMessage.content.substring(0, maxLength)}...`
                          : chat.RecentMessage.content
                        : ""}
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
