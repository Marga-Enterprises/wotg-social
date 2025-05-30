import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

// redux
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;
    const isAuthenticated = Cookies.get('authenticated') === 'true';

    if (!account || !isAuthenticated) return;

    const socketUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://community.wotgonline.com';

    const newSocket = io(socketUrl, {
      auth: { userId: account.id },
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', account.id, account.id);

      newSocket.emit('add_user_id_to_online_users', {
        userId: account.id,
        fullName: `${account.user_fname} ${account.user_lname}`.trim(),
        email: account.email,
        socketId: newSocket.id,
      });
    });

    newSocket.on('disconnect', () => {
      console.warn(`❌ Disconnected`);
    });

    // Async load chatrooms after socket is ready
    (async () => {
      try {
        const res = await dispatch(wotgsocial.chatroom.getAllChatroomsAction());
        if (res.success && Array.isArray(res.data)) {
          res.data.forEach(chatroom => {
            newSocket.emit('join_room', chatroom.id);
          });
        }
      } catch (error) {
        console.error('Failed to join chatrooms:', error);
      }
    })();

    return () => {
      newSocket.disconnect();
    };
  }, [dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for use across app
export const useSocket = () => useContext(SocketContext);
