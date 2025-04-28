import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { wotgsocial } from "../../redux/combineActions";
import wotgLogo from "../../images/wotgLogo.webp";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";

const Page = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const loadingRef = useRef(false); // ✅ Prevent duplicate API calls

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoLoaded, setVideoLoaded] = useState(false);

    // ✅ Memoized Backend URL (Prevents unnecessary recalculations)
    const backendUrl = useMemo(() => {
        return process.env.NODE_ENV === "development"
            ? "http://localhost:5000/uploads"
            : "https://wotg.sgp1.cdn.digitaloceanspaces.com/videos";
    }, []);

    // ✅ Fetch Blog Details (Optimized)
    const fetchBlogDetails = useCallback(async () => {
        if (!id || loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const res = await dispatch(wotgsocial.blog.getBlogByIdAction(id));
            if (res.success && JSON.stringify(res.data) !== JSON.stringify(blog)) {
                setBlog(res.data);
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [dispatch, id, blog]);

    useEffect(() => {
        fetchBlogDetails();
    }, [fetchBlogDetails]);

    return (
        <>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className={styles.mainContainer}>
                    <div className={styles.blogContainer}>
                        {blog ? (
                            <div className={styles.blogContent}>
                                {/* ✅ Optimized Video Handling */}
                                {blog.blog_video && (
                                    <div className={styles.videoWrapper}>
                                        <div className={styles.videoContainer}>
                                            <video
                                                controls
                                                autoPlay
                                                className={styles.videoPlayer}
                                                onLoadedData={() => {
                                                    if (!videoLoaded) {
                                                        setVideoLoaded(true);
                                                    }
                                                }}
                                                poster={wotgLogo}
                                                preload="metadata" // ✅ Faster page load
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
