import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';

// Components
import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';

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
    const [isMobile, setIsMobile] = useState(false); // State to track if the screen width is 570px or below
    const [isChatVisible, setIsChatVisible] = useState(true);


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
            setIsMobile(window.innerWidth <= 570); // Check if window width is <= 570px
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
    const fetchChatrooms = useCallback(async () => {
        dispatch(common.ui.setLoading());
        const res = await dispatch(wotgsocial.chatroom.getAllChatroomsAction());
        dispatch(common.ui.clearLoading());

        if (res.success) {
            setChatrooms(res.data); // Update local state with chatrooms
            handleSelectChatroom(res.data[0].id);
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
            console.log('New message received:', message);

            // Update local messages state
            setMessages((prevMessages) => {
                const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
                return isDuplicate ? prevMessages : [...prevMessages, message];
            });
        });

        return () => {
            socket.off('new_message'); // Cleanup event listener on component unmount
        };
    }, [socket]);

    // Join the selected chatroom
    useEffect(() => {
        if (!socket || !selectedChatroom) return;

        socket.emit('join_room', selectedChatroom);

        return () => {
            socket.emit('leave_room', selectedChatroom); // Leave the room on cleanup
            console.log(`Left room: ${selectedChatroom}`);
        };
    }, [socket, selectedChatroom]);

    // Handle chatroom selection
    const handleSelectChatroom = (chatroomId) => {
        setSelectedChatroom(chatroomId);  // Set the selected chatroom
        setIsChatVisible(true);            // Reset chat window visibility to true when a new chatroom is selected
    };

    const handleBackClick = () => {
        setIsChatVisible(false);  // Hide the chat window when back is clicked
    };
    

    // Handle sending a message
    const handleSendMessage = (message) => {
        if (!selectedChatroom || !user) return;

        const payload = {
            content: message,
            senderId: user.id,
            chatroomId: selectedChatroom,
        };

        // Send message to the server via REST API
        dispatch(wotgsocial.message.sendMessageAction(payload)).then((res) => {
            if (res.success) {
                console.log('Message sent via API:', res.data);

                // Update local state for immediate feedback to sender
                setMessages((prevMessages) => [...prevMessages]);
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
                <ChatSidebar chatrooms={chatrooms} onSelectChatroom={handleSelectChatroom} />
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
        </div>
    );    
};

export default Page;
