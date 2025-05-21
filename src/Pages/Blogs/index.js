import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";

// redux
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";

// react-router-dom
import { useLocation, useNavigate } from "react-router-dom";

// utils
import styles from "./index.module.css";
import Cookies from "js-cookie";

// components
import LoadingSpinner from "../../components/LoadingSpinner";

// sections
import BlogBannerSection from "../../sections/BlogBannerSection";
import BlogListSection from "../../sections/BlogListSection";

const Page = () => {
  const account = useMemo(() => {
    return Cookies.get("account") ? JSON.parse(Cookies.get("account")) : null;
  }, []);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const loadingRef = useRef(false);

  // query params
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const currentPage = useMemo(() => parseInt(queryParams.get("page")) || 1, [queryParams]);

  const [blogs, setBlogs] = useState([]);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [pageDetails, setPageDetails] = useState({
    totalRecords: 0,
    pageIndex: currentPage,
    totalPages: 0,
  });

  const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

  // Fetch blogs
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
        setPageDetails({
          totalRecords: res.data.totalRecords,
          pageIndex: res.data.pageIndex,
          totalPages: res.data.totalPages,
        });

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

  // Handle delete video
  const handleDeleteVideo = useCallback(async (blogId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      const res = await dispatch(wotgsocial.blog.deleteBlogVideoAction(blogId));
      if (res.success) {
        handleBlogList(pageDetails.pageIndex);
      }
    }
  }, [dispatch, pageDetails.pageIndex, handleBlogList]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.pageContent}>
        <BlogBannerSection />

        <BlogListSection
          blogs={blogs}
          account={account}
          backendUrl={backendUrl}
          pageDetails={pageDetails}
          handleDeleteVideo={handleDeleteVideo}
          handleBlogList={handleBlogList}
        />
      </div>
    </div>
  );
};

export default Page;
