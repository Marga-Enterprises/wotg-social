import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import { formatUserName } from '../../utils/methods';
import styles from './index.module.css';
import ErrorSnackbar from '../ErrorSnackbar';
import SuccessSnackbar from '../SuccessSnackbar';

const ChatRoomCreateForm = ({ onClose, fetchChatrooms, currentUserId, socket }) => {
  const dispatch = useDispatch();
  const [chatroomName, setChatroomName] = useState('');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]); // Don't manually add currentUserId to UI
  const [showChatroomNameField, setShowChatroomNameField] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchUsers = useCallback(async () => {
    const payload = { search };
    dispatch(common.ui.setLoading());
    const res = await dispatch(wotgsocial.user.getAllUsersAction(payload));
    dispatch(common.ui.clearLoading());

    if (res.success) {
      // Filter out the currentUserId so they do not appear in the list
      setUsers(res.data.filter((user) => user.id !== currentUserId));
    }
  }, [dispatch, search, currentUserId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUsers.length > 1) { // More than 1 (excluding current user)
      setChatroomName('');
      setShowChatroomNameField(true);
    } else {
      setShowChatroomNameField(false);
    }
  }, [selectedUsers]);

  const handleUserSelection = (user) => {
    setSelectedUsers((prevSelected) => {
      const isAlreadySelected = prevSelected.some((u) => u.id === user.id);
      return isAlreadySelected
        ? prevSelected.filter((u) => u.id !== user.id) // Remove user if already selected
        : [...prevSelected, user]; // Add user if not selected
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: chatroomName,
      participants: [currentUserId, ...selectedUsers.map((user) => user.id)], // Auto-add current user
    };

    const res = await dispatch(wotgsocial.chatroom.createChatroomAction(payload));

    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 2000);
      fetchChatrooms(res.data.id);
      setSuccessMsg('Chatroom created successfully');
      setShowSuccess(true);
      socket.emit('new_chatroom', res.data);
    } else {
      setErrorMsg(res.payload);
      setShowError(true);
    }
  };

  return (
    <>
      <div className={styles.modalContainer}>
        <div className={styles.modalContent}>
          {showError && <ErrorSnackbar message={errorMsg} onClose={() => setShowError(false)} />}
          {showSuccess && <SuccessSnackbar message={successMsg} onClose={() => setShowSuccess(false)} />}
          <h2>Create a New Chatroom</h2>
          <form onSubmit={handleSubmit}>
            {showChatroomNameField && (
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
              <label>Selected Participants</label>
              <div className={styles.selectedUsers}>
                {selectedUsers.map((user) => (
                  <span key={user.id} className={styles.selectedUser} onClick={() => handleUserSelection(user)}>
                    {formatUserName(user.user_fname, user.user_lname)} ✖
                  </span>
                ))}
              </div>
            </div>

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
                  <div
                    key={user.id}
                    className={`${styles.userItem} ${
                      selectedUsers.some((u) => u.id === user.id) ? styles.selected : ''
                    }`}
                    onClick={() => handleUserSelection(user)}
                  >
                    {formatUserName(user.user_fname, user.user_lname)}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="submit" className={styles.submitButton}>
                Create
              </button>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatRoomCreateForm;
