import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

const TeleprompterPreview = ({ 
    scriptText, 
    teleprompterSettings, 
    setTeleprompterSettings, 
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

    const updateSetting = (key, value) => {
        const newSettings = { ...teleprompterSettings, [key]: value };
        setTeleprompterSettings(newSettings);
        localStorage.setItem(`teleprompter_${key}`, value);
    };
    

    const startScrolling = () => {
        if (teleprompterRef.current) {
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
                {/* ✅ Scrollable Teleprompter with Touch & Scrollbar */}
                <div
                    className={styles.teleprompter}
                    ref={teleprompterRef}
                    style={{ 
                        fontSize: `${teleprompterSettings.fontSize}px`, 
                        paddingLeft: `${teleprompterSettings.paddingX}px`,
                        paddingRight: `${teleprompterSettings.paddingX}px`,
                        overflowY: "auto"
                    }}
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
                    <button onClick={() => updateSetting("fontSize", Math.max(10, teleprompterSettings.fontSize - 2))}>➖</button>
                    <span>Font</span>
                    <span className={styles.fontSizeValue}>{teleprompterSettings.fontSize}</span>
                    <button onClick={() => updateSetting("fontSize", Math.min(80, teleprompterSettings.fontSize + 2))}>➕</button>
                </div>

                <div className={styles.scrollSpeedControls}>
                    <button onClick={() => updateSetting("scrollSpeed", Math.max(0.1, teleprompterSettings.scrollSpeed - 0.1))}>⏪</button>
                    <span>Speed</span>
                    <span className={styles.scrollSpeedValue}>{teleprompterSettings.scrollSpeed.toFixed(1)}</span>
                    <button onClick={() => updateSetting("scrollSpeed", Math.min(10, teleprompterSettings.scrollSpeed + 0.1))}>⏩</button>
                </div>

                {/* ✅ Dynamic Padding Controls */}
                <div className={styles.paddingControls}>
                    <button onClick={() => updateSetting("paddingX", Math.max(0, teleprompterSettings.paddingX - 5))}>⬅️</button>
                    <span>Padding</span>
                    <span className={styles.paddingValue}>{teleprompterSettings.paddingX}px</span>
                    <button onClick={() => updateSetting("paddingX", Math.min(300, teleprompterSettings.paddingX + 5))}>➡️</button>
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
