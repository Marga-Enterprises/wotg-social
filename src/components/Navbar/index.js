import React from 'react';
import styles from './index.module.css';

function Navbar({ onToggleMenu  }) {
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
              Give
          </a>
      </div>

      <div className={styles.burger} onClick={onToggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
  </div>
  );
}

export default Navbar;
