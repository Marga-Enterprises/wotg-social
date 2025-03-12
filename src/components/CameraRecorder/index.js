import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ReactMediaRecorder } from "react-media-recorder";
import { wotgsocial } from '../../redux/combineActions';
import styles from './index.module.css';

const CameraRecorder = ({ blogId }) => {
    const dispatch = useDispatch();
    const [videoBlob, setVideoBlob] = useState(null);

    // Handle Save Video
    const handleSaveVideo = () => {
        if (!videoBlob) return;

        const file = new File([videoBlob], `blog-video-${blogId}.mp4`, { type: 'video/mp4' });

        const payload = {
            id: blogId,
            file: file
        };

        dispatch(wotgsocial.blog.uploadBlogVideoAction(payload))
            .then(() => alert('Video uploaded successfully!'))
            .catch(() => alert('Failed to upload video.'));
    };

    return (
        <div className={styles.recorderContainer}>
            <ReactMediaRecorder
                video
                render={({ startRecording, stopRecording, mediaBlobUrl, status }) => (
                    <div className={styles.recorder}>
                        <p>Status: {status}</p>

                        {/* Show Video Preview if Recorded */}
                        {mediaBlobUrl && (
                            <video
                                src={mediaBlobUrl}
                                controls
                                className={styles.videoPreview}
                            />
                        )}

                        {/* Recording Controls */}
                        <div className={styles.controls}>
                            <button onClick={startRecording} className={styles.recordButton}>
                                🎥 Start Recording
                            </button>
                            <button
                                onClick={() => {
                                    stopRecording();
                                    fetch(mediaBlobUrl)
                                        .then(res => res.blob())
                                        .then(blob => setVideoBlob(blob));
                                }}
                                className={styles.stopButton}
                            >
                                ⏹ Stop Recording
                            </button>
                        </div>

                        {/* Show Save & Discard Buttons if Video is Available */}
                        {videoBlob && (
                            <div className={styles.actionButtons}>
                                <button onClick={handleSaveVideo} className={styles.saveButton}>
                                    ✅ Save Video
                                </button>
                                <button onClick={() => setVideoBlob(null)} className={styles.discardButton}>
                                    ❌ Discard
                                </button>
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    );
};

export default CameraRecorder;
