import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

const TeleprompterPreview = ({ 
    scriptText, 
    fontSize, setFontSize,  
    scrollSpeed, setScrollSpeed,  
    onNext, 
    onPrev 
}) => {
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
            teleprompterRef.current.scrollTop = 0; // ✅ Start at the top
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

    const toggleCamera = () => {
        setIsFrontCamera((prev) => !prev);
    };

    const adjustFontSize = (increment) => {
        setFontSize((prev) => Math.max(10, Math.min(prev + increment, 80)));
    };

    const adjustScrollSpeed = (increment) => {
        setScrollSpeed((prev) => Math.max(1, Math.min(prev + increment, 10))); // ✅ Adjusted for smoother control
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
                    style={{ fontSize: `${fontSize}px`, overflowY: "auto" }} // ✅ Enables manual scrolling
                >
                    {scriptText.split("\n").map((line, index) => (
                        <p key={index} className={styles.teleprompterText}>{line}</p>
                    ))}
                </div>
            </div>

            <div className={styles.controls}>
                <button className={styles.iconButton} onClick={onPrev}>⬅️</button>
                <button className={styles.iconButton} onClick={toggleCamera}>🔄</button>

                <div className={styles.fontSizeControls}>
                    <button onClick={() => adjustFontSize(-2)}>➖</button>
                    <span>Font</span>
                    <span className={styles.fontSizeValue}>{fontSize}</span>
                    <button onClick={() => adjustFontSize(2)}>➕</button>
                </div>

                <div className={styles.scrollSpeedControls}>
                    <button onClick={() => adjustScrollSpeed(-0.1)}>⏪</button> {/* ✅ Smoother Decrease */}
                    <span>Speed</span>
                    <span className={styles.scrollSpeedValue}>{scrollSpeed.toFixed(1)}</span> {/* ✅ Show decimal */}
                    <button onClick={() => adjustScrollSpeed(0.1)}>⏩</button> {/* ✅ Smoother Increase */}
                </div>

                <button className={styles.iconButton} onClick={isScrolling ? stopScrolling : startScrolling}>
                    {isScrolling ? "⏸" : "▶"}
                </button>

                <button className={styles.iconButton} onClick={onNext}>✅</button>
            </div>
        </div>
    );
};

export default TeleprompterPreview;
