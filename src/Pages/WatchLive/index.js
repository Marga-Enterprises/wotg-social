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
                lowLatencyMode: false,  // ✅ Disables ultra-low latency mode (prevents buffering spikes)
                liveSyncDuration: 2,    // ✅ Keeps the stream ~2 seconds behind real-time
                liveMaxLatencyDuration: 4, // ✅ Allows a small buffer (avoids sudden lag)
                backBufferLength: 1,    // ✅ Store only 1 second of past video (prevents seeking)
                maxBufferLength: 3,     // ✅ Limits buffer size for stable playback
                maxMaxBufferLength: 4,  // ✅ Prevents excessive buffering
            });

            hls.loadSource(hlsUrl);
            hls.attachMedia(videoRef.current);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("HLS Error:", data);
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    console.log("🔄 Stream stopped, reloading...");
                    setTimeout(() => hls.loadSource(hlsUrl), 2000); // ✅ Auto-reload if stream stops
                }
            });

            return () => hls.destroy();
        }
    }, [hlsUrl]);

    // ✅ Prevent Play/Pause & Disable Controls
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.controls = false; // ❌ Remove default controls
            video.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback");
            video.addEventListener("contextmenu", (e) => e.preventDefault()); // ❌ Disable right-click (prevents download)
        }
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>🎥 Watch Live Stream</h2>

            <div className={styles.videoWrapper}>
                {isLoading && <div className={styles.loader}>🔴 Loading Live Stream...</div>}
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className={styles.videoPlayer} 
                    disablePictureInPicture 
                    controls={false} // ❌ Disable Play/Pause & Seek
                    onPlay={(e) => e.preventDefault()} // ❌ Prevent Play/Pause actions
                />
            </div>

            <p className={styles.info}>Live stream from WOTG Online. Stay connected! ✨</p>
        </div>
    );
};

export default WatchLive;
