import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";
import { convertMomentWithFormatWhole } from "../../utils/methods";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./index.module.css";
import wotgLogo from "./wotg-logo.webp";
import wotgLogo1 from "./wotgLogo.webp";
import prayer from "./prayer.webp";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

// Utility functions (moved outside the component to prevent re-creation)
const stripHtml = (html) => html.replace(/<\/?[^>]+(>|$)/g, "");
const decodeHtmlEntities = (text) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
};
const truncateText = (text, maxLength) => (text.length <= maxLength ? text : text.substring(0, text.lastIndexOf(" ", maxLength)) + "...");

const Page = () => {
    const account = Cookies.get("account") ? JSON.parse(Cookies.get("account")) : null;
    const dispatch = useDispatch();

    const [blogs, setBlogs] = useState([]);
    const [pageSize] = useState(5);
    const [loading, setLoading] = useState(true);
    const [pageDetails, setPageDetails] = useState({ totalRecords: 0, pageIndex: 1, totalPages: 0 });
    const loadingRef = useRef(false); // Prevent unnecessary API calls

    const backendUrl = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://community.wotgonline.com/api";

    const handleBlogList = useCallback(async (pageIndex = 1) => {
        if (loadingRef.current) return; // Prevent duplicate calls
        loadingRef.current = true;
        setLoading(true);

        try {
            const res = await dispatch(wotgsocial.blog.getAllBlogsAction({ pageSize, pageIndex }));
            if (res.success && res.data?.blogs) {
                setBlogs(res.data.blogs);
                setPageDetails({
                    totalRecords: res.data.totalRecords,
                    pageIndex: res.data.pageIndex,
                    totalPages: res.data.totalPages,
                });
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [dispatch, pageSize]);

    useEffect(() => {
        handleBlogList(1);
    }, [handleBlogList]);

    const handleDeleteVideo = async (blogId) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            const res = await dispatch(wotgsocial.blog.deleteBlogVideoAction(blogId));
            if (res.success) {
                handleBlogList(pageDetails.pageIndex);
            }
        }
    };

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
                    <Link to={`/blog/${blog.id}`} className={styles.readMore}>See More</Link>

                    {account.user_role !== "member" && (
                        <Link to={`/blog/upload-video/${blog.id}`} className={styles.readMore}>Create Video</Link>
                    )}

                    {blog.blog_video && (
                        <>
                            <Link to={`/blog/watch-video/${blog.id}`} className={styles.readMore}>Watch Video</Link>
                            {(account.user_role === "admin" || account.user_role === "owner" || blog.blog_uploaded_by === account.id) && (
                                <button className={styles.readMore} onClick={() => handleDeleteVideo(blog.id)}>Delete Video</button>
                            )}
                        </>
                    )}
                </div>
            </div>
        ));
    }, [blogs, account, handleDeleteVideo]);

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
                            <button className={styles.paginationButton} disabled={pageDetails.pageIndex === 1} onClick={() => handleBlogList(pageDetails.pageIndex - 1)}>Previous</button>
                            <span className={styles.pageInfo}>Page {pageDetails.pageIndex} of {pageDetails.totalPages}</span>
                            <button className={styles.paginationButton} disabled={pageDetails.pageIndex >= pageDetails.totalPages} onClick={() => handleBlogList(pageDetails.pageIndex + 1)}>Next</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Page;
