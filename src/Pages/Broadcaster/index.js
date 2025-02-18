import React, { useEffect, useRef, useState } from "react";
import * as mediasoupClient from "mediasoup-client";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import styles from "./index.module.css"; // Import CSS

const Broadcaster = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Waiting to start...");
  const [device, setDevice] = useState(null);
  const [transport, setTransport] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [webrtcInitialized, setWebrtcInitialized] = useState(false);

  const initializeWebRTC = async () => {
    if (webrtcInitialized) return; // ✅ Prevent duplicate WebRTC setup
    setWebrtcInitialized(true);

    try {
        setStatusMessage("Initializing WebRTC...");
        const newDevice = new mediasoupClient.Device();
        setDevice(newDevice);

        const payload = { role: "producer" };

        dispatch(wotgsocial.stream.createTransportAction(payload))
            .then((res) => {
                if (!res) {
                    throw new Error("Transport info is invalid");
                }

                const transportInfo = res;
                console.log("🔍 Transport Response:", transportInfo.id);
                return newDevice.load({ routerRtpCapabilities: transportInfo.rtpCapabilities }).then(() => transportInfo);
            })
            .then((transportInfo) => {
                if (!transportInfo || !transportInfo.id) {
                    throw new Error("Invalid transport info received from server.");
                }

                const sendTransport = newDevice.createSendTransport(transportInfo);
                sendTransport.on("connect", async ({ dtlsParameters }, callback) => {
                    dispatch(wotgsocial.stream.connectTransportAction({ dtlsParameters, role: "producer" }));
                    callback();
                });

                setTransport(sendTransport);
                setStatusMessage("Ready to start streaming...");
            })
            .catch((error) => {
                console.error("❌ Error initializing WebRTC 1:", error);
                setStatusMessage("Error initializing WebRTC.");
            });
    } catch (error) {
        console.error("❌ Error initializing WebRTC 2:", error);
        setStatusMessage("Error initializing WebRTC.");
    }
  };

  const startBroadcast = async () => {
    console.log('START BROADCAST TRIGGERED')
    if (isStarting) return; // ✅ Prevent multiple calls
    setIsStarting(true);

    try {
        setStatusMessage("Selecting Screen...");

        // ✅ Get screen stream and wait for the user to select
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: 30, cursor: "always" },
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });

        if (!stream) throw new Error("No stream available");

        // ✅ Prevent multiple dispatches by checking if stream is already set
        if (screenStream) {
            console.warn("⚠ Screen stream already exists, preventing duplicate dispatch.");
            return;
        }

        videoRef.current.srcObject = stream;
        setScreenStream(stream);

        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        if (!videoTrack) throw new Error("No video track found");
        if (!audioTrack) console.warn("⚠ No audio track found (some browsers block system audio)");

        // ✅ Extract `rtpCapabilities`
        const rtpCapabilities = device.rtpCapabilities;
        console.log("✅ RTP Capabilities:", rtpCapabilities);

        // ✅ Generate a unique SSRC (avoid duplicates)
        const ssrc = Math.floor(Math.random() * 0xffffffff);

        // ✅ Format `rtpParameters`
        const rtpParameters = {
            codecs: rtpCapabilities.codecs.map(codec => ({
                mimeType: codec.mimeType,
                payloadType: codec.preferredPayloadType,
                clockRate: codec.clockRate,
                channels: codec.channels || 1,
                parameters: codec.parameters || {}
            })),
            encodings: [{ ssrc, maxBitrate: 500000 }]
        };

        console.log("✅ Sending RTP Parameters:", rtpParameters);

        // ✅ Dispatch ONLY AFTER user selects a screen
        stream.oninactive = () => {
            console.log("🔴 Screen sharing stopped by user.");
            stopBroadcast();
        };

        // ✅ Send Video Track (ONLY if not already streaming)
        await dispatch(wotgsocial.stream.startStreamAction({ kind: "video", rtpParameters }));

        // ✅ Send Audio Track (if available)
        if (audioTrack) {
            await dispatch(wotgsocial.stream.startStreamAction({ kind: "audio", rtpParameters }));
        }

        setIsStreaming(true);
        setStatusMessage("🟢 Live Screen Sharing Started!");
    } catch (error) {
        console.error("❌ Error starting screen sharing:", error);
        setStatusMessage("Error starting screen sharing.");
    } finally {
        setIsStarting(false); // ✅ Allow starting again only after completion
    }
  };


  const stopBroadcast = async () => {
    if (isStopping) return; // ✅ Prevent multiple calls
    setIsStopping(true);

    setIsStreaming(false);
    setStatusMessage("Stream stopped.");

    if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
    }

    videoRef.current.srcObject = null;

    // ✅ Ensure stream is stopped before allowing restart
    await dispatch(wotgsocial.stream.stopStreamAction());

    setIsStopping(false);
  };

  useEffect(() => {
    initializeWebRTC();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎥 Broadcaster Dashboard</h1>

      {/* Status Indicator */}
      <div className={`${styles.status} ${isStreaming ? styles.active : styles.inactive}`}>
        {statusMessage}
      </div>

      {/* Video Preview */}
      <video ref={videoRef} autoPlay playsInline className={styles.video} />

      {/* Start/Stop Stream Button */}
      {isStreaming ? (
        <button className={styles.stopButton} onClick={stopBroadcast}>
          ⛔ Stop Sharing
        </button>
      ) : (
        <button className={styles.startButton} onClick={startBroadcast}>
          🚀 Start Screen Sharing
        </button>
      )}
    </div>
  );
};

export default Broadcaster;
