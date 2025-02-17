import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { wotgsocial } from "../../redux/combineActions"; // Redux actions
import styles from "./index.module.css";

const LivePage = () => {
    const dispatch = useDispatch();
    const [socket, setSocket] = useState(null);
    const [stream, setStream] = useState(null);
    const [streamStatus, setStreamStatus] = useState("stopped");
    const videoRef = useRef(null);
    const peerConnectionRef = useRef(null);

    // ✅ Initialize Socket.IO Connection
    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://chat.wotgonline.com";

        const newSocket = io(socketUrl, { transports: ["websocket", "polling"] });
        setSocket(newSocket);

        newSocket.on("stream_status", (data) => {
            setStreamStatus(data.status);
            console.log("Stream status updated:", data.status);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // ✅ Start WebRTC Streaming (Screen + System Audio)
    const handleStartStream = async () => {
        try {
            const captureStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" },
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100, 
                }
            });

            videoRef.current.srcObject = captureStream;
            setStream(captureStream);

            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            captureStream.getTracks().forEach(track => peerConnection.addTrack(track, captureStream));

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            socket.emit("start_webrtc_stream", { sdp: offer });

            peerConnectionRef.current = peerConnection;

            // ✅ Trigger Redux API Call
            dispatch(wotgsocial.stream.startStreamAction());
        } catch (error) {
            console.error("❌ Error starting stream:", error);
        }
    };

    // ✅ Stop WebRTC Streaming
    const handleStopStream = async () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        socket.emit("stop_webrtc_stream");

        // ✅ Trigger Redux API Call
        dispatch(wotgsocial.stream.stopStreamAction());
    };

    return (
        <div className={styles.container}>
            <h2>🎥 Live Stream</h2>
            <p>Status: <strong>{streamStatus}</strong></p>

            <button onClick={handleStartStream} className={styles.startBtn}>Start Streaming</button>
            <button onClick={handleStopStream} className={styles.stopBtn}>Stop Streaming</button>

            <video ref={videoRef} autoPlay playsInline className={styles.videoPreview} />
        </div>
    );
};

export default LivePage;
