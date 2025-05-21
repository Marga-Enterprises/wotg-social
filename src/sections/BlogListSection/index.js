// src/sections/BlogListSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';
import { convertMomentWithFormatWhole } from '../../utils/methods';

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// arrow left and right icon
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const stripHtml = (html) => html.replace(/<\/?[^>]+(>|$)/g, '');
const decodeHtmlEntities = (text) => {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
};
const truncateText = (text, maxLength) =>
  text.length <= maxLength ? text : text.substring(0, text.lastIndexOf(" ", maxLength)) + "...";

const BlogListSection = ({ blogs, account, backendUrl, pageDetails, handleDeleteVideo, handleBlogList }) => {
  return (
    <div className={styles.leftContainer}>
      <div className={styles.blogsContainer}>
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div key={blog.id} className={styles.blogCard}>
              <h3 className={styles.blogTitle}>{blog.blog_title}</h3>

              <div className={styles.blogImageContainer} style={{ backgroundColor: blog.blog_thumbnail ? 'transparent' : 'red' }}>
                <img
                  loading="lazy"
                  src={blog.blog_thumbnail ? `${backendUrl}/${blog.blog_thumbnail}` : 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp'}
                  alt={blog.blog_title}
                  className={styles.blogImage}
                />
              </div>

              <h3 className={styles.blogRelease}>
                Date: {convertMomentWithFormatWhole(blog.blog_release_date_and_time)}
              </h3>

              <p className={styles.blogBody}>
                {truncateText(decodeHtmlEntities(stripHtml(blog.blog_body)), 200)}
              </p>

              <div className={styles.linksContainer}>
                <Link to={`/blog/${blog.id}?page=${pageDetails.pageIndex}`} className={styles.readMore}>
                  See More
                </Link>

                {account.user_role !== "member" && !blog.blog_video && (
                  <>
                    <Link to={`/blog/record-video/${blog.id}?page=${pageDetails.pageIndex}`} className={styles.readMore}>
                      Record
                    </Link>
                    <Link to={`/blog/upload-video/${blog.id}?page=${pageDetails.pageIndex}`} className={styles.readMore}>
                      Upload
                    </Link>
                  </>
                )}

                {blog.blog_video && (
                  <>
                    <Link to={`/blog/watch-video/${blog.id}`} className={styles.readMore}>
                      Watch
                    </Link>
                    {(account.user_role === "admin" || account.user_role === "owner" || blog.blog_uploaded_by === account.id) && (
                      <button className={styles.readMore} onClick={() => handleDeleteVideo(blog.id)}>Delete</button>
                    )}
                  </>
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
          <FontAwesomeIcon icon={faArrowLeft} className={styles.prevSpan}/> 
          <span>Prev</span>
        </button>
        <span className={styles.pageInfo}>Page {pageDetails.pageIndex} of {pageDetails.totalPages}</span>
        <button 
          className={styles.paginationButton} 
          disabled={pageDetails.pageIndex >= pageDetails.totalPages} 
          onClick={() => handleBlogList(pageDetails.pageIndex + 1)}
        >
          <span>Next</span>
          <FontAwesomeIcon icon={faArrowRight} className={styles.nextSpan}/>
        </button>
      </div>
    </div>
  );
};

export default React.memo(BlogListSection);
