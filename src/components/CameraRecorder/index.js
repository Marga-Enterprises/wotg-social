import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ReactMediaRecorder } from "react-media-recorder";
import { wotgsocial } from '../../redux/combineActions';
import styles from './index.module.css';

import LoadingSpinner from '../LoadingSpinner';

const CameraRecorder = ({ blogId }) => {
    const dispatch = useDispatch();
    const [videoBlob, setVideoBlob] = useState(null); // Holds the recorded video file
    const [isRecording, setIsRecording] = useState(false); // Tracks recording state
    const [loading, setLoading] = useState(false); // Loading state for uploading
    const [cameraAvailable, setCameraAvailable] = useState(true); // Detects camera presence
    const [startRecording, setStartRecording] = useState(() => () => {});
    const [stopRecording, setStopRecording] = useState(() => () => {});
    const [status, setStatus] = useState("Idle");

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoInput = devices.some(device => device.kind === 'videoinput');
                setCameraAvailable(videoInput);
            })
            .catch(() => setCameraAvailable(false));
    }, []);

    const handleSaveVideo = () => {
        if (!videoBlob) return alert("No video recorded.");

        const file = new File([videoBlob], `blog-video-${blogId}.mp4`, { type: 'video/mp4' });

        const payload = {
            id: blogId,
            file: file
        };

        setLoading(true);

        dispatch(wotgsocial.blog.uploadBlogVideoAction(payload))
            .then(() => alert('Video uploaded successfully!'))
            .catch(() => alert('Failed to upload video.'))
            .finally(() => setLoading(false));
    };

    return (
        <>
            {loading ? <LoadingSpinner /> : (
                <div className={styles.recorderContainer}>
                    {!cameraAvailable ? (
                        <p className={styles.noCameraMessage}>🚫 Camera not detected</p>
                    ) : (
                        <>
                            {/* ReactMediaRecorder (Hidden) to store recording functions */}
                            <ReactMediaRecorder
                                video
                                render={({ startRecording, stopRecording, mediaBlobUrl, status }) => {
                                    setStartRecording(() => startRecording);
                                    setStopRecording(() => stopRecording);
                                    setStatus(status);
                                    return null;
                                }}
                            />

                            <div className={styles.recorder}>
                                <p>Status: {status}</p>

                                {/* ✅ Camera Live Feed while Recording */}
                                {isRecording && (
                                    <video autoPlay playsInline className={styles.cameraPreview}>
                                        <track kind="captions" />
                                    </video>
                                )}

                                {/* Recording Controls */}
                                <div className={styles.controls}>
                                    {!isRecording ? (
                                        <button onClick={() => {
                                            setIsRecording(true);
                                            startRecording();
                                        }} className={styles.recordButton}>
                                            🎥 Start Recording
                                        </button>
                                    ) : (
                                        <button onClick={() => {
                                            stopRecording();
                                            setIsRecording(false);
                                        }} className={styles.stopButton}>
                                            ⏹ Stop Recording
                                        </button>
                                    )}
                                </div>

                                {/* ✅ Show Save Button AFTER Stopping Recording */}
                                {status === "stopped" && (
                                    <div className={styles.actionButtons}>
                                        <button onClick={handleSaveVideo} className={styles.saveButton}>
                                            ✅ Save Video
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default CameraRecorder;
