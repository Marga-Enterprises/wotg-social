import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";

const RecordingPreview = ({ recordedVideo, onSave, onReRecord }) => {
    const videoRef = useRef(null);
    const [videoUrl, setVideoUrl] = useState(null);

    // ✅ Set video source properly when recordedVideo is available
    useEffect(() => {
        if (recordedVideo) {
            const url = URL.createObjectURL(recordedVideo);
            setVideoUrl(url);
        }

        // ✅ Cleanup URL to free memory
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [recordedVideo]);

    return (
        <div className={styles.container}>
            <div className={styles.cameraOverlay}>
                {videoUrl ? (
                    <video ref={videoRef} src={videoUrl} autoPlay controls className={styles.video} />
                ) : (
                    <p className={styles.noVideoText}>No recorded video available</p> // ✅ Fallback message
                )}
            </div>

            {/* ✅ Save or Discard Buttons */}
            <div className={styles.recordControls}>
                <button className={styles.saveButton} onClick={onSave} disabled={!videoUrl}>💾 Save</button>
                <button className={styles.discardButton} onClick={onReRecord}>🔄 Discard</button>
            </div>
        </div>
    );
};

export default RecordingPreview;
