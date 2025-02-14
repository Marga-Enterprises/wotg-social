import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { wotgsocial } from '../../redux/combineActions'; // Import Redux actions
import styles from './index.module.css';

const LivePage = () => {
    const dispatch = useDispatch();
    const [socket, setSocket] = useState(null);
    const [streamStatus, setStreamStatus] = useState("stopped"); // Local state for stream status
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    // Initialize Socket.io Connection
    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000' 
            : 'https://chat.wotgonline.com';

        const newSocket = io(socketUrl, { transports: ["websocket", "polling"] });
        setSocket(newSocket);

        // Listen for real-time stream status updates
        newSocket.on("stream_status", (data) => {
            setStreamStatus(data.status);
            console.log("Stream status updated:", data.status);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Start Streaming with Screen Selection
    const handleStartStream = async () => {
        try {
            const captureStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" },
                audio: true
            });

            videoRef.current.srcObject = captureStream;
            setStream(captureStream);

            // Start WebSocket stream
            const ws = new WebSocket("ws://your-backend-url:5000"); // Update with backend URL

            const mediaRecorder = new MediaRecorder(captureStream, {
                mimeType: "video/webm; codecs=vp8",
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    ws.send(event.data); // Send video data to backend
                }
            };

            mediaRecorder.start(1000); // Send chunks every second
            mediaRecorderRef.current = mediaRecorder;

            // Dispatch start stream action to backend
            dispatch(wotgsocial.stream.startStreamAction());
        } catch (error) {
            console.error("Error starting screen share:", error);
        }
    };

    // Stop Streaming
    const handleStopStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop the screen share
            setStream(null);
        }

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }

        dispatch(wotgsocial.stream.stopStreamAction());
    };

    return (
        <div className={styles.container}>
            <h2>Live Stream</h2>
            <p>Status: <strong>{streamStatus}</strong></p>

            <button onClick={handleStartStream} className={styles.startBtn}>Start Streaming</button>
            <button onClick={handleStopStream} className={styles.stopBtn}>Stop Streaming</button>

            <video ref={videoRef} autoPlay playsInline className={styles.videoPreview} />
        </div>
    );
};

export default LivePage;
