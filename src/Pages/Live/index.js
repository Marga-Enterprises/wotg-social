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

    const backendUrl = process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://chat.wotgonline.com/api";

    const socketUrl = process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://chat.wotgonline.com";

    // ✅ Initialize Socket.IO Connection
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

    // ✅ Start WebRTC Streaming (Screen + System Audio)
    const handleStartStream = async () => {
        try {
            // ✅ Step 1: Dispatch API Call to Start Stream
            dispatch(wotgsocial.stream.startStreamAction());
    
            // ✅ Step 2: Fetch RTP Capabilities from Backend
            const response = await fetch(`${backendUrl}/stream/rtpCapabilities`);
            const { success, rtpCapabilities } = await response.json();
    
            if (!success || !rtpCapabilities) {
                console.error("❌ Failed to get RTP capabilities from server.");
                return;
            }
    
            // ✅ Step 3: Start Capture (Screen + System Audio)
            const captureStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" },
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });
    
            videoRef.current.srcObject = captureStream;
            setStream(captureStream);
    
            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
    
            captureStream.getTracks().forEach(track => peerConnection.addTrack(track, captureStream));
    
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
    
            // ✅ Step 4: Extract `rtpParameters` and ensure `encodings` include `ssrc`
            const senders = peerConnection.getSenders();
            const rtpParameters = senders.map(sender => {
                const params = sender.getParameters();
    
                // ✅ Ensure `payloadType` is present & map `RTX` codecs correctly
                params.codecs = rtpCapabilities.codecs.map(codec => {
                    const mappedCodec = {
                        mimeType: codec.mimeType,
                        clockRate: codec.clockRate,
                        channels: codec.channels || 1,
                        payloadType: codec.preferredPayloadType, // ✅ Ensure payloadType is included
                        rtcpFeedback: codec.rtcpFeedback || [],
                        parameters: codec.parameters || {} // ✅ Ensure parameters are passed
                    };
    
                    // ✅ If it's an RTX codec, make sure it references the correct payloadType (VP8 or H264)
                    if (mappedCodec.mimeType === "video/rtx") {
                        const primaryCodec = params.codecs.find(c => c.mimeType === "video/VP8" || c.mimeType === "video/H264");
                        if (primaryCodec) {
                            mappedCodec.parameters.apt = primaryCodec.payloadType; // ✅ Correctly reference primary codec
                        }
                    }
    
                    return mappedCodec;
                });
    
                // ✅ Fix: Ensure `encodings` include `ssrc`
                params.encodings = [
                    {
                        ssrc: Math.floor(Math.random() * 10000000), // ✅ Generate a random SSRC
                        scalabilityMode: "S1T3",
                        maxBitrate: 3000000 // ✅ Adjust bitrate if needed
                    }
                ];
    
                return params;
            });
    
            console.log("✅ Sending valid rtpParameters:", JSON.stringify(rtpParameters, null, 2));
    
            // ✅ Step 5: Send `rtpParameters` to Backend
            socket.emit("start_webrtc_stream", { rtpParameters });
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
