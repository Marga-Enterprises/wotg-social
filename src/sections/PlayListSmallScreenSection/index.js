// react
import React, { useEffect, useState, useCallback, useMemo, useRef} from 'react';

// redux
import { wotgsocial } from '../../redux/combineActions';
import { useDispatch } from 'react-redux';

// react-router-dom
import { useNavigate } from 'react-router-dom';

// components
import LoadingSpinner from '../../components/LoadingSpinner';

// css
import styles from './index.module.css';

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const PlayListSmallScreenSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loadingRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState([]);

  const handleFetchPlaylists = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
        const res = await dispatch(wotgsocial.playlist.getPlaylistsByParamsAction({ pageIndex: 1, pageSize: 20 }));

        if (res.success) {
            setPlaylist(res.data.playlists);
        }
    } catch (err) {
        console.error('Unable to retrieve playlists')
    } finally {
        loadingRef.current = false;
        setLoading(false);
    }
  }, [dispatch]);

  const selectPlaylist = (playlistId) => {
    navigate(`/playlist/${playlistId}`)
  };

  const handleCreateNewPlayList = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const payload = {
      name: 'New Playlist',
      description: ''
    };

    try {
      const res = await dispatch(wotgsocial.playlist.createPlaylistAction(payload));

      if (res.success) {
        navigate(`/playlist/${res.data.id}`);
      };
    } catch (err) {
        console.error('Unable to create playlists.', err);
    } finally {
        loadingRef.current = false;
        setLoading(false);
    }
  }, [dispatch])

  useEffect(() => {
    handleFetchPlaylists();
  }, [handleFetchPlaylists])

  if (loading) return <LoadingSpinner/>;

  return (
    <>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Playlists</h2>

        <div>
            <FontAwesomeIcon
              icon={faPlus}
              className={styles.addButton}
              title="Add Playlist"
              onClick={() => handleCreateNewPlayList()}
            />
        </div>
      </div>

      <div className={styles.smallPlaylistSection}>
        <div className={styles.playlistGrid}>
          {playlist.map((pl) => (
            <div key={pl.id} className={styles.playlistItem} onClick={() => selectPlaylist(pl.id)}>
              <img
                src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${pl.cover_image || 'wotgLogo.webp'}`}
                alt={pl.name}
                className={styles.playlistImage}
              />
              <div className={styles.playlistText}>
                <p className={styles.playlistName}>{pl.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );  
};

export default React.memo(PlayListSmallScreenSection);

