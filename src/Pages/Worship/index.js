import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';
import styles from './index.module.css';
import ChatWindowStream from '../../components/ChatWindowStream';
import wotgLogo from './wotgLogo.jpg';

const Page = () => {
  const dispatch = useDispatch();

  // Global state
  const { ui: { loading } } = useSelector((state) => state.common);

  let wotglivechatroom = process.env.NODE_ENV === 'development' ? 40 : 7;
  const userRole = Cookies.get('role');

  // Local state
  const [messages, setMessages] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);
  const [selectedChatroom, setSelectedChatroom] = useState(wotglivechatroom);
  const [selectedChatroomDetails, setSelectedChatroomDetails] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [videoId, setVideoId] = useState(''); // YouTube video ID
  const [newVideoId, setNewVideoId] = useState('');

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
      : 'https://community.wotgonline.com';

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

  const handleUpdateWorship = async () => {
    if (!newVideoId) return;

    dispatch(common.ui.setLoading());
    const res = await dispatch(wotgsocial.worship.createWorshipServiceAction(newVideoId));

    dispatch(common.ui.clearLoading());
    if (res.success) {
      setVideoId(newVideoId);
      setNewVideoId('');
    }
  };

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

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(wotgsocial.worship.getWorshipServiceAction()).then((res) => {
        if (res.success) {
          setVideoId(res.data.videoId); // Store video ID dynamically
        }
      });
    }
  }, [dispatch, isAuthenticated]);
  

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

  console.log('userRole:', userRole);

  return (
    <div className={styles.container}>
      {/* Right Column */}
      <div className={styles.rightColumn}>

        {/* Navbar at the Top */}
        <div className={styles.navbar}>
          {/* Logo on the Left */}
          <div className={styles.logo}>
            <img src={wotgLogo} alt="WOTG Logo"/>
          </div>

          {/* Links on the Right */}
          <div className={styles.navLinks}>
            <a href="/" className={styles.navLink}>Chat</a>
            <a href="https://wotgonline.com/donate/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Give</a>
          </div>
        </div>

        {/* Livestream Section */}
        <div className={styles.streamSection}>
          <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&cc_load_policy=0&rel=0&modestbranding=1&controls=0&iv_load_policy=3&disablekb=1`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
          />
        </div>

        {/*<div className={styles.overlay}/>*/}

        {/* Chat Window at the Bottom */}
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

        {/* Admin Panel for Updating Livestream (Admin Only) */}
        { (userRole === 'admin' || userRole === 'owner') && (
          <div className={styles.adminPanel}>
            <input
              type="text"
              placeholder="Enter new YouTube Video ID"
              value={newVideoId}
              onChange={(e) => setNewVideoId(e.target.value)}
            />
            <button onClick={handleUpdateWorship}>Update</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Page;
