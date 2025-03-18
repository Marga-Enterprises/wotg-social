import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import parse from "html-react-parser";
import { wotgsocial } from "../../redux/combineActions";
import wotgLogo from "./wotg-logo.webp";
import wotgLogo1 from "./wotgLogo.webp";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";

const Page = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const loadingRef = useRef(false); // Prevent duplicate API calls

    const backendUrl = useMemo(() => {
        return process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://community.wotgonline.com/api";
    }, []);

    // Fetch blog details (optimized)
    const fetchBlogDetails = useCallback(async () => {
        if (!id || loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const res = await dispatch(wotgsocial.blog.getBlogByIdAction(id));
            if (res.success) {
                setBlog(res.data);
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [dispatch, id]);

    useEffect(() => {
        fetchBlogDetails();
    }, [fetchBlogDetails]);

    return (
        <>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className={styles.mainContainer}>
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

                    <div className={styles.blogContainer}>
                        {blog ? (
                            <div className={styles.blogContent}>
                                <div className={styles.blogImageContainer}>
                                    <img
                                        loading="lazy"
                                        src={blog.blog_thumbnail ? `${backendUrl}/uploads/${blog.blog_thumbnail}` : wotgLogo1}
                                        alt={blog.blog_title}
                                        className={styles.blogImage}
                                    />
                                </div>
                                <div className={styles.blogBodyWrapper}>{parse(blog.blog_body)}</div>

                                <center>
                                    <div className={styles.backButtonContainer}>
                                        <Link to="/blogs" className={styles.backButton}>
                                            ⬅ Back to Blogs
                                        </Link>
                                    </div>
                                </center>
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
