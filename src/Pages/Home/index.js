import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';

import { requestForToken } from "../../firebase";

// Components
import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';
import ProfileSidebar from '../../components/ProfileSidebar';
import ProfileModal from '../../components/ProfileModal';
import ChatRoomCreateForm from '../../components/ChatRoomCreateForm';
import styles from './index.module.css';
import AddParticipantsInChatroomForm from '../../components/AddParticpantsInChatroomForm';

// CONTEXT
import { useSetHideNavbar } from "../../contexts/NavbarContext";

const Page = ({ onToggleMenu  }) => {
    const dispatch = useDispatch();

    // Local state
    const [user, setUser] = useState(null);
    const [chatrooms, setChatrooms] = useState([]); // Local state for chatrooms
    const [messages, setMessages] = useState([]); // Local state for messages
    const [selectedChatroom, setSelectedChatroom] = useState(null);
    const [selectedChatroomDetails, setSelectedChatroomDetails] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
    const [socket, setSocket] = useState(null); // Manage Socket.IO connection
    const [isMobile, setIsMobile] = useState(false); // State to track if the screen width is 780px or below
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
    const [isModalOpenForAddParticipant, setIsModalOpenForAddParticipant] = useState(false); // State to manage modal visibility
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State to manage search input value

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


    // Initialize Socket.IO connection
    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000' 
            : 'https://community.wotgonline.com';

        const newSocket = io(socketUrl); // Adjust to your backend server
        setSocket(newSocket);

        // Log successful connection
        newSocket.on('connect', () => {
            // console.log('Socket connected successfully:', newSocket.id);
        });

        // Log disconnection
        newSocket.on('disconnect', () => {
            // console.log('Socket disconnected');
        });

        return () => {
            newSocket.disconnect(); // Cleanup on component unmount
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!socket) return;
        
        socket.on("new_message_reaction", (newReaction) => {
            setMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.id === newReaction.messageId
                ? { ...msg, reactions: [...(msg.reactions || []), newReaction] } // ✅ Ensure reactions is always an array
                : msg
            )
            );
        });
        
        return () => socket.off("new_message_reaction");
    }, [socket]); 

    const handleOpenCreateChatroomModal = () => {
        setIsModalOpen(true);
    };

    const handleOpenAddParticipantModal = () => {
        setIsModalOpenForAddParticipant(true);
    };

    const handleOpenProfileModal = () => {
        setIsProfileModalOpen(true);
    };
    
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

    
    // Web Push Notification: Request Permission and Subscribe
    const subscribeToPushNotifications = async () => {
        if (!("Notification" in window)) {
            console.error("🚫 Push notifications are not supported in this browser.");
            return;
        }
    
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("⚠️ Push notification permission denied.");
            return;
        }
    
        try {
            // 🔥 Get the FCM Token
            const fcmToken = await requestForToken();
            if (!fcmToken) {
                console.error("❌ FCM Token is not available.");
                return;
            }
    
            // ✅ Generate a unique deviceId for this device
            const getDeviceId = () => {
                let deviceId = localStorage.getItem("deviceId");
                if (!deviceId) {
                    deviceId = crypto.randomUUID(); // Generate a unique UUID
                    localStorage.setItem("deviceId", deviceId);
                }
                return deviceId;
            };
    
            const deviceId = getDeviceId();
    
            // 🔍 Detect Device Type (Web, Android, iOS)
            const getDeviceType = () => {
                const userAgent = navigator.userAgent.toLowerCase();
                if (/android/.test(userAgent)) return "android";
                if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
                return "web"; // Default to web
            };
    
            const deviceType = getDeviceType();
    
            // ✅ Prepare subscription data
            const subscriptionData = {
                userId: user.id,  // Assuming the user object contains an ID field
                deviceId,         // Unique device ID
                deviceType,       // Store device type
                subscription: {   // Store FCM token inside subscription JSON
                    fcmToken: fcmToken,
                },
            };
    
            // ✅ Send the FCM token to the backend for storage
            const res = await dispatch(wotgsocial.subscription.addSubscriptionAction(subscriptionData));
    
            // 🛠 Handle backend response
            if (res.error && res.error.status === 400) {
                console.log("ℹ️ Subscription already exists in the backend for this device.");
                return null; // Return null if the subscription already exists in the backend
            }
    
            console.log("✅ Subscription successfully saved:", res);
        } catch (error) {
            console.error("❌ Error subscribing to push notifications:", error);
            return null;
        }
    };    
    

    // Fetch chatrooms
    const fetchChatrooms = useCallback(
        async (chatId) => {
            dispatch(common.ui.setLoading());
    
            const res = await dispatch(
                wotgsocial.chatroom.getAllChatroomsAction({ search: searchQuery }) // Pass the search query
            );
    
            dispatch(common.ui.clearLoading());
    
            if (res.success) {
                // Determine the chatroom ID to hide based on the environment
                const hiddenChatroomId = process.env.NODE_ENV === "development" ? 40 : 7;
    
                // Filter out the chatroom ID to be hidden
                const filteredChatrooms = res.data.filter(chat => chat.id !== hiddenChatroomId);
    
                setChatrooms(filteredChatrooms);
    
                if (filteredChatrooms.length > 0) {
                    if (chatId) {
                        handleSelectChatroom(chatId);
                    } else {
                        if (!searchQuery) {
                            // handleSelectChatroom(filteredChatrooms[0].id);
                        }
                    }
                }
            }
        },
        [dispatch, isAuthenticated, searchQuery] // Add searchQuery as a dependency
    );    

    // Fetch chatrooms on component mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchChatrooms();
        }
    }, [fetchChatrooms, isAuthenticated]);

    // Fetch messages for the selected chatroom
    const fetchMessages = useCallback(async (chatroomId) => {
        if (!selectedChatroom && !isAuthenticated) return;

        dispatch(common.ui.setLoading());
        const res = await dispatch(wotgsocial.message.getMessagesByChatroomAction(chatroomId || selectedChatroom));
        dispatch(common.ui.clearLoading());

        if (res.success) {
            setMessages(res.data.messages); // Update local state with messages
            setSelectedChatroomDetails(res.data.chatroom); // Update the selected chatroom name
        }
    }, [selectedChatroom, dispatch]);
    

    // Fetch messages when chatroom changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchMessages();
        }
    }, [fetchMessages, isAuthenticated]);

    // Listen for new messages in real-time
    useEffect(() => {
        if (!socket) return;
    
        // Listen for new messages
        socket.on('new_message', (message) => {
            // Update the messages state with the new message
            setMessages((prevMessages) => {
                const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
                if (isDuplicate) return prevMessages;
    
                const updatedMessages = [message, ...prevMessages];
                // Sort messages in descending order based on createdAt timestamp
                updatedMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                return updatedMessages;
            });
    
            // Update chatrooms with the new message
            setChatrooms((prevChatrooms) => {
                const updatedChatrooms = prevChatrooms.map((chat) => {
                    if (chat.id === message.chatroomId) {
                        const isUnread = message.senderId !== user?.id; // Check if the message is unread for the current user
                        return {
                            ...chat,
                            RecentMessage: message,
                            unreadCount: isUnread ? chat.unreadCount + 1 : chat.unreadCount,
                            hasUnread: chat.hasUnread || isUnread,
                        };
                    }
                    return chat;
                });
    
                // Sort chatrooms based on the most recent message's timestamp
                updatedChatrooms.sort((a, b) => {
                    const dateA = new Date(a.RecentMessage?.createdAt || 0).getTime();
                    const dateB = new Date(b.RecentMessage?.createdAt || 0).getTime();
                    return dateB - dateA; // Sort in descending order (most recent first)
                });
    
                return updatedChatrooms;
            });
        });
    
        return () => {
            socket.off('new_message'); // Cleanup the listener
        };
    }, [socket, user?.id]);
    

    useEffect(() => {
        if (!socket) return;
    
        // Listen for new chatroom event
        socket.on('new_chatroom', (newChatroom) => {
            // Check if the current user is a participant in the new chatroom
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
       
    
    useEffect(() => {
        if (!socket || !selectedChatroom) return;

        chatrooms.forEach((chatroom) => {
            socket.emit('join_room', chatroom.id); // Join each chatroom by its ID
        });

        socket.emit('join_room', selectedChatroom);

        return () => {
            socket.emit('leave_room', selectedChatroom); // Leave the room on cleanup
        };
    }, [socket, selectedChatroom]);


    // Handle chatroom selection
    const handleSelectChatroom = async (chatroomId) => {
        if (chatroomId) {
            setSelectedChatroom(chatroomId); // Set the selected chatroom
            setIsChatVisible(true); // Show the chat window
        
            // Update the local state to set `unreadCount` to 0 for the selected chatroom
            setChatrooms((prevChatrooms) =>
                prevChatrooms.map((chat) =>
                    chat.id === chatroomId
                        ? { ...chat, unreadCount: 0, hasUnread: false } // Clear unread count and hasUnread flag
                        : chat
                )
            );
        
            // Notify the backend to mark messages as read
            if (socket) {
                socket.emit('mark_as_read', { chatroomId, userId: user?.id });
            }
        
            // Fetch messages for the selected chatroom
            await fetchMessages(chatroomId);
        }
    };
    
    

    const handleBackClick = () => {
        setIsChatVisible(false);  // Hide the chat window when back is clicked
    };
    
    // Handle sending a message
    const handleSendMessage = async (messageContent, selectedFile) => {
        if (!selectedChatroom || !user) return;

        console.log('[[[[[[SELECTED FILE MAIN]]]]]]', selectedFile);
      
        if (selectedFile) {
          const message = {
            file: selectedFile, // Attach the selected file
            senderId: user.id,
            chatroomId: selectedChatroom,
          };
          await dispatch(wotgsocial.message.sendFileMessageAction(message));
        } else if (messageContent?.trim()) {
          // ✉️ Regular text message
          const message = {
            content: messageContent,
            senderId: user.id,
            chatroomId: selectedChatroom,
          };
      
          await dispatch(wotgsocial.message.sendMessageAction(message));
        }
      };
      

    // If the user is authenticated, subscribe them to push notifications
    useEffect(() => {
        if (isAuthenticated) {
            subscribeToPushNotifications();
        }
    }, [isAuthenticated]);

    return (
        /*loading ? <LoadingSpinner /> :*/
        <>
            <div className={styles.customLayoutContainer}>
                {isAuthenticated && (isMobile ? !isChatVisible : true) && (
                    <>
                        <ProfileSidebar onOpenProfileModal={handleOpenProfileModal}/>
                        <ChatSidebar 
                            chatrooms={chatrooms}
                            toggleMenu={onToggleMenu} 
                            onSelectChatroom={handleSelectChatroom} 
                            onOpenCreateChatroomModal={handleOpenCreateChatroomModal}
                            currentUserId={user?.id}
                            onSearchChange={(query) => setSearchQuery(query)}
                            selectedChatroom={selectedChatroom}
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
                        onMessageReaction={handleReactMessage}
                        onOpenAddParticipantModal={handleOpenAddParticipantModal}
                        userDetails={user}
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
