import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { wotgsocial } from '../../redux/combineActions';

const ProfileSidebar = () => {
  const dispatch = useDispatch();
  const [profilePicture, setProfilePicture] = useState(null);
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    // Get "account" from cookies
    const storedAccount = Cookies.get('account'); 
    if (storedAccount) {
      const accountData = JSON.parse(storedAccount);

      // Set profile picture if available
      if (accountData.picture) {
        setProfilePicture(accountData.picture);
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
  }, []);

  const handleSignOut = () => {
    dispatch(wotgsocial.user.userLogout());
    setProfilePicture(null);
    setUserInitials('');
  };

  return (
    <div className={styles.chatContainer}>
      {profilePicture ? (
        <img src={profilePicture} alt="Profile" className={styles.profilePicture} />
      ) : (
        <div className={styles.fallbackAvatar}>{userInitials}</div>
      )}
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
  );
};

export default ProfileSidebar;
