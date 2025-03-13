import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

const RecordingSection = ({ scriptText, fontSize, scrollSpeed, setRecordedVideo, onNext, onPrev }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [isFrontCamera, setIsFrontCamera] = useState(true);
    const [videoReady, setVideoReady] = useState(false);

    const videoRef = useRef(null);
    const teleprompterRef = useRef(null);
    const scrollInterval = useRef(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [isFrontCamera]);

    useEffect(() => {
        if (teleprompterRef.current) {
            teleprompterRef.current.scrollTop = 0; // ✅ Ensures teleprompter starts at the top
        }
    }, [scriptText]);

    const startCamera = async () => {
        try {
            const constraints = { video: { facingMode: isFrontCamera ? "user" : "environment" } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoRef.current.srcObject = stream;
            setCameraStream(stream);
        } catch (error) {
            console.error("Error accessing camera: ", error);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
        }
    };

    const startRecording = () => {
        if (cameraStream) {
            const recorder = new MediaRecorder(cameraStream, { mimeType: "video/webm" });
            let tempChunks = []; // ✅ Temporary array to store recorded chunks

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    tempChunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(tempChunks, { type: "video/webm" });
                setRecordedVideo(blob); // ✅ Save recorded video
                setVideoReady(true); // ✅ Show the "Next" button
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);

            if (teleprompterRef.current) {
                teleprompterRef.current.scrollTop = 0;
                scrollInterval.current = setInterval(() => {
                    teleprompterRef.current.scrollBy(0, scrollSpeed);
                }, 50);
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
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
                <div className={styles.teleprompter} ref={teleprompterRef} style={{ fontSize: `${fontSize}px` }}>
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
                    <button className={styles.stopButton} onClick={stopRecording}>⏹️</button>
                ) : (
                    <button className={styles.iconButton} onClick={onNext}>✅</button>
                )}
            </div>
        </div>
    );
};

export default RecordingSection;
