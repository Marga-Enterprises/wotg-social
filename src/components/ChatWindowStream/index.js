import React, { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceSmile, faPaperPlane, faHeart } from '@fortawesome/free-solid-svg-icons';


import styles from './index.module.css';

const ChatWindow = ({ messages, onSendMessage, selectedChatroom, socket, userId, selectedChatroomDetails, onSendReaction, reactions }) => {
  const backendUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://community.wotgonline.com/api';
    
  const [message, setMessage] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState([...messages]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

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
  
  const handleSendReaction = (reaction) => {
      if (onSendReaction) {
          onSendReaction(reaction);
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

  const formatName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase() // Convert the whole string to lowercase
      .split(" ") // Split into an array of words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" "); // Join words back into a single string
  }; 
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.reactionButton}`)) {
        setShowReactions(false);
      }
    };
  
    if (showReactions) {
      document.addEventListener("click", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showReactions]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.reactionContainer}>
        {reactions.map((reaction) => {
          const randomX = Math.random() * 80 - 40; // Smooth swerving left-right movement
          const randomSpeed = Math.random() * 1 + 0.6; // Faster speed (0.6s - 1.6s)
          const randomStart = Math.random() * 80 + 10; // Random starting position (10% - 90%)

          return (
            <span
              key={reaction.id}
              className={`${styles.floatingReaction} ${styles[reaction.type]}`}
              style={{
                "--x-move": `${randomX}px`, // Left-right swerving
                "--speed": `${randomSpeed}s`, // Smoother speed range
                left: `${randomStart}%`, // Randomized starting position along bottom
              }}
            >
              {reaction.type === "heart" && "❤️"}
              {reaction.type === "clap" && "👏"}
              {reaction.type === "pray" && "🙏"}
            </span>
          );
        })}
      </div>

      <div ref={messagesEndRef} />
      <div className={styles.messageContainer}>
        {realtimeMessages &&
          realtimeMessages.length > 0 ? (
            realtimeMessages
              .filter((msg) => msg.chatroomId === selectedChatroom)
              .map((msg, index) => {
                const isSender = msg.senderId === userId;
                const receiver = selectedChatroomDetails?.Participants?.find(
                  (participant) => participant.user.id === msg.senderId
                );

                return (
                  <div
                    key={index}
                    className={`${isSender ? styles.messageSender : styles.messageReceiver}`}
                  >
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
                    >
                      {!isSender && selectedChatroomDetails?.Participants?.length > 2 && (
                        <p className={styles.senderName}>
                          {formatName(`${msg?.sender?.user_fname} ${msg?.sender?.user_lname}`)}
                        </p>
                      )}

                      <p className={styles.messageContent}>
                        {msg?.content ? renderMessageContent(msg.content) : 'No content available'}
                      </p>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className={styles.noMessages}>
              <p>Say 'hi' and start messaging</p>
            </div>
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

        <div className={styles.reactionButton}>
          {/* Toggle Reaction Drawer on Click */}
          <button onClick={() => setShowReactions(!showReactions)} className={styles.heart}>
            <FontAwesomeIcon icon={faHeart} className={styles.reactionIcon} />
          </button>

          {/* Reaction Drawer (Visible when showReactions is true) */}
          <div className={`${styles.reactionDrawer} ${showReactions ? styles.open : ""}`}>
            <button onClick={() => { handleSendReaction("heart"); }}>❤️</button>
            <button onClick={() => { handleSendReaction("clap"); }}>👏</button>
            <button onClick={() => { handleSendReaction("pray"); }}>🙏</button>
            {/*<button onClick={() => { handleSendReaction("smile"); }}>😊</button>*/}
          </div>
        </div>

        <button className={styles.sendButton}>
          <FontAwesomeIcon onClick={handleSend} icon={faPaperPlane} className={styles.sendIcon} />
        </button>
      </div>
    </div>
  );
   
};

export default ChatWindow;
