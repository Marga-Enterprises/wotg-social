import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ReactMediaRecorder } from "react-media-recorder";
import { wotgsocial } from '../../redux/combineActions';
import styles from './index.module.css';

import LoadingSpinner from '../LoadingSpinner';

const CameraRecorder = ({ blogId }) => {
    const dispatch = useDispatch();
    const [videoBlob, setVideoBlob] = useState(null);
    const [mediaUrl, setMediaUrl] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraAvailable, setCameraAvailable] = useState(true);

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoInput = devices.some(device => device.kind === 'videoinput');
                setCameraAvailable(videoInput);
            })
            .catch(() => setCameraAvailable(false));
    }, []);

    const handleSaveVideo = () => {
        if (!videoBlob) return;

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
                        <ReactMediaRecorder
                            video
                            render={({ startRecording, stopRecording, mediaBlobUrl, status }) => {
                                return (
                                    <div className={styles.recorder}>
                                        <p>Status: {status}</p>

                                        {/* ✅ Container for Video Preview & Buttons */}
                                        <div className={styles.videoContainer}>
                                            {/* ✅ Camera Preview while Recording */}
                                            {(isRecording || !mediaUrl) && (
                                                <video autoPlay playsInline className={styles.cameraPreview}>
                                                    <track kind="captions" />
                                                </video>
                                            )}

                                            {/* ✅ Show Video Preview After Recording */}
                                            {mediaUrl && !isRecording && (
                                                <video src={mediaUrl} controls className={styles.videoPreview} />
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
                                                        fetch(mediaBlobUrl)
                                                            .then(res => res.blob())
                                                            .then(blob => {
                                                                setVideoBlob(blob);
                                                                setMediaUrl(mediaBlobUrl);
                                                            });
                                                    }} className={styles.stopButton}>
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
                                                        setMediaUrl(null);
                                                    }} className={styles.discardButton}>
                                                        ❌ Discard
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default CameraRecorder;
