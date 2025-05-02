import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './index.module.css';

const MostPopularSection = () => {
  const dispatch = useDispatch();

  const scrollRef = useRef(null);
  const loadingRef = useRef(false);

  const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMusics = useCallback(async () => {
    if (loadingRef.current || musics.length > 0) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(
        wotgsocial.music.getMusicByParamsAction({ pageSize: 10, pageIndex: 1, order: 'play_count' })
      );
      if (res.success && Array.isArray(res.data?.musics)) {
        setMusics(res.data.musics);
      }
    } catch (error) {
      console.error('❌ Failed to fetch musics:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch, musics.length]);

  const handleTrackClick = (trackId, coverImage) => {
    dispatch(wotgsocial.musicPlayer.setTrackList(musics));
    const meta = { source: "album", albumCover: coverImage };
    const selected = musics.find((t) => t.id === trackId);
    dispatch(wotgsocial.musicPlayer.setCurrentTrack({ ...selected, ...meta }));
    dispatch(wotgsocial.musicPlayer.setIsPlaying(true));
  };

  useEffect(() => {
    fetchMusics();
  }, [fetchMusics]);

  const scrollFunction = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      const scrollBy = direction === 'left' ? -scrollAmount : scrollAmount;
      scrollRef.current.scrollBy({ left: scrollBy, behavior: 'smooth' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.musicScrollContainer}>
      <button
        className={`${styles.scrollButton} ${styles.left}`}
        onClick={() => scrollFunction('left')}
      >
        &#10094;
      </button>

      <div className={styles.musicRowWrapper} ref={scrollRef}>
        <div className={styles.musicRow}>
          {musics.map((music) => (
            <div key={music.id} className={styles.musicCard} onClick={() => handleTrackClick(music.id, music.cover_image)}>
              <img
                src={
                  process.env.NODE_ENV === 'development'
                    ? 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/prayer.webp'
                    : `${backendUrl}/${music.cover_image || 'wotgLogo.webp'}`
                }
                alt={music.title}
                className={styles.musicImage}
                loading="lazy"
              />
              <div className={styles.musicText}>
                <h3 className={styles.musicTitle}>{music.title}</h3>
                <p className={styles.musicMeta}>{music.artist_name}</p>
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

export default React.memo(MostPopularSection);
