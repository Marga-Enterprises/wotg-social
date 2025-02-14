import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { wotgsocial } from "../../redux/combineActions"; // Redux actions
import styles from "./index.module.css";

const LivePage = () => {
    const dispatch = useDispatch();
    const [socket, setSocket] = useState(null);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const streamStatus = useSelector((state) => state.stream.streamStatus);

    // Initialize Socket.IO Connection
    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://chat.wotgonline.com";

        const newSocket = io(socketUrl, { transports: ["websocket", "polling"] });
        setSocket(newSocket);

        newSocket.on("stream_status", (data) => {
            dispatch(wotgsocial.stream.updateStreamStatus(data.status));
            console.log("Stream status updated:", data.status);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [dispatch]);

    // Start Streaming with Screen Selection
    const handleStartStream = async () => {
        try {
            const captureStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" },
                audio: true
            });

            videoRef.current.srcObject = captureStream;
            setStream(captureStream);

            dispatch(wotgsocial.stream.startStreamAction());

            if (socket) {
                const mediaRecorder = new MediaRecorder(captureStream, {
                    mimeType: "video/webm; codecs=vp8",
                });

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        socket.emit("stream_data", event.data); // Send video chunks to backend
                    }
                };

                mediaRecorder.start(1000); // Send chunks every second
                mediaRecorderRef.current = mediaRecorder;
            }
        } catch (error) {
            console.error("Error starting screen share:", error);
        }
    };

    // Stop Streaming
    const handleStopStream = async () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }

        dispatch(wotgsocial.stream.stopStreamAction());

        if (socket) {
            socket.emit("stop_stream");
        }
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
