import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './index.module.css';
import wotgLogo from './wotg-logo.png';
import wotgLogo1 from './wotgLogo.webp';
import prayer from './prayer.webp';

import { Link } from "react-router-dom";

import Cookies from 'js-cookie';

const Page = () => {
    const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;

    const dispatch = useDispatch();
    const [blogs, setBlogs] = useState([]);
    const [pageSize] = useState(5);
    const [pageDetails, setPageDetails] = useState({
        totalRecords: 0,
        pageIndex: 1,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);

    const backendUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://community.wotgonline.com/api';

    // Function to strip HTML tags
    const stripHtml = (html) => {
        return html.replace(/<\/?[^>]+(>|$)/g, ""); // Removes all HTML tags
    };

    // Function to decode HTML entities
    const decodeHtmlEntities = (text) => {
        const textArea = document.createElement("textarea");
        textArea.innerHTML = text;
        return textArea.value;
    };

    const handleBlogList = useCallback(
        (pageIndex = 1) => {
            const payload = { pageSize, pageIndex };

            setLoading(true);
            dispatch(wotgsocial.blog.getAllBlogsAction(payload))
                .then((res) => {
                    if (res.success && res.data?.blogs) {
                        setBlogs(res.data.blogs);
                        setPageDetails({
                            totalRecords: res.data.totalRecords,
                            pageIndex: res.data.pageIndex,
                            totalPages: res.data.totalPages,
                        });
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [dispatch, pageSize]
    );

    useEffect(() => {
        handleBlogList(1);
    }, [handleBlogList]);

    // Function to truncate text at 80 characters, keeping whole words
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text; // If text is already short, return as is
        return text.substring(0, text.lastIndexOf(" ", maxLength)) + "..."; // Cut at nearest space
    };

    return (
        <>
            { loading ? <LoadingSpinner /> :
                <div className={styles.mainContainer}>
                    <div className={styles.navbar}>
                        {/* Logo on the Left */}
                        <div className={styles.logo}>
                            <img src={wotgLogo} alt="WOTG Logo"/>
                        </div>

                        {/* Links on the Right */}
                        <div className={styles.navLinks}>
                            <a href="/" className={styles.navLink}>Chat</a>
                            <a href="/worship" className={styles.navLink}>Worship</a>
                            <a href="https://wotgonline.com/donate/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Give</a>
                        </div>
                    </div>
                    <div className={styles.banner}>
                        {/* Background Image */}
                        <img src={prayer} alt="Banner" loading="lazy" className={styles.bannerImage} />

                        {/* Dark Overlay */}
                        <div className={styles.overlay}></div>

                        {/* Message Content */}
                        <div className={styles.bannerContent}>
                            <h2>Romans 1:16</h2>
                            <p>
                                “For I am not ashamed of the gospel, because it is the power of God that brings salvation 
                                to everyone who believes…”
                            </p>
                        </div>
                    </div>
                    <div className={styles.leftContainer}>
                        <div className={styles.blogsContainer}>
                            {blogs.length > 0 ? (
                                blogs.map((blog, index) => (
                                    <div key={blog.id} className={styles.blogCard}>
                                        <h3 className={styles.blogTitle}>{blog.blog_title}</h3>

                                        {/* Placeholder for Image */}
                                        <div
                                            className={styles.blogImageContainer}
                                            style={{ backgroundColor: blog.blog_thumbnail ? "transparent" : "red" }}
                                        >
                                            <img
                                                loading="lazy"
                                                src={blog.blog_thumbnail ? `${backendUrl}/uploads/${blog.blog_thumbnail}` : wotgLogo1}
                                                alt={blog.blog_title}
                                                className={styles.blogImage}
                                            />
                                        </div>
                                        {/* Render Blog Body as Plain Text (No HTML + No Entities) */}
                                        <p className={styles.blogBody}>
                                            {truncateText(decodeHtmlEntities(stripHtml(blog.blog_body)), 200)}
                                        </p>

                                        {/* ✅ Updated "See More" as a <Link> */}

                                        <div className={styles.linksContainer}>
                                            <Link to={`/blog/${blog.id}`} className={styles.readMore}>
                                                See More
                                            </Link>

                                            {/* ✅ Show "Create Video" ONLY if user is NOT a member */}
                                            {account.user_role !== 'member' && (
                                                <Link to={`/blog/upload-video/${blog.id}`} className={styles.readMore}>
                                                    Create Video
                                                </Link>
                                            )}

                                            {/* ✅ Show "Watch Video" to ALL users, but ONLY if blog_video exists */}
                                            {blog.blog_video && (
                                                <Link to={`/blog/watch-video/${blog.id}`} className={styles.readMore}>
                                                    Watch Video
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noBlogs}>No blogs available.</p>
                            )}
                        </div>
                        <div className={styles.pagination}>
                            <button
                                className={styles.paginationButton}
                                disabled={pageDetails.pageIndex === 1}
                                onClick={() => handleBlogList(pageDetails.pageIndex - 1)}
                            >
                                Previous
                            </button>

                            <span className={styles.pageInfo}>
                                Page {pageDetails.pageIndex} of {pageDetails.totalPages}
                            </span>

                            <button
                                className={styles.paginationButton}
                                disabled={pageDetails.pageIndex >= pageDetails.totalPages}
                                onClick={() => handleBlogList(pageDetails.pageIndex + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default Page;
