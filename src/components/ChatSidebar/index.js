import React from 'react';

const ChatSidebar = ({ chatrooms, onSelectChatroom }) => {
  console.log('CHAT ROOMS', chatrooms);
  return (
    <div className="w-1/4 bg-gray-100 p-4 border-r">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Chat</h2>
        {/*<button className="px-4 py-2 bg-[#c0392b] text-white rounded">+ Create New</button>*/}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search Name"
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />

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
