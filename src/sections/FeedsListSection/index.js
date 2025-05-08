import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';
import { useNavigate } from 'react-router-dom';

import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './index.module.css';

// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShare } from '@fortawesome/free-solid-svg-icons';

// components
import ExpandableText from '../../common/ExpandableText';

// subsections
import PostHeaderAuthor from '../../subsections/feeds/PostHeaderAuthor';
import PostMediaGrid from '../../subsections/feeds/PostMediaGrid';
import SharedPostPreview from '../../subsections/feeds/SharedPostPreview';
import PostFooterSummary from '../../subsections/feeds/PostFooterSummary';
import PostActions from '../../subsections/feeds/PostActions';

const FeedsListSection = () => {
  const dispatch = useDispatch();

  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

  const [feeds, setFeeds] = useState([]);
  const [pageDetails, setPageDetails] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0
  });

  const [loading, setLoading] = useState(false);

  const fetchFeeds = useCallback(async () => {
    if (loadingRef.current || (pageDetails.totalPages && pageDetails.pageIndex > pageDetails.totalPages)) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(wotgsocial.post.getPostsByParamsAction({
        pageIndex: pageDetails.pageIndex,
        pageSize: pageDetails.pageSize
      }));

      if (res.success && res.data?.posts) {
        setFeeds(prev => [...prev, ...res.data.posts]);
        setPageDetails(prev => ({
          ...prev,
          pageIndex: prev.pageIndex + 1,
          totalPages: res.data.totalPages,
          totalRecords: res.data.totalRecords
        }));
      }
    } catch (err) {
      console.error("Error fetching feeds:", err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch, pageDetails.pageIndex, pageDetails.pageSize, pageDetails.totalPages]);

  useEffect(() => {
    fetchFeeds();
  }, []);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    if (feeds.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchFeeds();
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [fetchFeeds]);

  const renderPost = (post) => {
    return (
      <div className={styles.postCard} key={post.id}>
        {/* Author */}
        <PostHeaderAuthor author={post.author} createdAt={post.created_at} />
  
        {/* Shared Post */}
        {post.original_post && <SharedPostPreview post={post.original_post} />}
  
        {/* Post Content */}
        {post.content && (
          <ExpandableText text={post.content} className={styles.sharedText} />
        )}
  
        {/* Media */}
        {post.media?.length > 0 && (
          <PostMediaGrid media={post.media} />
        )}
  
        {/* Reaction / Comment / Share Count Summary */}
        <PostFooterSummary
          reactionCount={post.reaction_count}
          commentsCount={post.comments_count}
          sharesCount={post.shares_count}
        />
  
        {/* Action Buttons */}
        <PostActions
          onLike={() => console.log('Liked Post ID:', post.id)}
          onComment={() => console.log('Comment on Post ID:', post.id)}
          onShare={() => console.log('Shared Post ID:', post.id)}
        />
      </div>
    );
  };  

  return (
    <div className={styles.feedWrapper}>
      {feeds.length === 0 && !loading && <p>No posts found.</p>}

      {feeds.map(renderPost)}

      <div ref={observerRef} className={styles.loadingArea}>
        {loading && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default React.memo(FeedsListSection);
