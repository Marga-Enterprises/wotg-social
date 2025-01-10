import React, { useEffect, useRef } from 'react';
import styles from './index.module.css'; // Import styles for the component

const MeetingRoom = ({ roomName }) => {
  const jitsiContainerRef = useRef(null); // Ref to attach Jitsi to the DOM

  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      const options = {
        roomName: roomName, // Room name passed as a prop
        width: '100%',      // Full width
        height: '100%',     // Full height
        parentNode: jitsiContainerRef.current, // Attach the Jitsi interface to this div
        configOverwrite: {
          startWithAudioMuted: true, // Mute audio by default
          startWithVideoMuted: true, // Mute video by default
        },
        interfaceConfigOverwrite: {
          filmStripOnly: false, // Show or hide the filmstrip
        },
        userInfo: {
          displayName: 'User Name', // Optionally set a user name
        },
      };

      // Initialize the Jitsi API
      const jitsiAPI = new window.JitsiMeetExternalAPI('meet.jit.si', options);

      // Cleanup on unmount
      return () => {
        if (jitsiAPI) {
          jitsiAPI.dispose();
        }
      };
    }
  }, [roomName]); // Re-run if roomName changes

  return (
    <div className={styles.jitsiContainer}>
      {/* This is the div where Jitsi will be loaded */}
      <div ref={jitsiContainerRef} className={styles.jitsiEmbed} />
    </div>
  );
};

export default MeetingRoom;
