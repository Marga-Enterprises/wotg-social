import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useSetHideNavbar } from "../../contexts/NavbarContext";
import { useChatroomsLogic } from "./useChatroomsLogic";
import { useMessagesLogic } from "./useMessagesLogic";

export const useChatLogic = () => {
  const setHideNavbar = useSetHideNavbar();

  // -----------------------------
  // 🍪 Authentication setup
  // -----------------------------
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // -----------------------------
  // 📱 Layout states
  // -----------------------------
  const [isMobile, setIsMobile] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [selectedChatroomDetails, setSelectedChatroomDetails] = useState(null);

  // -----------------------------
  // Hide navbar on mount
  // -----------------------------
  useEffect(() => {
    setHideNavbar(true);
    return () => setHideNavbar(false);
  }, [setHideNavbar]);

  // -----------------------------
  // Detect mobile resize
  // -----------------------------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 780);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -----------------------------
  // 💬 Messages logic
  // -----------------------------
  const {
    messages,
    fetchMessages,
    handleSendMessage,
    uploading,
  } = useMessagesLogic(user, selectedChatroom);

  // -----------------------------
  // 🧩 Chatrooms logic
  // -----------------------------
  const {
    chatrooms,
    onlineUsers,
    botChatroomId,
    fetchChatrooms,
    handleSelectChatroom,
  } = useChatroomsLogic({
    user,
    isAuthenticated,
    fetchMessages,
    setSelectedChatroom,
    setIsChatVisible,
  });

  // -----------------------------
  // 🧭 Modals & UI Controls
  // -----------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenForAddParticipant, setIsModalOpenForAddParticipant] =
    useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenCreateChatroomModal = () => setIsModalOpen(true);
  const handleOpenAddParticipantModal = () =>
    setIsModalOpenForAddParticipant(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsProfileModalOpen(false);
    setIsModalOpenForAddParticipant(false);
  };
  const handleBackClick = () => setIsChatVisible(false);

  // -----------------------------
  // ✅ Final data for Page.jsx
  // -----------------------------
  return {
    user,
    isAuthenticated,
    chatrooms,
    messages,
    selectedChatroom,
    selectedChatroomDetails,
    isMobile,
    isChatVisible,
    uploading,
    isModalOpen,
    isModalOpenForAddParticipant,
    isProfileModalOpen,
    onlineUsers,
    handleSelectChatroom,
    handleSendMessage,
    handleOpenCreateChatroomModal,
    handleOpenAddParticipantModal,
    handleCloseModal,
    handleBackClick,
    fetchChatrooms,
    setSearchQuery,
  };
};
