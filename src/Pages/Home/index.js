import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';

// Components
import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';
import ChatRoomCreateForm from '../../components/ChatRoomCreateForm';

import styles from './index.module.css';

const Page = () => {
    const dispatch = useDispatch();

    // Local state
    const [user, setUser] = useState(null);
    const [chatrooms, setChatrooms] = useState([]); // Local state for chatrooms
    const [messages, setMessages] = useState([]); // Local state for messages
    const [selectedChatroom, setSelectedChatroom] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
    const [socket, setSocket] = useState(null); // Manage Socket.IO connection
    const [isMobile, setIsMobile] = useState(false); // State to track if the screen width is 780px or below
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility



    // Fetch user details and authentication status from cookies
    useEffect(() => {
        const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;
        const authenticated = Cookies.get('authenticated') === 'true'; // Assuming "authenticated" cookie is a string
        if (account && authenticated) {
            console.log('User authenticated:', authenticated);
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
    
    // Function to close the modal
    const handleCloseCreateChatroomModal = () => {
        setIsModalOpen(false);
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
    
            // If a subscription exists, do not proceed with dispatching or subscribing again
            if (existingSubscription) {
                console.log('Existing subscription found, no need to subscribe again.');
                return null; // Return early if the subscription already exists
            }
    
            // Now subscribe with the correct applicationServerKey (VAPID public key)
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY, // VAPID public key
            });
    
            console.log('New push notification subscription:', subscription);
    
            // Prepare subscription data
    
            // Function to convert ArrayBuffer to Base64 string
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
                subscription: {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: p256dhBase64,  // Encoded base64 public encryption key
                        auth: authBase64       // Encoded base64 authentication key
                    }
                }
            };
    
            // Log the subscription data
            console.log('Subscription Data:', subscriptionData);
    
            // Now you can send the subscriptionData to the backend
            try {
                // Attempt to dispatch subscription to Redux for storing it in your backend
                console.log('Attempting to subscribe:', subscriptionData);
                const res = await dispatch(wotgsocial.subscription.addSubscriptionAction(subscriptionData));
    
                // Check if the response indicates an error (e.g., subscription already exists in backend)
                if (res.error && res.error.status === 400) {
                    console.log('Subscription already exists in the backend. No need to subscribe again.');
                    return null; // Return null if the subscription already exists in the backend
                }
    
                // If successful, log the response (successfully saved to the backend)
                console.log('Subscription successfully saved:', res);
            } catch (error) {
                console.error('Error occurred while subscribing:', error);
                return null; // Return null in case of any errors
            }
        }
    };
    

    // Fetch chatrooms
    const fetchChatrooms = useCallback(async (chatId) => {
        dispatch(common.ui.setLoading());
        const res = await dispatch(wotgsocial.chatroom.getAllChatroomsAction());
        dispatch(common.ui.clearLoading());

        if (res.success) {
            setChatrooms(res.data);
            if (res.data.length > 0) {
                if (chatId) {
                    handleSelectChatroom(chatId);
                } else {
                    handleSelectChatroom(res.data[0].id);
                }
            }
        }
    }, [dispatch, isAuthenticated]);

    // Fetch chatrooms on component mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchChatrooms();
        }
    }, [fetchChatrooms, isAuthenticated]);

    // Fetch messages for the selected chatroom
    const fetchMessages = useCallback(async () => {
        if (!selectedChatroom && !isAuthenticated) return;

        dispatch(common.ui.setLoading());
        const res = await dispatch(wotgsocial.message.getMessagesByChatroomAction(selectedChatroom));
        dispatch(common.ui.clearLoading());

        if (res.success) {
            setMessages(res.data); // Update local state with messages
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
    
        socket.on('new_message', (message) => {
            // Update messages state to include the new message
            setMessages((prevMessages) => {
                const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
                return isDuplicate ? prevMessages : [...prevMessages, message];
            });
    
            // Update chatrooms with the new message and set hasUnread
            setChatrooms((prevChatrooms) => {
                const updatedChatrooms = prevChatrooms.map((chat) => {
                    if (chat.id === message.chatroomId) {
                        const isUnread = message.senderId !== user?.id; // Only mark as unread if the sender is not the current user
                        return {
                            ...chat,
                            RecentMessage: message,
                            hasUnread: chat.hasUnread || isUnread, // Keep unread true unless explicitly read
                        };
                    }
                    return chat;
                });
    
                // Sort chatrooms to ensure the most recent message is at the top
                updatedChatrooms.sort((a, b) => {
                    const dateA = new Date(a.RecentMessage?.createdAt).getTime();
                    const dateB = new Date(b.RecentMessage?.createdAt).getTime();
                    return dateB - dateA; // Sort in descending order
                });
    
                return updatedChatrooms;
            });
        });
    
        return () => {
            socket.off('new_message'); // Cleanup event listener on component unmount
        };
    }, [socket, user?.id]);

    useEffect(() => {
        if (!socket) return;
    
        // Listen for the message_read event
        socket.on('message_read', ({ userId, messageIds }) => {
            // Update the chatrooms to remove the unread highlight for the specific user
            setChatrooms((prevChatrooms) =>
                prevChatrooms.map((chat) =>
                    messageIds.some((messageId) =>
                        chat.messages?.some((msg) => msg.id === messageId)
                    )
                        ? { ...chat, hasUnread: false }
                        : chat
                )
            );
        });
    
        return () => {
            socket.off('message_read'); // Cleanup the listener
        };
    }, [socket]);    

    useEffect(() => {
        if (!socket || !selectedChatroom) return;

        chatrooms.forEach((chatroom) => {
            socket.emit('join_room', chatroom.id); // Join each chatroom by its ID
            console.log(`User ${user.id} joined room ${chatroom.id}`);
        });

        socket.emit('join_room', selectedChatroom);

        return () => {
            socket.emit('leave_room', selectedChatroom); // Leave the room on cleanup
            console.log(`Left room: ${selectedChatroom}`);
        };
    }, [socket, selectedChatroom]);


    // Handle chatroom selection
    const handleSelectChatroom = async (chatroomId) => {
        console.log('SELECT CHAT ROOM TRIGGERED', chatroomId);
        setSelectedChatroom(chatroomId); // Set the selected chatroom
        setIsChatVisible(true); // Show the chat window
    
        // Update chatrooms locally to mark the selected chatroom as read
        setChatrooms((prevChatrooms) =>
            prevChatrooms.map((chat) =>
                chat.id === chatroomId
                    ? { ...chat, hasUnread: false } // Clear unread highlight
                    : chat
            )
        );
    
        // Fetch messages for the selected chatroom (backend will update MessageReadStatus)
        await fetchMessages();
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
        dispatch(wotgsocial.message.sendMessageAction(message)).then((res) => {
            if (res.success) {
                console.log('Message sent via API:', res.data);
            }
        });
    };

    // If the user is authenticated, subscribe them to push notifications
    useEffect(() => {
        if (isAuthenticated) {
            subscribeToPushNotifications();
        }
    }, [isAuthenticated]);

    return (
        <div className={styles.customLayoutContainer}>
            {isAuthenticated && (isMobile ? !isChatVisible : true) && (
                <ChatSidebar 
                    chatrooms={chatrooms} 
                    onSelectChatroom={handleSelectChatroom} 
                    onOpenCreateChatroomModal={handleOpenCreateChatroomModal} 
                    currentUserId={user?.id}
                />
            )}
            {isAuthenticated && isChatVisible && (
                <ChatWindow
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    selectedChatroom={selectedChatroom}
                    userId={user?.id}
                    className={isMobile ? styles.chatWindowVisible : ''} 
                    onBackClick={handleBackClick}
                    isMobile={isMobile}
                />
            )}

            {isModalOpen && (
                <ChatRoomCreateForm
                    onClose={handleCloseCreateChatroomModal}
                    currentUserId={user?.id}
                    fetchChatrooms={fetchChatrooms}
                />
            )}
        </div>
    );    
};

export default Page;
