import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { wotgsocial } from '../../redux/combineActions'; // Import Redux actions
import styles from './index.module.css';

const LivePage = () => {
    const dispatch = useDispatch();
    const [socket, setSocket] = useState(null);
    const [streamStatus, setStreamStatus] = useState("stopped"); // Local state for stream status

    // Initialize Socket.io Connection
    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000' 
            : 'https://chat.wotgonline.com';

        const newSocket = io(socketUrl, { transports: ["websocket", "polling"] }); // Use WebSocket + Polling for better connectivity
        setSocket(newSocket);

        // Listen for connection
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        // Listen for real-time stream status updates
        newSocket.on("stream_status", (data) => {
            setStreamStatus(data.status);
            console.log("Stream status updated:", data.status);
        });

        // Handle disconnection
        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            newSocket.disconnect(); // Cleanup on unmount
        };
    }, []);

    // Start Stream Handler
    const handleStartStream = () => {
        dispatch(wotgsocial.stream.startStreamAction());
    };

    // Stop Stream Handler
    const handleStopStream = () => {
        dispatch(wotgsocial.stream.stopStreamAction());
    };

    return (
        <div className={styles.container}>
            <h2>Live Stream</h2>
            <p>Status: <strong>{streamStatus}</strong></p>

            <button onClick={handleStartStream} className={styles.startBtn}>Start Streaming</button>
            <button onClick={handleStopStream} className={styles.stopBtn}>Stop Streaming</button>
        </div>
    );
};

export default LivePage;
