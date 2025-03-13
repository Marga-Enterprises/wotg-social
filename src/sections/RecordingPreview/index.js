import React, { useRef } from "react";
import styles from "./index.module.css";

const RecordingPreview = ({ recordedVideo, onSave, onReRecord }) => {
    const videoRef = useRef(null);

    // ✅ Set video source when component loads
    if (recordedVideo && videoRef.current) {
        videoRef.current.src = URL.createObjectURL(recordedVideo);
    }

    return (
        <div className={styles.container}>
            <div className={styles.cameraOverlay}>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    controls 
                    className={styles.video} 
                />
            </div>

            {/* ✅ Save or Discard Buttons */}
            <div className={styles.recordControls}>
                <button className={styles.saveButton} onClick={onSave}>💾 Save</button>
                <button className={styles.discardButton} onClick={onReRecord}>🔄 Discard</button>
            </div>
        </div>
    );
};

export default RecordingPreview;
