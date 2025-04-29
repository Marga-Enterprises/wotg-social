  import React, { Suspense, startTransition, lazy, useEffect, useRef, useState, useCallback, useMemo } from 'react';
  import data from '@emoji-mart/data';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faFaceSmile, faPaperPlane, faPaperclip, faTimes } from '@fortawesome/free-solid-svg-icons';
  import { faFaceSmile as faFaceSmileRegular } from '@fortawesome/free-regular-svg-icons';
  import debounce from 'lodash/debounce';
  import styles from './index.module.css';
  import LoadingSpinner from '../LoadingSpinner';

  // COMPONENT IMPORTS
  const MessageImageModal = lazy(() => import('../MessageImageModal'));

  const Picker = React.lazy(() => import('@emoji-mart/react'));

  const ChatWindow = ({ 
    messages, 
    onSendMessage, 
    selectedChatroom, 
    userId, 
    onBackClick, 
    isMobile, 
    selectedChatroomDetails, 
    onOpenAddParticipantModal, 
    onMessageReaction, 
    userDetails,
    uploading
  }) => {

    const backendUrl = useMemo(() =>
      'https://wotg.sgp1.cdn.digitaloceanspaces.com/images',
      []
    );
      
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [realtimeMessages, setRealtimeMessages] = useState([...messages]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeMessageId, setActiveMessageId] = useState(null);
    const [showMessageReactors, setShowMessageReactors] = useState(false);
    const [selectedMessageReactions, setSelectedMessageReactions] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [modalImageUrl, setModalImageUrl] = useState(null);

    const longPressTimeout = useRef(null);
    const messagesEndRef = useRef(null); // This ref will target the bottom of the messages container
    const emojiPickerRef = useRef(null); 
    const fileInputRef = useRef(null);

    // Sync initial messages with realtimeMessages
    useEffect(() => {
      setRealtimeMessages([...messages]);
    }, [messages]);
    
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' }); 
      }
    }

    const handleFileIconClick = () => {
      fileInputRef.current?.click();
    };
    
    const handleFileChange = useCallback(debounce((e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }, 300), []);  
    
    const removePreview = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
    };
    
    // Handle Send Message
    const handleSend = () => {
      if ((!message.trim() && !selectedFile) || !selectedChatroom) return;
    
      // Pass both message and file to the parent handler
      onSendMessage(message, selectedFile);
    
      setMessage('');       // Clear input
      removePreview();      // Reset file selection
    
      // Reset textarea height
      const textarea = document.querySelector(`.${styles.messageTextarea}`);
      if (textarea) {
        textarea.style.height = 'auto';
      }
    
      // ✅ Wait for DOM update and then scroll to bottom safely
      setTimeout(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }, 100); // zero delay works best when using rAF
    };
    

    const renderMessageContent = useCallback((content, type) => {
      const isImage = type === 'file';

      if (isImage) {
        return (
          <>
            <img
              src={`${backendUrl}/${content}`}
              alt="sent-img"
              className={styles.chatImage}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onClick={() => handleImageClick(`${backendUrl}/${content}`)}
            />
          </>
        );
      }
    
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return content.split(urlRegex).map((part, index) =>
        urlRegex.test(part) ? (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        ) : (
          part
        )
      );
    }, [backendUrl]);  

    const handleShowMessageReactors = useCallback((messageId) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (message && message.reactions.length > 0) {
        setSelectedMessageReactions(message.reactions);
        setShowMessageReactors(true);
      }
    }, [messages]);

    const closeMessageReactors = () => {
      setShowMessageReactors(false);
      setSelectedMessageReactions([]);
    };
    

    // Handle Enter key press to send the message
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Shift + Enter: Allow new line
          return;
        } else {
          // Enter: Submit the message
          e.preventDefault();
          handleSend();
        }
      }
    };

    const handleTextareaChange = (e) => {
      const textarea = e.target;

      // Dynamically adjust height
      textarea.style.height = 'auto'; // Reset height to auto
      const maxHeight = parseFloat(getComputedStyle(textarea).lineHeight) * 5; // Limit to 5 rows
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;

      setMessage(textarea.value); // Update the message state
    };

    const handleShowMessageReacts = useCallback((messageId) => {
      setActiveMessageId((prevId) => (prevId === messageId ? null : messageId));
    }, []);
    
    const participantsMap = useMemo(() => {
      const map = new Map();
      selectedChatroomDetails?.Participants?.forEach(participant => {
        map.set(participant.user.id, participant.user);
      });
      return map;
    }, [selectedChatroomDetails?.Participants]);
    

    const renderedMessages = useMemo(() => {
      return realtimeMessages.map((msg, index) => {
        const isSender = msg.senderId === userId;
    
        const receiver = participantsMap.get(msg.senderId);
    
        const groupedReactions = msg?.reactions?.reduce((acc, reaction) => {
          acc[reaction.react] = (acc[reaction.react] || 0) + 1;
          return acc;
        }, {});
    
        return (
          <div key={msg.id || index} className={isSender ? styles.messageSender : styles.messageReceiver}>
            {!isSender && (
              <img
                loading="lazy"
                src={receiver?.user?.user_profile_picture
                  ? `${backendUrl}/${receiver.user.user_profile_picture}`
                  : "https://www.gravatar.com/avatar/07be68f96fb33752c739563919f3d694?s=200&d=identicon"}
                alt={receiver?.user?.user_fname || "User Avatar"}
                className={styles.receiverAvatar}
              />
            )}
    
            <div
              className={`${styles.messageBubble} ${isSender ? styles.senderBubble : styles.receiverBubble}`}
              {...(!isSender && {
                onMouseDown: (e) => handleLongPress(e, msg.id),
                onTouchStart: (e) => handleLongPress(e, msg.id),
              })}
            >
              {!isSender && selectedChatroomDetails?.Participants?.length > 2 && (
                <p className={styles.senderName}>{msg?.sender?.user_fname} {msg?.sender?.user_lname}</p>
              )}
              {msg?.content ? renderMessageContent(msg.content, msg.type) : "No content available"}
    
              {msg?.reactions?.length > 0 && (
                <div
                  onClick={() => handleShowMessageReactors(msg.id)}
                  className={styles.reactionDisplay}
                >
                  {Object.entries(groupedReactions).map(([type, count], i) => (
                    <span key={i} className={styles.reactionItem}>
                      {type === "heart" && "❤️"}
                      {type === "clap" && "👏"}
                      {type === "pray" && "🙏"}
                      {type === "praise" && "🙌"}
                    </span>
                  ))}
                  <span className={styles.totalReactionCount}>{msg?.reactions?.length}</span>
                </div>
              )}
            </div>
    
            {!isSender && (
              <div>
                <FontAwesomeIcon
                  onClick={() => handleShowMessageReacts(msg.id)}
                  icon={faFaceSmileRegular}
                  className={styles.messageReactIcon}
                />
              </div>
            )}
    
            {activeMessageId === msg.id && !isSender && (
              <div className={styles.messageReactions}>
                {["heart", "clap", "pray", "praise"].map((reaction) => (
                  <button key={reaction} onClick={() => handleMessageReaction(reaction, msg.id)}>
                    {reaction === "heart" && "❤️"}
                    {reaction === "clap" && "👏"}
                    {reaction === "pray" && "🙏"}
                    {reaction === "praise" && "🙌"}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      });
    }, [realtimeMessages, userId, selectedChatroomDetails, activeMessageId]);  

    const handleLongPress = useCallback((e, messageId) => {
      e.preventDefault();
      longPressTimeout.current = setTimeout(() => {
        handleShowMessageReacts(messageId);
      }, 600);
    }, [handleShowMessageReacts]);  

    // Cancel long press if user releases early
    const cancelLongPress = () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };

    const handleImageClick = (url) => {
      startTransition(() => {
        setModalImageUrl(url);
      });
    }; 

    // Attach cancel on mouse/touch release
    useEffect(() => {
      document.addEventListener("mouseup", cancelLongPress);
      document.addEventListener("touchend", cancelLongPress);

      return () => {
        document.removeEventListener("mouseup", cancelLongPress);
        document.removeEventListener("touchend", cancelLongPress);
      };
    }, []);

    // Handle emoji selection
    const handleEmojiSelect = (emoji) => {
      setMessage((prevMessage) => prevMessage + emoji.native);
    };

    // Toggle emoji picker visibility
    const toggleEmojiPicker = () => {
      startTransition(() => {
        setShowEmojiPicker((prevState) => !prevState);
      });
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        // Close Emoji Picker if clicked outside
        if (
          emojiPickerRef.current && 
          !emojiPickerRef.current.contains(event.target)
        ) {
          setShowEmojiPicker(false);
        }
    
        // Close Reaction Drawer if clicked outside (EXCLUDE MESSAGE REACTIONS)
        if (
          !event.target.closest(`.${styles.reactionButton}`) && 
          !event.target.closest(`.${styles.messageReactions}`) // 🔥 Prevent closing when clicking inside the drawer
        ) {
          setActiveMessageId(null); // Keep this but prevent it from closing when clicking inside reactions
        }
      };
    
      document.addEventListener("mousedown", handleClickOutside);
    
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showEmojiPicker]);

    const handleMessageReaction = useCallback((reaction, messageId) => {
      if (onMessageReaction) {
        onMessageReaction(messageId, reaction);
      }
      setActiveMessageId(null);
    }, [onMessageReaction]);

    useEffect(() => {
      if (selectedChatroom === null && isMobile) {
        onBackClick();
      }
    }, [selectedChatroom]);

    return (
      <>
          { selectedChatroom ? (
            <div className={styles.chatContainer}>
              <div className={styles.chatHeader}>
                {isMobile && onBackClick && selectedChatroomDetails && (
                    <div className={styles.backButtonContainer}>
                      <button
                        className={styles.backButton}
                        onClick={onBackClick}
                        aria-label="Back to chatrooms"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth="3.0" 
                          stroke="currentColor" 
                          className={styles.backIcon}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                      </button>
                    </div>
                  )}
                  { selectedChatroomDetails && (
                    <div className={styles.participantDetails}>
                      <div
                        className={styles.chatAvatar}
                        style={{
                          backgroundColor: selectedChatroomDetails?.avatar ? 'transparent' : '#c0392b',
                        }}
                      >
                        {selectedChatroomDetails?.Participants?.length === 2 ? (
                          // Find the receiver (the participant who is NOT the current user)
                          selectedChatroomDetails.Participants.filter(participant => participant?.user.id !== userId)
                            .map((participant, index) => {
                              return participant.user.user_profile_picture ? (
                                <img
                                  loading="lazy"
                                  key={index}
                                  onClick={onOpenAddParticipantModal}
                                  src={`${backendUrl}/${participant.user.user_profile_picture}`}
                                  alt={participant.user.user_fname}
                                  className={styles.avatarImage}
                                />
                              ) : (
                                <img
                                  key={index}
                                  loading="lazy"
                                  onClick={onOpenAddParticipantModal}
                                  src={`https://www.gravatar.com/avatar/07be68f96fb33752c739563919f3d694?s=200&d=identicon&quot`}
                                  alt={participant.user.user_fname}
                                  className={styles.avatarImage}
                                />
                              );
                            })
                        ) : (
                          // If it's a group chat (more than 2 participants), show the chat name's first letter
                          <span onClick={onOpenAddParticipantModal} className={styles.avatarText}>
                            {selectedChatroomDetails?.name ? selectedChatroomDetails.name.charAt(0).toUpperCase() : 'A'}
                          </span>
                        )}
                      </div>

                      {/* Chat Name Display */}
                      <p className={styles.chatNameHeader}>
                        {selectedChatroomDetails?.Participants?.length === 2
                          ? selectedChatroomDetails.Participants.filter(
                              (participant) => participant?.user.id !== userId
                            ).map((participant, index) => (
                              <span key={index}>
                                {`${participant.user.user_fname} ${participant.user.user_lname}`}
                              </span>
                            ))
                          : selectedChatroomDetails?.name || ''}
                      </p>
                    </div>
                  )}
              </div>
              
              <div className={styles.messageContainer}>
                <div ref={messagesEndRef} />

                {uploading && (
                  <div className={styles.uploadingMessage}>
                    <div className={styles.uploadingBubble}>
                      <span className={styles.uploadingDots}>Uploading Image<span className={styles.dot}>.</span><span className={styles.dot}>.</span><span className={styles.dot}>.</span></span>
                    </div>
                  </div>
                )}

                {renderedMessages.length > 0 ? (
                  <>
                    {renderedMessages}
                  </>
                ) : (
                  <div className={styles.noMessages}>
                    <p>Say 'Hi' and start messaging</p>
                  </div>
                )}
              </div>
              <div className={styles.inputContainer}>
                {previewUrl && (
                  <div className={styles.previewWrapper}>
                    <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                    <button className={styles.removePreview} onClick={removePreview} title="Remove image">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}

                <div className={styles.textareaWrapper}>
                  <textarea
                    value={message}
                    onChange={handleTextareaChange}
                    placeholder="Type a message..."
                    className={styles.messageTextarea}
                    rows={1}
                    onKeyDown={handleKeyDown}
                  ></textarea>

                  <div className={styles.inputIcons}>
                    {/* 📎 Attach Icon */}
                    <button className={styles.attachButton} onClick={handleFileIconClick} title="Attach file">
                      <FontAwesomeIcon icon={faPaperclip} className={styles.sendIcon} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    {/* 😊 Emoji */}
                    <button className={styles.emojiButton}>
                      <FontAwesomeIcon onClick={toggleEmojiPicker} icon={faFaceSmile} className={styles.sendIcon} />
                    </button>

                    {/* 📨 Send */}
                    <button className={styles.sendButton}>
                      <FontAwesomeIcon onClick={handleSend} icon={faPaperPlane} className={styles.sendIcon} />
                    </button>
                  </div>
                </div>

                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className={styles.emojiPickerContainer}>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                    </Suspense>
                  </div>
                )}
              </div>

              {showMessageReactors && (
                <div className={styles.modalOverlay} onClick={closeMessageReactors}>
                  <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h1 className={styles.reactorName}>Message Reactions</h1>
                    <button className={styles.closeButton} onClick={closeMessageReactors}>×</button>
                    <ul className={styles.reactorsList}>
                      {selectedMessageReactions.map((reactor, index) => (
                        <li key={index} className={styles.reactorItem}>
                          <img
                            loading="lazy"
                            src={`${backendUrl}/${reactor.user.user_profile_picture}`}
                            alt={reactor.user.user_fname}
                            className={styles.reactorAvatar}
                          />
                          <span className={styles.reactorName}>{reactor.user.user_fname} {reactor.user.user_lname}</span>
                          <span className={styles.reactionEmoji}>
                            {reactor.react === "heart" && "❤️"}
                            {reactor.react === "clap" && "👏"}
                            {reactor.react === "pray" && "🙏"}
                            {reactor.react === "praise" && "🙌"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <Suspense fallback={<LoadingSpinner />}>
                {modalImageUrl && (
                  <MessageImageModal
                    imageUrl={modalImageUrl}
                    onClose={() => setModalImageUrl(null)}
                  />
                )}
              </Suspense>
            </div>
          ) : (
            <div className={styles.noChatIdContainer}>
              <div className={styles.avatarWrapper}>
                <img
                  loading="lazy"
                  src={`${backendUrl}/${userDetails.user_profile_picture}`}
                  alt={userDetails.user_fname}
                  className={styles.noChatIdAvatarImage}
                />
              </div>
              <p className={styles.greetingText}>Hello, {userDetails.user_fname}!</p>
              <p className={styles.noChatIdText}>
                Welcome to WOTG Community! Connect, share, and grow together.  
                Select a chat to start messaging and be part of the conversation.
              </p>
            </div>
          ) }

      </>
    );
    
  };

  export default React.memo(ChatWindow);
