import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faBell } from '@fortawesome/free-solid-svg-icons';

// components
import Notifications from '../Notifications';
import { useSocket } from '../../contexts/SocketContext';
import { set } from 'lodash';

function Navbar({ onToggleMenu }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSocket();

  const user = useSelector((state) => state.wotgsocial.user.loggedUser);
  const [notificationsMounted, setNotificationsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const loadingRef = useRef(false);
  const pageSize = 10;

  // Fetch notifications from server
  const fetchNotifications = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(wotgsocial.notification.getNotifications({ pageIndex: 1, pageSize }));
      if (res.success) {
        setNotifList(res.data.notifications);
        setUnreadCount(res.data.notifications.filter((n) => !n.is_read).length);
      } else {
        console.error('Error fetching notifications:', res.msg);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch]);

  // Fetch when dropdown is opened
  useEffect(() => {
    fetchNotifications();
  }, fetchNotifications);

  const handleNotificationClick = () => {
    // detect if the device is android phone and IOS phones
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobile = isAndroid || isIOS;
    
    if (isMobile) {
      navigate('/notifications');
    } else {
      setNotificationsMounted((prev) => !prev);
    }
  };

  // Real-time notification handling
  useEffect(() => {
    if (!socket) return;

    const notificationSound = new Audio('https://wotg.sgp1.cdn.digitaloceanspaces.com/audios/notif_sound.mp3');
    notificationSound.volume = 0.7;

    const handleNewNotification = (notification) => {
      try {
        notificationSound.play().catch((e) => {
          console.warn('Notification sound blocked or failed:', e);
        });
      } catch (e) {
        console.error('Error playing sound:', e);
      }

      setNotifList((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

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
        <Link to="/feeds" className={styles.navLink}>Feeds</Link>
        <a
          href="https://wotgonline.com/donate/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.navLink}
        >
          Partner
        </a>

        <div className={styles.notificationWrapper}>
          <FontAwesomeIcon
            icon={faBell}
            size="2x"
            className={styles.headerIcon}
            onClick={handleNotificationClick}
          />
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        {notificationsMounted && (
          <Notifications
            notifList={notifList}
            unreadCount={unreadCount}
            onNavigate={navigate}
            loading={loading}
          />
        )}

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
        <div className={styles.notificationWrapper}>
          <FontAwesomeIcon
            icon={faBell}
            size="2x"
            className={styles.headerIcon}
            onClick={handleNotificationClick}
          />
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className={styles.burger} onClick={onToggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Navbar);
