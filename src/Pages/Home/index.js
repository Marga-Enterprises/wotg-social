import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';
import ProfileModal from '../../components/ProfileModal';
import ChatRoomCreateForm from '../../components/ChatRoomCreateForm';
import AddParticipantsInChatroomForm from '../../components/AddParticpantsInChatroomForm';
import styles from './index.module.css';
import { useChatLogic } from './useLogic';

const Page = ({ onToggleMenu }) => {
  const {
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
  } = useChatLogic();

  if (!isAuthenticated) return null;

  return (
    <div className={styles.customLayoutContainer}>
      {(isMobile ? !isChatVisible : true) && (
        <ChatSidebar
          chatrooms={chatrooms}
          toggleMenu={onToggleMenu}
          onSelectChatroom={handleSelectChatroom}
          onOpenCreateChatroomModal={handleOpenCreateChatroomModal}
          currentUserId={user?.id}
          onSearchChange={setSearchQuery}
          selectedChatroom={selectedChatroom}
          onlineUsers={onlineUsers}
        />
      )}

      {isChatVisible && (
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          selectedChatroom={selectedChatroom}
          selectedChatroomDetails={selectedChatroomDetails}
          userId={user?.id}
          onBackClick={handleBackClick}
          isMobile={isMobile}
          uploading={uploading}
          onOpenAddParticipantModal={handleOpenAddParticipantModal}
          userDetails={user}
          onlineUsers={onlineUsers}
        />
      )}

      {isModalOpen && (
        <ChatRoomCreateForm
          onClose={handleCloseModal}
          currentUserId={user?.id}
          fetchChatrooms={fetchChatrooms}
        />
      )}

      {isProfileModalOpen && <ProfileModal onClose={handleCloseModal} />}

      {isModalOpenForAddParticipant && (
        <AddParticipantsInChatroomForm
          onClose={handleCloseModal}
          fetchChatroomDetails={selectedChatroomDetails}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};

export default Page;
