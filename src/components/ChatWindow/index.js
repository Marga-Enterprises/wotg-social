import React from 'react';

const ChatWindow = ({ messages, onSendMessage, selectedChatroom, socket }) => {
  const [message, setMessage] = React.useState('');
  const [realtimeMessages, setRealtimeMessages] = React.useState([...messages]);

  // Sync initial messages with realtimeMessages
  React.useEffect(() => {
    setRealtimeMessages([...messages]);
  }, [messages]);

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
          realtimeMessages.map((msg, index) => (
            <div key={index} className="p-2 mb-2 bg-gray-200 rounded">
              <p className="text-sm text-gray-600 font-semibold">
                {msg?.sender?.user_fname && msg?.sender?.user_lname
                  ? `${msg.sender.user_fname} ${msg.sender.user_lname}`
                  : 'Unknown User'}
              </p>
              <p className="font-medium">{msg?.content || 'No content available'}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No messages in this chatroom yet.</p>
        )}
      </div>
      <div className="flex">
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
