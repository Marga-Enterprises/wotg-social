import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';

// Components
import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';
import RightPanel from '../../components/RightPanel';

const Page = () => {
    const dispatch = useDispatch();

    // Redux state
    const { chatrooms } = useSelector((state) => state.wotgsocial.chatroom);
    const { messages } = useSelector((state) => state.wotgsocial.message);
    const {
        ui: { loading },
    } = useSelector((state) => state.common);

    // Local state
    const [user, setUser] = useState(null);
    const [selectedChatroom, setSelectedChatroom] = useState(1);

    console.log('Messages', messages);

    // Fetch user details from cookies
    useEffect(() => {
        const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;
        if (account) {
            setUser(account);
        }
    }, []);

    // Fetch chatrooms on component mount
    useEffect(() => {
        dispatch(common.ui.setLoading());
        dispatch(wotgsocial.chatroom.getAllChatroomsAction())
            .finally(() => {
                dispatch(common.ui.clearLoading());
            });
    }, [dispatch]);

    // Fetch messages when chatroom changes
    useEffect(() => {
        if (selectedChatroom) {
            dispatch(common.ui.setLoading());
            dispatch(wotgsocial.message.getMessagesByChatroomAction(selectedChatroom))
                .finally(() => {
                    dispatch(common.ui.clearLoading());
                });
        }
    }, [selectedChatroom, dispatch]);

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

        dispatch(wotgsocial.message.sendMessageAction(payload));
    };

    return (
        <div className="flex min-h-screen">
             <ChatSidebar chatrooms={chatrooms} onSelectChatroom={handleSelectChatroom} />
             <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                selectedChatroom={selectedChatroom}
             />
        </div>
    );
};

export default Page;
