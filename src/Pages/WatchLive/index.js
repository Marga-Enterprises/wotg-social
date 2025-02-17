import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import styles from "./index.module.css"; // Import CSS module

const WatchLive = () => {
    const videoRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const hlsUrl = "https://live.wotgonline.com/hls/teststream.m3u8"; // Update with your HLS stream URL

    useEffect(() => {
        if (Hls.isSupported()) {
            const hls = new Hls({
                lowLatencyMode: false,  // ✅ Disable ultra-low latency mode (prevents buffering)
                liveSyncDuration: 2,    // ✅ Keeps the stream ~2 seconds behind real-time
                liveMaxLatencyDuration: 4, // ✅ Provides a small buffer to avoid stuttering
                backBufferLength: 3,    // ✅ Store 3 seconds of past content for stability
                maxBufferLength: 4,     // ✅ Limits buffer growth to prevent delay accumulation
                maxMaxBufferLength: 5,  // ✅ Prevents excessive buffering beyond 5 seconds
            });
    
            hls.loadSource(hlsUrl);
            hls.attachMedia(videoRef.current);
    
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false);
            });
    
            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("HLS Error:", data);
            });
    
            return () => hls.destroy();
        }
    }, [hlsUrl]);    
    
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>🎥 Watch Live Stream</h2>

            <div className={styles.videoWrapper}>
                {isLoading && <div className={styles.loader}>🔴 Loading Live Stream...</div>}
                <video ref={videoRef} controls autoPlay className={styles.videoPlayer} />
            </div>

            <p className={styles.info}>Live stream from WOTG Online. Stay connected! ✨</p>
        </div>
    );
};

export default WatchLive;
