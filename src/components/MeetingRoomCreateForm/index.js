import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions'; // Ensure you have the right import for the action

import styles from './index.module.css'; // Import styles for the modal

const MeetingRoomCreateForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [type, setType] = useState('group'); // Default type is 'group'

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) return; // Ensure room name is provided

    // Prepare the payload for creating the room
    const payload = { name, type };

    // Dispatch the action to create the meeting room
    const res = await dispatch(wotgsocial.meetingroom.createMeetingRoomAction(payload));

    // Check if the room creation was successful
    if (res.success) {
      // Trigger Jitsi meeting with the created room's name
      launchJitsiMeeting(res.data.name); // Assuming res.data contains the newly created room details
      onClose(); // Close the modal if successful
    } else {

    }
  };

  const launchJitsiMeeting = (roomName) => {
    const domain = 'meet.jit.si'; // Jitsi public server, replace if you have your own server
    const options = {
      roomName: roomName,  // The name of the newly created room
      width: '100%',
      height: '100%',
      parentNode: document.getElementById('jitsi-meet-container'), // This is the DOM element where Jitsi will be rendered
    };

    // Ensure that the container is available before initializing Jitsi
    const container = document.getElementById('jitsi-meet-container');
    if (container) {
      const api = new window.JitsiMeetExternalAPI(domain, options);

      // Optional: You can listen for events here, like when the meeting has started
      api.addEventListener('videoConferenceJoined', () => {

      });
    } else {
      console.error('Jitsi container not found. Make sure it is rendered in the DOM.');
    }
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalContent}>
        <h2>Create a New Meeting Room</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Room Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter meeting room name"
            />
          </div>
          <div>
            <label htmlFor="type">Room Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="group">Group</option>
              <option value="private">Private</option>
            </select>
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

export default MeetingRoomCreateForm;
