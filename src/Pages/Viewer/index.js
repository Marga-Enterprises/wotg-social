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

  const checkLiveStream = async () => {
    try {
      setStatusMessage("Checking for live stream...");
      const res = await dispatch(wotgsocial.stream.checkStreamStatusAction());
      console.log('CHECK STREAM TRIGGERED', res);
      if (res && res.isLive) {
        console.log("✅ Live stream detected, starting viewer...");
        setIsStreaming(true);
        startWatching();
      } else {
        console.log("❌ No Live stream detected");
        setStatusMessage("No Livestream");
      }
    } catch (error) {
      console.error("❌ Error checking live stream:", error);
      setStatusMessage("No Livestream");
    }
  };

  const startWatching = async () => {
    setStatusMessage("Waiting for broadcaster...");

    dispatch(wotgsocial.stream.consumeStreamAction()).then(res => {
      if (!res || !res.payload) {
        setStatusMessage("No Livestream");
        return;
      }

      const stream = new MediaStream();
      stream.addTrack(res.payload.track);
      videoRef.current.srcObject = stream;

      setStatusMessage("🟢 Live Stream Started!");
    }).catch(error => {
      console.error("❌ Error consuming stream:", error);
      setStatusMessage("No Livestream");
    });
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
