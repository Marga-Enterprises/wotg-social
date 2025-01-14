import React, { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react'

import styles from './index.module.css';

const ChatWindow = ({ messages, onSendMessage, selectedChatroom, socket, userId, onBackClick, isMobile }) => {
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
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' }); // No smooth scroll, jump straight to bottom
    }
  }, [realtimeMessages]); // Trigger scroll when messages are updated

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (newMessage) => {
      if (newMessage.chatroomId === selectedChatroom) {
        // Avoid duplicate messages
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
    <div className="w-full flex flex-col bg-gray-50 p-4">
      {isMobile && onBackClick && (
        <div className="w-full flex justify-start">
          <button
            className={styles.backButton}
            onClick={onBackClick} // Trigger the back action
            aria-label="Back to chatrooms"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="3.0" 
              stroke="currentColor" 
              className="w-6 h-6 text-[#c0392b]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex-grow overflow-y-auto border border-gray-300 rounded p-4 mb-4">
        {realtimeMessages && realtimeMessages.length > 0 ? (
          realtimeMessages.map((msg, index) => {
            const isSender = msg.senderId === userId; // Check if the message is from the current user
            return (
              <div
                key={index}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2`} // Align sender's message to the right, others to the left
              >
                <div
                  className={`${styles.messageContainer} ${isSender ? styles.bgSender : styles.bgReceiver}`}
                >
                  <p className={styles.senderName}>
                    {msg?.sender?.user_fname && msg?.sender?.user_lname
                      ? `${msg.sender.user_fname} ${msg.sender.user_lname}`
                      : 'Unknown User'}
                  </p>
                  <p className={styles.messageContent}>
                    {msg?.content || 'No content available'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No messages in this chatroom yet.</p>
        )}
        {/* This empty div is used to trigger the scroll to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex mt-auto items-center">
        <input
          type="text"
          className="flex-grow p-2 border rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown} // Add onKeyDown handler
        />
        <button
          className="ml-2 p-2 bg-transparent text-white rounded flex items-center justify-center"
          onClick={toggleEmojiPicker} // Toggle emoji picker
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
          className="bg-transparent text-white rounded flex items-center justify-center"
          onClick={handleSend}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 text-[#c0392b]" // Apply color here (blue)
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
