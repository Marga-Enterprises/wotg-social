// react
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// redux
import { useDispatch, useSelector } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

// react-router-dom
import { useNavigate } from 'react-router-dom';

// css
import styles from './index.module.css';

// contexts
import { useSocket } from '../../contexts/SocketContext';

// utils
import { convertMomentWithFormat } from '../../utils/methods';

// components
import NoneOverlayCircularLoading from '../NoneOverlayCircularLoading';

const Notifications = () => {
    const { notifications } = useSelector((state => state.wotgsocial.notification));

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const socket = useSocket();

    const loadingRef = useRef(false);
    const listRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [notifList, setNotifList] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pageSize] = useState(10);
    const [pageDetails, setPageDetails] = useState({
        pageIndex: 1,
        totalPages: 0,
        totalRecords: 0,
    });

    const handleFetchNotification = useCallback(async (pageIndex = 1) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const params = {
                pageIndex: pageIndex,
                pageSize: pageSize,
            };

            const res = await dispatch(wotgsocial.notification.getNotifications(params));
            if (res.success) {
                setNotifList(res.data.notifications);
                setPageDetails({
                    ...pageDetails,
                    totalPages: res.data.totalPages,
                    totalRecords: res.data.totalRecords,
                });
                setUnreadCount(res.data.notifications.filter(n => !n.is_read).length);
            } else {
                console.error('Error fetching notifications:', res.msg);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [dispatch, pageDetails.pageIndex, pageSize, notifications]);

    useEffect(() => {
        handleFetchNotification();
    }, [handleFetchNotification]);

    // realtime notifications
    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (notification) => {
            setNotifList((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket]);    

    return (
        <>
            <div className={styles.notificationPanel}>
                <div className={styles.header}>
                    <span>Notifications</span>
                    <span className={styles.unreadCount}>{unreadCount}</span>
                </div>

                <div className={styles.notificationsList} ref={listRef}>
                    {notifList?.map((n, index) => (
                        <div
                            key={index}
                            className={`${styles.notificationItem} ${!n.is_read ? styles.unread : ''}`}
                            onClick={() => {
                                navigate(n.redirectTo || '/'); // adjust as needed
                            }}
                        >
                            <img
                                src={n.sender?.profilePic || '/default-profile.png'}
                                alt="profile"
                                className={styles.avatar}
                            />
                            <div className={styles.content}>
                                <div className={styles.message}>
                                    <span className={styles.sender}>{n.sender?.name}</span>{" "}
                                    <span>{n.message}</span>
                                </div>
                                <div className={styles.meta}>
                                    {n.icon && <span className={styles.icon}>{n.icon}</span>}
                                    <span className={styles.time}>{convertMomentWithFormat(n.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {loading && <NoneOverlayCircularLoading/>}

                <div className={styles.footer}>
                    <button onClick={() => navigate('/notifications')}>See previous notifications</button>
                </div>

                
            </div>
            
        </>
    );
};

export default React.memo(Notifications);