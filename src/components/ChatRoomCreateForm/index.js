import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions'; // Ensure you have the correct import for the action
import { formatUserName } from '../../utils/methods'; // Ensure you have the correct import for the action
import styles from './index.module.css'; // Import the modal styles

const ChatRoomCreateForm = ({ onClose, fetchChatrooms, currentUserId }) => {
  const dispatch = useDispatch();
  const [chatroomName, setChatroomName] = useState(''); // Track chatroom name
  const [users, setUsers] = useState([]); // Track user list
  const [type, setType] = useState('private'); // Default type is 'private'
  const [selectedUsers, setSelectedUsers] = useState([currentUserId]); // Ensure current user is selected by default

  const fetchUsers = useCallback(async () => {
    dispatch(common.ui.setLoading());
    const res = await dispatch(wotgsocial.user.getAllUsersAction());
    dispatch(common.ui.clearLoading());

    if (res.success) {
      setUsers(res.data); // Set the fetched users
    }
  }, [dispatch]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle the submission of the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!chatroomName) return; // Ensure chatroom name is provided

    // Prepare the payload for creating the chatroom
    const payload = {
      name: chatroomName,
      type: type,
      participants: selectedUsers, // Use selected users for participants
    };

    // Dispatch the action to create the chatroom
    const res = await dispatch(wotgsocial.chatroom.createChatroomAction(payload));

    // Handle success
    if (res.success) {
      onClose(); // Close the modal after successful creation
      fetchChatrooms(res.data.id); // Fetch the chatrooms after creation
    } else {
      console.log('Error creating chatroom:', res.msg); // Handle any errors
    }
  };

  // Handle selecting/deselecting users
  const handleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        // Deselect if already selected
        return prevSelected.filter((id) => id !== userId);
      } else {
        // Add to the list if not selected
        return [...prevSelected, userId];
      }
    });
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalContent}>
        <h2>Create a New Chatroom</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="chatroomName">Chatroom Name</label>
            <input
              type="text"
              id="chatroomName"
              value={chatroomName}
              onChange={(e) => setChatroomName(e.target.value)}
              required
              placeholder="Enter chatroom name"
            />
          </div>

          <div>
            <label htmlFor="type">Chatroom Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="private">Private</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div>
            <label>Participants</label>
            <div className={styles.userList}>
              {users.map((user) => (
                user.id !== currentUserId && ( // Exclude the current user from the list
                  <div key={user.id} className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      value={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelection(user.id)}
                    />
                    <label htmlFor={`user-${user.id}`}>
                      {formatUserName(user.user_fname, user.user_lname)}
                    </label>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="submit" className={styles.submitButton}>Create</button>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatRoomCreateForm;
