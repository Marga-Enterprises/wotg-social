import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

import styles from './index.module.css';

// components
import NoneOverlayCircularLoading from '../../components/NoneOverlayCircularLoading';
import NewPost from '../../subsections/feeds/NewPost';
import PostCard from '../../subsections/feeds/PostCard';

// cookies
import Cookies from 'js-cookie';

const FeedsListSection = ({ socket }) => {
  const dispatch = useDispatch();
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const pageIndexRef = useRef(1); // ✅ Persistent, up-to-date page index

  const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;
  const userId = account?.id || null;

  const pageSize = useMemo(() => 10, []);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageDetails, setPageDetails] = useState({
    totalPages: 0,
    totalRecords: 0,
  });

  // Fetch Feeds
  const fetchFeeds = useCallback((reset = false, newPost) => {
    if (
      loadingRef.current ||
      (!reset && pageDetails.totalPages && pageIndexRef.current > pageDetails.totalPages)
    ) return;

    loadingRef.current = true;
    setLoading(true);

    const currentPage = reset ? 1 : pageIndexRef.current;

    dispatch(wotgsocial.post.getPostsByParamsAction({ pageIndex: currentPage, pageSize }))
      .then((res) => {
        if (res.success && res.data?.posts) {
          setFeeds((prev) =>
            reset ? res.data.posts : [...prev, ...res.data.posts]
          );

          // ✅ Update page index and total pages correctly
          const nextPage = currentPage + 1;
          pageIndexRef.current = nextPage;

          setPageDetails({
            totalPages: res.data.totalPages,
            totalRecords: res.data.totalRecords,
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
  }, [dispatch, pageDetails.totalPages, pageSize]);

  // Initial load
  useEffect(() => {
    fetchFeeds(true);
  }, [fetchFeeds]);

  // Infinite Scroll setup
  useEffect(() => {
    const sentinel = observerRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchFeeds(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchFeeds]);

  return (
    <div className={styles.feedWrapper}>
      <NewPost triggerRefresh={(newPost) => {
        pageIndexRef.current = 1;
        fetchFeeds(true, newPost);
      }} />

      {feeds.length === 0 && loading && (
        <div className={styles.loadingArea}>
          <NoneOverlayCircularLoading />
        </div>
      )}

      {feeds.length === 0 && !loading && (
        <p className={styles.noPostsText}>No posts found.</p>
      )}

      {feeds.map((post, index) => (
        <PostCard 
          key={index} 
          post={post} 
          triggerRefresh={() => {
            pageIndexRef.current = 1;
            fetchFeeds(true);
          }}
          userId={userId} 
          socket={socket}
        />
      ))}

      <div ref={observerRef} className={styles.loadingArea}>
        {loading && feeds.length > 0 && <NoneOverlayCircularLoading />}
      </div>
    </div>
  );
};

export default React.memo(FeedsListSection);
