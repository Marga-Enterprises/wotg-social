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

    // Start Streaming with Screen Selection
    const handleStartStream = async () => {
        try {
            // ✅ Capture screen + system audio
            const captureStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" },
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100,
                }
            });
    
            // ✅ Capture microphone separately
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
            // ✅ Combine system & mic audio
            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();
            const screenAudio = audioContext.createMediaStreamSource(captureStream);
            const micAudio = audioContext.createMediaStreamSource(micStream);
    
            screenAudio.connect(destination);
            micAudio.connect(destination);
    
            // ✅ Create final stream (video + both audio)
            const finalStream = new MediaStream([
                ...captureStream.getVideoTracks(),
                ...destination.stream.getAudioTracks()
            ]);
    
            videoRef.current.srcObject = finalStream;
            setStream(finalStream);
    
            dispatch(wotgsocial.stream.startStreamAction());
    
            if (socket) {
                const mediaRecorder = new MediaRecorder(finalStream, {
                    mimeType: "video/webm; codecs=vp8,opus" // ✅ Opus for better audio quality
                });
    
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        socket.emit("stream_data", event.data); // ✅ Send both audio & video
                    }
                };
    
                mediaRecorder.start(1000); // ✅ Send chunks every 1 second for stable streaming
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
