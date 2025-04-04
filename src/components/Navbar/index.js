import React from 'react';
import styles from './index.module.css';

import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

function Navbar({ onToggleMenu  }) {
  const dispatch = useDispatch();

  const handleSignOut = () => {
    dispatch(wotgsocial.user.userLogout());
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <img key={Date.now()} src="/wotg-logo.webp" alt="WOTG Logo" />
      </div>
      <div className={styles.navLinks}>
          <a href="/" className={styles.navLink}>Chat</a>
          <a href="/blogs" className={styles.navLink}>Devotion</a>
          <a href="/bible" className={styles.navLink}>Bible</a>
          <a href="/your-journals" className={styles.navLink}>Journals</a>
          <a href="/worship" className={styles.navLink}>Worship</a>
          <a
              href="https://wotgonline.com/donate/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
          >
              Partner
          </a>
          <FontAwesomeIcon 
            icon={faRightFromBracket} 
            size="2x" 
            className={styles.headerIcon}
            onClick={handleSignOut}
          />
      </div>

      <div className={styles.navLinks1}>
          <a href="/blogs" className={styles.navLink}>Devotion</a>
          <a
              href="https://wotgonline.com/donate/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
          >
              Partner
          </a>

          <div className={styles.burger} onClick={onToggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
      </div>
  </div>
  );
}

export default Navbar;
