import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import * as mediasoupClient from "mediasoup-client";
import { wotgsocial } from "../../redux/combineActions";
import styles from "./index.module.css"; // Import CSS

const Viewer = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState("Checking for live stream...");
  const [isStreaming, setIsStreaming] = useState(false);
  const [device, setDevice] = useState(null);

  const checkLiveStream = async () => {
    try {
        setStatusMessage("Checking for live stream...");
        console.log("🔍 Checking live stream status...");

        const res = await dispatch(wotgsocial.stream.checkStreamStatusAction());

        console.log("✅ CHECK STREAM RESPONSE:", res);

        if (res && res.isLive && res.rtpCapabilities) {
            console.log("✅ Live stream detected, initializing viewer...");
            startWatching(res.rtpCapabilities);
            setIsStreaming(true);
        } else {
            console.warn("❌ No Live stream detected");
            setStatusMessage("No Livestream");
        }
    } catch (error) {
        console.error("❌ Error checking live stream:", error);
        setStatusMessage("No Livestream");
    }
  };

  const startWatching = async (rtpCapabilities) => {
    try {
        setStatusMessage("Initializing viewer...");
        console.log("🔄 Initializing Mediasoup Device...");

        // ✅ Initialize Mediasoup Device
        const newDevice = new mediasoupClient.Device();
        await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
        setDevice(newDevice);

        console.log("✅ Mediasoup Device Initialized", newDevice.rtpCapabilities);

        // ✅ Create Transport
        console.log("🔄 Requesting Consumer Transport...");
        const transportResponse = await dispatch(wotgsocial.stream.createTransportAction({ role: "consumer" }));

        if (!transportResponse || !transportResponse.id) {
            console.error("❌ Failed to create transport", transportResponse);
            setStatusMessage("No Livestream");
            return;
        }

        console.log("✅ Consumer Transport Created:", transportResponse);

        const consumerTransport = newDevice.createRecvTransport(transportResponse);

        // ✅ Connect Transport
        consumerTransport.on("connect", async ({ dtlsParameters }, callback) => {
            console.log("🔄 Connecting Consumer Transport...");
            await dispatch(wotgsocial.stream.connectTransportAction({ dtlsParameters, role: "consumer" }));
            console.log("✅ Consumer Transport Connected");
            callback();
        });

        // ✅ Consume Stream (Now includes DTLS Parameters)
        console.log("🔄 Requesting to consume stream...");
        const consumeResponse = await dispatch(
            wotgsocial.stream.consumeStreamAction({ 
                rtpCapabilities: newDevice.rtpCapabilities,
                dtlsParameters: transportResponse.dtlsParameters // ✅ Pass DTLS parameters
            })
        );

        if (!consumeResponse || !consumeResponse.payload) {
            console.error("❌ Failed to consume stream", consumeResponse);
            setStatusMessage("No Livestream");
            return;
        }

        console.log("✅ Stream Consumed:", consumeResponse.payload);

        const stream = new MediaStream();
        stream.addTrack(consumeResponse.payload.track);

        console.log("🎥 MediaStream Created:", stream);

        videoRef.current.srcObject = stream;
        videoRef.current.play()
            .then(() => console.log("✅ Video Playback Started"))
            .catch(error => console.error("❌ Video Play Error:", error));

        setStatusMessage("🟢 Live Stream Started!");
    } catch (error) {
        console.error("❌ Error consuming stream:", error);
        setStatusMessage("No Livestream");
    }
  };

  useEffect(() => {
    checkLiveStream();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📺 Live Viewer</h1>

      <div className={`${styles.status} ${isStreaming ? styles.active : styles.inactive}`}>
        {statusMessage}
      </div>

      {isStreaming ? (
        <video ref={videoRef} autoPlay playsInline className={styles.video} />
      ) : (
        <div className={styles.noStream}>No Livestream</div>
      )}
    </div>
  );
};

export default Viewer;
