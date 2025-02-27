import React, { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceSmile, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faFaceSmile as faFaceSmileRegular } from '@fortawesome/free-regular-svg-icons';

import styles from './index.module.css';

const ChatWindow = ({ messages, onSendMessage, selectedChatroom, socket, userId, onBackClick, isMobile, selectedChatroomDetails, onOpenAddParticipantModal, onMessageReaction }) => {
  const backendUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://community.wotgonline.com/api';
    
  const [message, setMessage] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState([...messages]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [showMessageReactors, setShowMessageReactors] = useState(false);
  const [selectedMessageReactions, setSelectedMessageReactions] = useState([]);

  const longPressTimeout = useRef(null);
  const messagesEndRef = useRef(null); // This ref will target the bottom of the messages container
  const emojiPickerRef = useRef(null); 

  // Sync initial messages with realtimeMessages
  useEffect(() => {
    setRealtimeMessages([...messages]);
  }, [messages]);

  // Scroll to the bottom when component mounts or when new messages are added (initially)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' }); 
    }
  }, [realtimeMessages,]); // Trigger scroll when messages are updated

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (newMessage) => {
      if (newMessage.chatroomId === selectedChatroom) {
        // Avoid duplicate messages for the same chatroom
        setRealtimeMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket, selectedChatroom]);

  // Handle Send Message
  const handleSend = () => {
    if (message.trim() && selectedChatroom) {
      onSendMessage(message); // Send the message
      setMessage(''); // Clear the input field
  
      // Reset the textarea height to 1 row
      const textarea = document.querySelector(`.${styles.messageTextarea}`);
      if (textarea) {
        textarea.style.height = 'auto'; // Force height reset
      }
    }
  };  

  const renderMessageContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Regex to detect URLs
    return content.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank" // Open in a new tab
          rel="noopener noreferrer" // Prevent security vulnerabilities
          style={{ color: '#007bff', textDecoration: 'underline' }} // Optional link styling
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  const handleShowMessageReactors = (messageId) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message && message.reactions.length > 0) {
      setSelectedMessageReactions(message.reactions);
      setShowMessageReactors(true);
    }
  };

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

  const handleLongPress = (e, messageId) => {
    e.preventDefault();

    // Set timeout to trigger after 600ms (adjust as needed)
    longPressTimeout.current = setTimeout(() => {
      handleShowMessageReacts(messageId);
    }, 600);
  };

  // Cancel long press if user releases early
  const cancelLongPress = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
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
    setShowEmojiPicker((prevState) => !prevState); // Toggle picker
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

  const handleMessageReaction = (reaction, messageId) => {
    if (onMessageReaction) {
      onMessageReaction(messageId, reaction); 
    }

    setActiveMessageId(null);
  };

  const handleShowMessageReacts = (messageId) => {
    setActiveMessageId(activeMessageId === messageId ? null : messageId);
  };

  return (
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
                          key={index}
                          onClick={onOpenAddParticipantModal}
                          src={`${backendUrl}/uploads/${participant.user.user_profile_picture}`}
                          alt={participant.user.user_fname}
                          className={styles.avatarImage}
                        />
                      ) : (
                        <img
                          key={index}
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
      <div ref={messagesEndRef} />
      <div className={styles.messageContainer}>
        {realtimeMessages.length > 0 ? (
          realtimeMessages.map((msg, index) => {
            const isSender = msg.senderId === userId;
            const receiver = selectedChatroomDetails?.Participants?.find(
              (participant) => participant.user.id === msg.senderId
            );

            const groupedReactions = msg?.reactions?.reduce((acc, reaction) => {
              acc[reaction.react] = (acc[reaction.react] || 0) + 1;
              return acc;
            }, {});

            return (
              <div key={index} className={isSender ? styles.messageSender : styles.messageReceiver}>
                {!isSender && (
                  <img
                    src={receiver?.user?.user_profile_picture
                      ? `${backendUrl}/uploads/${receiver.user.user_profile_picture}`
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
                    <p className={styles.senderName}>{msg.sender.user_fname} {msg.sender.user_lname}</p>
                  )}
                  {msg?.content ? renderMessageContent(msg.content) : "No content available"}

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

                      {/* Display total count of reactions */}
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

                {/* Reaction Drawer (Only Visible for Active Message) */}
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
          })
        ) : (
          <div className={styles.noMessages}><p>Say 'hi' and start messaging</p></div>
        )}
      </div>

      <div className={styles.inputContainer}>
        <div className={styles.textareaWrapper}> {/* Wrapper for positioning */}
          <textarea
            value={message}
            onChange={handleTextareaChange}
            placeholder="Type a message..."
            className={styles.messageTextarea}
            rows={1}
            onKeyDown={handleKeyDown}
          ></textarea>

          <button
            className={styles.emojiButton}  
          >
            <FontAwesomeIcon onClick={toggleEmojiPicker} icon={faFaceSmile} className={styles.sendIcon}/>
          </button>
        </div>

        {showEmojiPicker && (
          <div ref={emojiPickerRef} className={styles.emojiPickerContainer}>
            <Picker 
              data={data} 
              onEmojiSelect={handleEmojiSelect} 
            />
          </div>
        )}

        <button className={styles.sendButton}>
          <FontAwesomeIcon onClick={handleSend} icon={faPaperPlane} className={styles.sendIcon} />
        </button>
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
                    src={`${backendUrl}/uploads/${reactor.user.user_profile_picture}`}
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
    </div>
  );
   
};

export default ChatWindow;
