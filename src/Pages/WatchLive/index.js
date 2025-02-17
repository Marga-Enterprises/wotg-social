import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import styles from "./index.module.css";

const WatchLive = () => {
    const videoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://chat.wotgonline.com";

        const newSocket = io(socketUrl, { transports: ["websocket", "polling"] });
        setSocket(newSocket);

        // ✅ Debug WebSocket Connection
        newSocket.on("connect", () => console.log("✅ WebSocket connected"));
        newSocket.on("disconnect", () => console.log("🔴 WebSocket disconnected"));

        // ✅ Request Stream Status (for late viewers)
        newSocket.emit("check_stream_status", {}, (data) => {
            console.log("🔍 Checking if stream is running:", data);
            if (data.isLive) {
                console.log("🎥 Stream is already live! Joining now...");
                setupWebRTC(newSocket);
            }
        });

        // ✅ If the stream starts while this page is open, join automatically
        newSocket.on("stream_started", () => {
            console.log("📡 Live stream started! Joining now...");
            setupWebRTC(newSocket);
        });

        return () => {
            newSocket.disconnect();
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, []);

    // ✅ Setup WebRTC for Viewer (Mediasoup Consumer)
    const setupWebRTC = async (socket) => {
        try {
            console.log("📡 Setting up WebRTC for viewer...");

            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            // ✅ Receive Video/Audio Stream
            peerConnection.ontrack = (event) => {
                console.log("🎥 Receiving video/audio stream...");
                if (videoRef.current) {
                    videoRef.current.srcObject = event.streams[0];
                    console.log("✅ Video Stream Set!");
                }
            };

            // ✅ Send ICE Candidate to Server
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("📡 Sending ICE candidate:", event.candidate);
                    socket.emit("webrtc_ice_candidate", event.candidate);
                }
            };

            // ✅ Request RTP Capabilities
            socket.emit("request_rtp_capabilities", {}, async (rtpCapabilities) => {
                console.log("📡 Received RTP Capabilities:", rtpCapabilities);

                // ✅ Create Consumer Transport
                socket.emit("create_consumer_transport", {}, async (transportInfo) => {
                    console.log("📡 Received Consumer Transport Info:", transportInfo);

                    if (!transportInfo.id || !transportInfo.dtlsParameters) {
                        console.error("❌ Consumer Transport Info is missing critical data!");
                        return;
                    }

                    // ✅ Set Remote Description (Mediasoup doesn't use SDP, we map RTP)
                    const offer = {
                        type: "offer",
                        sdp: JSON.stringify(rtpCapabilities)
                    };

                    await peerConnection.setRemoteDescription(offer);
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);

                    console.log("✅ Local SDP Set, sending answer to server...");
                    socket.emit("webrtc_transport_answer", { id: transportInfo.id, sdp: answer });

                    // ✅ Handle ICE Candidates from Server
                    socket.on("webrtc_ice_candidate", (candidate) => {
                        console.log("✅ Adding received ICE candidate...");
                        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    });

                    peerConnectionRef.current = peerConnection;
                    setIsStreaming(true);
                });
            });

        } catch (error) {
            console.error("❌ Error connecting to WebRTC stream:", error);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                🎥 {isStreaming ? "Live Stream Running" : "Waiting for Stream..."}
            </h2>
            <video ref={videoRef} autoPlay playsInline className={styles.videoPlayer} />
        </div>
    );
};

export default WatchLive;
