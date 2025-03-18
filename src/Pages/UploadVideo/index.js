import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { wotgsocial } from "../../redux/combineActions";
import wotgLogo from "./wotg-logo.webp";

import LoadingSpinner from "../../components/LoadingSpinner";
import DynamicSnackbar from "../../components/DynamicSnackbar";

import RecordingPreview from "../../sections/RecordingPreview";
import RecordingSection from "../../sections/RecordingSection";
import ScriptEditor from "../../sections/ScriptEditor";
import TeleprompterPreview from "../../sections/TeleprompterPreview";

import styles from "./index.module.css";

const Page = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const loadingRef = useRef(false);

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [scriptText, setScriptText] = useState("");
    const [recordedVideo, setRecordedVideo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

    // ✅ Load settings from localStorage or set defaults
    const [teleprompterSettings, setTeleprompterSettings] = useState(() => ({
        fontSize: parseFloat(localStorage.getItem("teleprompter_fontSize")) || 16,
        scrollSpeed: parseFloat(localStorage.getItem("teleprompter_scrollSpeed")) || 2,
        paddingX: parseFloat(localStorage.getItem("teleprompter_paddingX")) || 10,
    }));

    // ✅ Show Snackbar Function
    const showSnackbar = (message, type) => {
        setSnackbar({ open: true, message, type });
    };

    // ✅ Remove All <img> Tags from HTML String
    const removeImagesFromHTML = useCallback((htmlString) => {
        if (!htmlString) return "";

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");
        doc.querySelectorAll("img").forEach((img) => img.remove());
        return doc.body.innerHTML;
    }, []);

    // ✅ Fetch Blog Details (Optimized)
    const fetchBlogDetails = useCallback(async () => {
        if (!id || loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const res = await dispatch(wotgsocial.blog.getBlogByIdAction(id));
            if (res.success) {
                setBlog(res.data);

                // ✅ Convert HTML to plain text
                const cleanedHtml = removeImagesFromHTML(res.data.blog_body);
                const plainText = new DOMParser().parseFromString(cleanedHtml, "text/html").body.textContent;

                // ✅ Avoid unnecessary re-renders
                if (plainText !== scriptText) {
                    setScriptText(plainText);
                }
            }
        } catch (error) {
            showSnackbar("Failed to fetch blog details.", "error");
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [dispatch, id, removeImagesFromHTML]);

    useEffect(() => {
        fetchBlogDetails();
    }, [fetchBlogDetails]);

    // ✅ Handle Video Upload
    const handleSaveVideo = async () => {
        if (!recordedVideo || !id) return;

        setUploading(true);
        setLoading(true);

        const payload = {
            id,
            file: recordedVideo,
        };

        try {
            await dispatch(wotgsocial.blog.uploadBlogVideoAction(payload));
            setStep(0);
            showSnackbar("Video uploaded successfully!", "success");
        } catch (error) {
            showSnackbar("Upload failed. Please try again.", "error");
        } finally {
            setUploading(false);
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className={styles.mainContainer}>
                    {/* ✅ Navbar remains intact */}
                    {step !== 2 && step !== 1 && (
                        <div className={styles.navbar}>
                            <div className={styles.logo}>
                                <img src={wotgLogo} alt="WOTG Logo" loading="lazy" />
                            </div>

                            <div className={styles.navLinks}>
                                <a href="/" className={styles.navLink}>Chat</a>
                                <a href="/worship" className={styles.navLink}>Worship</a>
                                <a href="https://wotgonline.com/donate/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Give</a>
                            </div>
                        </div>
                    )}

                    {/* ✅ Main Container Structure Preserved */}
                    <div className={styles.blogContainer}>
                        {blog ? (
                            <div className={styles.contentWrapper}>
                                {step === 0 && (
                                    <ScriptEditor
                                        scriptText={scriptText}
                                        setScriptText={setScriptText}
                                        onNext={() => setStep(1)}
                                    />
                                )}
                                {step === 1 && (
                                    <TeleprompterPreview
                                        scriptText={scriptText}
                                        teleprompterSettings={teleprompterSettings}
                                        setTeleprompterSettings={setTeleprompterSettings} 
                                        onPrev={() => setStep(0)}
                                        onNext={() => setStep(2)}
                                    />
                                )}
                                {step === 2 && (
                                    <RecordingSection
                                        scriptText={scriptText}
                                        teleprompterSettings={teleprompterSettings} 
                                        setRecordedVideo={setRecordedVideo}
                                        onPrev={() => setStep(1)}
                                        onNext={() => setStep(3)}
                                    />
                                )}
                                {step === 3 && (
                                    <RecordingPreview
                                        recordedVideo={recordedVideo}
                                        onSave={handleSaveVideo}
                                        onReRecord={() => {
                                            setRecordedVideo(null);
                                            setStep(2);
                                        }}
                                        blogId={id}
                                    />
                                )}
                            </div>
                        ) : (
                            <p className={styles.noBlog}>Blog not found.</p>
                        )}
                    </div>

                    {/* ✅ Uploading Overlay */}
                    {uploading && (
                        <div className={styles.uploadingOverlay}>
                            <p>Uploading video...</p>
                        </div>
                    )}
                </div>
            )}

            {/* ✅ Snackbar for Messages */}
            <DynamicSnackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            />
        </>
    );
};

export default Page;
