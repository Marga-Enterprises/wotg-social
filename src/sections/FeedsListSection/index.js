import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

import styles from './index.module.css';

// components
import NoneOverlayCircularLoading from '../../components/NoneOverlayCircularLoading';
import NewPost from '../../subsections/feeds/NewPost';

// subsections
import PostCard from '../../subsections/feeds/PostCard';

const FeedsListSection = () => {
  const dispatch = useDispatch();
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const pageSize = useMemo(() => 10, []);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageDetails, setPageDetails] = useState({
    pageIndex: 1,
    totalPages: 0,
    totalRecords: 0,
  });

  // Fetch Feeds
  const fetchFeeds = useCallback((reset = false) => {
    if (
      loadingRef.current ||
      (!reset && pageDetails.totalPages && pageDetails.pageIndex > pageDetails.totalPages)
    ) return;

    loadingRef.current = true;
    setLoading(true);

    const pageIndex = reset ? 1 : pageDetails.pageIndex;

    dispatch(wotgsocial.post.getPostsByParamsAction({ pageIndex, pageSize }))
      .then((res) => {
        if (res.success && res.data?.posts) {
          setFeeds((prev) => reset ? res.data.posts : [...prev, ...res.data.posts]);
          setPageDetails({
            pageIndex: pageIndex + 1,
            totalPages: res.data.totalPages,
            totalRecords: res.data.totalRecords
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching feeds:", err);
      })
      .finally(() => {
        loadingRef.current = false;
        setLoading(false);
      });
  }, [dispatch, pageDetails.pageIndex, pageDetails.totalPages, pageSize]);

  // Initial Fetch
  useEffect(() => {
    fetchFeeds(true);
  }, [fetchFeeds]);

  // Infinite Scroll
  useEffect(() => {
    if (!observerRef.current || feeds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchFeeds();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchFeeds, feeds.length]);

  return (
    <div className={styles.feedWrapper}>
      <NewPost triggerRefresh={() => fetchFeeds(true)} />

      {feeds.length === 0 && loading && (
        <div className={styles.loadingArea}>
          <NoneOverlayCircularLoading />
        </div>
      )}

      {feeds.length === 0 && !loading && (
        <p className={styles.noPostsText}>No posts found.</p>
      )}

      {feeds.map((post, index) => (
        <PostCard key={post.id || index} post={post} />
      ))}

      <div ref={observerRef} className={styles.loadingArea}>
        {loading && feeds.length > 0 && <NoneOverlayCircularLoading />}
      </div>
    </div>
  );
};

export default React.memo(FeedsListSection);
