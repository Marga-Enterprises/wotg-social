import React from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';

import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

function Navbar({ onToggleMenu }) {
  const dispatch = useDispatch();

  const handleSignOut = () => {
    dispatch(wotgsocial.user.userLogout());
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <img
          key={Date.now()}
          src="https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotg-logo.webp"
          alt="WOTG Logo"
        />
      </div>

      <div className={styles.navLinks}>
        <Link to="/" className={styles.navLink}>Chat</Link>
        <Link to="/blogs" className={styles.navLink}>Devotion</Link>
        <Link to="/bible" className={styles.navLink}>Bible</Link>
        <Link to="/your-journals" className={styles.navLink}>Journal</Link>
        <Link to="/music" className={styles.navLink}>Music</Link>
        <Link to="/worship" className={styles.navLink}>Worship</Link>
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
        <Link to="/blogs" className={styles.navLink}>Devotion</Link>
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
