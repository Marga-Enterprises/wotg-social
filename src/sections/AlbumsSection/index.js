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
    'https://wotg.sgp1.cdn.digitaloceanspaces.com/images',
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
        wotgsocial.album.getAlbumsByParamsAction({ pageSize: 10, pageIndex: 1 })
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

  const scrollFunction = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      const scrollBy = direction === 'left' ? -scrollAmount : scrollAmount;
      scrollRef.current.scrollBy({ left: scrollBy, behavior: 'smooth' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.albumScrollContainer}>
      <button
        className={`${styles.scrollButton} ${styles.left}`}
        onClick={() => scrollFunction('left')}
      >
        &#10094;
      </button>

      <div className={styles.albumRowWrapper} ref={scrollRef}>
        <div className={styles.albumRow}>
          {albums.map((album) => (
            <div key={album.id} className={styles.albumCard}>
              <img
                src={`${backendUrl}/${album.cover_image || 'default-cover.png'}`}
                alt={album.title}
                className={styles.albumImage}
                loading="lazy"
              />
              <div className={styles.albumText}>
                <h3 className={styles.albumTitle}>{album.title}</h3>
                <p className={styles.albumMeta}>{album.artist_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className={`${styles.scrollButton} ${styles.right}`}
        onClick={() => scrollFunction('right')}
      >
        &#10095;
      </button>
    </div>
  );
};

export default React.memo(AlbumSection);
