import React, { useState } from 'react';
import MeetingRoomCreateForm from '../../components/MeetingRoomCreateForm'; // Import the modal component

import styles from './index.module.css'; // Import styles for the page

const MeetingPage = () => {
  const [showModal, setShowModal] = useState(false);

  const handleCreateMeeting = () => {
    setShowModal(true); // Show the modal to create the room
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal when creation is complete
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Meeting Room</h1>
      <button onClick={handleCreateMeeting} className={styles.createButton}>
        Create a New Meeting
      </button>

      {/* Show modal when needed */}
      {showModal && <MeetingRoomCreateForm onClose={handleCloseModal} />}

      {/* The container where the Jitsi meeting will be rendered */}
      <div id="jitsi-meet-container" style={{ width: '100%', height: '600px' }}></div>
    </div>
  );
};

export default MeetingPage;
