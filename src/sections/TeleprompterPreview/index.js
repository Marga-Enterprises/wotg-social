import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

const Section = ({ scriptText, onNext }) => {
    const [fontSize, setFontSize] = useState(16);
    const [scrollSpeed, setScrollSpeed] = useState(2);
    const [isScrolling, setIsScrolling] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [isFrontCamera, setIsFrontCamera] = useState(true);

    const teleprompterRef = useRef(null);
    const videoRef = useRef(null);
    const scrollInterval = useRef(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
            clearInterval(scrollInterval.current);
        };
    }, [isFrontCamera]);

    useEffect(() => {
        if (teleprompterRef.current) {
            teleprompterRef.current.scrollTop = 0; // ✅ Ensures teleprompter starts from the top
        }
    }, [scriptText]); // ✅ Runs when scriptText is set or changed

    const startCamera = async () => {
        try {
            const constraints = {
                video: { facingMode: isFrontCamera ? "user" : "environment" },
            };
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

    const toggleCamera = () => {
        setIsFrontCamera((prev) => !prev);
    };

    const adjustFontSize = (increment) => {
        setFontSize((prev) => Math.max(1, Math.min(prev + increment, 80)));
    };

    const adjustScrollSpeed = (increment) => {
        setScrollSpeed((prev) => Math.max(1, Math.min(prev + increment, 10)));
    };

    const startScrolling = () => {
        if (teleprompterRef.current) {
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
                <video ref={videoRef} autoPlay playsInline className={styles.video} />
                <div
                    className={styles.teleprompter}
                    ref={teleprompterRef}
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {scriptText.split("\n").map((line, index) => (
                        <p key={index} className={styles.teleprompterText}>{line}</p>
                    ))}
                </div>
            </div>

            <div className={styles.controls}>
                <button className={styles.iconButton} onClick={toggleCamera}>🔄</button>

                <div className={styles.fontSizeControls}>
                    <button onClick={() => adjustFontSize(-2)}>➖</button>
                    <span>Font</span>
                    <span className={styles.fontSizeValue}>{fontSize}</span>
                    <button onClick={() => adjustFontSize(2)}>➕</button>
                </div>

                <div className={styles.scrollSpeedControls}>
                    <button onClick={() => adjustScrollSpeed(-1)}>⏪</button>
                    <span>Speed</span>
                    <span className={styles.scrollSpeedValue}>{scrollSpeed}</span>
                    <button onClick={() => adjustScrollSpeed(1)}>⏩</button>
                </div>

                <button className={styles.iconButton} onClick={isScrolling ? stopScrolling : startScrolling}>
                    {isScrolling ? "⏸" : "▶"}
                </button>

                <button className={styles.iconButton} onClick={onNext}>✅</button>
            </div>
        </div>
    );
};

export default Section;
