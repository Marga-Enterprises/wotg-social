import React from 'react';

const ChatWindow = ({ messages, onSendMessage, selectedChatroom }) => {
  const [message, setMessage] = React.useState('');

  const handleSend = () => {
    if (message.trim() && selectedChatroom) {
      onSendMessage(message); // Call the parent function to send the message
      setMessage(''); // Clear the input field
    }
  };

  return (
    <div className="w-2/4 flex flex-col bg-gray-50 p-4">
      <div className="flex-grow overflow-y-auto border border-gray-300 rounded p-4 mb-4">
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className="p-2 mb-2 bg-gray-200 rounded">
              <p className="text-sm text-gray-600 font-semibold">
                {msg?.sender?.user_fname && msg?.sender?.user_lname
                  ? `${msg.sender.user_fname} ${msg.sender.user_lname}`
                  : 'Unknown User'} {/* Display full name or fallback */}
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
