import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import styles from "./index.module.css";

const WatchLive = () => {
    const videoRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const peerConnectionRef = useRef(null);

    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://chat.wotgonline.com";

        const newSocket = io(socketUrl, { transports: ["websocket", "polling"] });
        setSocket(newSocket);

        newSocket.on("stream_started", async ({ sdp }) => {
            try {
                const peerConnection = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
                });

                peerConnection.ontrack = (event) => {
                    videoRef.current.srcObject = event.streams[0];
                };

                await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                newSocket.emit("join_webrtc_stream", { sdp: answer });

                peerConnectionRef.current = peerConnection;
            } catch (error) {
                console.error("❌ Error connecting to WebRTC stream:", error);
            }
        });

        return () => newSocket.disconnect();
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>🎥 Watch Live Stream</h2>
            <video ref={videoRef} autoPlay playsInline className={styles.videoPlayer} />
        </div>
    );
};

export default WatchLive;
