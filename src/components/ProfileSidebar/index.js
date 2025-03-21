import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { wotgsocial } from '../../redux/combineActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

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
        <img loading="lazy" onClick={onOpenProfileModal} src={profilePicture} alt="Profile" className={styles.profilePicture} />
      ) : (
        <div className={styles.fallbackAvatar} onClick={onOpenProfileModal}>{userInitials}</div>
      )}

      <div>
        {/*<div>
          <a href="/worship">
            <FontAwesomeIcon size="2x" icon={faBroadcastTower} className={styles.headerIcon}/>
          </a>
        </div>*/}

        <div>
          <FontAwesomeIcon 
            icon={faRightFromBracket} 
            size="2x" 
            className={styles.headerIcon}
            onClick={handleSignOut}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
