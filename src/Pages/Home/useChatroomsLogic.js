import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { wotgsocial, common } from '../../redux/combineActions';
import { useSocket } from '../../contexts/SocketContext';

export const useChatroomsLogic = ({
  user,
  isAuthenticated,
  fetchMessages,
  setSelectedChatroom,
  setIsChatVisible,
}) => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const chatroomLoginId = Cookies.get('chatroomLoginId')
    ? JSON.parse(Cookies.get('chatroomLoginId'))
    : null;

  const [chatrooms, setChatrooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [botChatroomId, setBotChatroomId] = useState(null);

  // -----------------------------
  // Fetch all chatrooms
  // -----------------------------
  const fetchChatrooms = useCallback(
    async (chatId) => {
      dispatch(common.ui.setLoading());
      const res = await dispatch(
        wotgsocial.chatroom.getAllChatroomsAction({ search: '' })
      );
      dispatch(common.ui.clearLoading());

      if (res.success) {
        const hiddenId = 7;
        const filtered = res.data.filter((chat) => chat.id !== hiddenId);
        setChatrooms(filtered);

        // detect welcome/bot
        const botRoom = filtered.find(
          (chat) =>
            chat.name?.toLowerCase().includes('welcome') ||
            chat.name?.toLowerCase().includes('guest') ||
            chat.type === 'bot'
        );
        if (botRoom) setBotChatroomId(botRoom.id);

        // optional initial select
        if (filtered.length > 0 && chatId) setSelectedChatroom(chatId);
      }
    },
    [dispatch, setSelectedChatroom]
  );

  useEffect(() => {
    if (isAuthenticated) fetchChatrooms();
  }, [isAuthenticated, fetchChatrooms]);

  // -----------------------------
  // Select chatroom logic
  // -----------------------------
  const handleSelectChatroom = useCallback(
    async (chatroomId) => {
      if (!chatroomId) return;

      setSelectedChatroom(chatroomId);
      setIsChatVisible(true);

      // mark as read
      if (socket?.connected && user?.id) {
        socket.emit('mark_as_read', { chatroomId, userId: user.id });
      }

      // update URL param
      const currentParam = new URLSearchParams(location.search).get('chat');
      if (currentParam !== 'wotgadmin' && currentParam !== String(chatroomId)) {
        navigate(`?chat=${chatroomId}`, { replace: true });
      }

      await fetchMessages(chatroomId);
    },
    [socket, user, navigate, location.search, fetchMessages, setSelectedChatroom, setIsChatVisible]
  );

  // -----------------------------
  // Read chat param from URL
  // -----------------------------
  useEffect(() => {
    if (!isAuthenticated) return;
    const params = new URLSearchParams(location.search);
    const chatParam = params.get('chat');

    if (chatParam === 'wotgadmin') {
      navigate(`?chat=${chatroomLoginId}`, { replace: true });
    } else if (chatParam && !isNaN(chatParam)) {
      handleSelectChatroom(Number(chatParam));
    } else {
      handleSelectChatroom(chatroomLoginId);
      navigate(`?chat=${chatroomLoginId}`, { replace: true });
    }
  }, [location.search, isAuthenticated]);

  // -----------------------------
  // Socket listeners
  // -----------------------------
  useEffect(() => {
    if (!socket || !user) return;

    socket.on('online_users', (users) => setOnlineUsers(users));

    socket.on('new_chatroom', (newChatroom) => {
      const isParticipant = newChatroom.Participants?.some(
        (p) => p.userId.toString() === user.id.toString()
      );
      if (isParticipant) {
        setChatrooms((prev) => {
          if (prev.some((c) => c.id === newChatroom.id)) return prev;
          return [...prev, newChatroom];
        });
      }
    });

    socket.on('new_participants', (updatedChatroom) => {
      const isParticipant = updatedChatroom.Participants?.some(
        (p) => p.userId.toString() === user.id.toString()
      );
      if (isParticipant) {
        setChatrooms((prev) => {
          const exists = prev.some((c) => c.id === updatedChatroom.id);
          if (!exists) return [...prev, updatedChatroom];
          return prev.map((c) => (c.id === updatedChatroom.id ? updatedChatroom : c));
        });
      }
    });

    return () => {
      socket.off('online_users');
      socket.off('new_chatroom');
      socket.off('new_participants');
    };
  }, [socket, user]);

  return {
    chatrooms,
    onlineUsers,
    botChatroomId,
    fetchChatrooms,
    handleSelectChatroom,
  };
};
