import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';

// redux
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

// react-router-dom
import { useNavigate } from 'react-router-dom';

// components
import LoadingSpinner from '../../components/LoadingSpinner';

// css
import styles from './index.module.css';

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const PlayListSideBarSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const backendUrl = useMemo(() => 
    'https://wotg.sgp1.cdn.digitaloceanspaces.com/images',
    []
  );
 
  const loadingRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [playlists, setPlayLists] = useState([]);
  const [pageDetails, setPageDetails] = useState({
    totalRecords: 0,
    totalPages: 0,
    pageIndex: 1
  });
  const [pageSize] = useState(20);

  const handleFetchPlayLists = useCallback(async (pageIndex = 1) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(wotgsocial.playlist.getPlaylistsByParamsAction({ pageIndex, pageSize }));

      if (res.success) {
        setPlayLists(res.data.playlists);
        setPageDetails({
            totalPages: res.data.totalPages,
            totalRecords: res.data.totalRecords,
            pageIndex: res.data.pageIndex
        })
      };
    } catch (err) {
        console.error('Unable to retrieve playlists.', err);
    } finally {
        loadingRef.current = false;
        setLoading(false);
    }

  }, [dispatch]);

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

  const selectPlaylist = (playListId) => {
    navigate(`/playlist/${playListId}`);
  }; 

  useEffect(() => {
    handleFetchPlayLists();
  }, [handleFetchPlayLists])

  if (loading) return <LoadingSpinner/>;

  return (
    <div className={styles.sidebar}>
      <div className={styles.section}>
        <div>
          <h2 className={styles.sidebarHeading}>Your Playlists</h2>
        </div>
        <div>
            <FontAwesomeIcon
              icon={faPlus}
              className={styles.addButton}
              title="Add Playlist"
              onClick={() => handleCreateNewPlayList()}
            />
        </div>
      </div>

      { playlists?.length > 0 ? (
        playlists.map((playlist, index) => 
            <div className={styles.playlistList}>
                <div key={index} className={styles.playlistItem} onClick={() => selectPlaylist(playlist.id)}>
                    <img
                      src={
                          playlist.cover_image ? `${backendUrl}/${playlist.cover_image}` : 
                          'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp'
                      }
                      alt={playlist.name}
                      className={styles.cover}
                    />
                    <div className={styles.info}>
                        <p className={styles.title}>{playlist.name}</p>
                        <p className={styles.creator}>{playlist.creator_fname} {playlist.creator_lname}</p>
                    </div>
                </div>
            </div>
        )
       ) : (
        <div className={styles.createBox}>
            <p className={styles.createTitle}>Create your first playlist</p>
            <p className={styles.createSubtitle}>It’s easy, we’ll help you</p>
            <button className={styles.createButton} onClick={() => handleCreateNewPlayList()}>Create playlist</button>
        </div>
       )}

      <div className={styles.footer}/>
    </div>
  );
};

export default React.memo(PlayListSideBarSection);
