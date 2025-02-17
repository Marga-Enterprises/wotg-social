import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { wotgsocial } from "../../redux/combineActions"; // Redux actions
import styles from "./index.module.css";

const LivePage = () => {
    const dispatch = useDispatch();
    const [socket, setSocket] = useState(null);
    const [stream, setStream] = useState(null);
    const [streamStatus, setStreamStatus] = useState("stopped"); // Local state for stream status
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    // Initialize Socket.IO Connection
    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://chat.wotgonline.com";

        const newSocket = io(socketUrl, { transports: ["websocket", "polling"] });
        setSocket(newSocket);

        newSocket.on("stream_status", (data) => {
            setStreamStatus(data.status); // ✅ Update local state instead of Redux
            console.log("Stream status updated:", data.status);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Start Streaming with Screen Selection (No Mic, Only System Audio)
    const handleStartStream = async () => {
        try {
            // ✅ Capture screen + system audio only (NO microphone)
            const captureStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" },
                audio: { // ✅ Only capture system audio
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100, 
                }
            });

            // ✅ Create final stream (Only Video + System Audio)
            const finalStream = new MediaStream([
                ...captureStream.getVideoTracks(), 
                ...captureStream.getAudioTracks() // ✅ Use only system audio
            ]);

            videoRef.current.srcObject = finalStream;
            setStream(finalStream);
            dispatch(wotgsocial.stream.startStreamAction());

            if (socket) {
                const mediaRecorder = new MediaRecorder(finalStream, {
                    mimeType: "video/webm; codecs=vp8,opus" // ✅ Opus for better system audio quality
                });

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        socket.emit("stream_data", event.data); // ✅ Send both video & system audio
                    }
                };

                mediaRecorder.start(1000); // ✅ Send chunks every 1s for stable streaming
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
            <p>Status: <strong>{streamStatus}</strong></p>  {/* ✅ Now using local state */}

            <button onClick={handleStartStream} className={styles.startBtn}>Start Streaming</button>
            <button onClick={handleStopStream} className={styles.stopBtn}>Stop Streaming</button>

            <video ref={videoRef} autoPlay playsInline className={styles.videoPreview} />
        </div>
    );
};

export default LivePage;
