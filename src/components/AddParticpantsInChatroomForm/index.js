import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import { formatUserName } from '../../utils/methods';
import styles from './index.module.css';
import ErrorSnackbar from '../ErrorSnackbar';
import SuccessSnackbar from '../SuccessSnackbar';

const AddParticipantsInChatroomForm = ({ onClose, fetchChatroomDetails, socket, currentUserId }) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch chatroom participants first to filter them out
  useEffect(() => {
    if (fetchChatroomDetails) {
      const participantIds = fetchChatroomDetails.Participants?.map((p) => p.userId) || [];
    }
  }, [fetchChatroomDetails]);

  const fetchUsers = useCallback(async () => {
    const payload = { search };
    dispatch(common.ui.setLoading());
    const res = await dispatch(wotgsocial.user.getAllUsersAction(payload));
    dispatch(common.ui.clearLoading());

    if (res.success) {
        const existingParticipants = fetchChatroomDetails?.Participants?.map(p => Number(p.userId)) || [];
        setUsers(res.data.filter(user => user.id !== currentUserId && !existingParticipants.includes(user.id)));
    }
  }, [dispatch, search, currentUserId, fetchChatroomDetails]);



  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchUsers();
    if (selectedUsers.length === 0) return;

    const payload = {
      chatroomId: fetchChatroomDetails.id,
      userIds: selectedUsers.map(user => user.id), // Send only user IDs
    };

    const res = await dispatch(wotgsocial.chatroom.addParticipantsInChatroomAction(payload));
    
    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 2000);
      setSuccessMsg('Participants added successfully');
      setShowSuccess(true);
      socket.emit('new_participants', res.data);
    } else {
      setErrorMsg(res.payload);
      setShowError(true);
    }
  };

  // Handle selecting/deselecting users
  const handleUserSelection = (user) => {
    setSelectedUsers((prevSelected) => {
      const isAlreadySelected = prevSelected.some((u) => u.id === user.id);
      return isAlreadySelected
        ? prevSelected.filter((u) => u.id !== user.id) // Remove if already selected
        : [...prevSelected, user]; // Add if not selected
    });
  };

  return (
    <>
      <div className={styles.modalContainer}>
        <div className={styles.modalContent}>
          {showError && <ErrorSnackbar message={errorMsg} onClose={() => setShowError(false)} />}
          {showSuccess && <SuccessSnackbar message={successMsg} onClose={() => setShowSuccess(false)} />}
          <h2>Add Participants</h2>
          <form onSubmit={handleSubmit}>
            
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
              <button type="submit" className={styles.submitButton}>Add</button>
              <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddParticipantsInChatroomForm;
