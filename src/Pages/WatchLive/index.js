import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import styles from "./index.module.css"; // Import CSS module

const WatchLive = () => {
    const videoRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const hlsUrl = "https://live.wotgonline.com/hls/teststream.m3u8"; // Update with your HLS stream URL

    useEffect(() => {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(hlsUrl);
            hls.attachMedia(videoRef.current);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false); // Hide loader when video is ready
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("HLS Error:", data);
            });

            return () => hls.destroy(); // Cleanup on unmount
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
            videoRef.current.src = hlsUrl;
            videoRef.current.addEventListener("loadedmetadata", () => {
                setIsLoading(false);
            });
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
