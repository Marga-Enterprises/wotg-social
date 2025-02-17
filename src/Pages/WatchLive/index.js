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

        console.log("🔗 Connecting to WebSocket Server...");

        newSocket.on("connect", () => console.log("✅ WebSocket connected"));
        newSocket.on("disconnect", () => console.log("🔴 WebSocket disconnected"));

        // ✅ Check if there is an ongoing stream when the page loads
        newSocket.emit("check_stream_status", {}, (data) => {
            console.log("🔍 Checking stream status:", data);
            if (data.isLive) {
                console.log("🎥 Ongoing Live Stream Found! Auto-Joining...");
                setupWebRTC(newSocket);
            } else {
                console.log("❌ No ongoing live stream detected.");
            }
        });

        // ✅ If a live stream starts while on this page, auto-join
        newSocket.on("stream_started", () => {
            console.log("📡 Live Stream Started! Joining now...");
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
            console.log("🔍 Fetching RTP Capabilities...");
            const response = await fetch("/stream/rtpCapabilities");
            const data = await response.json();

            console.log("📡 Received RTP Capabilities:", data);

            if (data.success && data.rtpCapabilities) {
                setRtpCapabilities(data.rtpCapabilities);
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

            // ✅ Step 1: Create Consumer Transport
            socket.emit("create_consumer_transport", {}, (transportInfo) => {
                if (!transportInfo || !transportInfo.id) {
                    console.error("❌ Consumer Transport Info missing.");
                    return;
                }

                console.log("✅ Consumer Transport Created:", transportInfo);

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
                        console.log("📡 Sending ICE Candidate:", event.candidate);
                        socket.emit("webrtc_ice_candidate", event.candidate);
                    }
                };

                // ✅ Step 2: Connect Consumer Transport
                socket.emit("connect_consumer_transport", {
                    transportId: transportInfo.id,
                    dtlsParameters: peerConnection.localDescription
                }, async (connectResponse) => {
                    if (!connectResponse.success) {
                        console.error("❌ Failed to connect Consumer Transport.");
                        return;
                    }

                    console.log("✅ Consumer Transport Connected!");

                    // ✅ Step 3: Start Consuming Media
                    socket.emit("consume", { transportId: transportInfo.id, rtpCapabilities }, (consumeResponse) => {
                        if (!consumeResponse || !consumeResponse.id) {
                            console.error("❌ Failed to start consuming media.");
                            return;
                        }

                        console.log("🎥 Consuming Stream:", consumeResponse);

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
