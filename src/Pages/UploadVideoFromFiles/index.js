import React, { useState, useMemo, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { wotgsocial } from "../../redux/combineActions";
import wotgLogo from "./wotg-logo.webp";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./index.module.css";

const Page = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const videoPreviewRef = useRef(null);

    // ✅ Memoized Query Parameters
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const page = useMemo(() => queryParams.get("page") || 1, [queryParams]);

    // ✅ Handle File Selection
    const handleFileChange = useCallback((e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile && selectedFile.type.startsWith("video/")) {
            setFile(selectedFile);
            if (videoPreviewRef.current) {
                URL.revokeObjectURL(videoPreviewRef.current);
            }
            videoPreviewRef.current = URL.createObjectURL(selectedFile);
        } else {
            alert("Please select a valid video file.");
        }
    }, []);

    // ✅ Remove Video Function
    const handleRemoveVideo = () => {
        setFile(null);
        if (videoPreviewRef.current) {
            URL.revokeObjectURL(videoPreviewRef.current);
            videoPreviewRef.current = null;
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ✅ Handle Drag and Drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];

        if (droppedFile && droppedFile.type.startsWith("video/")) {
            setFile(droppedFile);
            if (videoPreviewRef.current) {
                URL.revokeObjectURL(videoPreviewRef.current);
            }
            videoPreviewRef.current = URL.createObjectURL(droppedFile);
        } else {
            alert("Please drop a valid video file.");
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    // ✅ Handle Upload with Progress
    const handleUpload = useCallback(async () => {
        if (!file) {
            alert("Please select a video file first.");
            return;
        }
    
        setUploading(true);
        setUploadProgress(0);
    
        const payload = { id, file };
    
        try {
            // ✅ Wait for the Redux action to complete before navigating
            const response = await dispatch(wotgsocial.blog.uploadBlogVideoAction(payload));
    
            if (response?.success) { // Ensure Redux action returns success
                alert("Video received. Please wait for processing...");
    
                // ✅ Clear file input and preview
                handleRemoveVideo();

                // ✅ Redirect to blogs page after upload
                navigate(`/blogs?page=${page}`);
            } else {
                alert("Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    }, [file, id, dispatch, navigate, page]);    

    return (
        <div className={styles.mainContainer}>
            {/* ✅ Navbar */}
            <div className={styles.navbar}>
                <div className={styles.logo}>
                    <img src={wotgLogo} alt="WOTG Logo"/>
                </div>
                <div className={styles.navLinks}>
                    <a href="/" className={styles.navLink}>Chat</a>
                    <a href="/worship" className={styles.navLink}>Worship</a>
                    <a href="https://wotgonline.com/donate/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Give</a>
                </div>
            </div>

            {/* ✅ Drag and Drop File Upload */}
            <div 
                className={styles.dropZone} 
                onDrop={handleDrop} 
                onDragOver={handleDragOver}
            >
                {file ? (
                    <p>{file.name}</p>
                ) : (
                    <div>
                        <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" />
                        <p>Drag files here</p>
                        <p>— or —</p>
                        <button onClick={() => fileInputRef.current.click()} className={styles.uploadButton}>
                            Select files from your device
                        </button>
                    </div>
                )}
                <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleFileChange} 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                />
            </div>

            {/* ✅ Video Preview */}
            {file && videoPreviewRef.current && (
                <div className={styles.videoPreview}>
                    <video width="100%" controls>
                        <source src={videoPreviewRef.current} type={file.type} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            {/* ✅ Upload & Remove Buttons */}
            {file && (
                <div className={styles.buttonContainer}>
                    <button 
                        className={styles.uploadButton} 
                        onClick={handleUpload}
                    >
                        Upload Video
                    </button>
                    <button className={styles.uploadButton} onClick={handleRemoveVideo}>
                        <FontAwesomeIcon icon={faTimesCircle} /> Remove Video
                    </button>
                </div>
            )}

            {/* ✅ Upload Progress */}
            {uploading && (
                <div className={styles.progressContainer}>
                    <LoadingSpinner />
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progress} 
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p>{uploadProgress}%</p>
                </div>
            )}

            {/* ✅ Back Button */}
            <center>
                <div className={styles.backButtonContainer}>
                    <Link to={`/blogs?page=${page}`} className={styles.backButton}>
                        ⬅ Back to Blogs
                    </Link>
                </div>
            </center>
        </div>
    );
};

export default Page;
