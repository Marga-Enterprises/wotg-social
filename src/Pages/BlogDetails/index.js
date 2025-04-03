import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams, Link, useLocation } from "react-router-dom";
import parse from "html-react-parser";
import { wotgsocial } from "../../redux/combineActions";
import wotgLogo1 from "./wotgLogo.webp";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";

const Page = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const location = useLocation();
    const loadingRef = useRef(false);
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Extract `page` from query parameters (Memoized to prevent re-calculations)
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const page = useMemo(() => queryParams.get("page") || 1, [queryParams]);

    // ✅ Memoize Backend URL
    const backendUrl = useMemo(() => {
        return process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://community.wotgonline.com/api";
    }, []);

    // ✅ Fetch Blog Details (Optimized with `useCallback`)
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
                                <div className={styles.blogImageContainer}>
                                    <img
                                        loading="lazy"
                                        src={blog.blog_thumbnail ? `${backendUrl}/uploads/${blog.blog_thumbnail}` : wotgLogo1}
                                        alt={blog.blog_title}
                                        className={styles.blogImage}
                                    />
                                </div>
                                <div className={styles.blogBodyWrapper}>{parse(blog.blog_body)}</div>

                                {/* ✅ Back Button (Preserves Page State) */}
                                <center>
                                    <div className={styles.backButtonContainer}>
                                        <Link to={`/blogs?page=${page}`} className={styles.backButton}>
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
