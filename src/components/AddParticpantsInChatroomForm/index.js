import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import { formatUserName } from '../../utils/methods';
import styles from './index.module.css';
import ErrorSnackbar from '../ErrorSnackbar';
import SuccessSnackbar from '../SuccessSnackbar';

const AddParticipantsInChatroomForm = ({ onClose, fetchChatroomDetails, chatroomId, socket }) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
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
      setUsers(res.data);
    }
  }, [dispatch, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    console.log('chatDetails', fetchChatroomDetails.id)

    const payload = {
      chatroomId: fetchChatroomDetails.id,
      userIds: selectedUsers,
    };

    console.log('PAYLOAD', payload)

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

  const handleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
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
