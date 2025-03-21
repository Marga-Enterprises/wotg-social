import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { wotgsocial } from "../../redux/combineActions";
import { convertMomentWithFormatWhole } from "../../utils/methods";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";
import wotgLogo from "./wotg-logo.webp";
import wotgLogo1 from "./wotgLogo.webp";
import prayer from "./prayer.webp";
import Cookies from "js-cookie";

// Utility functions
const stripHtml = (html) => html.replace(/<\/?[^>]+(>|$)/g, "");
const decodeHtmlEntities = (text) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
};
const truncateText = (text, maxLength) => (text.length <= maxLength ? text : text.substring(0, text.lastIndexOf(" ", maxLength)) + "...");

const Page = () => {
    const account = useMemo(() => {
        return Cookies.get("account") ? JSON.parse(Cookies.get("account")) : null;
    }, []);

    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const loadingRef = useRef(false);

    // ✅ Get the current page from query parameters
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const currentPage = useMemo(() => parseInt(queryParams.get("page")) || 1, [queryParams]);

    const [blogs, setBlogs] = useState([]);
    const [pageSize] = useState(5);
    const [loading, setLoading] = useState(true);
    const [pageDetails, setPageDetails] = useState({ totalRecords: 0, pageIndex: currentPage, totalPages: 0 });

    const backendUrl = useMemo(() => {
        return process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://community.wotgonline.com/api";
    }, []);

    // ✅ Fetch Blog List with Page Index (Optimized)
    const handleBlogList = useCallback(async (pageIndex) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const res = await dispatch(wotgsocial.blog.getAllBlogsAction({ pageSize, pageIndex }));
            if (res.success && res.data?.blogs) {
                if (JSON.stringify(res.data.blogs) !== JSON.stringify(blogs)) {
                    setBlogs(res.data.blogs);
                }
                setPageDetails((prev) => ({
                    ...prev,
                    totalRecords: res.data.totalRecords,
                    pageIndex: res.data.pageIndex,
                    totalPages: res.data.totalPages,
                }));

                // ✅ Update URL without causing extra re-renders
                if (res.data.pageIndex !== currentPage) {
                    navigate(`/blogs?page=${res.data.pageIndex}`, { replace: true });
                }
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [dispatch, pageSize, blogs, currentPage, navigate]);

    useEffect(() => {
        handleBlogList(currentPage);
    }, [handleBlogList, currentPage]);

    // ✅ Handle Video Deletion
    const handleDeleteVideo = useCallback(async (blogId) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            const res = await dispatch(wotgsocial.blog.deleteBlogVideoAction(blogId));
            if (res.success) {
                handleBlogList(pageDetails.pageIndex);
            }
        }
    }, [dispatch, pageDetails.pageIndex, handleBlogList]);

    // ✅ Memoized Blog Items
    const blogItems = useMemo(() => {
        return blogs.map((blog) => (
            <div key={blog.id} className={styles.blogCard}>
                <h3 className={styles.blogTitle}>{blog.blog_title}</h3>

                {account.user_role !== "member" && (
                    <h3 className={styles.blogRelease}>
                        Release Date: {convertMomentWithFormatWhole(blog.blog_release_date_and_time)}
                    </h3>
                )}

                <div className={styles.blogImageContainer} style={{ backgroundColor: blog.blog_thumbnail ? "transparent" : "red" }}>
                    <img
                        loading="lazy"
                        src={blog.blog_thumbnail ? `${backendUrl}/uploads/${blog.blog_thumbnail}` : wotgLogo1}
                        alt={blog.blog_title}
                        className={styles.blogImage}
                    />
                </div>

                <p className={styles.blogBody}>{truncateText(decodeHtmlEntities(stripHtml(blog.blog_body)), 200)}</p>

                <div className={styles.linksContainer}>
                    {/* ✅ "See More" Link */}
                    <Link to={`/blog/${blog.id}?page=${pageDetails.pageIndex}`} className={styles.readMore}>
                        See More
                    </Link>

                    {/* ✅ Show "Upload" and "Record" only if NO video exists */}
                    {account.user_role !== "member" && !blog.blog_video && (
                        <>
                            <Link to={`/blog/record-video/${blog.id}?page=${pageDetails.pageIndex}`} className={styles.readMore}>
                                Record Video
                            </Link>

                            <Link to={`/blog/upload-video/${blog.id}?page=${pageDetails.pageIndex}`} className={styles.readMore}>
                                Upload Video
                            </Link>
                        </>
                    )}

                    {/* ✅ Show "Watch Video" only if there is a video */}
                    {blog.blog_video && (
                        <>
                            <Link to={`/blog/watch-video/${blog.id}`} className={styles.readMore}>Watch Video</Link>

                            {/* ✅ Allow Delete only for admin, owner, or the uploader */}
                            {(account.user_role === "admin" || account.user_role === "owner" || blog.blog_uploaded_by === account.id) && (
                                <button className={styles.readMore} onClick={() => handleDeleteVideo(blog.id)}>Delete Video</button>
                            )}
                        </>
                    )}
                </div>
            </div>
        ));
    }, [blogs, account, handleDeleteVideo, pageDetails.pageIndex, backendUrl]);

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

                    <div className={styles.banner}>
                        <img src={prayer} alt="Banner" loading="lazy" className={styles.bannerImage} />
                        <div className={styles.overlay}></div>
                        <div className={styles.bannerContent}>
                            <h2>Romans 1:16</h2>
                            <p>“For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes…”</p>
                        </div>
                    </div>

                    <div className={styles.leftContainer}>
                        <div className={styles.blogsContainer}>
                            {blogItems.length > 0 ? blogItems : <p className={styles.noBlogs}>No blogs available.</p>}
                        </div>

                        <div className={styles.pagination}>
                            <button className={styles.paginationButton} disabled={pageDetails.pageIndex === 1} onClick={() => handleBlogList(pageDetails.pageIndex - 1)}>⬅ Prev</button>
                            <span className={styles.pageInfo}>Page {pageDetails.pageIndex} of {pageDetails.totalPages}</span>
                            <button className={styles.paginationButton} disabled={pageDetails.pageIndex >= pageDetails.totalPages} onClick={() => handleBlogList(pageDetails.pageIndex + 1)}>Next ➡</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Page;
