import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import parse from 'html-react-parser'; // Import html-react-parser
import { wotgsocial } from '../../redux/combineActions';
import wotgLogo from './wotg-logo.png';

import CameraRecorder from '../../components/CameraRecorder';
import LoadingSpinner from '../../components/LoadingSpinner';

import { Link } from "react-router-dom";

import styles from './index.module.css';

const Page = () => {
    const dispatch = useDispatch();
    const { id } = useParams(); // Get the blog ID from the URL
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sanitizedBlogBody, setSanitizeBlogBody] = useState('');

    // Function to remove all <img> elements from HTML string
    const removeImagesFromHTML = (htmlString) => {
        if (!htmlString) return '';

        // Convert string to DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        // Select all <img> elements and remove them
        doc.querySelectorAll('img').forEach(img => img.remove());

        // Return the sanitized HTML string
        return doc.body.innerHTML;
    };

    const fetchBlogDetails = useCallback(() => {
        setLoading(true);
        dispatch(wotgsocial.blog.getBlogByIdAction(id))
            .then((res) => {
                if (res.success) {
                    setBlog(res.data);

                    // Sanitize blog body by removing <img> elements
                    const cleanedHtml = removeImagesFromHTML(res.data.blog_body);
                    setSanitizeBlogBody(parse(cleanedHtml)); // Parse cleaned HTML
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
            {loading ? <LoadingSpinner /> : (
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
                    <div className={styles.blogContainer}>
                        {blog ? (
                            <div className={styles.blogContent}>
                                {/* ✅ Render Blog Body with `html-react-parser` */}
                                <div
                                    className={styles.blogImageContainer}
                                >
                                    <CameraRecorder blogId={id} />
                                </div>
                                <div className={styles.blogTitle}>Script:</div>
                                <div className={styles.blogBodyWrapper}>
                                    {sanitizedBlogBody}
                                </div>
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
