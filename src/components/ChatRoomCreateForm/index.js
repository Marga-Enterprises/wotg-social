import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions'; // Ensure you have the correct import for the action
import { formatUserName } from '../../utils/methods'; // Ensure you have the correct import for the action
import styles from './index.module.css'; // Import the modal styles
import ErrorSnackbar from '../ErrorSnackbar';
import SuccessSnackbar from '../SuccessSnackbar';

const ChatRoomCreateForm = ({ onClose, fetchChatrooms, currentUserId, socket  }) => {
  const dispatch = useDispatch();
  const [chatroomName, setChatroomName] = useState(''); // Track chatroom name
  const [users, setUsers] = useState([]); 
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([currentUserId]);
  const [showChatroomNameField, setShowChatroomNameField] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchUsers = useCallback(async () => {
    const payload = {
      search,
    };
    dispatch(common.ui.setLoading());
    const res = await dispatch(wotgsocial.user.getAllUsersAction(payload));
    dispatch(common.ui.clearLoading());

    if (res.success) {
      setUsers(res.data); // Set the fetched users
    }
  }, [dispatch, search]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => { 
    if (selectedUsers.length > 2) {
      setChatroomName('');
      setShowChatroomNameField(true);
    } else {
      console.log(selectedUsers);
      setShowChatroomNameField(false);
      // setChatroomName('Private');
    }
  }, [selectedUsers]);

  // Handle the submission of the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!chatroomName) return;

    const payload = {
        name: chatroomName,
        participants: selectedUsers,
    };

    // Dispatch the action to create the chatroom
    const res = await dispatch(wotgsocial.chatroom.createChatroomAction(payload));

    if (res.success) {
        setTimeout(() => {
          onClose(); 
      }, 2000);
        fetchChatrooms(res.data.id); // Fetch updated chatrooms
        setSuccessMsg('Chatroom created successfully');
        setShowSuccess(true);
        // Emit the new chatroom event via socket
        socket.emit('new_chatroom', res.data);  // Emit event to the server
    } else {
        setErrorMsg(res.payload);
        setShowError(true);
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
    <>
      <div className={styles.modalContainer}>
        <div className={styles.modalContent}>
          {showError && <ErrorSnackbar message={errorMsg} onClose={() => setShowError(false)} />}
          {showSuccess && <SuccessSnackbar message={successMsg} onClose={() => setShowSuccess(false)} />}
          <h2>Create a New Chatroom</h2>
          <form onSubmit={handleSubmit}>
            { showChatroomNameField && ( 
              <div>
                <label htmlFor="chatroomName">Chatroom Name</label>
                <input
                  type="text"
                  id="chatroomName"
                  value={chatroomName}
                  required
                  onChange={(e) => setChatroomName(e.target.value)}
                  placeholder="Enter chatroom name"
                />
              </div>
            )}

            <div>
              <label>Search Participants</label>
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter name"
              />
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
    </>
  );
};

export default ChatRoomCreateForm;
