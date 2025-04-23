import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import Cookie from 'js-cookie';

const ChatSidebar = ({ 
  chatrooms, 
  onSelectChatroom, 
  onOpenCreateChatroomModal,
  currentUserId, 
  onSearchChange,
  selectedChatroom,
  toggleMenu
}) => {
  const account = Cookie.get('account') ? JSON.parse(Cookie.get('account')) : null;
  const role = account ? account.user_role : null;
  const isAdmin = role === 'admin' || role === 'owner';

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
          {/*<div header className={styles.headerContentLeft}>
            <h2 className={styles.title}>MESSAGES</h2>
          </div>*/}
          <div header className={styles.headerContentLeft}>
            <FontAwesomeIcon
              icon={faCirclePlus}
              className={styles.newChatButton}
              onClick={onOpenCreateChatroomModal}
              title="Add New Chat"
            />

            <div>
              <FontAwesomeIcon
                icon={faBars}
                className={styles.menuButton}
                onClick={toggleMenu}
                title="Open Menu"
              />

              <a className={styles.worshipLink} href="/bible">Bible</a>
              <a className={styles.worshipLink} href="/worship">Worship</a>
              <a className={styles.worshipLink} href="/blogs">Devotion</a>
              {isAdmin && (<a className={styles.worshipLink} href="/music-dashboard">Music</a>)}
              <a className={styles.worshipLink} href="/your-journals">Journal</a>
            </div>
          </div>
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
                      {chat.RecentMessage ? (() => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(chat.RecentMessage.content);
                        const sender = chat.Participants?.find(p => p.user.id === chat.RecentMessage.senderId)?.user;

                        if (isImage) {
                          return `${sender?.user_fname || 'Someone'} sent an image.`;
                        }

                        const trimmedContent = chat.RecentMessage.content.length > maxLength
                          ? `${chat.RecentMessage.content.substring(0, maxLength)}...`
                          : chat.RecentMessage.content;

                        return trimmedContent;
                      })() : ''}
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
