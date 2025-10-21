import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { wotgsocial, common } from "../../redux/combineActions";
import Cookies from "js-cookie";

// Components
import ChatSidebar from "../../components/ChatSidebar";
import ChatWindow from "../../components/ChatWindow";
// import ProfileSidebar from '../../components/ProfileSidebar';
import ProfileModal from "../../components/ProfileModal";
import ChatRoomCreateForm from "../../components/ChatRoomCreateForm";
import AddParticipantsInChatroomForm from "../../components/AddParticpantsInChatroomForm";

import styles from "./index.module.css";

// Sound
import { Howl } from "howler";

// Context
import { useSetHideNavbar } from "../../contexts/NavbarContext";
import { useSocket } from "../../contexts/SocketContext";

const Page = ({ onToggleMenu }) => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const setHideNavbar = useSetHideNavbar();

  // 🔊 Message sound setup
  const messageSound = useRef(
    new Howl({
      src: [
        "https://wotg.sgp1.cdn.digitaloceanspaces.com/audios/chat_sound.mp3",
      ],
      volume: 0.6,
      html5: false, // Uses Web Audio API, avoids pool issues
    })
  ).current;

  const lastPlayedRef = useRef(0); // throttle sound playback

  // 🧠 Get chatroom ID from cookies
  const chatroomLoginId = Cookies.get("chatroomLoginId")
    ? JSON.parse(Cookies.get("chatroomLoginId"))
    : null;

  // 🌐 State management
  const [user, setUser] = useState(null);
  const [chatrooms, setChatrooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [selectedChatroomDetails, setSelectedChatroomDetails] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenForAddParticipant, setIsModalOpenForAddParticipant] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // 🧩 Fetch authentication and user details
  useEffect(() => {
    const account = Cookies.get("account")
      ? JSON.parse(Cookies.get("account"))
      : null;
    const authenticated = Cookies.get("authenticated") === "true";

    if (account && authenticated) {
      setUser(account);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // 🧱 Hide Navbar for Chat Page
  useEffect(() => {
    setHideNavbar(true);
    return () => setHideNavbar(false);
  }, [setHideNavbar]);

  // 📱 Detect screen size (for mobile behavior)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 780);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔔 Handle message reactions (with sound)
  useEffect(() => {
    if (!socket) return;

    const handleNewReaction = (newReaction) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newReaction.messageId
            ? { ...msg, reactions: [...(msg.reactions || []), newReaction] }
            : msg
        )
      );

      if (newReaction.userId !== user?.id) {
        const now = Date.now();
        if (now - lastPlayedRef.current > 1000) {
          messageSound.play();
          lastPlayedRef.current = now;
        }
      }
    };

    socket.on("new_message_reaction", handleNewReaction);
    return () => socket.off("new_message_reaction", handleNewReaction);
  }, [socket, user?.id]);

  // 👥 Track online users
  useEffect(() => {
    if (!socket) return;
    socket.on("online_users", (users) => setOnlineUsers(users));
  }, [socket]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatParam = params.get("chat");

    // Determine final chatroom ID to use
    let chatIdToJoin = chatroomLoginId;

    if (chatParam === "wotgadmin") {
      chatIdToJoin = chatroomLoginId;
      navigate(`?chat=${chatroomLoginId}`, { replace: true });
    } else if (chatParam && !isNaN(chatParam)) {
      chatIdToJoin = Number(chatParam);
    } else {
      navigate(`?chat=${chatroomLoginId}`, { replace: true });
    }

    if (chatIdToJoin) {
      // 🚀 Leave previous room (if any) before joining new one
      if (selectedChatroom && selectedChatroom !== chatIdToJoin) {
        socket?.emit("leave_room", selectedChatroom);
      }

      // 🚀 Join the new chatroom immediately for realtime updates
      socket?.emit("join_room", chatIdToJoin);

      // 📩 Load chat messages
      handleSelectChatroom(chatIdToJoin);
    }
  }, [location.search, socket, chatroomLoginId, selectedChatroom]);

  // 📦 Modal Controls
  const handleOpenCreateChatroomModal = () => setIsModalOpen(true);
  const handleOpenAddParticipantModal = () =>
    setIsModalOpenForAddParticipant(true);
  const handleCloseCreateChatroomModal = () => {
    setIsModalOpen(false);
    setIsProfileModalOpen(false);
    setIsModalOpenForAddParticipant(false);
  };

  // ❤️ React to a message
  const handleReactMessage = (messageId, reactionType) => {
    if (!socket) {
      console.error("⚠️ Socket is not connected!");
      return;
    }

    socket.emit("send_message_reaction", { messageId, react: reactionType });
    dispatch(wotgsocial.message.reactToMessageAction({ messageId, react: reactionType }));
  };

  // 🧭 Fallback chatroom handler
  const fallbackToDefaultChatroom = useCallback(async () => {
    setSelectedChatroom(chatroomLoginId);
    setIsChatVisible(true);

    // Clear unread badge
    setChatrooms((prev) =>
      prev.map((chat) =>
        chat.id === chatroomLoginId
          ? { ...chat, unreadCount: 0, hasUnread: false }
          : chat
      )
    );

    // Mark as read
    if (socket?.connected && user?.id) {
      socket.emit("mark_as_read", { chatroomId: chatroomLoginId, userId: user.id });
    }

    navigate(`?chat=${chatroomLoginId}`, { replace: true });

    try {
      const res = await dispatch(
        wotgsocial.message.getMessagesByChatroomAction(chatroomLoginId)
      );
      if (res?.success) {
        setMessages(res.data.messages);
        setSelectedChatroomDetails(res.data.chatroom);
      } else {
        console.error("Fallback fetch failed");
      }
    } catch (err) {
      console.error("Critical fallback error:", err);
    }
  }, [chatroomLoginId, dispatch, navigate, socket, user]);

  // 📩 Fetch messages in selected chatroom
  const fetchMessages = useCallback(
    async (chatroomId) => {
      if (!isAuthenticated) return;
      const activeChatroomId = chatroomId || selectedChatroom;

      setChatLoading(true); // ⏳ start loading
      dispatch(common.ui.setLoading());

      try {
        const res = await dispatch(
          wotgsocial.message.getMessagesByChatroomAction(activeChatroomId)
        );

        if (res?.success && selectedChatroom === activeChatroomId) {
          setMessages(res.data.messages);
          setSelectedChatroomDetails(res.data.chatroom);
        }
      } catch (error) {
        console.error("Fetch Messages Error:", error);
        if (selectedChatroom === activeChatroomId) {
          await fallbackToDefaultChatroom();
        }
      } finally {
        setChatLoading(false); // ✅ stop loading
        dispatch(common.ui.clearLoading());
      }
    },
    [dispatch, selectedChatroom, isAuthenticated, fallbackToDefaultChatroom]
  );


  // 🔁 Join chatroom on socket
  const joinChatroom = useCallback(
    (chatroomId) => {
      if (!socket || !chatroomId) return;
      socket.emit("join_room", chatroomId);
    },
    [socket]
  );

  // 🔁 Leave chatroom
  const leaveChatroom = useCallback(
    (chatroomId) => {
      if (!socket || !chatroomId) return;
      socket.emit("leave_room", chatroomId);
    },
    [socket]
  );

  // 🗂️ Fetch all chatrooms
  const fetchChatrooms = useCallback(
    async (chatId) => {
      dispatch(common.ui.setLoading());
      const res = await dispatch(
        wotgsocial.chatroom.getAllChatroomsAction({ search: searchQuery })
      );
      dispatch(common.ui.clearLoading());

      if (res.success) {
        const hiddenChatroomId = 7;
        const filtered = res.data.filter((c) => c.id !== hiddenChatroomId);
        setChatrooms(filtered);

        // Find bot chatroom
        const botRoom = filtered.find(
          (c) =>
            c.name?.toLowerCase().includes("welcome") ||
            c.name?.toLowerCase().includes("guest") ||
            c.type === "bot"
        );

        if (filtered.length > 0 && chatId) {
          handleSelectChatroom(chatId);
        }
      }
    },
    [dispatch, searchQuery]
  );

  // 🔔 Handle incoming message
  const handleNewMessage = useCallback(
    (message) => {
      setChatrooms((prev) => {
        const updated = prev.map((chat) => {
          if (chat.id !== message.chatroomId) return chat;
          const isUnread = message.senderId !== user?.id;
          return {
            ...chat,
            RecentMessage: message,
            unreadCount: isUnread ? (chat.unreadCount || 0) + 1 : 0,
            hasUnread: chat.hasUnread || isUnread,
          };
        });

        return updated.sort(
          (a, b) =>
            new Date(b.RecentMessage?.createdAt || 0) -
            new Date(a.RecentMessage?.createdAt || 0)
        );
      });

      // Play sound only for others’ messages
      if (message.senderId !== user?.id) {
        const now = Date.now();
        if (now - lastPlayedRef.current > 1000) {
          messageSound.play();
          lastPlayedRef.current = now;
        }
      }

      if (message.chatroomId !== selectedChatroom) return;

      // Add new message to chat window
      setMessages((prev) =>
        [message, ...prev].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    },
    [selectedChatroom, user?.id]
  );

  // 🚀 Initial fetch
  useEffect(() => {
    if (isAuthenticated) fetchChatrooms();
  }, [fetchChatrooms, isAuthenticated]);

  // after joinChatroom and leaveChatroom definitions
  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      if (selectedChatroom) {
        joinChatroom(selectedChatroom);
      }
    };

    socket.on("connect", handleReconnect);
    return () => socket.off("connect", handleReconnect);
  }, [socket, selectedChatroom, joinChatroom]);


  // 🎵 Unlock sound on first click (browser policy)
  useEffect(() => {
    const unlock = () => {
      try {
        messageSound.play();
        messageSound.stop();
      } catch {}
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("click", unlock);
    return () => window.removeEventListener("click", unlock);
  }, []);

  // 📨 Fetch messages whenever chatroom changes
  useEffect(() => {
    if (isAuthenticated) fetchMessages();
  }, [fetchMessages, isAuthenticated]);

  // 🔄 Listen for new messages
  useEffect(() => {
    if (!socket) return;
    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [socket, handleNewMessage]);

  // 🆕 Listen for new chatroom
  useEffect(() => {
    if (!socket) return;

    socket.on("new_chatroom", (newChatroom) => {
      socket.emit("join_room", newChatroom.id);
      const isCurrentUserParticipant = newChatroom.Participants?.some(
        (p) => p.userId.toString() === user?.id.toString()
      );

      if (isCurrentUserParticipant) {
        setChatrooms((prev) => {
          const exists = prev.some((chat) => chat.id === newChatroom.id);
          return exists ? prev : [...prev, newChatroom];
        });
      }
    });

    return () => socket.off("new_chatroom");
  }, [socket, user?.id]);

  // 👥 Listen for new participants added
  useEffect(() => {
    if (!socket || !user) return;

    socket.on("new_participants", (updatedChatroom) => {
      const isCurrentUserParticipant = updatedChatroom.Participants?.some(
        (p) => p.userId.toString() === user.id.toString()
      );

      if (isCurrentUserParticipant) {
        setChatrooms((prev) => {
          const exists = prev.some((c) => c.id === updatedChatroom.id);
          return exists
            ? prev.map((c) => (c.id === updatedChatroom.id ? updatedChatroom : c))
            : [...prev, updatedChatroom];
        });
      }
    });

    return () => socket.off("new_participants");
  }, [socket, user]);

  // 💬 Handle chatroom selection
  const handleSelectChatroom = async (chatroomId) => {
    if (!chatroomId) return;

    // Leave old room if switching
    if (selectedChatroom && selectedChatroom !== chatroomId) {
      leaveChatroom(selectedChatroom);
    }

    // Join new room
    joinChatroom(chatroomId);
    setSelectedChatroom(chatroomId);
    setIsChatVisible(true);

    // Reset unread badge
    setChatrooms((prev) =>
      prev.map((chat) =>
        chat.id === chatroomId ? { ...chat, unreadCount: 0, hasUnread: false } : chat
      )
    );

    if (socket?.connected && user?.id) {
      socket.emit("mark_as_read", { chatroomId, userId: user.id });
    }

    // Update URL
    const currentParam = new URLSearchParams(location.search).get("chat");
    if (currentParam !== String(chatroomId)) {
      navigate(`?chat=${chatroomId}`, { replace: true });
    }

    await fetchMessages(chatroomId);
  };


  // 🔙 Go back to sidebar (mobile)
  const handleBackClick = () => setIsChatVisible(false);

  // 📨 Send message (text or file)
  const handleSendMessage = async (messageContent, selectedFile) => {
    if (!selectedChatroom || !user) return;

    const isGuest = user.user_role === "guest";

    // 1️⃣ Handle file messages
    if (selectedFile) {
      const fileMessage = {
        file: selectedFile,
        senderId: user.id,
        chatroomId: selectedChatroom,
        type: "file",
      };
      try {
        setUploading(true);
        await dispatch(wotgsocial.message.sendFileMessageAction(fileMessage));
      } catch (err) {
        console.error("File message dispatch failed:", err);
      } finally {
        setUploading(false);
      }
    }

    // 2️⃣ Handle text messages
    const trimmed = messageContent?.trim();
    if (trimmed) {
      const textMessage = {
        content: trimmed,
        senderId: user.id,
        chatroomId: selectedChatroom,
        type: "text",
      };

      try {
        await dispatch(wotgsocial.message.sendMessageAction(textMessage));

        // 🤖 Trigger bot reply for guest users
        /*if (isGuest && botChatroomId && selectedChatroom === botChatroomId) {
          setTimeout(() => {
            dispatch(
              wotgsocial.message.sendBotReplyAction({
                message: { content: trimmed },
                userId: user.id,
                chatroomId: selectedChatroom,
              })
            ).then((res) => {
              if (res.success && res.data.triggerRefresh) {
                dispatch(
                  wotgsocial.user.reloginAction(res.data.accessToken)
                ).finally(() => window.location.reload());
              }
            });
          }, 800);
        }*/
      } catch (err) {
        console.error("Text message dispatch failed:", err);
      }
    }
  };

  // 🧱 JSX Layout
  return (
    <div className={styles.customLayoutContainer}>
      {isAuthenticated && (isMobile ? !isChatVisible : true) && (
        <>
          <ChatSidebar
            chatrooms={chatrooms}
            toggleMenu={onToggleMenu}
            onSelectChatroom={handleSelectChatroom}
            onOpenCreateChatroomModal={handleOpenCreateChatroomModal}
            currentUserId={user?.id}
            onSearchChange={(query) => setSearchQuery(query)}
            selectedChatroom={selectedChatroom}
            onlineUsers={onlineUsers}
          />
        </>
      )}

      {isAuthenticated && isChatVisible && (
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          selectedChatroom={selectedChatroom}
          selectedChatroomDetails={selectedChatroomDetails}
          userId={user?.id}
          className={isMobile ? styles.chatWindowVisible : ""}
          onBackClick={handleBackClick}
          isMobile={isMobile}
          guestChatroomId={chatroomLoginId}
          uploading={uploading}
          onMessageReaction={handleReactMessage}
          onOpenAddParticipantModal={handleOpenAddParticipantModal}
          userDetails={user}
          onlineUsers={onlineUsers}
          isChatLoading={chatLoading}
        />
      )}

      {isModalOpen && (
        <ChatRoomCreateForm
          onClose={handleCloseCreateChatroomModal}
          currentUserId={user?.id}
          fetchChatrooms={fetchChatrooms}
          socket={socket}
        />
      )}

      {isProfileModalOpen && <ProfileModal onClose={handleCloseCreateChatroomModal} />}

      {isModalOpenForAddParticipant && (
        <AddParticipantsInChatroomForm
          onClose={handleCloseCreateChatroomModal}
          fetchChatroomDetails={selectedChatroomDetails}
          socket={socket}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};

export default Page;
