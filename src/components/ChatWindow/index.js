import React, { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react'

import styles from './index.module.css';

const ChatWindow = ({ messages, onSendMessage, selectedChatroom, socket, userId, onBackClick, isMobile, selectedChatroomDetails }) => {
  const [message, setMessage] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState([...messages]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  console.log('[[[[[[[[[[CHAT DEETS:]]]]]]]]]]', selectedChatroomDetails);

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
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' }); // No smooth scroll, jump straight to bottom
    }
  }, [realtimeMessages]); // Trigger scroll when messages are updated

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (newMessage) => {
      if (newMessage.chatroomId === selectedChatroom) {
        // Avoid duplicate messages for the same chatroom
        setRealtimeMessages((prev) => {
          const isDuplicate = prev.some((msg) => msg.id === newMessage.id);
          return isDuplicate ? prev : [...prev, newMessage];
        });
      }
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket, selectedChatroom]);

  // Handle Send Message
  const handleSend = () => {
    if (message.trim() && selectedChatroom) {
      onSendMessage(message); // Send the message through the parent handler
      setMessage(''); // Clear the input field
    }
  };

  // Handle Enter key press to send the message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission or other default actions
      handleSend(); // Call the send function
    }
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
    <>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          {isMobile && onBackClick && (
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
            <div className={styles.participantDetails}>
              <div
                className={styles.chatAvatar}
                style={{
                  backgroundColor: selectedChatroomDetails?.avatar ? 'transparent' : '#fff',
                }}
              >
                {selectedChatroomDetails?.avatar ? (
                  <img
                    src={selectedChatroomDetails.avatar}
                    alt={selectedChatroomDetails?.name || 'Chat Avatar'}
                    className={styles.avatarImage}
                  />
                ) : (
                  <span className={styles.avatarText}>
                    {selectedChatroomDetails?.Participants?.length <= 2
                      ? selectedChatroomDetails?.Participants?.filter(
                          (participant) => participant?.user.id !== userId
                        ).map((participant, index) => (
                          <span key={index}>
                            {participant?.user?.user_fname?.charAt(0).toUpperCase()}
                          </span>
                        ))
                      : selectedChatroomDetails?.name
                      ? selectedChatroomDetails.name.charAt(0).toUpperCase()
                      : 'A'}
                  </span>
                )}
              </div>
              <p className={styles.chatNameHeader}>
                {selectedChatroomDetails?.Participants?.length <= 2
                  ? selectedChatroomDetails?.Participants?.filter(
                      (participant) => participant?.user.id !== userId
                    ).map((participant, index) => (
                      <span key={index}>
                        {`${participant?.user.user_fname} ${participant?.user.user_lname}`}
                      </span>
                    ))
                  : selectedChatroomDetails?.name || ''}
              </p>
            </div>
        </div>
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
                        <p className={styles.senderName}>
                          {msg?.sender?.user_fname && msg?.sender?.user_lname
                            ? `${msg.sender.user_fname} ${msg.sender.user_lname}`
                            : 'Unknown User'}
                        </p>
                      )}
                      <p className={styles.messageContent}>
                        {msg?.content || 'No content available'}
                      </p>
                    </div>
                  </div>
                );
              })
          ) : (
            <p className={styles.noMessages}>No messages in this chatroom yet.</p>
          )}
          <div ref={messagesEndRef} />
        </div>
    
        <div className={styles.inputContainer}> 
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}>
          </input>  
          <button
            className={styles.emojiButton}
            onClick={toggleEmojiPicker}
          >
            😊
          </button>
    
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className={styles.emojiPickerContainer}>
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiSelect} 
              />
            </div>
          )}
    
          <button
            className={styles.sendButton}
            onClick={handleSend}
          >
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
    </>
  );
   
};

export default ChatWindow;
