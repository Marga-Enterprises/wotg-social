import React, { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceSmile, faPaperPlane, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faFaceSmile as faFaceSmileRegular } from '@fortawesome/free-regular-svg-icons';

import styles from './index.module.css';

const ChatWindow = ({ messages, onSendMessage, selectedChatroom, socket, userId, selectedChatroomDetails, onSendReaction, onMessageReaction, reactions }) => {
  const backendUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://community.wotgonline.com/api';
    
  const [message, setMessage] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState([...messages]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [showMessageReactors, setShowMessageReactors] = useState(false);
  const [selectedMessageReactions, setSelectedMessageReactions] = useState([]);
  const [mentionList, setMentionList] = useState([]); // List of participants
  const [showMentionList, setShowMentionList] = useState(false); // Controls mention dropdown visibility
  const [cursorPosition, setCursorPosition] = useState(0); // Tracks cursor position


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

  const handleMessageReaction = (reaction, messageId) => {
    if (onMessageReaction) {
      onMessageReaction(messageId, reaction); 
    }

    setActiveMessageId(null);
 };

  const renderMessageContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Detects URLs
    const mentionRegex = /(^|\s)(@\w+(?:\s\w+)?)(?=\s|$)/g; // Captures mentions only (single or double names)

    return content.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        // Convert URLs into clickable links
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#007bff', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      } else {
        // Format mentions properly without affecting other text
        return part.split(mentionRegex).map((subPart, subIndex) => {
          if (subPart.trim().startsWith("@")) {
            return (
              <strong key={subIndex} style={{ fontWeight: 'bold' }}>
                {subPart}
              </strong>
            );
          }
          return subPart; // Normal text remains unchanged
        });
      }
    });
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
    const cursorPos = textarea.selectionStart;
    const newMessage = textarea.value;
  
    // Dynamically adjust height
    textarea.style.height = 'auto'; // Reset height to auto
    const maxHeight = parseFloat(getComputedStyle(textarea).lineHeight) * 5; // Limit to 5 rows
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  
    setMessage(newMessage); // Update message state
    setCursorPosition(cursorPos); // Store cursor position
  
    // Extract the last typed word
    const words = newMessage.slice(0, cursorPos).split(" ");
    const lastWord = words[words.length - 1];
  
    // Check if lastWord starts with "@" to trigger mention list
    if (lastWord.startsWith("@")) {
      const query = lastWord.slice(1).toLowerCase(); // Remove "@" and convert to lowercase
      const filteredParticipants = selectedChatroomDetails?.Participants
        ?.filter(participant => 
          participant.user.id !== userId && // Exclude the current user
          (participant.user.user_fname.toLowerCase().startsWith(query) || 
          participant.user.user_lname.toLowerCase().startsWith(query))
        )
        .slice(0, 5); // Limit results to 5 participants
  
      setMentionList(filteredParticipants); 
      setShowMentionList(filteredParticipants.length > 0); // Show only if results exist
    } else {
      setShowMentionList(false);
    }
  };
  
  const handleMentionSelect = (participant) => {
    const mentionText = `@${participant.user.user_fname} ${participant.user.user_lname} `;
  
    // Get the part of the message before the "@" and after the cursor
    const beforeCursor = message.slice(0, cursorPosition).replace(/@\S*$/, ""); // Remove "@..." before cursor
    const afterCursor = message.slice(cursorPosition);
  
    const updatedMessage = beforeCursor + mentionText + afterCursor;
    setMessage(updatedMessage);
    setCursorPosition(beforeCursor.length + mentionText.length);
    setShowMentionList(false);
  };  

  const formatMessageContent = (content) => {
    return content.split(/(@[A-Za-z\s]+)/g).map((part, index) => {
      if (part.startsWith('@')) {
        return <strong key={index}>{part}</strong>; // Make mentions bold
      }
      return part;
    });
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
        setShowReactions(false);
        setActiveMessageId(null); // Keep this but prevent it from closing when clicking inside reactions
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReactions, showEmojiPicker]);

  const formatName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase() // Convert the whole string to lowercase
      .split(" ") // Split into an array of words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" "); // Join words back into a single string
  }; 

  const handleShowMessageReacts = (messageId) => {
    setActiveMessageId(activeMessageId === messageId ? null : messageId);
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
              {reaction.type === "praise" && "🙌"}
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

                // Group reactions by type and count them
                const groupedReactions = msg?.reactions?.reduce((acc, reaction) => {
                  acc[reaction.react] = (acc[reaction.react] || 0) + 1;
                  return acc;
                }, {});

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
                      {...(!isSender && {
                        onMouseDown: (e) => handleLongPress(e, msg.id),
                        onTouchStart: (e) => handleLongPress(e, msg.id),
                      })}
                    >
                      {!isSender && selectedChatroomDetails?.Participants?.length > 2 && (
                        <p className={styles.senderName}>
                          {formatName(`${msg?.sender?.user_fname} ${msg?.sender?.user_lname}`)}
                        </p>
                      )}

                      <p className={styles.messageContent}>
                        {msg?.content ? renderMessageContent(msg.content) : "No content available"}
                      </p>

                      {/* Show Reactions Below Message */}
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
                    

                    {/* Smiley Icon for Message Reactions */}
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
            <div className={styles.noMessages}>
              <p>Say 'Hi' and start messaging</p>
            </div>
          )}
      </div>

      {showMentionList && (
        <ul className={styles.mentionList}>
          {mentionList.map((participant) => (
            <li key={participant.user.id} onClick={() => handleMentionSelect(participant)}>
              {participant.user.user_fname} {participant.user.user_lname}
            </li>
          ))}
        </ul>
      )}

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
            <button onClick={() => { handleSendReaction("praise"); }}>🙌</button>
          </div>
        </div>

        <button className={styles.sendButton}>
          <FontAwesomeIcon onClick={handleSend} icon={faPaperPlane} className={styles.sendIcon} />
        </button>
      </div>

      {/* Modal for Message Reactions */}
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
