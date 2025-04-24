import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './index.module.css';

const AlbumSection = () => {
  const dispatch = useDispatch();
  const loadingRef = useRef(false);

  const backendUrl = useMemo(() =>
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://community.wotgonline.com/api',
    []
  );

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetchAlbums = useCallback(async () => {
    if (loadingRef.current || albums.length > 0) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(
        wotgsocial.album.getAlbumsByParamsAction({ pageSize: 5, pageIndex: 1 })
      );
      if (res.success && res.data?.albums?.length) {
        setAlbums(res.data.albums);
      }
    } catch (err) {
      console.error('Unable to fetch albums.', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch, albums.length]);

  useEffect(() => {
    handleFetchAlbums();
  }, [handleFetchAlbums]);

  const renderedAlbums = useMemo(() => (
    albums.map((album) => (
      <div key={album.id} className={styles.albumCard}>
        <img
          src={`${backendUrl}/uploads/${album.cover_image || 'default-cover.png'}`}
          alt={album.title}
          className={styles.albumImage}
          loading="lazy"
        />
        <div className={styles.albumText}>
          <h3 className={styles.albumTitle}>{album.title}</h3>
          <p className={styles.albumMeta}><strong>Artist:</strong> {album.artist_name}</p>
        </div>
      </div>
    ))
  ), [albums, backendUrl]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.albumRow}>
      {renderedAlbums}
    </div>
  );
};

export default React.memo(AlbumSection);
