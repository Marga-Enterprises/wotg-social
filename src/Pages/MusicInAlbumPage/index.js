import React, { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { wotgsocial } from "../../redux/combineActions";

import LoadingSpinner from "../../components/LoadingSpinner";
import AddMusicModal from "../../components/AddMusicModal";

import styles from "./index.module.css";
import Cookies from "js-cookie";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const AlbumDetailsPage = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentTrack = useSelector((state) => state.wotgsocial.musicPlayer.currentTrack);
  const backendUrl = 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images';

  const account = useMemo(() => {
    return Cookies.get("account") ? JSON.parse(Cookies.get("account")) : null;
  }, []);
  const role = account?.user_role || "user";

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const currentPage = useMemo(() => parseInt(queryParams.get("page")) || 1, [queryParams]);

  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState(null);
  const [musics, setMusics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pageDetails, setPageDetails] = useState({
    totalRecords: 0,
    pageIndex: currentPage,
    totalPages: 0,
  });

  const loadingRef = useRef(false);

  const fetchAlbumDetails = useCallback(async () => {
    const res = await dispatch(wotgsocial.album.getAlbumByIdAction({ id }));
    if (res.success) setAlbum(res.data);
  }, [dispatch, id]);

  const fetchMusics = useCallback(async () => {
    const res = await dispatch(
      wotgsocial.music.getMusicByParamsAction({
        albumId: id,
        pageSize: 50,
        pageIndex: currentPage,
        order: "createdAt",
      })
    );
    if (res.success) {
      setMusics(res.data.musics);
      setPageDetails({
        totalRecords: res.data.totalRecords,
        pageIndex: res.data.pageIndex,
        totalPages: res.data.totalPages,
      });
    }
  }, [dispatch, id, currentPage]);

  const handleFetchDetails = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    await Promise.all([fetchAlbumDetails(), fetchMusics()]);
    setLoading(false);
    loadingRef.current = false;
  }, [fetchAlbumDetails, fetchMusics]);

  useEffect(() => {
    handleFetchDetails();
  }, [handleFetchDetails]);

  const handleDeleteTrack = useCallback((trackId) => {
    // confirm first

    if (!window.confirm("Are you sure you want to delete this track?")) return;

    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    dispatch(wotgsocial.music.deleteMusicAction({ id: trackId, albumId: id }))
    .then((res) => {
      if (res.success) {
        setMusics((prevMusics) => prevMusics.filter((music) => music.id !== trackId));
      } else {
        console.error("Failed to delete track:", res.message);
      }
    }).finally(() => {
      setLoading(false);
      loadingRef.current = false;
    })
  }, [dispatch, id]);

  const handleTrackClick = (trackId) => {
    dispatch(wotgsocial.musicPlayer.setTrackList(musics));
    const meta = { source: "album", albumCover: album?.cover_image };
    const selected = musics.find((t) => t.id === trackId);
    dispatch(wotgsocial.musicPlayer.setCurrentTrack({ ...selected, ...meta }));
    dispatch(wotgsocial.musicPlayer.setIsPlaying(true));
  };

  const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const backToMainMusicPage = () => {
    navigate('/music');
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.albumPage}>
          <div className={styles.albumHeader}>
            <img
              src={`${backendUrl}/${album?.cover_image || "default-cover.png"}`}
              alt={album?.title}
              className={styles.albumCover}
              loading="lazy"
            />
            <div className={styles.albumInfo}>
              <p className={styles.albumType}>Album</p>
              <h1 className={styles.albumTitle}>{album?.title}</h1>
              <p className={styles.albumMeta}>
                {album?.artist_name || "Unknown Artist"} •{" "}
                {album?.release_date?.split("-")[0]} • {musics.length} songs
              </p>
            </div>

            <button className={styles.addButton} onClick={backToMainMusicPage}>
              Back
            </button>

            {(role === "admin" || role === "owner") && (
              <button className={styles.addButton} onClick={() => setShowModal(true)}>
                Add Track
              </button>
            )}
          </div>

          <div className={styles.trackList}>
            <div className={styles.trackListHeader}>
              <span>#</span>
              <span>Title</span>

              {(role === "member") && (
                <span className={styles.durationHeader}>Duration</span>
              )}
              {(role === "admin" || role === "owner") && (
                <span className={styles.actionHeader}>Action</span>
              )}
            </div>

            {musics.map((music, index) => (
              <div
                key={music.id}
                className={styles.trackItem}
                onClick={() => handleTrackClick(music.id)}
              >
                <span>
                  {currentTrack?.id === music.id ? (
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
                  <p
                    className={
                      currentTrack?.id === music.id
                        ? styles.trackTitleSelected
                        : styles.trackTitle
                    }
                  >
                    {music.title}
                  </p>
                  <p className={styles.trackArtist}>
                    {music.artist_name || album?.artist_name}
                  </p>
                </div>

                {(role === "member") && (
                  <span className={styles.trackDuration}>
                    {formatDuration(music.duration)}
                  </span>
                )}

                <span className={styles.trackAction}>
                  {(role === "admin" || role === "owner") && (
                    <FontAwesomeIcon
                      icon={faTrash}
                      className={styles.trashIcon}
                      onClick={() => handleDeleteTrack(music.id)}
                    />
                  )}

                  
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddMusicModal
        albumId={id}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          handleFetchDetails();
        }}
        length={musics.length}
      />
    </>
  );
};

export default React.memo(AlbumDetailsPage);
