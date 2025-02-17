import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import styles from "./index.module.css";

const WatchLive = () => {
    const videoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [rtpCapabilities, setRtpCapabilities] = useState(null);

    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://chat.wotgonline.com";

        const newSocket = io(socketUrl, { transports: ["websocket", "polling"] });
        setSocket(newSocket);

        newSocket.on("connect", () => console.log("✅ WebSocket connected"));
        newSocket.on("disconnect", () => console.log("🔴 WebSocket disconnected"));

        newSocket.emit("check_stream_status", {}, (data) => {
            if (data.isLive) {
                setupWebRTC(newSocket);
            }
        });

        newSocket.on("stream_started", () => {
            setupWebRTC(newSocket);
        });

        return () => {
            newSocket.disconnect();
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, []);

    const fetchRtpCapabilities = async () => {
        try {
            const response = await fetch("/stream/rtpCapabilities");
            const data = await response.json();

            if (data.success && data.rtpCapabilities) {
                setRtpCapabilities(data.rtpCapabilities);
                console.log("✅ Received RTP Capabilities:", data.rtpCapabilities);
            } else {
                console.error("❌ Failed to get RTP Capabilities:", data);
            }
        } catch (error) {
            console.error("❌ Error fetching RTP Capabilities:", error);
        }
    };

    const setupWebRTC = async (socket) => {
        try {
            console.log("📡 Setting up WebRTC for viewer...");

            await fetchRtpCapabilities();
            if (!rtpCapabilities) {
                console.error("❌ RTP Capabilities not available.");
                return;
            }

            // Create Consumer Transport
            socket.emit("create_consumer_transport", {}, (transportInfo) => {
                if (!transportInfo || !transportInfo.id) {
                    console.error("❌ Consumer Transport Info missing.");
                    return;
                }

                const peerConnection = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
                });

                peerConnectionRef.current = peerConnection;

                peerConnection.ontrack = (event) => {
                    console.log("🎥 Receiving video/audio stream...");
                    videoRef.current.srcObject = event.streams[0];
                };

                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("webrtc_ice_candidate", event.candidate);
                    }
                };

                // Connect Consumer Transport
                socket.emit("connect_consumer_transport", {
                    transportId: transportInfo.id,
                    dtlsParameters: peerConnection.localDescription
                }, async (connectResponse) => {
                    if (!connectResponse.success) {
                        console.error("❌ Failed to connect Consumer Transport.");
                        return;
                    }

                    // Start Consuming Media
                    socket.emit("consume", { transportId: transportInfo.id, rtpCapabilities }, (consumeResponse) => {
                        if (!consumeResponse || !consumeResponse.id) {
                            console.error("❌ Failed to start consuming media.");
                            return;
                        }

                        const remoteDescription = new RTCSessionDescription({
                            type: 'offer',
                            sdp: consumeResponse.sdp
                        });

                        peerConnection.setRemoteDescription(remoteDescription)
                            .then(() => peerConnection.createAnswer())
                            .then(answer => peerConnection.setLocalDescription(answer))
                            .then(() => {
                                socket.emit("consumer_answer", {
                                    sdp: peerConnection.localDescription.sdp
                                });
                                setIsStreaming(true);
                            })
                            .catch(console.error);
                    });
                });
            });
        } catch (error) {
            console.error("❌ Error setting up WebRTC viewer:", error);
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
