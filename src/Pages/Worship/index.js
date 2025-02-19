import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';
import styles from './index.module.css';
import ChatWindowStream from '../../components/ChatWindowStream';

const Page = () => {
  const dispatch = useDispatch();

  // Global state
  const { ui: { loading } } = useSelector((state) => state.common);

  let wotglivechatroom = process.env.NODE_ENV === 'development' ? 40 : 7;

  // Local state
  const [messages, setMessages] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);
  const [selectedChatroom, setSelectedChatroom] = useState(wotglivechatroom);
  const [selectedChatroomDetails, setSelectedChatroomDetails] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);



  // Fetch user authentication details
  useEffect(() => {
    const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;
    const authenticated = Cookies.get('authenticated') === 'true';

    if (account && authenticated) {
      setUser(account);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    if (!isAuthenticated) return;

    const socketUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : 'https://chat.wotgonline.com';

    const newSocket = io(socketUrl, { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
    newSocket.on('disconnect', () => console.log('Socket disconnected'));

    return () => newSocket.disconnect();
  }, [isAuthenticated]);

  // Fetch Chatrooms
  const fetchChatrooms = useCallback(async () => {
    if (!isAuthenticated) return;

    dispatch(common.ui.setLoading());
    const res = await dispatch(wotgsocial.chatroom.getAllChatroomsAction());

    dispatch(common.ui.clearLoading());
    if (res.success) {
      setChatrooms(res.data);
      if (res.data.length > 0) {
        handleSelectChatroom(res.data[0].id); // Auto-select first chatroom
      }
    }
  }, [dispatch, isAuthenticated]);

  // Fetch Messages
  const fetchMessages = useCallback(async (chatroomId) => {
    if (!chatroomId || !isAuthenticated) return;

    dispatch(common.ui.setLoading());
    const res = await dispatch(wotgsocial.message.getMessagesByChatroomAction(chatroomId));

    dispatch(common.ui.clearLoading());
    if (res.success) {
      setMessages(res.data.messages);
      setSelectedChatroomDetails(res.data.chatroom);
    }
  }, [dispatch, isAuthenticated]);

  // Fetch chatrooms on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchChatrooms();
    }
  }, [fetchChatrooms, isAuthenticated]);

  // Fetch messages when chatroom changes
  useEffect(() => {
    if (selectedChatroom && isAuthenticated) {
      fetchMessages(wotglivechatroom);
    }
  }, [selectedChatroom, fetchMessages, isAuthenticated]);

  // Handle chatroom selection
  const handleSelectChatroom = (chatroomId) => {
    setSelectedChatroom(wotglivechatroom);
    fetchMessages(wotglivechatroom);

    // Mark messages as read when the chatroom is opened
    if (socket) {
      socket.emit('mark_as_read', { chatroomId: wotglivechatroom, userId: user?.id });
    }

    // Clear unread messages count
    setChatrooms((prevChatrooms) =>
      prevChatrooms.map((chat) =>
        chat.id === chatroomId
          ? { ...chat, unreadCount: 0, hasUnread: false }
          : chat
      )
    );
  };

  // Handle sending a message
  const handleSendMessage = (messageContent) => {
    if (!selectedChatroom || !user) return;

    const message = {
      content: messageContent,
      senderId: user.id,
      chatroomId: selectedChatroom,
    };

    socket.emit('send_message', message);
    dispatch(wotgsocial.message.sendMessageAction(message));
  };

  // Real-time message updates
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message) => {
      // Update only if the message belongs to the current chatroom
      if (message.chatroomId === selectedChatroom) {
        setMessages((prevMessages) => {
            const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
            if (isDuplicate) return prevMessages;

            const updatedMessages = [message, ...prevMessages];
            // Sort messages in descending order based on createdAt timestamp
            updatedMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return updatedMessages;
        });
      }

      // Update chatrooms with the latest message
      setChatrooms((prevChatrooms) =>
        prevChatrooms.map((chat) =>
          chat.id === message.chatroomId
            ? { ...chat, RecentMessage: message }
            : chat
        )
      );
    });

    return () => socket.off('new_message');
  }, [socket, selectedChatroom]);

  // Join and leave chatrooms dynamically
  useEffect(() => {
    if (!socket || !selectedChatroom) return;

    chatrooms.forEach((chatroom) => {
      socket.emit('join_room', chatroom.id);
    });

    socket.emit('join_room', selectedChatroom);

    return () => {
      socket.emit('leave_room', selectedChatroom);
    };
  }, [socket, selectedChatroom]);

  return (
    <div className={styles.container}>
      {/* Livestream at the top */}
      <div className={styles.streamSection}>
        <iframe
          className={styles.video}
          src="https://www.youtube.com/embed/gTJLjDQ9jhs?si=VwwpL27BgxfxtHGb"
          title="WOTG Live Stream"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      {/* Chat Window at the bottom */}
      {isAuthenticated && selectedChatroom && (
        <div className={styles.chatSection}>
          <ChatWindowStream
            messages={messages}
            onSendMessage={handleSendMessage}
            selectedChatroom={selectedChatroom}
            selectedChatroomDetails={selectedChatroomDetails}
            userId={user?.id}
          />
        </div>
      )}
    </div>
  );
};

export default Page;
