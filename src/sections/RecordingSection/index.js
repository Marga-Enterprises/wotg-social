import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import Cookies from 'js-cookie';
import RecordRTC from "recordrtc"; 

const RecordingSection = ({ 
    scriptText, 
    teleprompterSettings, 
    setRecordedVideo, 
    onNext, 
    onPrev 
}) => {
    const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    const [isRecording, setIsRecording] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [videoReady, setVideoReady] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const videoRef = useRef(null);
    const teleprompterRef = useRef(null);
    const scrollInterval = useRef(null);
    const isFrontCamera = true;

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [isFrontCamera]);

    useEffect(() => {
        if (teleprompterRef.current) {
            teleprompterRef.current.scrollTop = 0;
        }
    }, [scriptText]);

    const startCamera = async () => {
        try {
            const constraints = {
                video: {
                    facingMode: isFrontCamera ? "user" : "environment",
                    width: { ideal: isIOS ? 1920 : 1280 },
                    height: { ideal: isIOS ? 1080 : 720 },
                },
                audio: true,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            setCameraStream(stream);
        } catch (error) {
            alert("⚠️ Error accessing camera/microphone. Please allow permissions in settings.");
        }
    };

    const startRecording = () => {
        if (!cameraStream) {
            alert("⚠️ No camera access. Please check your permissions.");
            return;
        }

        if (isIOS) {
            const recorder = new RecordRTC(cameraStream, {
                type: "video",
                mimeType: "video/mp4; codecs=h264,aac",
                recorderType: RecordRTC.MediaStreamRecorder,
                disableLogs: false,
                videoBitsPerSecond: 1280000, 
            });

            recorder.startRecording();
            setMediaRecorder(recorder);
            setIsRecording(true);
            startScrolling();

        } else {
            const mimeType = "video/webm;codecs=vp8,opus";

            try {
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    alert("⚠️ Recording format not supported on this device.");
                    return;
                }

                const recorder = new MediaRecorder(cameraStream, { mimeType });
                let tempChunks = [];

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        tempChunks.push(event.data);
                    }
                };

                recorder.onstop = () => {
                    const blob = new Blob(tempChunks, { type: mimeType });
                    setRecordedVideo(blob);
                    setVideoReady(true);
                };

                recorder.start();
                setMediaRecorder(recorder);
                setIsRecording(true);
                startScrolling();
            } catch (error) {
                alert("Recording failed. Try restarting browser and allowing permissions.");
            }
        }
    };    

    const stopRecording = () => {
        if (!mediaRecorder) return;

        if (isIOS) {
            mediaRecorder.stopRecording(() => {
                let blob = mediaRecorder.getBlob();
                setRecordedVideo(blob);
                setVideoReady(true);
            });
        } else {
            mediaRecorder.stop();
        }

        setIsRecording(false);
        stopScrolling();
    };

    const resetRecording = () => {
        // ✅ Stop current recording if it's running
        if (isRecording) {
            stopRecording();
        }
        // ✅ Reset all states
        setRecordedVideo(null);
        setVideoReady(false);
        setIsRecording(false);
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
        }
    };

    const startScrolling = () => {
        if (teleprompterRef.current && !isScrolling) {
            setIsScrolling(true);
            scrollInterval.current = setInterval(() => {
                teleprompterRef.current.scrollBy(0, teleprompterSettings.scrollSpeed);
            }, 50);
        }
    };

    const stopScrolling = () => {
        setIsScrolling(false);
        clearInterval(scrollInterval.current);
    };

    return (
        <div className={styles.container}>
            <div className={styles.cameraOverlay}>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className={styles.video} 
                    style={{ transform: isFrontCamera ? "scaleX(-1)" : "scaleX(1)" }} 
                />
                <div
                    className={styles.teleprompter}
                    ref={teleprompterRef}
                    style={{ 
                        fontSize: `${teleprompterSettings.fontSize}px`, 
                        paddingLeft: `${teleprompterSettings.paddingX}px`,
                        paddingRight: `${teleprompterSettings.paddingX}px`,
                        overflowY: "auto", 
                        touchAction: "pan-y" 
                    }}
                >
                    {scriptText.split("\n").map((line, index) => (
                        <p key={index} className={styles.teleprompterText}>{line.trim()}</p>
                    ))}
                </div>
            </div>

            <div className={styles.recordControls}>
                {!isRecording && !videoReady ? (
                    <>
                        <button className={styles.iconButton} onClick={onPrev}>⬅️</button>
                        <button className={styles.recordButton} onClick={startRecording}>🔴</button>
                    </>
                ) : isRecording ? (
                    <>
                        <button className={styles.stopButton} onClick={stopRecording}>⏹️</button>
                        <button className={styles.iconButton} onClick={isScrolling ? stopScrolling : startScrolling}>
                            {isScrolling ? "⏸" : "▶"}
                        </button>
                    </>
                ) : (
                    <>
                        <button className={styles.iconButton} onClick={onNext}>✅</button>
                        <button className={styles.iconButton} onClick={resetRecording}>🔄</button> {/* ✅ Restart Button */}
                    </>
                )}
            </div>
        </div>
    );
};

export default RecordingSection;
