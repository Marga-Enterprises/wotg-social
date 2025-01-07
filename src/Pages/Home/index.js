import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';

// Components
import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';

const Page = () => {
    const dispatch = useDispatch();

    // Local state
    const [user, setUser] = useState(null);
    const [chatrooms, setChatrooms] = useState([]); // Local state for chatrooms
    const [messages, setMessages] = useState([]); // Local state for messages
    const [selectedChatroom, setSelectedChatroom] = useState(1);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
    const [socket, setSocket] = useState(null); // Manage Socket.IO connection

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

    // Initialize Socket.IO connection
    useEffect(() => {
        if (!isAuthenticated) return;

        const socketUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000' 
            : 'https://explorevps.site/api';

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


    // Fetch chatrooms
    const fetchChatrooms = useCallback(async () => {
        if (!isAuthenticated) return;

        dispatch(common.ui.setLoading());
        const res = await dispatch(wotgsocial.chatroom.getAllChatroomsAction());
        dispatch(common.ui.clearLoading());

        if (res.success) {
            setChatrooms(res.data); // Update local state with chatrooms
        }
    }, [dispatch, isAuthenticated]);

    // Fetch chatrooms on component mount
    useEffect(() => {
        fetchChatrooms();
    }, [fetchChatrooms]);

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
        fetchMessages();
    }, [fetchMessages]);

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
        console.log(`Joined room: ${selectedChatroom}`);

        return () => {
            socket.emit('leave_room', selectedChatroom); // Leave the room on cleanup
            console.log(`Left room: ${selectedChatroom}`);
        };
    }, [socket, selectedChatroom]);

    // Handle chatroom selection
    const handleSelectChatroom = (chatroomId) => {
        setSelectedChatroom(chatroomId);
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

    return (
        <div className="flex min-h-screen">
            {isAuthenticated && <ChatSidebar chatrooms={chatrooms} onSelectChatroom={handleSelectChatroom} />}
            {isAuthenticated && (
                <ChatWindow
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    selectedChatroom={selectedChatroom}
                />
            )}
        </div>
    );
};

export default Page;
