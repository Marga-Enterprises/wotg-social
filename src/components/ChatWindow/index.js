import React, { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react'

import styles from './index.module.css';

const ChatWindow = ({ messages, onSendMessage, selectedChatroom, socket, userId, onBackClick, isMobile, selectedChatroomDetails, onOpenAddParticipantModal }) => {
  const backendUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://chat.wotgonline.com/api';
    
  const [message, setMessage] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState([...messages]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Reference for scrolling
  const messagesEndRef = useRef(null); // This ref will target the bottom of the messages container

  // Reference for the emoji picker container
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
  
  

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.native);
  };

  // Toggle emoji picker visibility
  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevState) => !prevState); // Toggle picker
  };

  // Close emoji picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false); // Close emoji picker
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        {realtimeMessages && realtimeMessages.length > 0 ? (
          realtimeMessages
            .filter((msg) => msg.chatroomId === selectedChatroom)
            .map((msg, index) => {
              const isSender = msg.senderId === userId;
              return (
                <div
                  key={index}
                  className={`${isSender ? styles.messageSender : styles.messageReceiver}`}
                >
                  <div
                    className={`${styles.messageBubble} ${isSender ? styles.senderBubble : styles.receiverBubble}`}
                  >
                    { !isSender && (
                      <>
                        { selectedChatroomDetails?.Participants?.length > 2 && (
                          <p className={styles.senderName}>
                            {msg?.sender?.user_fname && msg?.sender?.user_lname
                              ? `${msg.sender.user_fname} ${msg.sender.user_lname}`
                              : 'Unknown User'}
                          </p>
                        )}
                      </>
                    )}
                    <p className={styles.messageContent}>
                      {msg?.content ? renderMessageContent(msg.content) : 'No content available'}
                    </p>
                  </div>
                </div>
              );
            })
        ) : (
          <p className={styles.noMessages}>Say 'hi' and start messaging</p>
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
            onClick={toggleEmojiPicker}
          >
            😊
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

        <button className={styles.sendButton} onClick={handleSend}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={styles.sendIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
   
};

export default ChatWindow;
