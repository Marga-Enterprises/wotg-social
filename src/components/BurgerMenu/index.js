import { useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

import styles from "./index.module.css";

import Cookie from 'js-cookie';

const BurgerMenu = ({ onClose }) => {
  const dispatch = useDispatch();

  const account = Cookie.get('account') ? JSON.parse(Cookie.get('account')) : null;
  const role = account ? account.user_role : null;

  const handleSignOut = () => {
    dispatch(wotgsocial.user.userLogout());
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <motion.div
      className={styles.burgerMenuOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>

      <nav className={styles.menuNav}>
        <Link to="/chat" className={styles.menuItem} onClick={onClose}>Chat</Link>
        <Link to="/blogs" className={styles.menuItem} onClick={onClose}>Devotion</Link>
        <Link to="/bible" className={styles.menuItem} onClick={onClose}>Bible</Link>
        <Link to="/your-journals" className={styles.menuItem} onClick={onClose}>Journal</Link>
        <Link to="/worship" className={styles.menuItem} onClick={onClose}>Worship</Link>
        <Link to="/music" className={styles.menuItem} onClick={onClose}>Music</Link>
        <Link to="/feeds" className={styles.menuItem} onClick={onClose}>Feeds</Link>
        <a
          href="https://wotgonline.com/donate/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.menuItem}
          onClick={onClose}
        >
          Partner
        </a>
        {(!account || role === 'guest') && (
          <Link to="/login" className={styles.menuItem} onClick={onClose}>Sign In</Link>
        )}
        {account && role !== 'guest' && (
          <button className={styles.menuItem} onClick={handleSignOut}>Sign Out</button>
        )}
      </nav>
    </motion.div>
  );
};

// ✅ Memoize with custom comparison to avoid re-renders
export default memo(BurgerMenu, (prevProps, nextProps) => {
  return prevProps.onClose === nextProps.onClose;
});