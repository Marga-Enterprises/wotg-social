import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { wotgsocial } from "../../redux/combineActions";
import wotgLogo from "./wotg-logo.png"; // ✅ Placeholder
import wotgLogo1 from "./wotgLogo.webp"; // ✅ Placeholder

import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";

const Page = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoLoaded, setVideoLoaded] = useState(false);

    const backendUrl =
        process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://community.wotgonline.com/api";

    // Fetch blog details
    const fetchBlogDetails = useCallback(() => {
        setLoading(true);
        dispatch(wotgsocial.blog.getBlogByIdAction(id))
            .then((res) => {
                if (res.success) {
                    setBlog(res.data);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [dispatch, id]);

    // Fetch when component mounts or ID changes
    useEffect(() => {
        if (id) {
            fetchBlogDetails();
        }
    }, [fetchBlogDetails, id]);

    return (
        <>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className={styles.mainContainer}>
                    <div className={styles.navbar}>
                        <div className={styles.logo}>
                            <img src={wotgLogo} alt="WOTG Logo" />
                        </div>
                        <div className={styles.navLinks}>
                            <a href="/" className={styles.navLink}>Chat</a>
                            <a href="/worship" className={styles.navLink}>Worship</a>
                            <a href="https://wotgonline.com/donate/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Give</a>
                        </div>
                    </div>

                    <div className={styles.blogContainer}>
                        {blog ? (
                            <div className={styles.blogContent}>
                                {blog.blog_video && (
                                    <div className={styles.videoWrapper}>
                                        <div className={styles.videoContainer}>
                                            {!videoLoaded && (
                                                <img
                                                    src={wotgLogo1}
                                                    alt="Loading video..."
                                                    className={styles.videoPlaceholder}
                                                />
                                            )}
                                            <video
                                                controls
                                                autoPlay
                                                className={styles.videoPlayer}
                                                onLoadedData={() => setVideoLoaded(true)}
                                                poster={wotgLogo1}
                                            >
                                                <source src={`${backendUrl}/uploads/${blog.blog_video}`} type="video/webm" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                )}

                                <Link to="/blogs" className={styles.backButton}>⬅ Back to Blogs</Link>
                            </div>
                        ) : (
                            <p className={styles.noBlog}>Blog not found.</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Page;
