// react
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';

// redux
import { wotgsocial } from '../../redux/combineActions';
import { useDispatch } from 'react-redux';

//react router
import { useNavigate } from 'react-router-dom';

// css
import styles from './index.module.css';

// components
import LoadingSpinner from '../../components/LoadingSpinner';

const RecommendedTracksSection = ({
  playlistId,
  onRefresh
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
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
  }, [dispatch, onRefresh]);

  useEffect(() => {
    handleFetchRecommended();
  }, [handleFetchRecommended]);

  const handleAddTrackToPlayList = useCallback(async (trackId) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const payload = {
      playlistId,
      musicIds: [ trackId ]
    }

    try {
      await dispatch(wotgsocial.playlist.addMusicToPlaylistAction(payload));
      onRefresh();
    } catch (err) {
      console.error('Unable to add track to playlist');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch])

  const handleRouteToMusicPage = (musicId, albumId) => {
    navigate(`/music-in-album/${albumId}?music=${musicId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.recommendedSection}>
        <h4 className={styles.recommendedTitle}>Recommended</h4>
        {/*<p className={styles.subText}>Based on what’s in this playlist</p>*/}

        <div className={styles.recommendedList}>
            {recommendedMusics.map((music, index) => (
            <div key={index} onClick={() => handleRouteToMusicPage(music.id, music.album_id)} className={styles.recommendedRow}>
                <img
                    src={`${backendUrl}/${music.cover_image || 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp'}`}
                    alt={music.title}
                    className={styles.musicThumbnail}
                />
                <div className={styles.musicDetails}>
                    <p className={styles.musicTitle}>{music.title}</p>
                    <p className={styles.musicArtist}>{music.artist_name}</p>
                </div>
                <button className={styles.addButton} onClick={() => handleAddTrackToPlayList(music.id)}>Add</button>
            </div>
            ))}
        </div>
    </div>
  );
};

export default React.memo(RecommendedTracksSection);
