import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

const RecordingSection = ({ scriptText, fontSize, scrollSpeed, setRecordedVideo, onNext, onPrev }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [videoReady, setVideoReady] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false); // ✅ Track scrolling state

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
            teleprompterRef.current.scrollTop = 0; // ✅ Start teleprompter from the top
        }
    }, [scriptText]);

    const startCamera = async () => {
        try {
            const constraints = {
                video: {
                    facingMode: isFrontCamera ? "user" : "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            };
    
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true; // ✅ Prevent feedback but allows recording
            setCameraStream(stream);
        } catch (error) {
            console.error("Chrome on iOS Camera/Audio Error: ", error);
            alert("Error accessing camera/microphone. Please check permissions in settings.");
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
        }
    };

    const startRecording = () => {
        if (!cameraStream) return;
    
        // ✅ Use "video/mp4" for Chrome on iPhone instead of "video/webm"
        const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=h264,aac")
            ? "video/mp4;codecs=h264,aac"
            : "video/webm;codecs=vp8,opus"; // ✅ Default to WebM if possible
    
        try {
            const recorder = new MediaRecorder(cameraStream, { mimeType });
            let tempChunks = [];
    
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    tempChunks.push(event.data);
                }
            };
    
            recorder.onstop = () => {
                const blob = new Blob(tempChunks, { type: mimeType });
                setRecordedVideo(blob); // ✅ Save recorded video
                setVideoReady(true);
            };
    
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            startScrolling();
        } catch (error) {
            console.error("Chrome on iOS MediaRecorder Error:", error);
            alert("Recording failed. Try restarting Chrome and allowing permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
        stopScrolling(); // ✅ Stop scrolling when recording stops
    };

    const startScrolling = () => {
        if (teleprompterRef.current && !isScrolling) {
            setIsScrolling(true);
            scrollInterval.current = setInterval(() => {
                teleprompterRef.current.scrollBy(0, scrollSpeed);
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
                {/* ✅ Scrollable Teleprompter with Touch & Scrollbar */}
                <div
                    className={styles.teleprompter}
                    ref={teleprompterRef}
                    style={{ fontSize: `${fontSize}px`, overflowY: "auto", touchAction: "pan-y" }} // ✅ Enables manual scrolling
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

                        {/* ✅ Play/Pause Teleprompter button is now ONLY visible while recording */}
                        <button className={styles.iconButton} onClick={isScrolling ? stopScrolling : startScrolling}>
                            {isScrolling ? "⏸ Pause" : "▶ Play"}
                        </button>
                    </>
                ) : (
                    <button className={styles.iconButton} onClick={onNext}>✅</button>
                )}
            </div>
        </div>
    );
};

export default RecordingSection;
