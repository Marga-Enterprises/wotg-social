// react
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';

// redux
import { wotgsocial } from '../../redux/combineActions';
import { useDispatch } from 'react-redux';

// css
import styles from './index.module.css';

// components
import LoadingSpinner from '../../components/LoadingSpinner';

const RecommendedTracksSection = () => {
  const dispatch = useDispatch();
  const loadingRef = useRef(null);

  const backendUrl = useMemo(
    () => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images',
    []
  );

  const [loading, setLoading] = useState(false);
  const [recommendedMusics, setRecommendedMusics] = useState([]);

  const handleFetchRecommended = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(
        wotgsocial.music.getMusicByParamsAction({
          pageIndex: 1,
          pageSize: 10,
          order: 'createdAt',
        })
      );

      if (res.success) {
        setRecommendedMusics(res.data.musics);
      }
    } catch (err) {
      console.error('Unable to retrieve recommended tracks:', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    handleFetchRecommended();
  }, [handleFetchRecommended]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.recommendedSection}>
        <h4 className={styles.recommendedTitle}>Recommended</h4>
        <p className={styles.subText}>Based on what’s in this playlist</p>

        <div className={styles.recommendedList}>
            {recommendedMusics.map((music) => (
            <div key={music.id} className={styles.recommendedRow}>
                <img
                    src={`${backendUrl}/${music.cover_image || 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp'}`}
                    alt={music.title}
                    className={styles.musicThumbnail}
                />
                <div className={styles.musicDetails}>
                    <p className={styles.musicTitle}>{music.title}</p>
                    <p className={styles.musicArtist}>{music.artist_name}</p>
                </div>
                <p className={styles.musicAlbum}>{music.album_title || 'Unknown Album'}</p>
                <button className={styles.addButton}>Add</button>
            </div>
            ))}
        </div>
    </div>
  );
};

export default React.memo(RecommendedTracksSection);
