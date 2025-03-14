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
            // ✅ Detect iOS Devices (iPhone/iPad)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
            // ✅ Adjust constraints for iOS devices (Chrome & Safari)
            const constraints = {
                video: {
                    facingMode: isFrontCamera ? "user" : "environment",
                    width: { ideal: isIOS ? 1920 : 1280 }, // ✅ Increase resolution for iOS
                    height: { ideal: isIOS ? 1080 : 720 },
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            };
    
            console.log("📸 [START CAMERA] Trying to access camera with constraints:", constraints);
    
            // ✅ Request Camera & Microphone
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
            // ✅ Set Video Stream
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true; // ✅ Mute live preview (prevents echo)
            setCameraStream(stream);
    
            console.log("✅ [START CAMERA] Camera & Microphone Access Granted");
        } catch (error) {
            console.error("❌ [CAMERA ERROR] Unable to access camera/audio:", error);
            alert("⚠️ Error accessing camera/microphone. Please allow permissions in settings.");
        }
    };

    const startRecording = () => {
        if (!cameraStream) {
            console.error("❌ [START RECORDING] No camera stream available.");
            alert("⚠️ No camera access. Please check your permissions.");
            return;
        }
    
        // ✅ Detect iOS Devices
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
        // ✅ Check if MediaRecorder is supported
        if (isIOS && typeof MediaRecorder === "undefined") {
            console.error("❌ [ERROR] MediaRecorder is NOT supported on this iOS version.");
            alert("⚠️ Recording not supported on this iOS version. Please update your browser.");
            return;
        }
    
        // ✅ Check MIME type support
        const mimeType = isIOS
            ? "video/mp4;codecs=h264,aac" // ✅ MP4 for iOS
            : "video/webm;codecs=vp8,opus"; // ✅ WebM for others
    
        console.log(`📡 [START RECORDING] Detected iOS: ${isIOS}`);
        console.log(`🎥 [START RECORDING] Selected MIME Type: ${mimeType}`);
        console.log(`🛠️ [CHECK SUPPORT] MediaRecorder.isTypeSupported("${mimeType}"):`, MediaRecorder.isTypeSupported(mimeType));
    
        try {
            // ✅ Ensure browser supports the format
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                alert("⚠️ Recording format not supported on this device.");
                console.error("❌ [ERROR] Selected MIME type is not supported:", mimeType);
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
                console.log("✅ [RECORDING COMPLETE] Video Blob Created:", blob);
            };
    
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            startScrolling();
            console.log("🎬 [START RECORDING] Recording started successfully.");
        } catch (error) {
            console.error("❌ [RECORDING ERROR] Chrome on iOS MediaRecorder Error:", error);
            alert("Recording failed. Try restarting browser and allowing permissions.");
        }
    };    
    
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
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
