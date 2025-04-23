import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";

// Components
import LoadingSpinner from "../../components/LoadingSpinner";
import AddMusicModal from "../../components/AddMusicModal";

// Sections
import MusicControlsSection from "../../sections/MusicControlsSection";

// Styles
import styles from "./index.module.css";

// JS Cookie
import Cookies from "js-cookie";

const AlbumDetailsPage = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();

  const account = useMemo(() => {
      return Cookies.get("account") ? JSON.parse(Cookies.get("account")) : null;
  }, []);

  const role = account?.user_role || "user"; // Default to 'user' if role is not found

  const backendUrl = useMemo(() => {
    return process.env.NODE_ENV === "development"
      ? "http://localhost:5000"
      : "https://community.wotgonline.com/api";
  }, []);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const currentPage = useMemo(() => parseInt(queryParams.get("page")) || 1, [queryParams]);

  const loadingRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [musics, setMusics] = useState([]);
  const [selectedMusicId, setSelectedMusicId] = useState(null); // ✅ currently playing track ID
  const [pageSize] = useState(50);
  const [pageDetails, setPageDetails] = useState({
    totalRecords: 0,
    pageIndex: currentPage,
    totalPages: 0
  });

  // NEXT SONG HANDLER
  const handleNextSong = useCallback(() => {
    const currentIndex = musics.findIndex((music) => music.id === selectedMusicId);
    const nextIndex = (currentIndex + 1) % musics.length;
    setSelectedMusicId(musics[nextIndex].id);
  }, [selectedMusicId]);

  // PREVIOUS SONG HANDLER
  const handlePreviousSong = useCallback(() => {
    const currentIndex = musics.findIndex((music) => music.id === selectedMusicId);
    const prevIndex = (currentIndex - 1 + musics.length) % musics.length;
    setSelectedMusicId(musics[prevIndex].id);
  }, [selectedMusicId]);


  const fetchAlbumDetails = useCallback(async () => {
    try {
      const res = await dispatch(wotgsocial.album.getAlbumByIdAction({ id }));
      if (res.success) setAlbum(res.data);
    } catch (err) {
      console.error("Failed to fetch album details:", err);
    }
  }, [dispatch, id]);

  const fetchMusics = useCallback(async () => {
    try {
      const res = await dispatch(
        wotgsocial.music.getMusicByParamsAction({ id, pageSize, pageIndex: currentPage })
      );
      if (res.success) {
        setMusics(res.data.musics);
        setPageDetails({
          totalRecords: res.data.totalRecords,
          pageIndex: res.data.pageIndex,
          totalPages: res.data.totalPages
        });
      }
    } catch (err) {
      console.error("Failed to fetch music list:", err);
    }
  }, [dispatch, id, pageSize, currentPage]);

  const handleFetchDetails = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    await Promise.all([fetchAlbumDetails(), fetchMusics()]);

    loadingRef.current = false;
    setLoading(false);
  }, [fetchAlbumDetails, fetchMusics]);

  useEffect(() => {
    handleFetchDetails();
  }, [handleFetchDetails]);

  const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.albumPage}>
          {/* Album Header */}
          <div className={styles.albumHeader}>
            <img
              src={`${backendUrl}/uploads/${album?.cover_image || "default-cover.png"}`}
              alt={album?.title}
              className={styles.albumCover}
              loading="lazy"
            />
            <div className={styles.albumInfo}>
              <p className={styles.albumType}>Album</p>
              <h1 className={styles.albumTitle}>{album?.title}</h1>
              <p className={styles.albumMeta}>
                {album?.artist_name || "Unknown Artist"} • {album?.release_date?.split("-")[0]} • {musics.length} songs
              </p>
            </div>

            { role === "admin" || role === "owner" && (
              <button className={styles.addButton} onClick={() => setShowModal(true)}>
                Add Track
              </button>
            )}
          </div>

          {/* Track List */}
          <div className={styles.trackList}>
            <div className={styles.trackListHeader}>
              <span>#</span>
              <span>Title</span>
              <span>Duration</span>
            </div>

            {musics.map((music, index) => (
                <div
                    key={music.id}
                    className={styles.trackItem}
                    onClick={() => setSelectedMusicId(music.id)}
                >
                    <span>
                    {selectedMusicId === music.id ? (
                        <div className={styles.playingBars}>
                        <div></div>
                        <div></div>
                        <div></div>
                        </div>
                    ) : (
                        index + 1
                    )}
                    </span>

                    <div className={styles.trackInfo}>
                    <p className={selectedMusicId === music.id ? styles.trackTitleSelected : styles.trackTitle}>
                        {music.title}
                    </p>
                    <p className={styles.trackArtist}>{music.artist_name || album?.artist_name}</p>
                    </div>

                    <span className={styles.trackDuration}>{formatDuration(music.duration)}</span>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Show footer player only when a music is selected */}
      {selectedMusicId && 
        <MusicControlsSection 
            musicId={selectedMusicId} 
            albumCover={album?.cover_image} 
            onNext={handleNextSong}
            onPrevious={handlePreviousSong}
        />
      }

      <AddMusicModal
        albumId={id}
        isOpen={showModal}
        onClose={() => {
            setShowModal(false);
            handleFetchDetails(); // optional: refresh after adding
        }}
      />
    </>
  );
};

export default React.memo(AlbumDetailsPage);
