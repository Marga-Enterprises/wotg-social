import { useEffect, Suspense, lazy, startTransition, useRef, useState, useCallback, useMemo } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react'
import debounce from 'lodash/debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceSmile, faPaperPlane, faHeart, faPaperclip, faTimes  } from '@fortawesome/free-solid-svg-icons';
import { faFaceSmile as faFaceSmileRegular } from '@fortawesome/free-regular-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './index.module.css'

// COMPONENT IMPORTS
import LoadingSpinner from '../LoadingSpinner';
import SignUpModal from '../SignUpModal';
const MessageImageModal = lazy(() => import('../MessageImageModal'));

const ChatWindow = ({ messages, 
  onSendMessage, 
  selectedChatroom, 
  userId, 
  selectedChatroomDetails, 
  onSendReaction, 
  onSendAutomatedMessage,
  onMessageReaction, 
  reactions, 
  userRole,
  uploading
}) => {
  const backendUrl = useMemo(() =>
    'https://wotg.sgp1.cdn.digitaloceanspaces.com/images',
    []
  );
  const [message, setMessage] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState([...messages]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [showMessageReactors, setShowMessageReactors] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [selectedMessageReactions, setSelectedMessageReactions] = useState([]);
  const [mentionList, setMentionList] = useState([]); // List of participants
  const [showMentionList, setShowMentionList] = useState(false); // Controls mention dropdown visibility
  const [cursorPosition, setCursorPosition] = useState(0); // Tracks cursor position
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [activeUserPopover, setActiveUserPopover] = useState(null);
  
  const longPressTimeout = useRef(null);
  const messagesEndRef = useRef(null); // This ref will target the bottom of the messages container
  const emojiPickerRef = useRef(null); 
  const fileInputRef = useRef(null);
  const popoverRef = useRef(null); // Ref for the user avatar popover

  // Sync initial messages with realtimeMessages
  useEffect(() => {
    setRealtimeMessages([...messages]);
  }, [messages]);

  /*useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActiveUserPopover(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);*/

  // Scroll to the bottom when component mounts or when new messages are added (initially)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' }); 
    }
  }, [realtimeMessages,]); // Trigger scroll when messages are updated

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
    if ((!message.trim() && !selectedFile) || !selectedChatroom) return;
  
    // Pass both message and file to the parent handler
    onSendMessage(message, selectedFile);
  
    setMessage(''); // Clear input
    removePreview(); // Reset file selection
  
    // Reset textarea height
    const textarea = document.querySelector(`.${styles.messageTextarea}`);
    if (textarea) {
      textarea.style.height = 'auto';
    }
  }; 

  const handleSendAutomatedMessage = (receiver) => {
    // if (!selectedChatroomDetails || !userId) return;
    onSendAutomatedMessage(receiver);
    setActiveUserPopover(null); // Close popover after sending message
  }
  
  const handleSendReaction = (reaction) => {
      // console.log('[[[REACTION CHAT STREAM COMPONENT]]]', reaction);  

      if (onSendReaction) {
          onSendReaction(reaction);
      }
  };

  const handleFileIconClick = () => {
    // console.log('File icon clicked!');
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

  const handleMessageReaction = (reaction, messageId) => {
    if (onMessageReaction) {
      onMessageReaction(messageId, reaction); 
    }

    setActiveMessageId(null);
 };

  const handleImageClick = (url) => {
    startTransition(() => {
      setModalImageUrl(url);
    });
  }; 

  const renderMessageContent = useCallback((content, type) => {
    const isImage = type === 'file';
    if (isImage) {
      return (
        <img
          src={`${backendUrl}/${content}`}
          alt="sent-img"
          className={styles.chatImage}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onClick={() => handleImageClick(`${backendUrl}/${content}`)}
        />
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
  }, [backendUrl, handleImageClick]);  

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
        .sort((a, b) => a.user.user_fname.localeCompare(b.user.user_fname)) // Sort alphabetically
        .map(participant => ({
          ...participant,
          user: {
            ...participant.user,
            user_fname: formatName(participant.user.user_fname),
            user_lname: formatName(participant.user.user_lname),
          }
        }))
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
        <AnimatePresence>
          {reactions.map((reaction) => {
            const randomX = Math.random() * 80 - 40;
            const randomStart = Math.random() * 80 + 10;
            const randomSpeed = Math.random() * 1 + 0.6;

            const uniqueKey = `${reaction.id}-${Date.now()}-${Math.random()}`;

            return (
              <motion.span
                key={uniqueKey}
                className={`${styles.floatingReaction} ${styles[reaction.type]}`}
                initial={{ opacity: 0, y: 0, scale: 0.8, x: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [0, -200, -350],
                  x: [0, randomX * 0.5, randomX],
                  scale: [0.8, 1, 0.7],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: randomSpeed + 3,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${randomStart}%`,
                  position: 'absolute',
                  pointerEvents: 'none',
                }}
              >
                {reaction.type === "heart" && "❤️"}
                {reaction.type === "clap" && "👏"}
                {reaction.type === "pray" && "🙏"}
                {reaction.type === "praise" && "🙌"}
              </motion.span>
            );
          })}
        </AnimatePresence>
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
                      <div className={styles.avatarContainer} ref={popoverRef}>
                        <img
                          loading="lazy"
                          src={
                            receiver?.user_profile_picture
                              ? `${backendUrl}/${receiver.user_profile_picture}`
                              : "https://www.gravatar.com/avatar/07be68f96fb33752c739563919f3d694?s=200&d=identicon"
                          }
                          alt={
                            receiver?.user?.user_fname ||
                            receiver?.user_fname ||
                            "User Avatar"
                          }
                          className={styles.receiverAvatar}
                          onClick={() => {
                            setActiveUserPopover((prev) =>
                              prev?.msgId === msg.id && prev?.receiverId === receiver?.id
                                ? null
                                : { msgId: msg.id, receiverId: receiver?.id }
                            );
                          }}
                        />

                        {activeUserPopover?.msgId === msg.id &&
                          activeUserPopover?.receiverId === receiver?.id && (() => {
                            // Fallback-safe access to fname/lname
                            const fname = receiver?.user?.user_fname || receiver?.user_fname || "Unknown";
                            const lname = receiver?.user?.user_lname || receiver?.user_lname || "Unknown";

                            // Debug log (will only run when condition is true)
                            console.log("Receiver details in activeUserPopover:", receiver);

                            return (
                              <div className={styles.userPopover}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendAutomatedMessage(fname, lname);
                                  }}
                                >
                                  Send Invitation
                                </button>
                              </div>
                            );
                          })()}
                      </div>
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
                          { msg.type !== 'file' && (
                            <>{formatName(`${msg?.sender?.user_fname} ${msg?.sender?.user_lname}`)}</>
                          )}
                        </p>
                      )}

                      <p className={styles.messageContent}>
                        {msg?.content ? renderMessageContent(msg.content, msg.type) : "No content available"}
                      </p>

                      {msg?.category === 'automated' && (
                        <div className={styles.automatedAction}>
                          <button
                            className={styles.automatedButton}
                            onClick={() => setShowSignUpModal(true)}
                          >
                            Sign Up Now
                          </button>
                        </div>
                      )}

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
          )
        }
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
        {previewUrl && (
          <div 
            className={styles.previewWrapper}
            style={{
              bottom: (userRole === 'admin' || userRole === 'owner') ? '8.5rem' : '4.5rem'
            }}
          >
            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
            <button className={styles.removePreview} onClick={removePreview} title="Remove image">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        <div className={styles.textareaWrapper}> {/* Wrapper for positioning */}
          <textarea
            value={message}
            onChange={handleTextareaChange}
            placeholder="Type a message..."
            className={styles.messageTextarea}
            rows={1}
            onKeyDown={handleKeyDown}
          ></textarea>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

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

        <button className={styles.attachButton} onClick={handleFileIconClick} title="Attach file">
          <FontAwesomeIcon icon={faPaperclip} className={styles.sendIcon} />
        </button>

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

      {showSignUpModal && (
        <SignUpModal onClose={() => setShowSignUpModal(false)} />
      )}
    </div>
  );
   
};

export default ChatWindow;
