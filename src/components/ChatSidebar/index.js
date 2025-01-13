import React, { useState, useEffect } from 'react';

const ChatSidebar = ({ chatrooms, onSelectChatroom }) => {
  const [isMobile, setIsMobile] = useState(false); // State to track if the screen is mobile size

  // Detect screen size (mobile or not)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 570); // Check if window width is <= 570px
    };

    handleResize(); // Initial check on mount
    window.addEventListener('resize', handleResize); // Listen for screen resizing

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup on unmount
    };
  }, []);

  return (
    <div className={`p-4 border-r ${isMobile ? 'w-full' : 'w-1/8'} bg-gray-100`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Chat</h2>
        {/* <button className="px-4 py-2 bg-[#c0392b] text-white rounded">+ Create New</button> */}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search Name"
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />

      {/* Chatrooms List */}
      <ul className="space-y-4">
        {chatrooms.length > 0 ? (
          chatrooms.map((chat) => (
            <li
              key={chat.id}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-200 rounded"
              onClick={() => onSelectChatroom(chat.id)}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                style={{
                  backgroundColor: chat.avatar ? 'transparent' : '#c0392b', // Set bg color only when no avatar
                }}
              >
                {chat.avatar ? (
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-white font-bold">
                    {chat.name ? chat.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold">{chat.name}</p>
                <p className="text-sm text-gray-500">{chat.lastActive || 'Active now'}</p>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No chatrooms available</p>
        )}
      </ul>
    </div>
  );
};

export default ChatSidebar;
