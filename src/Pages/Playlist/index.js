// react
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';

// redux
import { wotgsocial } from '../../redux/combineActions';
import { useDispatch } from 'react-redux';

//react router
import { useParams, useNavigate } from 'react-router-dom';

// css
import styles from './index.module.css';

// components
import LoadingSpinner from '../../components/LoadingSpinner';
import UpdatePlaylistModal from '../../components/UpdatePlaylistModal';

// sections
import PlayListSideBarSection from '../../sections/PlayListSideBarSection';
import RecommendedTracksSection from '../../sections/RecommendedTracksSection';

// hooks
import useWindowDimensions from '../../hooks/useWindowDimensions';

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faTrash } from '@fortawesome/free-solid-svg-icons'

// fast average color
// import { FastAverageColor } from 'fast-average-color';

// color js
// import Color from 'colorjs.io';

const Page = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { id } = useParams();
  const { width } = useWindowDimensions();

  const loadingRef = useRef(null);
  const imgRef = useRef(null);
  const menuRef = useRef(null);

  const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState({});
  const [playlistTracks, setPlayistTracks] = useState([]);
  // const [bgColor, setBgColor] = useState('#fff');
  // const [textColor, setTextColor] = useState('#111');
  const [showModal, setShowModal] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);

  const handleFetchPlaylist = useCallback(async () => {
    if (loadingRef.current) return;
  
    loadingRef.current = true;
    setLoading(true);
  
    try {
      const res = await dispatch(wotgsocial.playlist.getPlaylistByIdAction({ id }));
      if (res.success) {
        setPlaylist(res.data);
        setPlayistTracks(res.data.musics);
      } else {
        console.warn('❌ Fetch failed:', res.message || 'Unknown error');
      }
    } catch (err) {
      console.error('❌ Unable to retrieve playlist:', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch, id]);
  
  const handleRemoveFromPlaylist = useCallback(async (trackId) => {
    if (loadingRef.current) return;
  
    loadingRef.current = true;
    setLoading(true);
  
    const payload = {
      id,
      musicIds: [trackId],
    };
  
    try {
      const res = await dispatch(wotgsocial.playlist.removeMusicFromPlaylistAction(payload));
      if (res.success) {
        setPlayistTracks(prev => prev.filter(track => track.id !== trackId));
        setActiveMenuIndex(false);
        await handleFetchPlaylist(); // ✅ ensure we wait for this to complete fully
      } else {
        console.warn('❌ Remove failed:', res.message || 'Unknown error');
      }
    } catch (err) {
      console.error('❌ Unable to remove track from playlist:', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch, id, handleFetchPlaylist]);  

  useEffect(() => {
    handleFetchPlaylist();
  }, [handleFetchPlaylist]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuIndex(null); // Close the menu
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTrackClick = (trackId, coverImage) => {
    dispatch(wotgsocial.musicPlayer.setTrackList(playlistTracks));
    const meta = { source: "album", albumCover: coverImage };
    const selected = playlistTracks.find((t) => t.id === trackId);
    dispatch(wotgsocial.musicPlayer.setCurrentTrack({ ...selected, ...meta }));
    dispatch(wotgsocial.musicPlayer.setIsPlaying(true));
  };

  const backToMusicPage = () => {
    navigate('/music');
  }

  const toggleMenu = (index) => {
    setActiveMenuIndex((prev) => (prev === index ? null : index));
  };

  if (loading) return <LoadingSpinner/>;

  return (
    <div className={styles.playlistPage}>
        { width >= 1030 &&
            <PlayListSideBarSection/>
        }

        <div className={styles.playlistContent}>
            {/* Playlist Header */}
            <div className={styles.playlistHeaderWrapper}>
                {/* Back button positioned absolutely */}
                <button 
                    className={styles.backButton} 
                    onClick={backToMusicPage}
                >
                    ← Back
                </button>

                <div className={styles.playlistHeader} onClick={() => setShowModal(true)}>
                    <img
                        src={`${backendUrl}/${playlist?.cover_image || 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp'}`}
                        alt={playlist?.name}
                        ref={imgRef}
                        className={styles.coverImage}
                    />
                    <div className={styles.playlistInfo}>
                        <p className={styles.visibility}>
                            {playlist?.visibility === 'public' ? 'Public Playlist' : 'Private Playlist'}
                        </p>
                        <h1 className={styles.title}>{playlist?.name}</h1>
                    <h1 className={styles.creator}>{playlist?.description}</h1>
                    </div>
                </div>
            </div>

            {/* Playlist Tracks List */}
            {playlistTracks.length > 0 && (
                <div className={styles.tracksSection}>
                    <div className={styles.tracksHeader}>
                        <span className={styles.colNumber}>#</span>
                        <span className={styles.colTitle}>Title</span>
                    </div>

                    {playlistTracks.map((track, index) => (
                        <div key={index} onClick={() => handleTrackClick(track.id, track.cover_image)} className={styles.trackRow}>
                            <span className={styles.colNumber}>{index + 1}</span>

                            <div className={styles.colTrackInfo}>
                            <img
                                src={`${backendUrl}/${track.cover_image || 'wotgLogo.webp'}`}
                                alt={track.title}
                                className={styles.trackCover}
                            />
                            <div>
                                <p className={styles.trackTitle}>{track.title}</p>
                                <p className={styles.trackArtist}>{track.artist_name}</p>
                            </div>
                            </div>

                            <span className={styles.colDuration}>
                                {/*Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')*/}

                                <div className={styles.optionsWrapper}>
                                    <FontAwesomeIcon
                                        icon={faEllipsisH}
                                        className={styles.optionsIcon}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMenu(index);
                                        }}
                                    />
                                    {activeMenuIndex === index && (
                                    <div className={styles.optionsMenu} ref={menuRef}>
                                        <button
                                            className={styles.menuItem}
                                            onClick={() => handleRemoveFromPlaylist(track.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} className={styles.menuIcon} />
                                            Remove from playlist
                                        </button>
                                    </div>
                                    )}
                                </div>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        
            {/* Search Section */}
            <div className={styles.searchSection}>
                <RecommendedTracksSection 
                  playlistId={id}
                  onRefresh={handleFetchPlaylist}
                />
            </div>
            { showModal && 
              <UpdatePlaylistModal 
               playListDetails={playlist}
               onClose={() => {
                setShowModal(false);
               }}
               onRefresh={() => {
                handleFetchPlaylist();
               }}
              />
            }
        </div>
    </div>
  );  
}

export default Page;