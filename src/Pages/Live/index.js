import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { wotgsocial } from "../../redux/combineActions"; // Redux actions
import styles from "./index.module.css";

const LivePage = () => {
    const dispatch = useDispatch();
    const videoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [streamStatus, setStreamStatus] = useState("stopped");
    const [rtpCapabilities, setRtpCapabilities] = useState(null); // ✅ Local state for capabilities

    const backendUrl = process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://chat.wotgonline.com/api";

    const socketUrl = process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://chat.wotgonline.com";

    // ✅ Initialize Socket.IO
    useEffect(() => {
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

    // ✅ Fetch RTP Capabilities Before Starting the Stream
    const fetchRtpCapabilities = async () => {
        try {
            console.log("🔍 Fetching RTP Capabilities...");
            const response = await fetch(`${backendUrl}/stream/rtpCapabilities`);
            const data = await response.json();
            
            console.log("📡 API Response for RTP Capabilities:", data); // ✅ Debug Log
    
            if (data.success && data.rtpCapabilities) {
                setRtpCapabilities(data.rtpCapabilities);
                console.log("✅ RTP Capabilities Set in State:", data.rtpCapabilities);
            } else {
                console.error("❌ RTP Capabilities missing in response:", data);
            }
        } catch (error) {
            console.error("❌ Error fetching RTP Capabilities:", error);
        }
    };
    

    // ✅ Start WebRTC Streaming
    const handleStartStream = async () => {
        try {
            dispatch(wotgsocial.stream.startStreamAction());

            // ✅ Fetch RTP Capabilities First
            await fetchRtpCapabilities();

            if (!rtpCapabilities) {
                console.error("❌ RTP Capabilities not available. Aborting.");
                return;
            }

            // ✅ Stop Any Existing Stream Before Starting a New One
            if (videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }

            // ✅ Step 1: Prompt User to Select Screen/Tab
            const captureStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" }, // ✅ Browser will prompt the user
                audio: { // ✅ Captures system audio
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            videoRef.current.srcObject = captureStream; // ✅ Show preview in video tag

            // ✅ Step 2: Create Producer Transport
            const transportRes = await dispatch(wotgsocial.stream.createProducerTransportAction());
            const producerTransport = transportRes.payload;

            // ✅ Step 3: Setup WebRTC Connection
            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            captureStream.getTracks().forEach(track => peerConnection.addTrack(track, captureStream));

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("webrtc_ice_candidate", event.candidate);
                }
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            // ✅ Step 4: Connect Producer Transport
            await dispatch(wotgsocial.stream.connectProducerTransportAction(producerTransport.id, producerTransport.dtlsParameters));

            // ✅ Step 5: Ensure `rtpCapabilities` are present
            if (!rtpCapabilities) {
                console.error("❌ RTP Capabilities are missing!");
                return;
            }

            const senders = peerConnection.getSenders();
            const rtpParameters = senders.map(sender => sender.getParameters());

            // ✅ Step 6: Start Producing Video & Audio
            await dispatch(wotgsocial.stream.produceAction(producerTransport.id, "video", rtpParameters[0]));

            peerConnectionRef.current = peerConnection;

        } catch (error) {
            if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                console.error("❌ User denied screen sharing permission.");
            } else {
                console.error("❌ Error starting stream:", error);
            }
        }
    };

    // ✅ Stop WebRTC Streaming
    const handleStopStream = async () => {
        dispatch(wotgsocial.stream.stopStreamAction());

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        if (videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
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
