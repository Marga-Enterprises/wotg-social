import React, { useEffect, useRef } from 'react';

const ChatWindow = ({ messages, onSendMessage, selectedChatroom, socket, userId }) => {
  const [message, setMessage] = React.useState('');
  const [realtimeMessages, setRealtimeMessages] = React.useState([...messages]);

  // Reference for scrolling
  const messagesEndRef = useRef(null); // This ref will target the bottom of the messages container

  // Sync initial messages with realtimeMessages
  React.useEffect(() => {
    setRealtimeMessages([...messages]);
  }, [messages]);

  // Scroll to the bottom when component mounts or when new messages are added (initially)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' }); // No smooth scroll, jump straight to bottom
    }
  }, [realtimeMessages]); // Trigger scroll when messages are updated

  // Listen for real-time messages
  React.useEffect(() => {
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

  const handleSend = () => {
    if (message.trim() && selectedChatroom) {
      // Send the message through the parent handler (server handles broadcasting)
      onSendMessage(message);
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

  return (
    <div className="w-2/4 flex flex-col bg-gray-50 p-4">
      <div className="flex-grow overflow-y-auto border border-gray-300 rounded p-4 mb-4">
        {realtimeMessages && realtimeMessages.length > 0 ? (
          realtimeMessages.map((msg, index) => {
            const isSender = msg.senderId === userId; // Check if the message is from the current user
            return (
              <div
                key={index}
                className={`p-2 mb-2 rounded ${
                  isSender
                    ? 'bg-red-100 self-end text-right' // Sender's message with red background aligned to the right
                    : 'bg-gray-200 self-start text-left' // Receiver's message with gray background aligned to the left
                }`}
              >
                <p className="text-xs text-gray-600 font-semibold">
                  {msg?.sender?.user_fname && msg?.sender?.user_lname
                    ? `${msg.sender.user_fname} ${msg.sender.user_lname}`
                    : 'Unknown User'}
                </p>
                <p className="text-xs font-medium">{msg?.content || 'No content available'}</p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No messages in this chatroom yet.</p>
        )}
        {/* This empty div is used to trigger the scroll to the bottom */}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex mt-auto">
        <input
          type="text"
          className="flex-grow p-2 border rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown} // Add onKeyDown handler
        />
        <button
          className="ml-2 p-2 bg-[#c0392b] text-white rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
