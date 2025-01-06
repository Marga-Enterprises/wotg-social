import React from 'react';

const RightPanel = ({ userDetails, media, files }) => {
  return (
    <div className="w-1/4 bg-gray-100 p-4 border-l">
      {/* User Info */}
      <div className="text-center mb-4">
        <img
          src={userDetails.avatar || '/default-avatar.png'}
          alt={userDetails.name}
          className="w-20 h-20 rounded-full mx-auto mb-2"
        />
        <h3 className="text-lg font-bold">{userDetails.name}</h3>
        <p className="text-sm text-gray-500">{userDetails.role || 'User'}</p>
      </div>

      {/* Sections */}
      <div>
        <h4 className="text-md font-bold mb-2">Starred Messages</h4>
        <div className="text-sm text-gray-500 mb-4">
          No starred messages
        </div>

        <h4 className="text-md font-bold mb-2">Media ({media.length})</h4>
        {media.length > 0 ? (
          <ul className="space-y-2">
            {media.map((item, index) => (
              <li key={index} className="text-sm text-blue-500 cursor-pointer">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No media available</div>
        )}

        <h4 className="text-md font-bold mb-2">Files ({files.length})</h4>
        {files.length > 0 ? (
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="text-sm text-blue-500 cursor-pointer">
                {file}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No files available</div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
