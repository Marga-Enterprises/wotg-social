import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate  } from 'react-router-dom';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';

// Components
import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';
// import ProfileSidebar from '../../components/ProfileSidebar';
import ProfileModal from '../../components/ProfileModal';
import ChatRoomCreateForm from '../../components/ChatRoomCreateForm';
import styles from './index.module.css';
import AddParticipantsInChatroomForm from '../../components/AddParticpantsInChatroomForm';

// use sound
import { Howl } from 'howler';


// CONTEXT
import { useSetHideNavbar } from "../../contexts/NavbarContext";
import { useSocket } from '../../contexts/SocketContext';

const Page = ({ onToggleMenu  }) => {
    const dispatch = useDispatch();
    const socket = useSocket();
    const location = useLocation();
    const navigate = useNavigate();

    const messageSound = useRef(
        new Howl({
            src: ['https://wotg.sgp1.cdn.digitaloceanspaces.com/audios/chat_sound.mp3'],
            volume: 0.6,
            html5: false, // ✅ uses Web Audio API, no pool issues
        })
    ).current;

    const lastPlayedRef = useRef(0); // to throttle playback
    const chatroomLoginId = Cookies.get('chatroomLoginId') ? JSON.parse(Cookies.get('chatroomLoginId')) : null;

    // Local state
    const [user, setUser] = useState(null);
    const [chatrooms, setChatrooms] = useState([]); // Local state for chatrooms
    const [messages, setMessages] = useState([]); // Local state for messages
    const [selectedChatroom, setSelectedChatroom] = useState(null);
    const [selectedChatroomDetails, setSelectedChatroomDetails] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
    const [isMobile, setIsMobile] = useState(false); // State to track if the screen width is 780px or below
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
    const [isModalOpenForAddParticipant, setIsModalOpenForAddParticipant] = useState(false); // State to manage modal visibility
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State to manage search input value
    const [uploading, setUploading] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [botChatroomId, setBotChatroomId] = useState(null);

    const setHideNavbar = useSetHideNavbar();

    // Fetch user details and authentication status from cookies
    useEffect(() => {
        const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;
        const authenticated = Cookies.get('authenticated') === 'true'; // Assuming "authenticated" cookie is a string
        if (account && authenticated) {
            setUser(account);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        setHideNavbar(true);
        return () => setHideNavbar(false);
    }, [setHideNavbar]);

    // Detect screen size (mobile or not)
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 780); // Check if window width is <= 780px
        };

        handleResize(); // Initial check on mount
        window.addEventListener('resize', handleResize); // Listen for screen resizing

        return () => {
            window.removeEventListener('resize', handleResize); // Cleanup on unmount
        };
    }, []);

    useEffect(() => {
        if (!socket) return;
      
        const reactionSound = new Audio('https://wotg.sgp1.cdn.digitaloceanspaces.com/audios/chat_sound.mp3');
        reactionSound.volume = 0.5;
        reactionSound.preload = 'auto';
      
        const handleNewReaction = (newReaction) => {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === newReaction.messageId
                ? { ...msg, reactions: [...(msg.reactions || []), newReaction] }
                : msg
            )
          );
      
          // 🔇 Do not play sound if the current user is the one who reacted
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

    useEffect(() => {
        if (!socket) return;

        socket.on('online_users', (users) => {
            setOnlineUsers(users);
        });
    }, [socket]); 

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const chatParam = params.get('chat');

        if (chatParam === 'wotgadmin') {
            navigate(`?chat=${chatroomLoginId}`, { replace: true });
        } else if (chatParam && !isNaN(chatParam)) {
            handleSelectChatroom(Number(chatParam));
        } else {
            // Fallback: invalid or missing ?chat, use default AND update URL
            handleSelectChatroom(chatroomLoginId);
            navigate(`?chat=${chatroomLoginId}`, { replace: true });
        }
    }, [location.search]);
      
    const handleOpenCreateChatroomModal = () => {
        setIsModalOpen(true);
    };

    const handleOpenAddParticipantModal = () => {
        setIsModalOpenForAddParticipant(true);
    };

    /*const handleOpenProfileModal = () => {
        setIsProfileModalOpen(true);
    };*/
    
    // Function to close the modal
    const handleCloseCreateChatroomModal = () => {
        setIsModalOpen(false);
        setIsProfileModalOpen(false);
        setIsModalOpenForAddParticipant(false);
    };

    const handleReactMessage = (messageId, reactionType) => {
        if (!socket) {
            console.error("⚠️ Socket is not connected! Cannot send reaction.");
            return;
        }
        
        socket.emit("send_message_reaction", { messageId, react: reactionType });
        dispatch(wotgsocial.message.reactToMessageAction({ messageId, react: reactionType }));
    };

    // Fallback to default chatroom if needed
    const fallbackToDefaultChatroom = useCallback(async () => {

        // Minimal fallback: no fetchMessages() inside
        setSelectedChatroom(chatroomLoginId);
        setIsChatVisible(true);

        // Clear unread indicators
        setChatrooms((prevChatrooms) =>
            prevChatrooms.map((chat) =>
                chat.id === chatroomLoginId
                    ? { ...chat, unreadCount: 0, hasUnread: false }
                    : chat
            )
        );

        if (socket?.connected && user?.id) {
            socket.emit('mark_as_read', { chatroomId: chatroomLoginId, userId: user.id });
        }

        navigate(`?chat=${chatroomLoginId}`, { replace: true });

        // Finally fetch messages for the fallback
        try {
            const res = await dispatch(
                wotgsocial.message.getMessagesByChatroomAction(chatroomLoginId)
            );

            if (res?.success) {
                setMessages(res.data.messages);
                setSelectedChatroomDetails(res.data.chatroom);
            } else {
                console.error('Fallback fetch also failed.');
            }
        } catch (err) {
            console.error('Critical error during fallback:', err);
        }
    }, [chatroomLoginId, dispatch, navigate, socket, user]);

    // Fetch messages for the selected chatroom
    const fetchMessages = useCallback(async (chatroomId) => {
        if (!isAuthenticated) return;

        dispatch(common.ui.setLoading());

        try {
            const res = await dispatch(
                wotgsocial.message.getMessagesByChatroomAction(chatroomId || selectedChatroom)
            );

            if (res?.success) {
                setMessages(res.data.messages);
                setSelectedChatroomDetails(res.data.chatroom);
            } else {
                await fallbackToDefaultChatroom(); // ⬅ safe fallback
            }
        } catch (error) {
            console.error('Fetch Messages Error:', error);
            await fallbackToDefaultChatroom(); // ⬅ safe fallback
        } finally {
            dispatch(common.ui.clearLoading());
        }
    }, [dispatch, selectedChatroom, isAuthenticated, fallbackToDefaultChatroom]);

    // Fetch chatrooms
    const fetchChatrooms = useCallback(
        async (chatId) => {
            dispatch(common.ui.setLoading());
            const res = await dispatch(
                wotgsocial.chatroom.getAllChatroomsAction({ search: searchQuery })
            );
            dispatch(common.ui.clearLoading());

            if (res.success) {
                const hiddenChatroomId = 7;
                const filteredChatrooms = res.data.filter(
                    (chat) => chat.id !== hiddenChatroomId
                );
                setChatrooms(filteredChatrooms);

                // ✅ detect bot/welcome chatroom dynamically
                const botRoom = filteredChatrooms.find(
                    (chat) =>
                        chat.name?.toLowerCase().includes('welcome') ||
                        chat.name?.toLowerCase().includes('guest') ||
                        chat.type === 'bot'
                );
                if (botRoom) setBotChatroomId(botRoom.id);

                if (filteredChatrooms.length > 0) {
                    if (chatId) {
                        handleSelectChatroom(chatId);
                    }
                }
            }
        },
        [dispatch, searchQuery]
    );  

    const handleNewMessage = useCallback((message) => {
        setChatrooms((prevChatrooms) => {
            const updated = prevChatrooms.map((chat) => {
                if (chat.id !== message.chatroomId) return chat;

                const isUnread = message.senderId !== user?.id;
                return {
                    ...chat,
                    RecentMessage: message,
                    unreadCount: isUnread ? (chat.unreadCount || 0) + 1 : chat.unreadCount || 0,
                    hasUnread: chat.hasUnread || isUnread,
                };
            });

            return updated.sort((a, b) =>
                new Date(b.RecentMessage?.createdAt || 0) - new Date(a.RecentMessage?.createdAt || 0)
            );
        });

        if (message.senderId !== user?.id) {
            const now = Date.now();
            if (now - lastPlayedRef.current > 1000) {
                messageSound.play();
                lastPlayedRef.current = now;
            }
        }

        if (message.chatroomId !== selectedChatroom) return;

        setMessages((prevMessages) => {
            const updatedMessages = [message, ...prevMessages].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return updatedMessages;
        });
    }, [selectedChatroom, user?.id]);


    // Fetch chatrooms on component mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchChatrooms();
        }
    }, [fetchChatrooms, isAuthenticated]);

    useEffect(() => {
        const unlock = () => {
            try {
                messageSound.play();
                messageSound.stop();
            } catch {}
            window.removeEventListener('click', unlock);
        };

        window.addEventListener('click', unlock);
        return () => window.removeEventListener('click', unlock);
    }, []);

    // Fetch messages when chatroom changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchMessages();
        }
    }, [fetchMessages, isAuthenticated]);

    // Listen for new messages in real-time
    useEffect(() => {
        if (!socket) return;
        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, handleNewMessage]);
     
    
    useEffect(() => {
        if (!socket) return;
    
        // Listen for new chatroom event
        socket.on('new_chatroom', (newChatroom) => {
            socket.emit('join_room', newChatroom.id); // Join the new chatroom
            const isCurrentUserParticipant = newChatroom.Participants?.some(
                (participant) => participant.userId.toString() === user?.id.toString()
            );
    
            if (isCurrentUserParticipant) {
                // Add the new chatroom to the chatrooms state
                setChatrooms((prevChatrooms) => {
                    // Ensure no duplicates by checking chatroom IDs
                    const chatroomExists = prevChatrooms.some(chat => chat.id === newChatroom.id);
    
                    if (!chatroomExists) {
                        return [...prevChatrooms, newChatroom]; // Append new chatroom to the list
                    }
    
                    return prevChatrooms;
                });
            }
        });
    
        // Cleanup the listener on unmount
        return () => {
            socket.off('new_chatroom');
        };
    }, [socket, user?.id]);

    useEffect(() => {
        if (!socket || !user) return;
    
        socket.on('new_participants', (updatedChatroom) => {
            // console.log("New participant added, updating sidebar:", updatedChatroom);
    
            // Check if the current user is in the updated chatroom
            const isCurrentUserParticipant = updatedChatroom.Participants?.some(
                (participant) => participant.userId.toString() === user.id.toString()
            );
    
            if (isCurrentUserParticipant) {
                setChatrooms((prevChatrooms) => {
                    // Check if the chatroom already exists in state
                    const chatroomExists = prevChatrooms.some(chat => chat.id === updatedChatroom.id);
    
                    if (!chatroomExists) {
                        // console.log("Adding new chatroom to sidebar:", updatedChatroom);
                        return [...prevChatrooms, updatedChatroom]; // Add chatroom to the sidebar
                    }
    
                    return prevChatrooms.map(chat =>
                        chat.id === updatedChatroom.id ? updatedChatroom : chat
                    ); // Update existing chatroom
                });
            }
        });
    
        return () => {
            socket.off('new_participants');
        };
    }, [socket, user]);    

    // Handle chatroom selection
    const handleSelectChatroom = async (chatroomId) => {
        if (!chatroomId) return;

        // If already selected, avoid redundant update
        setSelectedChatroom((prevId) => {
            if (prevId !== chatroomId) {
                return chatroomId;
            }
            return prevId;
        });

        setIsChatVisible(true);

        // Reset unread count for selected chatroom
        setChatrooms((prevChatrooms) =>
            prevChatrooms.map((chat) =>
                chat.id === chatroomId
                    ? { ...chat, unreadCount: 0, hasUnread: false }
                    : chat
            )
        );

        // Mark as read via socket
        if (socket?.connected && user?.id) {
            socket.emit('mark_as_read', { chatroomId, userId: user.id });
        }

        // 🧠 Avoid URL update if already correct or it's wotgadmin
        const currentParam = new URLSearchParams(location.search).get('chat');
        if (currentParam !== 'wotgadmin' && currentParam !== String(chatroomId)) {
            navigate(`?chat=${chatroomId}`, { replace: true });
        }

        await fetchMessages(chatroomId);
    };

    const handleBackClick = () => {
        setIsChatVisible(false);  // Hide the chat window when back is clicked
    };

    
    // Handle sending a message
    const handleSendMessage = async (messageContent, selectedFile) => {
        if (!selectedChatroom || !user) return;

        const isGuest = user.user_role === 'guest';

        // 1) Handle file message
        if (selectedFile) {
            const fileMessage = {
                file: selectedFile,
                senderId: user.id,
                chatroomId: selectedChatroom,
                type: 'file',
            };
            try {
                setUploading(true);
                await dispatch(wotgsocial.message.sendFileMessageAction(fileMessage));
            } catch (err) {
                console.error('File message dispatch failed:', err);
            } finally {
                setUploading(false);
            }
        }

        // 2) Handle text message
        const trimmed = messageContent?.trim();
        if (trimmed) {
            const textMessage = {
                content: trimmed,
                senderId: user.id,
                chatroomId: selectedChatroom,
                type: 'text',
            };

            try {
                await dispatch(wotgsocial.message.sendMessageAction(textMessage));

                // ✅ Trigger bot reply ONLY in the botChatroomId
                if (isGuest && botChatroomId && selectedChatroom === botChatroomId) {
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
                }
            } catch (err) {
                console.error('Text message dispatch failed:', err);
            }
        }
    };

    return (
        /*loading ? <LoadingSpinner /> :*/
        <>
            <div className={styles.customLayoutContainer}>
                {isAuthenticated && (isMobile ? !isChatVisible : true) && (
                    <>
                        {/*<ProfileSidebar onOpenProfileModal={handleOpenProfileModal}/>*/}
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
                        className={isMobile ? styles.chatWindowVisible : ''} 
                        onBackClick={handleBackClick}
                        isMobile={isMobile}
                        uploading={uploading}
                        onMessageReaction={handleReactMessage}
                        onOpenAddParticipantModal={handleOpenAddParticipantModal}
                        userDetails={user}
                        onlineUsers={onlineUsers}
                    />
                )}

                {isModalOpen && (
                    <ChatRoomCreateForm
                        onClose={handleCloseCreateChatroomModal}
                        currentUserId={user?.id}
                        fetchChatrooms={fetchChatrooms}
                        socket={socket} // Pass socket to the child component
                    />
                )}

                {isProfileModalOpen && (
                    <ProfileModal onClose={handleCloseCreateChatroomModal} />
                )}

                {isModalOpenForAddParticipant && (
                    <AddParticipantsInChatroomForm 
                        onClose={handleCloseCreateChatroomModal}
                        fetchChatroomDetails={selectedChatroomDetails}
                        socket={socket}
                        currentUserId={user?.id}
                    />
                )}
            </div>
        </>

    );    
};

export default Page;
