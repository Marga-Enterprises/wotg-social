import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { wotgsocial } from '../../redux/combineActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignalStream } from '@fortawesome/free-solid-svg-icons';

const ProfileSidebar = ({ onOpenProfileModal }) => {
  const dispatch = useDispatch();
  const storedAccount = Cookies.get('account'); 

  const [profilePicture, setProfilePicture] = useState(null);
  const [userInitials, setUserInitials] = useState('');

  const backendUrl = 
  process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://community.wotgonline.com/api';

  useEffect(() => {
    if (storedAccount) {
      const accountData = JSON.parse(storedAccount);
  
      // Check if user has a profile picture
      if (accountData.user_profile_picture) {
        setProfilePicture(`${backendUrl}/uploads/${accountData.user_profile_picture}`);
      } else {
        // Generate initials from first and last name
        const firstName = accountData.user_fname || '';
        const lastName = accountData.user_lname || '';
  
        if (firstName && lastName) {
          setUserInitials(`${firstName[0]}${lastName[0]}`.toUpperCase()); // "JD"
        } else {
          setUserInitials(firstName[0]?.toUpperCase() || '?'); // Default to "?"
        }
      }
    }
  }, [storedAccount]);

  const handleSignOut = () => {
    dispatch(wotgsocial.user.userLogout());
    setProfilePicture(null);
    setUserInitials('');
  };

  return (
    <div className={styles.chatContainer}>
      {profilePicture ? (
        <img onClick={onOpenProfileModal} src={profilePicture} alt="Profile" className={styles.profilePicture} />
      ) : (
        <div className={styles.fallbackAvatar} onClick={onOpenProfileModal}>{userInitials}</div>
      )}

      <div>
        <a href="/menu">
          <FontAwesomeIcon icon="fa-solid fa-signal-stream" />
        </a>

        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="1.5" 
          stroke="currentColor" 
          onClick={handleSignOut}
          className={styles.headerIcon}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
        </svg>
      </div>
    </div>
  );
};

export default ProfileSidebar;
