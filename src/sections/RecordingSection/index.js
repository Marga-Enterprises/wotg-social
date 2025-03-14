import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import Cookies from 'js-cookie';
import RecordRTC from "recordrtc"; // ✅ Import RecordRTC

const RecordingSection = ({ scriptText, fontSize, scrollSpeed, setRecordedVideo, onNext, onPrev }) => {
    const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;

    const [isRecording, setIsRecording] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [videoReady, setVideoReady] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [debugLogs, setDebugLogs] = useState([]); // ✅ Store logs to render in UI

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

    const logToUI = (message) => {
        console.log(message);
        if (account?.user_role === 'owner') {
            setDebugLogs((prevLogs) => [...prevLogs, message]);
        }
    };

    const startCamera = async () => {
        try {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
            const constraints = {
                video: {
                    facingMode: isFrontCamera ? "user" : "environment",
                    width: { ideal: isIOS ? 1920 : 1280 },
                    height: { ideal: isIOS ? 1080 : 720 },
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            };
    
            logToUI(`📸 [START CAMERA] Trying to access camera with constraints: ${JSON.stringify(constraints)}`);
    
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            setCameraStream(stream);
    
            logToUI("✅ [START CAMERA] Camera & Microphone Access Granted");
        } catch (error) {
            logToUI(`❌ [CAMERA ERROR] Unable to access camera/audio: ${error.message}`);
            alert("⚠️ Error accessing camera/microphone. Please allow permissions in settings.");
        }
    };

    const startRecording = () => {
        if (!cameraStream) {
            logToUI("❌ [START RECORDING] No camera stream available.");
            alert("⚠️ No camera access. Please check your permissions.");
            return;
        }

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        logToUI(`📡 [START RECORDING] Detected iOS: ${isIOS}`);

        if (isIOS) {
            // ✅ Use RecordRTC for iOS
            const recorder = new RecordRTC(cameraStream, {
                type: "video",
                mimeType: "video/mp4", // Ensures MP4 format for iOS
                disableLogs: false,
                videoBitsPerSecond: 1280000, // Adjust bitrate for better quality
            });

            recorder.startRecording();

            setMediaRecorder(recorder);
            setIsRecording(true);
            startScrolling();
            logToUI("🎬 [START RECORDING] Recording started successfully (RecordRTC).");
        } else {
            // ✅ Use MediaRecorder for Android/Desktop
            const mimeType = "video/webm;codecs=vp8,opus";

            logToUI(`🎥 [START RECORDING] Selected MIME Type: ${mimeType}`);

            try {
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    alert("⚠️ Recording format not supported on this device.");
                    logToUI(`❌ [ERROR] Selected MIME type is not supported: ${mimeType}`);
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
                    logToUI("✅ [RECORDING COMPLETE] Video Blob Created.");
                };

                recorder.start();
                setMediaRecorder(recorder);
                setIsRecording(true);
                startScrolling();
                logToUI("🎬 [START RECORDING] Recording started successfully (MediaRecorder).");
            } catch (error) {
                logToUI(`❌ [RECORDING ERROR] MediaRecorder Error: ${error.message}`);
                alert("Recording failed. Try restarting browser and allowing permissions.");
            }
        }
    };

    const stopRecording = async () => {
        if (!mediaRecorder) {
            alert("⚠️ No active recording found. Please start recording first.");
            logToUI("❌ [STOP RECORDING] No active media recorder.");
            return;
        }
    
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
        if (isIOS && mediaRecorder instanceof RecordRTC) {
            // ✅ Ensure RecordRTC stops correctly on iOS
            logToUI("⏹️ [STOP RECORDING] Stopping RecordRTC on iOS...");
    
            try {
                await mediaRecorder.stopRecording(); // Force stopping
                let blob = mediaRecorder.getBlob();
    
                if (!blob || blob.size === 0) {
                    alert("⚠️ Recording stopped, but no video file was created.");
                    logToUI("❌ [STOP ERROR] RecordRTC stopped but returned an empty blob.");
                    return;
                }
    
                setRecordedVideo(blob);
                setVideoReady(true);
                setIsRecording(false);
                setMediaRecorder(null);
                logToUI("✅ [RECORDING COMPLETE] Video Blob Created (RecordRTC).");
                alert("✅ Recording saved successfully!");
    
            } catch (error) {
                alert(`❌ Error stopping recording: ${error.message}`);
                logToUI(`❌ [STOP ERROR] Failed to stop RecordRTC: ${error.message}`);
            }
        } else {
            // ✅ Stop MediaRecorder for Android/Desktop
            logToUI("⏹️ [STOP RECORDING] Stopping MediaRecorder...");
    
            if (mediaRecorder.state !== "recording") {
                alert("⚠️ MediaRecorder is not recording.");
                logToUI("❌ [STOP ERROR] MediaRecorder is not in a recording state.");
                return;
            }
    
            mediaRecorder.stop();
            mediaRecorder.onstop = () => {
                setIsRecording(false);
                setMediaRecorder(null);
                logToUI("✅ [STOP RECORDING] MediaRecorder stopped.");
                alert("✅ Recording saved successfully!");
            };
        }
    
        stopScrolling();
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
                <div
                    className={styles.teleprompter}
                    ref={teleprompterRef}
                    style={{ fontSize: `${fontSize}px`, overflowY: "auto", touchAction: "pan-y" }}
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
                    <button className={styles.iconButton} onClick={onNext}>✅</button>
                )}
            </div>
        </div>
    );
};

export default RecordingSection;
