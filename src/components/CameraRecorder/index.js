import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ReactMediaRecorder } from "react-media-recorder";
import { wotgsocial } from '../../redux/combineActions';
import styles from './index.module.css';

import LoadingSpinner from '../LoadingSpinner';

const CameraRecorder = ({ blogId }) => {
    const dispatch = useDispatch();
    const [videoBlob, setVideoBlob] = useState(null);
    const [mediaUrl, setMediaUrl] = useState(null); // Stores video preview URL
    const [isRecording, setIsRecording] = useState(false); // Track if user is recording
    const [loading, setLoading] = useState(false);

    // Handle Save Video
    const handleSaveVideo = () => {
        if (!videoBlob) return;

        const file = new File([videoBlob], `blog-video-${blogId}.mp4`, { type: 'video/mp4' });

        const payload = {
            id: blogId,
            file: file
        };

        setLoading(true); // ✅ Show loading while uploading

        dispatch(wotgsocial.blog.uploadBlogVideoAction(payload))
            .then(() => alert('Video uploaded successfully!'))
            .catch(() => alert('Failed to upload video.'))
            .finally(() => setLoading(false)); // ✅ Stop loading after upload
    };

    return (
        <>
            {loading ? <LoadingSpinner /> : (
                <div className={styles.recorderContainer}>
                    <ReactMediaRecorder
                        video
                        render={({ startRecording, stopRecording, mediaBlobUrl, status }) => (
                            <div className={styles.recorder}>
                                <p>Status: {status}</p>

                                {/* ✅ Camera Preview while Recording */}
                                {(isRecording || !mediaUrl) && (
                                    <video autoPlay playsInline className={styles.cameraPreview}>
                                        <track kind="captions" />
                                    </video>
                                )}

                                {/* ✅ Show Video Preview After Recording */}
                                {mediaUrl && !isRecording && (
                                    <video
                                        src={mediaUrl}
                                        controls
                                        className={styles.videoPreview}
                                    />
                                )}

                                {/* Recording Controls */}
                                <div className={styles.controls}>
                                    {!isRecording ? (
                                        <button onClick={() => {
                                            setIsRecording(true); // ✅ Show camera preview
                                            startRecording();
                                        }} className={styles.recordButton}>
                                            🎥 Start Recording
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                stopRecording();
                                                setIsRecording(false); // ✅ Stop camera preview
                                                fetch(mediaBlobUrl)
                                                    .then(res => res.blob())
                                                    .then(blob => {
                                                        setVideoBlob(blob);
                                                        setMediaUrl(mediaBlobUrl); // ✅ Save preview URL
                                                    });
                                            }}
                                            className={styles.stopButton}
                                        >
                                            ⏹ Stop Recording
                                        </button>
                                    )}
                                </div>

                                {/* ✅ Keep Save & Discard Buttons After Recording */}
                                {mediaUrl && (
                                    <div className={styles.actionButtons}>
                                        <button onClick={handleSaveVideo} className={styles.saveButton}>
                                            ✅ Save Video
                                        </button>
                                        <button onClick={() => {
                                            setVideoBlob(null);
                                            setMediaUrl(null); // ✅ Clear preview
                                        }} className={styles.discardButton}>
                                            ❌ Discard
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    />
                </div>
            )}
        </>
    );
};

export default CameraRecorder;
