import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';

// Components
import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';
import ProfileSidebar from '../../components/ProfileSidebar';
import ProfileModal from '../../components/ProfileModal';
import ChatRoomCreateForm from '../../components/ChatRoomCreateForm';
import SuccessSnackbar from '../../components/SuccessSnackbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './index.module.css';
import AddParticipantsInChatroomForm from '../../components/AddParticpantsInChatroomForm';

const Page = () => {
    const dispatch = useDispatch();

    const {
      ui: { loading },
    } = useSelector((state) => state.common);

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
            console.log('Socket connected successfully:', newSocket.id);
        });

        // Log disconnection
        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            newSocket.disconnect(); // Cleanup on component unmount
        };
    }, [isAuthenticated]);

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

    
    // Web Push Notification: Request Permission and Subscribe
    const subscribeToPushNotifications = async () => {
        console.log('Subscribing to push notifications...');
    
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.error('Push notifications are not supported in this browser');
            return;
        }
    
        // Check if notification permissions are already granted
        const permission = await Notification.requestPermission();
    
        // Proceed only if permission is granted
        if (permission !== 'granted') {
            console.log('Push notification permission denied');
            return;
        } else {
            console.log('Push notification permission granted');
    
            // Service worker registration: check if it's already registered
            let registration;
            try {
                registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered successfully.');
            } catch (error) {
                console.error('Service Worker registration failed:', error);
                return;
            }
    
            // Check if a subscription already exists
            const existingSubscription = await registration.pushManager.getSubscription();
    
            // If a subscription exists, log it and proceed
            if (existingSubscription) {
                console.log('Existing subscription found. No need to re-subscribe:', existingSubscription);
            }
    
            // Generate a unique deviceId for this device
            const getDeviceId = () => {
                let deviceId = localStorage.getItem('deviceId');
                if (!deviceId) {
                    deviceId = crypto.randomUUID(); // Generate a unique UUID
                    localStorage.setItem('deviceId', deviceId);
                }
                return deviceId;
            };
    
            const deviceId = getDeviceId();
            console.log('Device ID:', deviceId);
    
            // Now subscribe with the correct applicationServerKey (VAPID public key)
            const subscription = existingSubscription || await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY, // VAPID public key
            });
    
            console.log('New push notification subscription:', subscription);
    
            // Prepare subscription data
            const arrayBufferToBase64 = (buffer) => {
                const binary = String.fromCharCode(...new Uint8Array(buffer));  // Convert ArrayBuffer to binary string
                return window.btoa(binary);  // Convert binary string to base64
            };
    
            // Get the raw ArrayBuffer for p256dh and auth
            const p256dh = subscription.getKey('p256dh');
            const auth = subscription.getKey('auth');
    
            // Convert both to base64
            const p256dhBase64 = arrayBufferToBase64(p256dh);
            const authBase64 = arrayBufferToBase64(auth);
    
            const subscriptionData = {
                userId: user.id,  // Assuming the user object contains an ID field
                deviceId,         // Include the unique device ID
                subscription: {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: p256dhBase64,  // Encoded base64 public encryption key
                        auth: authBase64       // Encoded base64 authentication key
                    }
                }
            };
    
            console.log('Subscription Data:', subscriptionData);
    
            // Now send the subscriptionData to the backend
            try {
                console.log('Attempting to subscribe:', subscriptionData);
    
                // Dispatch subscription to backend
                const res = await dispatch(wotgsocial.subscription.addSubscriptionAction(subscriptionData));
    
                // Handle backend response
                if (res.error && res.error.status === 400) {
                    console.log('Subscription already exists in the backend for this device.');
                    return null; // Return null if the subscription already exists in the backend
                }
    
                console.log('Subscription successfully saved:', res);
            } catch (error) {
                console.error('Error occurred while subscribing:', error);
                return null; // Return null in case of any errors
            }
        }
    };
    
    

    // Fetch chatrooms
    const fetchChatrooms = useCallback(
        async (chatId) => {
            dispatch(common.ui.setLoading());
    
            const res = await dispatch(
                wotgsocial.chatroom.getAllChatroomsAction({ search: searchQuery }) // Pass the search query here
            );
    
            dispatch(common.ui.clearLoading());
    
            if (res.success) {
                setChatrooms(res.data);
    
                if (res.data.length > 0) {
                    if (chatId) {
                        handleSelectChatroom(chatId);
                    } else {
                        if (!searchQuery) {
                            handleSelectChatroom(res.data[0].id);
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
            console.log("New participant added, updating sidebar:", updatedChatroom);
    
            // Check if the current user is in the updated chatroom
            const isCurrentUserParticipant = updatedChatroom.Participants?.some(
                (participant) => participant.userId.toString() === user.id.toString()
            );
    
            if (isCurrentUserParticipant) {
                setChatrooms((prevChatrooms) => {
                    // Check if the chatroom already exists in state
                    const chatroomExists = prevChatrooms.some(chat => chat.id === updatedChatroom.id);
    
                    if (!chatroomExists) {
                        console.log("Adding new chatroom to sidebar:", updatedChatroom);
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
    };
    
    

    const handleBackClick = () => {
        setIsChatVisible(false);  // Hide the chat window when back is clicked
    };
    
    // Handle sending a message
    const handleSendMessage = (messageContent) => {
        if (!selectedChatroom || !user) return;

        const message = {
            content: messageContent,
            senderId: user.id,
            chatroomId: selectedChatroom,
        };

        // Emit the message to the server via socket
        socket.emit('send_message', message);

        // Optionally, update local state immediately for UI feedback
        // setMessages((prevMessages) => [...prevMessages]);

        // If you want to also update via API (or you can choose one):
        dispatch(wotgsocial.message.sendMessageAction(message));
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
                        onOpenAddParticipantModal={handleOpenAddParticipantModal}
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
