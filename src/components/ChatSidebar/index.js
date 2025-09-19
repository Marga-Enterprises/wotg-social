import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const ChatSidebar = ({ 
  chatrooms, 
  onSelectChatroom, 
  onOpenCreateChatroomModal,
  currentUserId, 
  onSearchChange,
  selectedChatroom,
  onlineUsers,
}) => {
  const [maxLength, setMaxLength] = useState(100);
  const [showAllWelcome, setShowAllWelcome] = useState(false);

  const backendUrl = useMemo(
    () => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images',
    []
  );

  const getSortedChats = useCallback((chats) => {
    return [...chats].sort((a, b) => {
      const aTime = new Date(a.RecentMessage?.createdAt || a.updatedAt || 0).getTime();
      const bTime = new Date(b.RecentMessage?.createdAt || b.updatedAt || 0).getTime();
      return bTime - aTime; // newest on top
    });
  }, []);


  // 🔹 Responsive maxLength
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const calculatedMaxLength = Math.max(10, Math.floor(screenWidth / 100));
      setMaxLength(calculatedMaxLength);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChatSelection = useCallback((chatId) => {
    onSelectChatroom(chatId);
  }, [onSelectChatroom]);


  // 🔹 Chat Item Renderer
  const renderChatItem = (chat) => (
    <li
      key={chat.id}
      className={`${styles.chatItem} 
                  ${chat.hasUnread ? styles.unreadChat : ''} 
                  ${selectedChatroom === chat.id ? styles.selectedChat : ''}`}
      onClick={() => handleChatSelection(chat.id)}
    >
      <div className={styles.chatDetails}>
        {/* Avatar */}
        <div className={styles.chatAvatarContainer}>
          <div
            className={styles.chatAvatar}
            style={{
              backgroundColor: chat.avatar ? 'transparent' : '#c0392b',
            }}
          >
            {chat.Participants?.length === 2 ? (
              chat.Participants.filter(
                (participant) => participant.user.id !== currentUserId
              ).map((participant, index) => {
                const isOnline = onlineUsers.some(u => u.id === participant.user.id);
                return (
                  <div key={index} className={styles.avatarWrapper}>
                    <img
                      loading="lazy"
                      src={
                        participant.user.user_profile_picture
                          ? `${backendUrl}/${participant.user.user_profile_picture}`
                          : `https://www.gravatar.com/avatar/07be68f96fb33752c739563919f3d694?s=200&d=identicon`
                      }
                      alt={participant.user.user_fname}
                      className={styles.avatarImage}
                    />
                    {isOnline && <span className={styles.avatarOnlineDot} />}
                  </div>
                );
              })
            ) : (
              <span className={styles.avatarText}>
                {chat?.chatroom_photo ? (
                  <img
                    src={`${backendUrl}/${chat.chatroom_photo}`}
                    alt="Chatroom"
                    className={styles.avatarImage}
                  />
                ) : (
                  chat?.name ? chat.name.charAt(0).toUpperCase() : 'A'
                )}
              </span>
            )}
          </div>
        </div>

        {/* Chat Info */}
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
                  <span key={index} className={styles.chatUserName}>
                    {`${participant.user.user_fname} ${participant.user.user_lname}`}
                    {onlineUsers.some((u) => u.id === participant.user.id) && (
                      <span className={styles.onlineDot} title="Online"></span>
                    )}
                  </span>
                ))
              : chat.name || "Unnamed Chat"}
          </p>

          <p className={styles.chatMessage}>
            {chat.RecentMessage ? (() => {
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(chat.RecentMessage.content);
              const sender = chat.Participants?.find(
                p => p.user.id === chat.RecentMessage.senderId
              )?.user;

              if (isImage) {
                return `${sender?.user_fname || 'Someone'} sent an image.`;
              }

              const trimmedContent =
                chat.RecentMessage.content.length > maxLength
                  ? `${chat.RecentMessage.content.substring(0, maxLength)}...`
                  : chat.RecentMessage.content;

              return trimmedContent;
            })() : ''}
          </p>
        </div>
      </div>

      {/* Unread Badge */}
      {chat.unreadCount > 0 && (
        <span className={styles.unreadBadge}>
          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
        </span>
      )}
    </li>
  );

  // 🔹 Split chats
  const welcomeChats = useMemo(() => getSortedChats(chatrooms?.filter(c => c.welcome_chat) || []), [chatrooms, getSortedChats]);
  const personalChats = useMemo(() => getSortedChats(chatrooms?.filter(c => !c.welcome_chat) || []), [chatrooms, getSortedChats]);

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContentLeft}>
          <FontAwesomeIcon
            icon={faCirclePlus}
            className={styles.newChatButton}
            onClick={onOpenCreateChatroomModal}
            title="Add New Chat"
          />

          <div>
            <Link className={styles.worshipLink} to="/bible">Bible</Link>
            <Link className={styles.worshipLink} to="/worship">Worship</Link>
            <Link className={styles.worshipLink} to="/blogs">Devotion</Link>
            <Link className={styles.worshipLink} to="/music">Music</Link>
            <Link className={styles.worshipLink} to="/your-journals">Journal</Link>
            <Link className={styles.worshipLink} to="/feeds">Feeds</Link>
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
        {chatrooms === undefined || chatrooms === null ? (
          // 🔹 Loading spinner
          <div className={styles.loadingWrapper}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : chatrooms.length > 0 ? (
          <>
            {/* If there are welcome chats, show grouped sections */}
            {welcomeChats.length > 0 ? (
              <>
                {/* Welcome Chats */}
                <div className={styles.section}>
                  <h4 className={styles.sectionTitle}>Welcome Chats</h4>
                  <ul>
                    {(showAllWelcome ? welcomeChats : welcomeChats.slice(0, 5))
                      .map(chat => renderChatItem(chat))}
                  </ul>
                  {welcomeChats.length > 5 && (
                    <button
                      className={styles.seeMoreBtn}
                      onClick={() => setShowAllWelcome(!showAllWelcome)}
                    >
                      {showAllWelcome ? 'See Less' : 'See More'}
                    </button>
                  )}
                </div>

                {/* Personal Chats */}
                {personalChats.length > 0 && (
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Personal Chats</h4>
                    <ul>
                      {personalChats.map(chat => renderChatItem(chat))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              // If no welcome chats, just show personal chats without heading
              <ul>
                {personalChats.map(chat => renderChatItem(chat))}
              </ul>
            )}
          </>
        ) : (
          <p className={styles.noChatrooms}>No chatrooms available</p>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatSidebar);
