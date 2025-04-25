import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './index.module.css';

const AlbumSection = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const loadingRef = useRef(false);

  const backendUrl = useMemo(() =>
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://community.wotgonline.com/api',
    []
  );

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlbums = useCallback(async () => {
    if (loadingRef.current || albums.length > 0) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(
        wotgsocial.album.getAlbumsByParamsAction({ pageSize: 7, pageIndex: 1 })
      );
      if (res.success && Array.isArray(res.data?.albums)) {
        setAlbums(res.data.albums);
      }
    } catch (error) {
      console.error('❌ Failed to fetch albums:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch, albums.length]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.tableScrollWrapper} ref={scrollRef}>

    </div>
  );
};

export default React.memo(AlbumSection);
