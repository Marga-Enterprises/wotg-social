import { useState, useEffect, useCallback, useRef } from 'react';
import { Howl } from 'howler';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import { useSocket } from '../../contexts/SocketContext';

export const useMessagesLogic = (user, selectedChatroom, botChatroomId) => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Sound setup
  const messageSound = useRef(
    new Howl({
      src: ['https://wotg.sgp1.cdn.digitaloceanspaces.com/audios/chat_sound.mp3'],
      volume: 0.6,
    })
  ).current;
  const lastPlayedRef = useRef(0);

  // Fetch messages
  const fetchMessages = useCallback(
    async (chatroomId) => {
      if (!user || !chatroomId) return;
      dispatch(common.ui.setLoading());
      try {
        const res = await dispatch(
          wotgsocial.message.getMessagesByChatroomAction(chatroomId)
        );
        if (res?.success) setMessages(res.data.messages);
      } finally {
        dispatch(common.ui.clearLoading());
      }
    },
    [dispatch, user]
  );

  // Send message
  const handleSendMessage = useCallback(
    async (content, file) => {
      if (!selectedChatroom || !user) return;
      const isGuest = user.user_role === 'guest';

      // File message
      if (file) {
        setUploading(true);
        await dispatch(
          wotgsocial.message.sendFileMessageAction({
            file,
            senderId: user.id,
            chatroomId: selectedChatroom,
            type: 'file',
          })
        );
        setUploading(false);
      }

      // Text message
      const trimmed = content?.trim();
      if (trimmed) {
        await dispatch(
          wotgsocial.message.sendMessageAction({
            content: trimmed,
            senderId: user.id,
            chatroomId: selectedChatroom,
            type: 'text',
          })
        );

        // Bot reply
        if (isGuest && botChatroomId && selectedChatroom === botChatroomId) {
          setTimeout(() => {
            dispatch(
              wotgsocial.message.sendBotReplyAction({
                message: { content: trimmed },
                userId: user.id,
                chatroomId: selectedChatroom,
              })
            );
          }, 800);
        }
      }
    },
    [dispatch, selectedChatroom, user, botChatroomId]
  );

  // Handle new incoming message
  const handleNewMessage = useCallback(
    (message) => {
      setMessages((prev) => [message, ...prev]);
      if (message.senderId !== user?.id) {
        const now = Date.now();
        if (now - lastPlayedRef.current > 1000) {
          messageSound.play();
          lastPlayedRef.current = now;
        }
      }
    },
    [user?.id]
  );

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, handleNewMessage]);

  return {
    messages,
    fetchMessages,
    handleSendMessage,
    uploading,
  };
};
