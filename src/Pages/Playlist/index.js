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

  const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState({});
  const [playlistTracks, setPlayistTracks] = useState([]);
  // const [bgColor, setBgColor] = useState('#fff');
  // const [textColor, setTextColor] = useState('#111');
  const [showModal, setShowModal] = useState(false);

  const handleFetchPlaylist = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
        const res = await dispatch(wotgsocial.playlist.getPlaylistByIdAction({id}));

        if (res.success) {
            setPlaylist(res.data)
            setPlayistTracks(res.data.musics);
        }
    } catch (err) {
        console.error('Unable to retrieve playist: ', err)
    } finally {
        loadingRef.current = false;
        setLoading(false);
    }
  }, [dispatch, id]);

  useEffect(() => {
    handleFetchPlaylist();
  }, [handleFetchPlaylist]);

  const handleRouteToMusicPage = (musicId, albumId) => {
    navigate(`/music-in-album/${albumId}?music=${musicId}`);
  };

  if (loading) return <LoadingSpinner/>;

  return (
    <div className={styles.playlistPage}>
        { width >= 1030 &&
            <PlayListSideBarSection/>
        }

        <div className={styles.playlistContent}>
            {/* Playlist Header */}
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
                    {/* <p className={styles.creator}>Pillorajem</p> */}
                </div>
            </div>

            {/* Playlist Tracks List */}
            {playlistTracks.length > 0 && (
                <div className={styles.tracksSection}>
                    <div className={styles.tracksHeader}>
                        <span className={styles.colNumber}>#</span>
                        <span className={styles.colTitle}>Title</span>
                        <span className={styles.colDuration}>⏱</span>
                    </div>

                    {playlistTracks.map((track, index) => (
                        <div key={index} onClick={() => handleRouteToMusicPage(track.id, track.album_id)} className={styles.trackRow}>
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
                                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
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